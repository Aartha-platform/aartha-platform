import { RFQQuote } from '../types';

/**
 * RFQ Quotes collection.
 * In production, supplier quotations are submitted live by factories and managed
 * through the Deal Room (/deals/[dealId]) rather than static hardcoded mock entries.
 */
export const rfqQuotes: RFQQuote[] = [];
