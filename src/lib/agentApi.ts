import { MatchResult, BuyerRequirements } from './aiMatching';
import { Supplier } from '../types';

export interface AgentMatchResponse {
  "@context": string;
  "@type": string;
  timestamp: string;
  query: {
    category: string;
    subcategory?: string;
    certifications?: string[];
    gidcZone?: string;
  };
  results: Array<{
    "@type": string;
    supplierId: string;
    companyName: string;
    matchScore: number;
    corridorFit: boolean;
    verificationGateState: string;
    badgeLifecycleState: string;
    reasons: string[];
    location: {
      city: string;
      state: string;
      gidcZone?: string;
      gpsCoordinates?: string;
    };
    structuredProducts: Array<{
      id: string;
      name: string;
      moq: number;
      moqUnit: string;
      priceRange: string;
    }>;
  }>;
}

/**
 * Generates a structured JSON-LD payload for programmatic / agent consumption.
 */
export function generateAgentMatchPayload(
  requirements: BuyerRequirements,
  matches: MatchResult[],
  suppliers: Supplier[]
): AgentMatchResponse {
  return {
    "@context": "https://schema.aartha.site/sourcing/v1",
    "@type": "SourcingMatchResponse",
    timestamp: new Date().toISOString(),
    query: {
      category: requirements.category,
      subcategory: requirements.subcategory,
      certifications: requirements.certifications,
      gidcZone: requirements.gidcZone,
    },
    results: matches.map((match) => {
      const supplier = suppliers.find((s) => s.id === match.supplierId);
      return {
        "@type": "VerifiedSupplierMatch",
        supplierId: match.supplierId,
        companyName: match.companyName,
        matchScore: match.score,
        corridorFit: match.corridorFit,
        verificationGateState: supplier?.verificationGateState || 'unverified',
        badgeLifecycleState: supplier?.badgeLifecycleState || 'expired',
        reasons: match.reasons,
        location: {
          city: supplier?.location.city || '',
          state: supplier?.location.state || '',
          gidcZone: supplier?.location.gidcZone,
          gpsCoordinates: supplier?.location.gpsCoordinates,
        },
        structuredProducts: (supplier?.structuredProducts || []).map((p) => ({
          id: p.id,
          name: p.name,
          moq: p.moq,
          moqUnit: p.moqUnit,
          priceRange: p.priceRange,
        })),
      };
    }),
  };
}
