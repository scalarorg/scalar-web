import * as React from 'react';

import { cn } from '@/lib/utils';
import { If } from '../common';

type TInput = React.ComponentProps<'input'>;

function Input({ className, type, ...props }: TInput) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'main-shadow flex h-9 w-full min-w-0 rounded-md bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
        'placeholder:text-text-primary-500/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        className
      )}
      {...props}
    />
  );
}

type TIconInput = TInput & {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  startIconClassName?: string;
  endIconClassName?: string;
  iconClassName?: string;
  wrapperClassName?: string;
};

const IconInput = ({
  startIcon,
  endIcon,
  className,
  type,
  startIconClassName,
  endIconClassName,
  iconClassName,
  wrapperClassName,
  ...props
}: TIconInput) => {
  return (
    <div className={cn('relative', wrapperClassName)}>
      <If condition={startIcon}>
        {(icon) => (
          <div
            className={cn(
              'absolute top-0 left-0 flex size-9 items-center justify-center',
              iconClassName,
              startIconClassName
            )}
            aria-hidden='true'
          >
            {icon}
          </div>
        )}
      </If>
      <Input
        type={type}
        data-slot='icon-input'
        className={cn(startIcon && 'pl-9', endIcon && 'pr-9', className)}
        {...props}
      />
      <If condition={endIcon}>
        {(icon) => (
          <div
            className={cn(
              'absolute top-0 right-0 flex size-9 items-center justify-center',
              iconClassName,
              endIconClassName
            )}
            aria-hidden='true'
          >
            {icon}
          </div>
        )}
      </If>
    </div>
  );
};

export { Input, type TInput, type TIconInput, IconInput };
