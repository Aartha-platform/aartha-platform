import { ShoppingCart, Factory, Building2, Globe, Target, HelpCircle, CheckCircle, ShieldCheck, Lock, BarChart2, Users, ClipboardCheck, Plug, FileBarChart, Truck, DollarSign, FileCheck, UserCheck, Layers, PieChart, MessageSquare, TrendingUp } from 'lucide-react';
import { solutions } from '@/data/solutions';

const iconMap: Record<string, React.ElementType> = {
  ShoppingCart, Factory, Building2, Globe, Target, ShieldCheck, BarChart2, MessageSquare, TrendingUp,
  Users, ClipboardCheck, Plug, FileBarChart, Truck, DollarSign, FileCheck, UserCheck, Layers, PieChart, Lock,
};

const trustStats = [
  { value: '4-Tier', label: 'Verification Depth' },
  { value: 'Early Access', label: 'Buyer Program' },
  { value: 'Live', label: 'RFQ System' },
  { value: '24–48 Hrs', label: 'Avg. Match Time' },
];

export default function SolutionsPage() {
  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen">
      {/* Header */}
      <section className="bg-navy text-white py-12 px-4 text-center border-b border-border-default/10">
        <div className="max-w-4xl mx-auto space-y-3">
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wide">
            Sourcing Solutions That Power Verified Trade
          </h1>
          <p className="text-white/70 text-xs max-w-xl mx-auto leading-relaxed">
            Every transaction backed by physically audited facilities, verified company credentials, and zero-spam matching.
          </p>
        </div>
      </section>

      {/* Solution Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {solutions.map((sol) => {
            const SolIcon = iconMap[sol.icon] || ShoppingCart;
            return (
              <div key={sol.id} className="border border-border-default rounded-2xl overflow-hidden bg-white flex flex-col hover:shadow-xs transition-shadow">
                {/* Card Header */}
                <div className="bg-cream-secondary p-5 border-b border-border-default">
                  <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center mb-3">
                    <SolIcon size={20} className="text-gold" />
                  </div>
                  <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">{sol.audience}</h3>
                  <p className="text-text-secondary text-[11px] mt-1 leading-normal">{sol.subtitle}</p>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Problem */}
                  <div className="bg-trust-red-bg/50 border border-trust-red/10 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <HelpCircle size={14} className="text-trust-red flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="font-bold text-[10px] text-trust-red uppercase tracking-wider">The Problem</div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">{sol.problem}</p>
                      </div>
                    </div>
                  </div>

                  {/* Solution */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-navy" />
                      <span className="font-bold text-[10px] uppercase tracking-wider text-text-primary">Our Solution</span>
                    </div>
                    <ul className="space-y-1.5">
                      {sol.solution.map((point, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0 mt-1.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Result */}
                  <div className="bg-trust-green-bg/50 border border-trust-green/10 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-trust-green flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-trust-green font-semibold leading-relaxed">{sol.result}</p>
                    </div>
                  </div>
                </div>

                {/* CTA + Features */}
                <div className="p-5 border-t border-border-default">
                  <button className={`w-full ${sol.ctaColor} text-white py-2.5 rounded-lg text-xs font-bold mb-3 hover:opacity-90 transition-opacity cursor-pointer select-none`}>
                    {sol.ctaLabel}
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sol.features.map((f) => {
                      const FIcon = iconMap[f.icon] || CheckCircle;
                      return (
                        <div key={f.label} className="flex items-center gap-1.5 bg-cream-secondary border border-border-default/45 rounded-lg p-2">
                          <FIcon size={11} className="text-navy flex-shrink-0" />
                          <span className="text-[10px] font-bold text-text-secondary leading-none">{f.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
