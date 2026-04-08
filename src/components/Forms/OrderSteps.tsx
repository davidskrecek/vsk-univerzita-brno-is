interface OrderStep {
  title: string;
  description: string;
}

interface OrderStepsProps {
  steps: OrderStep[];
}

export const OrderSteps = ({ steps }: OrderStepsProps) => {
  return (
    <ol className="space-y-6">
      {steps.map((step, idx) => (
        <li key={step.title} className="flex gap-4">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-display font-bold text-on-surface/60">
            {idx + 1}
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface/70">
              {step.title}
            </div>
            <div className="text-xs font-sans text-on-surface/40 leading-relaxed">
              {step.description}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default OrderSteps;
