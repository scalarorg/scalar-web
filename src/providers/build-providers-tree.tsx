import type { ElementType, ReactNode } from "react";

type ProvidersType = [ElementType, Record<string, unknown>?]; // Props is optional
type ChildrenType = {
  children: ReactNode;
};

export const buildProvidersTree = (
  componentsWithProps: Array<ProvidersType>,
) => {
  const initialComponent = ({ children }: ChildrenType) => <>{children}</>;

  return componentsWithProps.reduce(
    (AccumulatedComponents: ElementType, [Provider, props]: ProvidersType) => {
      return ({ children }: ChildrenType) => (
        <AccumulatedComponents>
          <Provider {...(props ?? {})}>{children}</Provider>
        </AccumulatedComponents>
      );
    },
    initialComponent,
  );
};
