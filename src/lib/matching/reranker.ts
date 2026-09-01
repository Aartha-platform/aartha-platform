import { Supplier } from '@/types';
import { StructuredQuery, HybridMatchResult } from './matchSchema';
import { RetrievedCandidate } from './hybridRetrieval';
import { evaluateHardConstraints } from './constraintEngine';
import { generateMatchExplanation } from './explainer';

/**
 * Multi-Feature Reranking Engine
 * Computes transparent, multidimensional scoring for retrieved candidates.
 * Enforces strict anti-gaming rules:
 * Subscriptions, ad spend, and payments NEVER alter ranking.
 */
export function rerankCandidates(
  candidates: RetrievedCandidate[],
  query: StructuredQuery
): HybridMatchResult[] {
  return candidates.map(candidate => {
    const { supplier, denseSimilarity, lexicalScore, rrfRank } = candidate;

    // 1. Evaluate Hard Constraints
    const constraints = evaluateHardConstraints(supplier, query);

    // 2. Semantic & Specification Match Score (0 - 100)
    // Combines dense semantic similarity and sparse lexical keyword relevance
    const normalizedDense = Math.min(1.0, Math.max(0, (denseSimilarity - 0.05) / 0.45));
    const normalizedLexical = Math.min(1.0, lexicalScore / 12.0);

    let specFitScore = Math.round((normalizedDense * 50) + (normalizedLexical * 30));

    if (query.subcategory && supplier.subcategories.some(s => s.toLowerCase() === query.subcategory!.toLowerCase())) {
      specFitScore += 10;
    }
    if (query.certifications && query.certifications.length > 0) {
      const held = query.certifications.filter(c => 
        supplier.certifications.some(sc => sc.toLowerCase().includes(c.toLowerCase()))
      );
      if (held.length > 0) {
        specFitScore += 10;
      }
    }
    if (query.materials && query.materials.length > 0) {
      const allText = (supplier.products.join(' ') + ' ' + (supplier.about || '')).toLowerCase();
      const matchedMat = query.materials.filter(m => allText.includes(m.toLowerCase()));
      if (matchedMat.length > 0) {
        specFitScore += 10;
      }
    }
    specFitScore = Math.min(100, Math.max(0, specFitScore));

    // If hard constraints failed, cap match score severely
    if (!constraints.passed) {
      specFitScore = Math.min(30, specFitScore);
    }

    // 3. Evidence Confidence Score (0 - 100)
    // Measures the level of independent third-party verification (NOT user-declared self-assertions)
    let evidencePoints = 0;
    
    // Official GSTIN registry status
    if (supplier.isVerified && supplier.verificationDetails?.gstin) {
      evidencePoints += 30;
    }
    // Independent On-site Factory Physical Audit
    if (supplier.auditRecords && supplier.auditRecords.length > 0 && supplier.auditRecords[0].passed) {
      const grade = supplier.auditRecords[0].grade;
      if (grade === 'A') evidencePoints += 35;
      else if (grade === 'B') evidencePoints += 25;
      else evidencePoints += 15;
    }
    // Verified Certifications
    if (supplier.certifications && supplier.certifications.length > 0) {
      evidencePoints += Math.min(20, supplier.certifications.length * 7);
    }
    // Verified GPS Coordinates matching physical address
    if (supplier.location.gpsCoordinates) {
      evidencePoints += 15;
    }

    // Evidence freshness decay
    if (supplier.verifiedDate) {
      const days = Math.max(0, (Date.now() - new Date(supplier.verifiedDate).getTime()) / (1000 * 60 * 60 * 24));
      if (days > 365) evidencePoints *= 0.70;
      else if (days > 180) evidencePoints *= 0.85;
    }

    const evidenceConfidence = Math.min(100, Math.max(0, Math.round(evidencePoints)));

    // 4. Data Completeness Score (0 - 100)
    let completenessFields = 0;
    const totalFields = 9;
    if (supplier.companyName) completenessFields++;
    if (supplier.location.fullAddress) completenessFields++;
    if (supplier.location.gidcZone) completenessFields++;
    if (supplier.about) completenessFields++;
    if (supplier.products && supplier.products.length > 0) completenessFields++;
    if (supplier.structuredProducts && supplier.structuredProducts.length > 0) completenessFields++;
    if (supplier.annualTurnover) completenessFields++;
    if (supplier.yearEstablished) completenessFields++;
    if (supplier.exportMarkets && supplier.exportMarkets.length > 0) completenessFields++;

    const dataCompleteness = Math.round((completenessFields / totalFields) * 100);

    // 5. Fraud & Operational Risk Score (0 - 100, where 0 = lowest risk, 100 = highest risk)
    let riskPoints = 0;
    if (!supplier.isVerified) riskPoints += 35;
    if (!supplier.auditRecords || supplier.auditRecords.length === 0) riskPoints += 25;
    if (supplier.responseRate && supplier.responseRate < 80) riskPoints += 15;
    if (supplier.verificationGateState === 'expired' || supplier.verificationGateState === 'suspended') riskPoints += 30;
    const riskScore = Math.min(100, Math.max(0, riskPoints));

    // 6. Overall Quality/Trust Score
    const qScore = supplier.qualityScore?.total || supplier.legacyTrustScore || 70;

    // 7. Generate Evidence-Grounded Transparent Explanation
    const explanation = generateMatchExplanation(supplier, query, constraints, {
      specFitScore,
      evidenceConfidence,
      dataCompleteness,
      riskScore,
    });

    const isRecommended = constraints.passed && specFitScore >= 60 && evidenceConfidence >= 40 && riskScore < 60;

    return {
      supplierId: supplier.id,
      companyName: supplier.companyName,
      slug: supplier.slug,
      category: supplier.category,
      location: {
        city: supplier.location.city,
        state: supplier.location.state,
        gidcZone: supplier.location.gidcZone,
      },
      isVerified: supplier.isVerified,
      verificationTier: supplier.verificationTier,
      sellerType: supplier.sellerType,
      qualityScore: qScore,

      matchScore: specFitScore,
      evidenceConfidence,
      dataCompleteness,
      riskScore,

      denseSimilarity,
      lexicalScore,
      rrfRank,

      constraints,
      explanation,
      isRecommended,
    };
  }).sort((a, b) => {
    // Sort primarily by isRecommended, then by matchScore (60%) + evidenceConfidence (40%)
    if (a.isRecommended !== b.isRecommended) {
      return a.isRecommended ? -1 : 1;
    }
    const scoreA = (a.matchScore * 0.6) + (a.evidenceConfidence * 0.4);
    const scoreB = (b.matchScore * 0.6) + (b.evidenceConfidence * 0.4);
    return scoreB - scoreA;
  });
}
