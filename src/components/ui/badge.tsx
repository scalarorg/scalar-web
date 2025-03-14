import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2 py-0.5 font-medium text-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: "border-transparent bg-success [a&]:hover:bg-success/90",
        fail: "border-transparent bg-fail [a&]:hover:bg-fail/90",
        pending: "border-transparent bg-pending [a&]:hover:bg-pending/90",
        executing: "border-transparent bg-executing [a&]:hover:bg-executing/90",
      },
      ghost: {
        true: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        ghost: true,
        className: "border-transparent bg-primary/20 text-primary",
      },
      {
        variant: "secondary",
        ghost: true,
        className: "border-transparent bg-secondary/20 text-secondary",
      },
      {
        variant: "destructive",
        ghost: true,
        className: "border-transparent bg-destructive/20 text-destructive",
      },
      {
        variant: "success",
        ghost: true,
        className: "border-transparent bg-success/20 text-success",
      },
      {
        variant: "fail",
        ghost: true,
        className: "border-transparent bg-fail/20 text-fail",
      },
      {
        variant: "pending",
        ghost: true,
        className: "border-transparent bg-pending/20 text-pending",
      },
      {
        variant: "executing",
        ghost: true,
        className: "border-transparent bg-executing/20 text-executing",
      },
    ],
    defaultVariants: {
      variant: "default",
      ghost: false,
    },
  },
);

type TBadgeVariants = VariantProps<typeof badgeVariants>;

function Badge({
  className,
  variant,
  ghost,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & TBadgeVariants & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, ghost }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants, type TBadgeVariants };
