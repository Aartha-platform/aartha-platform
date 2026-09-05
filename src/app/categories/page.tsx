"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, ArrowRight, ShieldCheck, CheckCircle2, 
  HelpCircle, Sparkles, Wrench, Settings, FileText, ArrowUpRight 
} from 'lucide-react';

interface PartFamily {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  whatIsIt: string;
  whoUsesIt: string[];
  customizations: string[];
  materials: string[];
  processes: string[];
  tolerances: string;
  typicalLeadTime: string;
}

const partFamilies: PartFamily[] = [
  {
    id: 'bracket',
    name: 'Brackets & Structural Mounts',
    subtitle: 'L-brackets, gusseted mounts, sensor brackets, and stiffener clips',
    badge: 'Core Sheet Metal Wedge',
    whatIsIt: 'Formed structural components engineered to position, support, or connect sub-assemblies, sensors, motors, and PCB modules with precise bend geometry.',
    whoUsesIt: ['Industrial Automation & Robotics', 'EV Battery & Drivetrain Mounts', 'Electrical Enclosure Internals', 'Machinery Frame Builders'],
    customizations: [
      'Slotted adjustment holes and clearance cutouts',
      'Bend angles from 30° to 150° with matched die radius',
      'Countersunk holes, PEM studs, and clinch nuts',
      'Deburred edge treatment and corner radiusing'
    ],
    materials: ['Stainless Steel 304 / 316 (1.0–6.0 mm)', 'CRCA Mild Steel (0.8–8.0 mm)', 'Aluminum 5052 / 6061 (1.0–6.0 mm)', 'Galvanized / GI Sheet (1.0–3.0 mm)'],
    processes: ['CNC Fiber Laser Cutting', 'CNC Press Brake Air Bending', 'Tumble / Vibratory Deburring', 'Zinc Plating / Powder Coating'],
    tolerances: 'Linear ±0.2 mm · Hole centers ±0.15 mm · Angular ±0.5°',
    typicalLeadTime: '5–8 business days (Prototype) · 10–14 days (Batch)',
  },
  {
    id: 'plate',
    name: 'Mounting & Adapter Base Plates',
    subtitle: 'Machine base plates, DIN adapter plates, motor flanges, and fixture stiffeners',
    badge: 'High Precision Flat',
    whatIsIt: 'Precision 2D flat profiles and machined plates designed as foundation mounting surfaces for electrical components, guide rails, and pneumatic actuators.',
    whoUsesIt: ['Special Purpose Machine (SPM) Builders', 'Test Jig & Inspection Fixture Makers', 'Factory Automation Assembly', 'Power Distribution Panel Builders'],
    customizations: [
      'High-density tapped hole arrays (M2.5 to M16)',
      'Precision pocketing and lightweighting cutouts',
      'Countersinks for flush socket-head assembly',
      'Beveled / chamfered outer perimeter edges'
    ],
    materials: ['Mild Steel Plate IS2062 / E250 (2.0–16.0 mm)', 'Aluminum 6061-T6 (2.0–12.0 mm)', 'Stainless Steel 304 (1.5–10.0 mm)', 'Brass / Copper Busbars (1.0–8.0 mm)'],
    processes: ['CNC Fiber Laser Cutting (Burr-free nitrogen assist)', 'CNC Surface Tapping & Countersinking', 'Vibratory Deburring', 'Black Oxide / Anodizing / Nickel Plating'],
    tolerances: 'Linear ±0.15 mm · Hole pitch ±0.1 mm · Surface flatness < 0.3 mm/m',
    typicalLeadTime: '4–7 business days (Prototype) · 8–12 days (Batch)',
  },
  {
    id: 'cover',
    name: 'Covers & Protective Guard Panels',
    subtitle: 'Chassis top covers, access doors, inspection lids, and safety guards',
    badge: 'Fit & Finish Critical',
    whatIsIt: 'Protective metal exterior panels that shield internal mechanical and electrical components from debris, fluids, or accidental operator contact while providing easy access for servicing.',
    whoUsesIt: ['Packaging Machinery Builders', 'HVAC Equipment Manufacturers', 'Laser & CNC Machine Guards', 'Power Electronics Enclosures'],
    customizations: [
      'Punched ventilation louvers and mesh cutouts',
      'Captive thumb-screw hardware integration',
      'Neoprene / EPDM gasket sealing surfaces',
      'Laser-etched part numbers and safety icons'
    ],
    materials: ['CRCA Mild Steel (0.8–2.0 mm)', 'Stainless Steel 304 (0.8–2.0 mm 2B / No. 4 finish)', 'Aluminum 5052 (1.0–2.5 mm)'],
    processes: ['Laser Cutting', 'Multi-bend Press Brake Folding', 'Spot Welding / Corner Hemming', 'Textured Powder Coating (RAL Shades)'],
    tolerances: 'Linear ±0.25 mm · Bend repeatability ±0.2 mm',
    typicalLeadTime: '6–10 business days',
  },
  {
    id: 'housing',
    name: 'Housings & Controller Chassis',
    subtitle: 'Multi-part sheet metal boxes, IoT enclosures, power supply cases, and DIN housings',
    badge: 'Turnkey Hardware Assembly',
    whatIsIt: 'Complete folded sheet-metal enclosures that house electronics, display screens, batteries, or hydraulic valves with integrated mounting standoffs and earthing studs.',
    whoUsesIt: ['Hardware & IoT Startups', 'Solar Inverter & EV Charger Makers', 'Medical Device Consoles', 'Audio & Telecom Rack Equipment'],
    customizations: [
      'Self-clinching PEM standoffs for PCB mounting',
      'Integrated DIN-rail or 19-inch rack ear tabs',
      'Silk-screened or UV-printed front panel graphics',
      'Pre-assembled copper earthing studs and hardware'
    ],
    materials: ['CRCA Sheet Steel (1.0–2.0 mm)', 'Aluminum 5052 / 6061 (1.2–3.0 mm)', 'SS304 Brushed Finish (1.0–1.5 mm)'],
    processes: ['Laser Cut + CNC Bending', 'TIG / Resistance Spot Welding', 'PEM Hardware Insertion', 'Custom Powder Coating (Matte/Gloss)'],
    tolerances: 'Enclosure squareness ±0.5 mm · Hole-to-bend distance ±0.2 mm',
    typicalLeadTime: '8–14 business days',
  },
];

export default function CategoriesPage() {
  const [activeFamilyId, setActiveFamilyId] = useState<string>(partFamilies[0].id);
  const activeFamily = partFamilies.find((f) => f.id === activeFamilyId) || partFamilies[0];

  return (
    <div className="bg-[#f8fafc] font-sans min-h-screen text-[#0f172a] pb-20">
      
      {/* Header Banner */}
      <section className="bg-white border-b border-[#e2e8f0] py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#eff6ff] text-[#2563eb] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#dbeafe]">
            <Layers size={14} />
            <span>Aartha Manufacturing Scope · Focused Gujarat Cluster Wedge</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0f172a] leading-tight">
                What We Make
              </h1>
              <p className="text-sm sm:text-base text-[#64748b] leading-relaxed">
                We focus on doing one category exceptionally well: <strong>custom precision sheet-metal components and housings</strong>. From 2D laser profiling to multi-bend formed assemblies, fabricated in audited Gujarat clusters.
              </p>
            </div>

            <Link
              href="/rfq"
              className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0 self-center sm:self-auto no-underline"
            >
              <span>Upload Custom Drawing</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Staged Capability Scope Roadband */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#64748b] mb-3">
            Execution Scope & Staged Expansion
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0]">
              <div className="flex items-center justify-between font-bold text-[#059669]">
                <span>Phase 01 · Active Now</span>
                <span>● Operational</span>
              </div>
              <p className="font-bold text-[#0f172a] mt-1.5">Laser Cut + CNC Bending</p>
              <p className="text-[11px] text-[#475569] mt-0.5">
                Brackets, mounting base plates, chassis covers, inspection lids, standard folded housings.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#eff6ff] border border-[#dbeafe]">
              <div className="flex items-center justify-between font-bold text-[#2563eb]">
                <span>Phase 02 · Rolling Out</span>
                <span>In Expansion</span>
              </div>
              <p className="font-bold text-[#0f172a] mt-1.5">Welded & Standoff Assemblies</p>
              <p className="text-[11px] text-[#475569] mt-0.5">
                MIG/TIG weldments, captive PEM fasteners, clinch nuts, full powder-coated enclosure assemblies.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
              <div className="flex items-center justify-between font-bold text-[#64748b]">
                <span>Phase 03 · Roadmap</span>
                <span>Future Wedge</span>
              </div>
              <p className="font-bold text-[#0f172a] mt-1.5">Multi-Process Assemblies</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                Sheet metal integrated with CNC turned pins, stamped brackets, and turnkey warehousing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalogue Deep-Dive */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Part Family Selector */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#64748b] block pl-1">
              Select Component Family
            </span>
            {partFamilies.map((family) => {
              const isSelected = family.id === activeFamilyId;
              return (
                <button
                  key={family.id}
                  onClick={() => setActiveFamilyId(family.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#2563eb] shadow-md ring-1 ring-[#2563eb]/20'
                      : 'bg-white/80 border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0f172a]">
                      {family.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-[#eff6ff] text-[#2563eb]' : 'bg-[#f1f5f9] text-[#64748b]'
                    }`}>
                      {family.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-1 line-clamp-1">
                    {family.subtitle}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right: Architectural Specifications for Active Family */}
          <div className="lg:col-span-8 bg-white border border-[#e2e8f0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f1f5f9] pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2563eb]">
                  Manufacturing Specification
                </span>
                <h2 className="text-2xl font-black text-[#0f172a] mt-0.5">
                  {activeFamily.name}
                </h2>
                <p className="text-xs text-[#64748b] mt-1 max-w-lg leading-relaxed">
                  {activeFamily.whatIsIt}
                </p>
              </div>

              <Link
                href={`/rfq?family=${activeFamily.id}`}
                className="inline-flex items-center gap-1.5 bg-[#0f172a] hover:bg-[#1e293b] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all no-underline shadow-xs shrink-0"
              >
                <span>Request a Quote →</span>
              </Link>
            </div>

            {/* Q&A Structure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              
              {/* Who uses it */}
              <div className="space-y-2">
                <div className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Wrench size={13} className="text-[#2563eb]" />
                  <span>Who Uses This Part?</span>
                </div>
                <ul className="space-y-1.5 text-[#475569]">
                  {activeFamily.whoUsesIt.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#2563eb] font-bold">▪</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What can be customized */}
              <div className="space-y-2">
                <div className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Settings size={13} className="text-[#f97316]" />
                  <span>Customizable Features</span>
                </div>
                <ul className="space-y-1.5 text-[#475569]">
                  {activeFamily.customizations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#f97316] font-bold">▪</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supported Materials */}
              <div className="space-y-2">
                <div className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px]">
                  Supported Materials
                </div>
                <ul className="space-y-1 text-[#475569]">
                  {activeFamily.materials.map((mat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#059669] shrink-0" />
                      <span>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Processes & Capabilities */}
              <div className="space-y-2">
                <div className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px]">
                  Fabrication Capabilities
                </div>
                <ul className="space-y-1 text-[#475569]">
                  {activeFamily.processes.map((proc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[#2563eb] shrink-0" />
                      <span>{proc}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Tolerances & Delivery Terms Footer */}
            <div className="border-t border-[#f1f5f9] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#f8fafc] p-4 rounded-xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Standard Machining Tolerance</span>
                <p className="font-mono font-bold text-[#0f172a] mt-0.5">{activeFamily.tolerances}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Turnaround Lead Time</span>
                <p className="font-bold text-[#059669] mt-0.5">{activeFamily.typicalLeadTime}</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Bottom Conversion Reassurance */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="bg-[#0f172a] text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#93c5fd]">
              HAVE A CUSTOM PART REQUIREMENT?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Don’t see your exact component listed?
            </h3>
            <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-xl leading-relaxed">
              If your part involves laser cutting, press brake bending, or welded sheet metal, send us whatever drawing, sketch, or 3D CAD you have. Our engineering desk will review manufacturability for free.
            </p>
          </div>

          <Link
            href="/rfq"
            className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all no-underline shadow-md shrink-0"
          >
            <span>Start an RFQ Now</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
}
