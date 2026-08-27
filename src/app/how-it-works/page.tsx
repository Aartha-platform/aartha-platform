'use client';

import Link from 'next/link';
import { ShieldCheck, ArrowRight, UserCheck, MapPin, BarChart2, CheckCircle, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function HowItWorksPage() {
  const { lang } = useTranslation();
  const isGu = lang === 'gu';

  const steps = [
    {
      num: '01',
      title: isGu ? 'વિનંતી સબમિટ કરો' : 'Submit Sourcing Requirement',
      desc: isGu 
        ? 'ખરીદદારો તેમના વિગતવાર સ્પષ્ટીકરણો, જથ્થો અને લક્ષ્ય કિંમત સબમિટ કરે છે. આ સિસ્ટમ વ્યાવસાયિક ડોમેન્સ અને ખરીદી સત્તાવાર મર્યાદાની ચકાસણી કરે છે.'
        : 'Buyers submit their detailed product specifications, target quantity, and target prices. The system validates company domains and purchasing authority levels to prevent spam.'
    },
    {
      num: '02',
      title: isGu ? 'ભૌતિક ફેક્ટરી ઓડિટ' : 'Physical GIDC Factory Audit',
      desc: isGu
        ? 'વરિષ્ઠ ઓડિટર રાજેશ શાહના નેતૃત્વમાં ઓડિટિંગ ટીમ વાસ્તવિક ઉત્પાદક પ્લાન્ટની મુલાકાત લે છે, જીપીએસ કોઓર્ડિનેટ્સ મેપ કરે છે અને મશીનરી લાઈવ તપાસે છે.'
        : 'Our auditing team, led by Senior Auditor Rajesh Shah, schedules physical plant inspections inside Vatva GIDC, Sachin GIDC Surat, or Ankleshwar to verify actual factory setup.'
    },
    {
      num: '03',
      title: isGu ? 'દસ્તાવેજ અને ગુણવત્તા સ્કોરિંગ' : 'Document Dossier Verification',
      desc: isGu
        ? 'અમે મંત્રાલયના રેકોર્ડ્સમાંથી GSTIN, IEC અને પાલન પ્રમાણપત્રો ચકાસીએ છીએ. આ પછી, ૧૦૦-પોઇન્ટ વેરિફાઇડ ક્વોલિટી સ્કોર જનરેટ થાય છે.'
        : 'We check registered GSTIN details, active IEC export codes, and compliance documentation. A transparent 100-point Quality Score is calculated for total matching clarity.'
    },
    {
      num: '04',
      title: isGu ? 'સ્માર્ટ અને સુરક્ષિત મેચિંગ' : 'Evidence-Backed Matching',
      desc: isGu
        ? 'અમારી સિસ્ટમ ખરીદદારોના ચોક્કસ માપદંડો સાથે ઉચ્ચ સ્કોર ધરાવતા સ્થાનિક સપ્લાયર્સને મેચ કરે છે અને સબમિટ કરેલ રિકવેસ્ટ સીધી મોકલે છે.'
        : 'Our algorithm maps active buyer requirements only to verified suppliers of that exact category. Suppliers submit side-by-side quotes directly with geocoded audit evidence.'
    },
    {
      num: '05',
      title: isGu ? 'ટ્રેડ આઉટકમ ટ્રેકિંગ' : 'Outcome Tracking & Dispatch',
      desc: isGu
        ? 'ખરીદદારો અને વેન્ડર્સ કરાર, નમૂના સ્વીકૃતિ અને ચુકવણીના માઇલસ્ટોન્સને મોનિટર કરવા માટે એક સંયુક્ત ટ્રેકરનો ઉપયોગ કરે છે, જેથી સુરક્ષિત સોદો પૂર્ણ થાય.'
        : 'Both buyer and manufacturer utilize our live shared outcome trackers to record sample approval, price negotiation, and cargo dispatch milestones securely.'
    }
  ];

  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen">
      {/* Hero */}
      <section className="bg-navy text-white py-12 px-4 border-b border-border-default/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-gold/15 text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gold/10">
              <ShieldCheck size={12} /> {isGu ? 'ટ્રસ્ટ ઓએસ માર્ગદર્શિકા' : 'Trust OS Framework'}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wide">
              {isGu ? 'આ પ્લેટફોર્મ કેવી રીતે કાર્ય કરે છે?' : 'How Aartha Works'}
            </h1>
            <p className="text-gold text-lg font-semibold">
              {isGu ? 'ભૌતિક વેરિફિકેશન અને ચકાસાયેલ માહિતી સાથે વેપાર' : 'Physical Verification meets Digital Matchmaking'}
            </p>
            <p className="text-white/70 text-xs leading-relaxed max-w-xl">
              {isGu 
                ? 'અમે જાહેરાતો અથવા લિસ્ટિંગ ફી વેચતા નથી. અમારું કાર્ય સપ્લાયર્સના વાસ્તવિક સરનામાં, પ્લાન્ટ વીડિયો અને પાલન રેકોર્ડ્સનું ભૌતિક ઓડિટ કરીને ખરીદદારો સુધી પહોંચાડવાનું છે.'
                : 'Unlike legacy business portals, we do not sell higher search rankings. We verify actual physical plants, log GPS positions, check registered company documents, and enforce absolute transparent trade milestones.'}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Step List */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-center uppercase tracking-wide">
            {isGu ? 'ચકાસાયેલ સોર્સિંગ પ્રક્રિયાના ૫ પગલાં' : '5 Steps to Verified B2B Trade'}
          </h2>

          <div className="space-y-6">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-white border border-border-default rounded-2xl p-6 flex gap-6 items-start shadow-2xs hover:border-gold/25 transition-all">
                <div className="text-3xl font-mono font-bold text-gold/30 flex-shrink-0 select-none">
                  {s.num}
                </div>
                <div className="space-y-1.5 text-xs">
                  <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">{s.title}</h3>
                  <p className="text-text-secondary leading-relaxed font-medium">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Actions */}
        <section className="bg-navy text-white rounded-2xl p-8 text-center space-y-6 border border-border-default/10">
          <h2 className="text-lg font-bold uppercase tracking-wider text-gold">
            {isGu ? 'આજે જ સુરક્ષિત સોર્સિંગ શરૂ કરો' : 'Start Sourcing with Absolute Trust'}
          </h2>
          <p className="text-white/70 text-xs max-w-md mx-auto leading-relaxed">
            {isGu 
              ? 'ભલે તમે વૈશ્વિક બાયર હોવ કે ગુજરાતના સપ્લાયર, અમારા ઓડિટિંગ ગેટવે સાથે જોડાઈને સુરક્ષિત વેપારની શરૂઆત કરો.'
              : 'Access geolocated manufacturer directories or register your own factory cluster for physical verification audit routing.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/rfq" 
              className="bg-navy-light hover:bg-navy border border-white/20 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider no-underline transition-all h-11 min-h-[44px] flex items-center justify-center"
            >
              {isGu ? 'નવી RFQ સબમિટ કરો' : 'Post Sourcing RFQ'}
            </Link>
            <Link 
              href="/get-listed" 
              className="bg-gold hover:bg-gold-hover text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider no-underline transition-all h-11 min-h-[44px] flex items-center justify-center"
            >
              {isGu ? 'ફેક્ટરી ઓડિટ શેડ્યૂલ કરો' : 'Apply for GIDC Audit'}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
