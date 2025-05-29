import { cn } from '@/lib/utils';
import { Link, LinkComponentProps } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  className?: string;
  link?: LinkComponentProps;
}

export const Heading = ({ children, className, link }: HeadingProps) => {
  const headingClass = cn('font-semibold text-2xl text-text-primary-500', className);

  return link ? (
    <div className='flex items-center gap-3'>
      <Link {...link}>
        <ArrowLeftIcon size={24} />
      </Link>
      <h1 className={headingClass}>{children}</h1>
    </div>
  ) : (
    <h1 className={headingClass}>{children}</h1>
  );
};
