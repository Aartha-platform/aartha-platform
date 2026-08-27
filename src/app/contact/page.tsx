'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Clock, MapPin, CheckCircle, ShieldCheck, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/Toast';
import WhatsAppButton from '@/components/WhatsAppButton';
import Checkbox from '@/components/ui/Checkbox';

export default function ContactPage() {
  const { lang, t } = useTranslation();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    whatsappNotifications: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(
        lang === 'gu' 
          ? 'સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો છે! અમારી ટીમ ટૂંક સમયમાં સંપર્ક કરશે.' 
          : 'Message sent successfully! Our verification desk will get back to you shortly.',
        'success'
      );
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        whatsappNotifications: true
      });
    }, 1200);
  };

  const isGu = lang === 'gu';

  return (
    <div className="bg-cream font-sans text-text-primary min-h-screen">
      {/* Hero Header */}
      <section className="bg-navy text-white py-12 px-4 border-b border-border-default/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-gold/15 text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gold/10">
              <ShieldCheck size={12} /> {isGu ? 'ચકાસાયેલ B2B સોર્સિંગ ડેસ્ક' : 'Verified B2B Sourcing Desk'}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wide">
              {isGu ? 'અમારો સંપર્ક કરો' : 'Contact Sourcing Desk'}
            </h1>
            <p className="text-gold text-lg font-semibold">
              {isGu ? 'ગુજરાત ઔદ્યોગિક કોરિડોર માટે સત્તાવાર સપોર્ટ ગેટવે' : 'Official Support Gateway for Gujarat Industrial Corridors'}
            </p>
            <p className="text-white/70 text-xs leading-relaxed max-w-xl">
              {isGu 
                ? 'સપ્લાયર ચકાસણી, ભૌતિક ઓડિટ મુલાકાતો અથવા વૈશ્વિક બાયર મેળ ખાતી ક્વેરી માટે સીધો અમારો સંપર્ક કરો. કોઈ સ્પેમ નહીં, માત્ર પ્રત્યક્ષ ચકાસાયેલ કનેક્શન.'
                : 'Get in touch directly for supplier verification status, physical GIDC audit schedules, or global buyer matching inquiries. Zero automated spam, only direct checked matching.'}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          {/* Contact Form */}
          <div className="bg-white border border-border-default rounded-2xl p-6 space-y-6 shadow-2xs">
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">
                {isGu ? 'સંપર્ક ફોર્મ' : 'Direct Inquiry Form'}
              </h2>
              <p className="text-[10px] text-text-muted mt-1">
                {isGu ? 'બધા પ્રશ્નો ૨ કલાકની અંદર ચકાસવામાં આવે છે.' : 'All customer support tickets are processed within 2 operating hours.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    {isGu ? 'નામ *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2.5 focus:outline-none focus:border-navy"
                    placeholder={isGu ? 'રાહુલ પટેલ' : 'Rahul Patel'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    {isGu ? 'ઈમેલ સરનામું *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2.5 focus:outline-none focus:border-navy"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    {isGu ? 'કંપનીનું નામ (વૈકલ્પિક)' : 'Company Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2.5 focus:outline-none focus:border-navy"
                    placeholder="Patel Chemicals"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    {isGu ? 'વિષય *' : 'Subject *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-white border border-border-strong rounded-lg px-3 py-2.5 focus:outline-none focus:border-navy"
                    placeholder={isGu ? 'મુલાકાત શેડ્યૂલ અથવા સામાન્ય ક્વેરી' : 'Audit visitation or general matching help'}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                  {isGu ? 'સંદેશ *' : 'Message *'}
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-white border border-border-strong rounded-lg px-3 py-2.5 focus:outline-none focus:border-navy resize-none"
                  placeholder={isGu ? 'કૃપા કરીને અહીં તમારી સોર્સિંગ ક્વેરી અથવા ઓડિટ જરૂરિયાત લખો...' : 'Enter your sourcing inquiry, GSTIN details, or audit coordination query...'}
                />
              </div>

              <Checkbox
                id="whatsapp-notif"
                checked={formData.whatsappNotifications}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappNotifications: e.target.checked }))}
                label={isGu ? 'WhatsApp પર સીધા જ પ્રગતિ અપડેટ મેળવો' : 'Receive updates directly via WhatsApp'}
              />

              <div className="pt-2 border-t border-border-default/40 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-navy hover:bg-navy-light text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 uppercase tracking-wider transition-all disabled:opacity-50 h-11 min-h-[44px] cursor-pointer"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? (isGu ? 'મોકલી રહ્યું છે...' : 'Sending...') : (isGu ? 'સંદેશ મોકલો' : 'Send Message')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Contact Details & Pricing sidebar */}
          <div className="space-y-6">
            {/* Quick Contacts */}
            <div className="bg-white border border-border-default rounded-2xl p-5 space-y-4 shadow-2xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">
                {isGu ? 'ઝડપી સંપર્ક' : 'Operating Gateway'}
              </h3>
              
              <div className="space-y-3.5 text-xs text-text-secondary font-medium">
                <div className="flex items-start gap-2.5">
                  <Phone size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-text-primary">{isGu ? 'ટેલિફોન' : 'Phone'}</div>
                    <a href="tel:+917208432138" className="hover:text-gold transition-colors">+91 72084 32138</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-text-primary">General Support Email</div>
                    <div>support@aartha.site</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-text-primary">Escalation & Dispute Desk</div>
                    <div className="font-semibold text-text-primary">disputes@aartha.site</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-text-primary">AI MCP Agent Desk</div>
                    <div className="font-semibold text-text-primary">agents@aartha.site</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-text-primary">{isGu ? 'કાર્યકારી સમય' : 'Support Hours'}</div>
                    <div>Mon – Sat: 9:00 AM – 7:00 PM IST</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-text-primary">{isGu ? 'મુખ્ય કાર્યાલય' : 'Office Location'}</div>
                    <p className="leading-relaxed mt-0.5 text-[11px]">
                      5th Floor, Mondeal Heights,<br />
                      SG Highway, Ahmedabad — 380015<br />
                      Gujarat, India
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-default/50 pt-3">
                <WhatsAppButton
                  phoneNumber="+91 72084 32138"
                  message="Hello! Sourcing inquiry from contact desk."
                  className="w-full h-11 py-3"
                />
              </div>
            </div>

            {/* Pricing Transparency */}
            <div className="bg-white border border-border-default rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-navy border-b border-border-default pb-2">
                {isGu ? 'પારદર્શક કિંમતો' : 'Transparent Pricing'}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {isGu 
                  ? 'ખરીદદારો માટે પ્લેટફોર્મ મફત છે. સપ્લાયર્સ માટે, એક વખતની ચકાસણી ઓડિટ ફી લાગુ પડે છે.'
                  : 'Buyers source completely free of charge. For suppliers, physical visit audits are billed transparently:'}
              </p>
              <div className="space-y-2 pt-1">
                <div className="bg-cream-secondary/45 border border-border-default/50 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold text-text-primary">
                  <span>{isGu ? 'બેઝિક ઓડિટ મુલાકાત' : 'Basic Plant Audit'}</span>
                  <span className="text-navy">₹12,000</span>
                </div>
                <div className="bg-cream-secondary/45 border border-border-default/50 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold text-text-primary">
                  <span>{isGu ? 'વાર્ષિક પ્રીમિયમ ચકાસણી' : 'Annual Premium Audit'}</span>
                  <span className="text-navy">₹35,000</span>
                </div>
              </div>
            </div>

            {/* Audit Lead */}
            <div className="bg-white border border-border-default rounded-2xl p-5 space-y-3 shadow-2xs">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border-default pb-2">
                {isGu ? 'ઓડિટિંગ નેતૃત્વ' : 'Field Audit Lead'}
              </h3>
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 bg-navy text-gold rounded-full flex items-center justify-center font-bold text-sm">
                  RS
                </div>
                <div className="text-xs">
                  <div className="font-bold text-text-primary">Rajesh Shah</div>
                  <div className="text-[10px] text-text-muted">{isGu ? 'મુખ્ય ઓડિટર (ગુજરાત ઝોન)' : 'Senior Lead Auditor (Gujarat Zone)'}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Aartha Sourcing Desk',
            image: 'https://aartha.site/logo.png',
            telephone: '+91-72084-32138',
            email: 'support@aartha.site',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '5th Floor, Mondeal Heights, SG Highway',
              addressLocality: 'Ahmedabad',
              addressRegion: 'Gujarat',
              postalCode: '380015',
              addressCountry: 'IN'
            },
            priceRange: '₹12000 - ₹35000'
          })
        }}
      />
    </div>
  );
}
