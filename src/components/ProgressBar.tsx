interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between w-full font-sans">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isCompleted
                    ? 'bg-trust-green border-trust-green text-white'
                    : isActive
                    ? 'bg-navy border-navy text-white'
                    : 'bg-white border-border-strong text-text-muted'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider mt-1 text-center max-w-[80px] leading-tight ${
                  isActive ? 'text-navy font-bold' : isCompleted ? 'text-trust-green font-bold' : 'text-text-muted'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-16px] ${
                  isCompleted ? 'bg-trust-green' : 'bg-border-default'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
