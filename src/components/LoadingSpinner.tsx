export default function LoadingSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-border-default border-t-gold rounded-full animate-spin" />
        <p className="text-text-secondary text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
