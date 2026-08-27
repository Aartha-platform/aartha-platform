export interface MarketPriceBenchmark {
  commodity: string;
  category: string;
  lowPrice: number;
  avgPrice: number;
  highPrice: number;
  unit: string;
  currency: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  freshness: string;
  source: string;
}

export const marketBenchmarks: Record<string, MarketPriceBenchmark> = {
  'paracetamol': {
    commodity: 'WHO-GMP Paracetamol API',
    category: 'Pharma & Healthcare',
    lowPrice: 2.80,
    avgPrice: 3.40,
    highPrice: 4.20,
    unit: 'kg',
    currency: 'USD',
    trend: 'down',
    changePercent: 3.5,
    freshness: 'Updated 24 hours ago',
    source: 'Nandesari GIDC Trade Desk',
  },
  'ibuprofen': {
    commodity: 'WHO Grade Ibuprofen',
    category: 'Pharma & Healthcare',
    lowPrice: 3.50,
    avgPrice: 4.20,
    highPrice: 5.00,
    unit: 'kg',
    currency: 'USD',
    trend: 'up',
    changePercent: 2.1,
    freshness: 'Updated 2 days ago',
    source: 'Anand Pharma Association Log',
  },
  'cotton-weave': {
    commodity: 'GOTS Organic Cotton Weave Fabric',
    category: 'Textiles & Apparel',
    lowPrice: 4.00,
    avgPrice: 4.80,
    highPrice: 6.20,
    unit: 'meter',
    currency: 'USD',
    trend: 'stable',
    changePercent: 0.5,
    freshness: 'Updated 3 days ago',
    source: 'Surat Textile Association Exchange',
  },
  'cnc-boring-bits': {
    commodity: 'CNC Carbide boring tools',
    category: 'Machinery & Industrial',
    lowPrice: 110,
    avgPrice: 135,
    highPrice: 160,
    unit: 'unit',
    currency: 'USD',
    trend: 'up',
    changePercent: 4.2,
    freshness: 'Updated 12 hours ago',
    source: 'Vatva Machine Tool Guild',
  },
  'valve-bodies': {
    commodity: 'Cast Iron Valve Bodies DN100',
    category: 'Machinery & Industrial',
    lowPrice: 30,
    avgPrice: 38,
    highPrice: 48,
    unit: 'unit',
    currency: 'USD',
    trend: 'down',
    changePercent: 1.8,
    freshness: 'Updated 5 days ago',
    source: 'Aji GIDC Casting Bureau',
  },
  'vitrified-tiles': {
    commodity: 'Polished Vitrified Tile 600x600',
    category: 'Home & Consumer',
    lowPrice: 3.00,
    avgPrice: 3.90,
    highPrice: 5.00,
    unit: 'sqm',
    currency: 'USD',
    trend: 'stable',
    changePercent: 0.0,
    freshness: 'Updated 1 day ago',
    source: 'Morbi Ceramics Association Desk',
  },
};

export interface PriceAnalysis {
  commodity: string;
  comparedToAverage: 'low' | 'high' | 'in-band' | 'unknown';
  percentDeviation: number;
  explanation: string;
  benchmark: MarketPriceBenchmark;
}

/**
 * Analyzes where a quote or target price stands relative to the commodity benchmark.
 */
export function analyzePriceAgainstMarket(
  productName: string,
  targetPrice: number
): PriceAnalysis | null {
  // Try to find matching benchmark
  const key = Object.keys(marketBenchmarks).find((k) =>
    productName.toLowerCase().includes(k) ||
    marketBenchmarks[k].commodity.toLowerCase().includes(productName.toLowerCase())
  );

  if (!key) return null;
  const benchmark = marketBenchmarks[key];

  let comparedToAverage: 'low' | 'high' | 'in-band' = 'in-band';
  let percentDeviation = 0;

  if (targetPrice < benchmark.lowPrice) {
    comparedToAverage = 'low';
    percentDeviation = Math.round(((benchmark.lowPrice - targetPrice) / benchmark.lowPrice) * 100);
  } else if (targetPrice > benchmark.highPrice) {
    comparedToAverage = 'high';
    percentDeviation = Math.round(((targetPrice - benchmark.highPrice) / benchmark.highPrice) * 100);
  } else {
    percentDeviation = Math.round(((targetPrice - benchmark.avgPrice) / benchmark.avgPrice) * 100);
  }

  let explanation = '';
  if (comparedToAverage === 'low') {
    explanation = `Your target price ($${targetPrice.toFixed(2)}) is ${percentDeviation}% BELOW the market benchmark low ($${benchmark.lowPrice.toFixed(2)}). Matching suppliers may require higher MOQs.`;
  } else if (comparedToAverage === 'high') {
    explanation = `Your target price ($${targetPrice.toFixed(2)}) is ${percentDeviation}% ABOVE the market benchmark high ($${benchmark.highPrice.toFixed(2)}). You are highly likely to receive quick, premium quotes.`;
  } else {
    const relativeText = percentDeviation > 0 ? `${percentDeviation}% above` : `${Math.abs(percentDeviation)}% below`;
    explanation = `Your target price ($${targetPrice.toFixed(2)}) is well within the market band of $${benchmark.lowPrice.toFixed(2)}–$${benchmark.highPrice.toFixed(2)} (${relativeText} average).`;
  }

  return {
    commodity: benchmark.commodity,
    comparedToAverage,
    percentDeviation,
    explanation,
    benchmark,
  };
}
