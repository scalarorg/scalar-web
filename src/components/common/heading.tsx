import { cn } from "@/lib/utils";
import { ValidRoutes } from "@/types/routers";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { ReactNode } from "react";

interface HeadingProps {
  children: ReactNode;
  className?: string;
  to?: ValidRoutes;
}

export const Heading = ({ children, className, to }: HeadingProps) => {
  const headingClass = cn(
    "font-semibold text-2xl text-text-primary-500",
    className,
  );

  return to ? (
    <div className="flex items-center gap-3">
      <Link to={to}>
        <ArrowLeftIcon size={24} />
      </Link>
      <h1 className={headingClass}>{children}</h1>
    </div>
  ) : (
    <h1 className={headingClass}>{children}</h1>
  );
};
