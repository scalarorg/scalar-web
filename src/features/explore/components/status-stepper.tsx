import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";

const steps = [
  {
    step: 1,
    title: "Linked",
  },
  {
    step: 2,
    title: "Sent",
  },
  {
    step: 3,
    title: "Deposit Address",
  },
  {
    step: 4,
    title: "Received",
  },
];

export const StatusStepper = () => {
  return (
    <div className="max-w-xl space-y-5 text-center">
      <Stepper defaultValue={4}>
        {steps.map(({ step, title }) => (
          <StepperItem
            key={step}
            step={step}
            className="relative flex-1 flex-col!"
          >
            <StepperTrigger className="flex-col gap-3 rounded" asChild>
              <>
                <StepperIndicator className="z-10 size-8 data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-white [&_span]:sr-only [&_svg]:size-4" />
                <div className="p-1">
                  <StepperTitle className="text-primary text-xs">
                    {title}
                  </StepperTitle>
                </div>
              </>
            </StepperTrigger>
            {step < steps.length && (
              <StepperSeparator className="-order-1 -translate-y-1/2 absolute inset-x-0 top-4 left-[calc(50%+0.75rem+0.125rem)] m-0 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  );
};
