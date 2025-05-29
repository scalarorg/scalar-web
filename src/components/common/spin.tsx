import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { If } from './if';

export const Spin = ({
  loading = false,
  children,
  className
}: {
  loading?: boolean;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('relative inline-block w-full', className)}>
      <If condition={loading}>
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/70'>
          <div className='h-6 w-6 animate-spin rounded-full border-3 border-gray-300 border-t-gray-800' />
        </div>
      </If>
      {children}
    </div>
  );
};
