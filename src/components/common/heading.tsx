import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export const Heading = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h1 className={cn("font-semibold text-[40px]", className)}>{children}</h1>
  );
};
