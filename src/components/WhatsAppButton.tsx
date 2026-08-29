import { getWhatsAppUrl, WhatsAppSource, DEFAULT_WHATSAPP_NUMBER } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  source?: WhatsAppSource;
  label?: string;
  className?: string;
  variant?: 'solid' | 'glass';
}

export default function WhatsAppButton({
  phoneNumber = DEFAULT_WHATSAPP_NUMBER,
  message,
  source = 'general',
  label = 'Chat on WhatsApp',
  className = '',
  variant = 'solid'
}: WhatsAppButtonProps) {
  const waLink = getWhatsAppUrl(source, message, phoneNumber);

  const variantStyles = variant === 'glass'
    ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-600/10 to-emerald-700/5 text-emerald-400 hover:text-white border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/30 backdrop-blur-md shadow-premium-sm hover:shadow-emerald-500/25 hover:scale-[1.03] transition-all duration-300 animate-glow-pulse'
    : 'bg-whatsapp hover:bg-whatsapp/90 text-white shadow-xs hover:shadow-md hover:scale-[1.02] transition-all duration-200';

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2.5 font-bold uppercase tracking-wider py-2.5 px-4 rounded-xl text-xs cursor-pointer select-none no-underline ${variantStyles} ${className}`}
    >
      {/* WhatsApp SVG logo */}
      <svg
        className="w-4 h-4 fill-current flex-shrink-0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.122.996 11.99.996c-5.441 0-9.87 4.373-9.874 9.8.001 1.637.45 3.238 1.3 4.675L2.4 21.082l6.247-1.628zm10.742-5.467c-.29-.145-1.716-.848-1.98-.943-.266-.096-.46-.145-.654.145-.193.291-.749.943-.918 1.137-.17.195-.34.219-.63.075-1.02-.511-1.689-.863-2.316-1.942-.257-.442.257-.41.737-1.37.08-.163.04-.305-.02-.45-.06-.145-.654-1.577-.897-2.16-.236-.57-.497-.491-.68-.501-.17-.008-.364-.01-.557-.01-.193 0-.509.072-.776.364-.266.291-1.02 1.002-1.02 2.443 0 1.441 1.05 2.83 1.196 3.024.145.195 2.062 3.149 5 4.36.7.288 1.246.46 1.673.596.702.222 1.342.19 1.847.114.563-.084 1.716-.701 1.96-1.378.243-.678.243-1.26.17-.137-.073-.122-.29-.267-.58-.412z" />
      </svg>
      <span>{label}</span>
    </a>
  );
}
