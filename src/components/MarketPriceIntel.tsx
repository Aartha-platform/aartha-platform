"use client";

import { analyzePriceAgainstMarket, MarketPriceBenchmark } from '../lib/marketIntel';
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, AlertCircle } from 'lucide-react';

interface MarketPriceIntelProps {
  productName: string;
  targetPrice?: number;
}

export default function MarketPriceIntel({ productName, targetPrice }: MarketPriceIntelProps) {
  const analysis = targetPrice ? analyzePriceAgainstMarket(productName, targetPrice) : null;
  
  // Find generic benchmark if targetPrice isn't set (e.g. for general dashboard insights)
  const defaultBenchmarkKey = 'paracetamol';
  const benchmark: MarketPriceBenchmark = analysis?.benchmark || 
    (Object.values(require('../lib/marketIntel').marketBenchmarks) as MarketPriceBenchmark[]).find(
      (b) => productName.toLowerCase().includes(b.commodity.toLowerCase()) || 
             b.commodity.toLowerCase().includes(productName.toLowerCase())
    ) || (require('../lib/marketIntel').marketBenchmarks)[defaultBenchmarkKey];

  const trendIcons = {
    up: <TrendingUp size={14} className="text-trust-red" />,
    down: <TrendingDown size={14} className="text-trust-green" />,
    stable: <span className="text-text-muted">Stable</span>,
  };

  const trendColors = {
    up: 'text-trust-red bg-trust-red-bg border border-trust-red/10',
    down: 'text-trust-green bg-trust-green-bg border border-trust-green/10',
    stable: 'text-text-secondary bg-cream-secondary border border-border-default',
  };

  return (
    <div className="bg-white border border-border-default rounded-xl p-5 space-y-4 shadow-2xs font-sans text-xs">
      <div className="flex justify-between items-start border-b border-border-default/50 pb-2">
        <div>
          <h4 className="font-bold text-text-primary text-sm leading-tight uppercase tracking-wide">
            Price Intelligence
          </h4>
          <span className="text-[10px] text-text-muted font-mono mt-0.5 block">{benchmark.commodity}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-text-muted font-medium bg-cream px-2 py-0.5 rounded border border-border-default/30">
          <RefreshCw size={8} className="animate-spin" />
          <span>{benchmark.freshness}</span>
        </div>
      </div>

      {/* Visual Benchmark Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-text-muted uppercase font-bold tracking-wider">
          <span>Low: ${benchmark.lowPrice.toFixed(2)}</span>
          <span>Avg: ${benchmark.avgPrice.toFixed(2)}</span>
          <span>High: ${benchmark.highPrice.toFixed(2)}</span>
        </div>

        <div className="relative h-2 bg-gradient-to-r from-trust-green/50 via-gold/50 to-trust-red/50 rounded-full">
          {/* Indicator slider */}
          {targetPrice && (
            <div 
              className="absolute -top-1.5 w-4 h-4 bg-navy border-2 border-white rounded-full shadow-md flex items-center justify-center -translate-x-1/2 group cursor-pointer"
              style={{
                left: `${Math.min(
                  100,
                  Math.max(
                    0,
                    ((targetPrice - benchmark.lowPrice * 0.8) / (benchmark.highPrice * 1.2 - benchmark.lowPrice * 0.8)) * 100
                  )
                )}%`,
              }}
              title={`Your Price Target: $${targetPrice}`}
            >
              <div className="absolute -bottom-6 bg-navy text-white text-[10px] font-bold px-1 py-0.5 rounded shadow whitespace-nowrap">
                Your target: ${targetPrice}
              </div>
            </div>
          )}
        </div>
        <div className="text-[10px] text-text-muted text-right italic font-medium pt-1">
          Source: {benchmark.source}
        </div>
      </div>

      {/* Analysis Details */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-cream/45 p-3 rounded-lg border border-border-default/30 space-y-1">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Trend Direction</span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${trendColors[benchmark.trend]}`}>
              {trendIcons[benchmark.trend]}
              <span className="capitalize">{benchmark.trend}</span>
            </span>
            <span className="text-text-muted text-[10px] font-semibold">{benchmark.changePercent}% mom</span>
          </div>
        </div>

        <div className="bg-cream/45 p-3 rounded-lg border border-border-default/30 space-y-1">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Sourcing Band</span>
          <div className="font-bold text-navy text-xs mt-0.5">
            ${benchmark.lowPrice.toFixed(2)}–${benchmark.highPrice.toFixed(2)} / {benchmark.unit}
          </div>
        </div>
      </div>

      {analysis && (
        <div className="bg-trust-blue-bg/30 border border-trust-blue/15 p-3 rounded-lg flex gap-2.5 items-start">
          <AlertCircle size={14} className="text-trust-blue flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-xs text-text-secondary leading-normal font-semibold">
            {analysis.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
