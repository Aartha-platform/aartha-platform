import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  analyzeDocumentContent,
  checkCrossDocumentConsistency,
  mockDossiers
} from '../../src/lib/documentIntel';

describe('Document Intelligence Pipeline — Live Scan & Validation', () => {
  it('1. Analyzes GST document with real field extraction and live-scan source tagging', () => {
    const rawText = `
      GOVERNMENT OF INDIA
      REGISTRATION CERTIFICATE
      Registration Number: 24AAAAC1234A1Z1
      Legal Name: RAJKOT CASTINGS PVT LTD
      Date of Issue: 15/01/2020
      State: Gujarat (24)
    `;

    const dossier = analyzeDocumentContent('GST_Registration_Rajkot.pdf', rawText, 'gst');

    assert.strictEqual(dossier.type, 'gst');
    assert.strictEqual(dossier.source, 'live-scan');
    
    const gstinField = dossier.extractedFields.find(f => f.label === 'GSTIN');
    assert.ok(gstinField);
    assert.strictEqual(gstinField.value, '24AAAAC1234A1Z1');
    assert.strictEqual(gstinField.status, 'VALIDATED');

    const entityField = dossier.extractedFields.find(f => f.label === 'Legal Entity Name');
    assert.ok(entityField);
    assert.strictEqual(entityField.status, 'EXTRACTED');
    assert.strictEqual(entityField.value.includes('MEHTA INDUS'), false, 'Must not inject mock Mehta Indus data');
  });

  it('2. Flags missing Country of Origin on commercial export invoices', () => {
    const invoiceText = `
      COMMERCIAL INVOICE
      Invoice No: INV-2026-9901
      Date: 2026-07-01
      Seller: AHMEDABAD TOOLS LTD
      Buyer: GLOBAL SOURCING INC
      HS Code: 8466.93
      Total Amount: USD 25,000
    `;

    const dossier = analyzeDocumentContent('Commercial_Invoice_9901.pdf', invoiceText, 'invoice');

    assert.strictEqual(dossier.type, 'invoice');
    assert.strictEqual(dossier.source, 'live-scan');
    
    const originAssertion = dossier.assertions.find(a => a.name.includes('Country of Origin'));
    assert.ok(originAssertion);
    assert.strictEqual(originAssertion.passed, false, 'Missing origin must fail assertion');

    const originException = dossier.exceptions.find(e => e.field.includes('Origin'));
    assert.ok(originException, 'Must raise compliance exception for missing country of origin');
  });

  it('3. Cross-document consistency detects mismatched exporter legal names', () => {
    const doc1 = {
      ...mockDossiers[0],
      extractedFields: [{ label: 'Legal Name', value: 'ALPHA MANUFACTURING LTD', confidence: 99 }]
    };
    const doc2 = {
      ...mockDossiers[1],
      extractedFields: [{ label: 'Entity Name', value: 'BETA TRADING COMPANY', confidence: 99 }]
    };

    const consistency = checkCrossDocumentConsistency([doc1, doc2]);
    const nameCheck = consistency.find(c => c.ruleName.includes('Legal Entity Name'));

    assert.ok(nameCheck);
    assert.strictEqual(nameCheck.passed, false, 'Inconsistent corporate entity names must fail cross-document check');
  });
});
