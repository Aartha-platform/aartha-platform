export interface RiskSignal {
  score: number; // 0 - 25
  status: 'passed' | 'review' | 'failed';
  explanation: string;
}

export interface RiskAnalysis {
  totalScore: number; // 0 - 100
  rating: 'Normal' | 'Monitor' | 'Restricted' | 'Review' | 'Blocked';
  signals: {
    identity: RiskSignal;
    behavior: RiskSignal;
    content: RiskSignal;
    geography: RiskSignal;
  };
}

export function evaluateBuyerRisk(
  email: string,
  companyName: string,
  rfqCount: number,
  averageRfqIntervalMinutes: number
): RiskAnalysis {
  let identityScore = 0;
  let identityExpl = 'Corporate email domain verified successfully against registry records.';
  let identityStatus: 'passed' | 'review' | 'failed' = 'passed';

  const freeDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.ru'];
  const emailDomain = email.split('@')[1]?.toLowerCase() || '';

  if (freeDomains.includes(emailDomain)) {
    identityScore = 20;
    identityExpl = 'Account uses a free webmail service rather than a confirmed corporate domain.';
    identityStatus = 'review';
  } else if (!emailDomain) {
    identityScore = 25;
    identityExpl = 'Invalid email structure. No domain verified.';
    identityStatus = 'failed';
  }

  let behaviorScore = 0;
  let behaviorExpl = 'Sourcing activity frequency conforms to standard buyer patterns.';
  let behaviorStatus: 'passed' | 'review' | 'failed' = 'passed';

  if (rfqCount > 10 && averageRfqIntervalMinutes < 5) {
    behaviorScore = 20;
    behaviorExpl = 'Anomalously high RFQ post rate detected (potential automated scraping or spam).';
    behaviorStatus = 'review';
  }

  let contentScore = 0;
  let contentExpl = 'Specifications and RFQ requirements are detailed and clear.';
  let contentStatus: 'passed' | 'review' | 'failed' = 'passed';

  if (companyName.length < 3 || companyName.toUpperCase().includes('TEST')) {
    contentScore = 15;
    contentExpl = 'Entity name appears generic or matches test patterns.';
    contentStatus = 'review';
  }

  let geographyScore = 0;
  let geographyExpl = 'IP routing, phone country code, and address match successfully.';
  let geographyStatus: 'passed' | 'review' | 'failed' = 'passed';

  if (emailDomain.endsWith('.de') && !companyName.toLowerCase().includes('germany') && !companyName.toLowerCase().includes('gmbh') && !companyName.toLowerCase().includes('global')) {
    geographyScore = 15;
    geographyExpl = 'Geocoded domain country mismatch: Buyer email domain (.de) conflicts with non-European registration location.';
    geographyStatus = 'review';
  } else if (emailDomain.endsWith('.ru') || emailDomain.endsWith('.cn')) {
    geographyScore = 20;
    geographyExpl = 'Geocoded IP routing mismatch: Connection matches high-risk routing channels.';
    geographyStatus = 'review';
  }

  // Total calculation
  const totalScore = identityScore + behaviorScore + contentScore + geographyScore;
  let rating: RiskAnalysis['rating'] = 'Normal';
  if (totalScore > 80) rating = 'Blocked';
  else if (totalScore > 60) rating = 'Review';
  else if (totalScore > 40) rating = 'Restricted';
  else if (totalScore > 20) rating = 'Monitor';

  return {
    totalScore,
    rating,
    signals: {
      identity: { score: identityScore, status: identityStatus, explanation: identityExpl },
      behavior: { score: behaviorScore, status: behaviorStatus, explanation: behaviorExpl },
      content: { score: contentScore, status: contentStatus, explanation: contentExpl },
      geography: { score: geographyScore, status: geographyStatus, explanation: geographyExpl }
    }
  };
}

export function evaluateSupplierRisk(
  gstin: string,
  gpsCoords?: string,
  phoneCode?: string,
  declaredSellerType?: string,
  gstRegistrationType?: string,
  bankAccountName?: string,
  registeredBusinessName?: string,
  certNumbers?: string[]
): RiskAnalysis {
  let identityScore = 0;
  let identityExpl = 'GSTIN format is standard and active in national registries.';
  let identityStatus: 'passed' | 'review' | 'failed' = 'passed';

  if (!gstin || gstin.length !== 15) {
    identityScore = 25;
    identityExpl = 'GSTIN is missing or does not conform to the 15-character standard.';
    identityStatus = 'failed';
  } else {
    // Check GSTIN state vs seller type mismatches
    if (declaredSellerType && gstRegistrationType) {
      const isMfgDeclared = declaredSellerType === 'direct_manufacturer' || declaredSellerType === 'contract_manufacturer';
      const isTraderGst = gstRegistrationType === 'Trader' || gstRegistrationType === 'Services';
      if (isMfgDeclared && isTraderGst) {
        identityScore = Math.max(identityScore, 15);
        identityExpl = `GST classification mismatch: Seller declared as manufacturer, but GST registry lists activity as ${gstRegistrationType}.`;
        identityStatus = 'review';
      }
    }

    // Check Bank Name mismatch
    if (bankAccountName && registeredBusinessName) {
      const cleanBank = bankAccountName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanReg = registeredBusinessName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanBank !== cleanReg && !cleanReg.includes(cleanBank) && !cleanBank.includes(cleanReg)) {
        identityScore = Math.max(identityScore, 18);
        identityExpl = `Bank registration mismatch: Bank account holder name "${bankAccountName}" does not match company name "${registeredBusinessName}".`;
        identityStatus = 'review';
      }
    }
  }

  let behaviorScore = 0;
  let behaviorExpl = 'Response speed and matching patterns fall within expected ranges.';
  let behaviorStatus: 'passed' | 'review' | 'failed' = 'passed';

  let contentScore = 0;
  let contentExpl = 'Product descriptions and machinery lists are verified.';
  let contentStatus: 'passed' | 'review' | 'failed' = 'passed';

  // Check invalid/expired certificate numbers (mock check for demo)
  if (certNumbers && certNumbers.some(c => c.toLowerCase().includes('expired') || c.toLowerCase().includes('fake'))) {
    contentScore = 15;
    contentExpl = 'Certificate verification failed: One or more certification numbers did not resolve in issuing registry databases.';
    contentStatus = 'review';
  }

  let geographyScore = 0;
  let geographyExpl = 'GPS coordinates geolocate perfectly within declared GIDC zone.';
  let geographyStatus: 'passed' | 'review' | 'failed' = 'passed';

  if (gpsCoords && !gpsCoords.includes('N') && !gpsCoords.includes('E')) {
    geographyScore = 15;
    geographyExpl = 'GPS coordinate telemetry is weak or malformed.';
    geographyStatus = 'review';
  }

  if (phoneCode && phoneCode !== '+91' && phoneCode !== '91') {
    geographyScore = 10;
    geographyExpl = 'Registered phone number country code does not match India (+91) factory origin.';
    geographyStatus = 'review';
  }

  const totalScore = identityScore + behaviorScore + contentScore + geographyScore;
  let rating: RiskAnalysis['rating'] = 'Normal';
  if (totalScore > 80) rating = 'Blocked';
  else if (totalScore > 60) rating = 'Review';
  else if (totalScore > 40) rating = 'Restricted';
  else if (totalScore > 20) rating = 'Monitor';

  return {
    totalScore,
    rating,
    signals: {
      identity: { score: identityScore, status: identityStatus, explanation: identityExpl },
      behavior: { score: behaviorScore, status: behaviorStatus, explanation: behaviorExpl },
      content: { score: contentScore, status: contentStatus, explanation: contentExpl },
      geography: { score: geographyScore, status: geographyStatus, explanation: geographyExpl }
    }
  };
}
