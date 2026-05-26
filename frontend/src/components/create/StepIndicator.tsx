interface StepIndicatorProps {
  currentStep: 1 | 2;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps): JSX.Element => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm">
      {[1, 2].map((step) => {
        const isActive = step === currentStep;
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              className={[
                'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition',
                isActive ? 'bg-veda-dark text-white' : 'bg-[#F3F3F3] text-veda-label',
              ].join(' ')}
            >
              {step}
            </div>
            <div>
              <div className="text-sm font-medium text-veda-dark">Step {step}</div>
              <div className="text-xs text-veda-label">{step === 1 ? 'Assignment Details' : 'Assignment Info'}</div>
            </div>
            {step === 1 ? <div className="mx-2 h-px w-10 bg-[#E5E5E5]" /> : null}
          </div>
        );
      })}
    </div>
  );
};
