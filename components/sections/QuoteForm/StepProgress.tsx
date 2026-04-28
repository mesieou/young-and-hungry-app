import { Eyebrow } from "@/components/ui/Eyebrow";
import { quoteSteps } from "./constants";

type StepProgressProps = {
  currentStep: number;
  isSuccess: boolean;
  onStepClick: (stepIndex: number) => void;
};

export function StepProgress({ currentStep, isSuccess, onStepClick }: StepProgressProps) {
  return (
    <div className="mb-8">
      <Eyebrow>
        Step {currentStep + 1}/{quoteSteps.length}
      </Eyebrow>
      <h2 className="mt-2 font-display text-xl font-semibold tracking-tight-2 text-white sm:text-2xl">
        {quoteSteps[currentStep]?.title}
      </h2>
      <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Quote steps">
        {quoteSteps.map((step, index) => {
          const isActive = currentStep === index;
          const isComplete = currentStep > index || isSuccess;
          const canOpenStep = index <= currentStep && !isSuccess;

          return (
            <button
              key={step.title}
              type="button"
              className={`h-1.5 rounded-full transition ${
                isActive
                  ? "bg-gradient-to-r from-violet to-blue shadow-glow"
                  : isComplete
                    ? "bg-success/80"
                    : "bg-line/70 hover:bg-line-hover"
              }`}
              aria-label={`0${index + 1} ${step.shortTitle}`}
              aria-current={isActive ? "step" : undefined}
              disabled={!canOpenStep}
              onClick={() => onStepClick(index)}
            />
          );
        })}
      </div>
      <div className="mt-3 hidden grid-cols-5 gap-2 sm:grid">
        {quoteSteps.map((step, index) => {
          const isActive = index === currentStep;
          const canOpenStep = index <= currentStep && !isSuccess;

          return (
            <button
              key={step.title}
              type="button"
              className={`text-left text-[11px] font-semibold uppercase tracking-eyebrow-sm transition ${
                isActive ? "text-white" : "text-text-muted"
              } ${canOpenStep ? "cursor-pointer hover:text-white" : "cursor-default opacity-60"}`}
              disabled={!canOpenStep}
              onClick={() => onStepClick(index)}
            >
              {step.shortTitle}
            </button>
          );
        })}
      </div>
    </div>
  );
}
