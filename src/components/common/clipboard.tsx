import { cn } from '@/lib/utils';
import { CheckIcon, ClipboardIcon } from 'lucide-react';
import { MouseEvent, useState } from 'react';
import { toast } from 'sonner';
import { If } from './if';

type ClipboardProps = {
  text: string;
  label?: string;
  onClick?: () => void;
  targetLink?: string;
  classNames?: Partial<{
    wrapper: string;
    text: string;
    button: string;
  }>;
};

export const Clipboard = ({ text, label = 'Copy', targetLink, onClick, classNames }: ClipboardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch (_err) {
      toast.error('Failed to copy text');
    }
  };

  const commonTextClassNames = cn('truncate text-primary', classNames?.text);

  return (
    <div className={cn('flex grow gap-1', classNames?.wrapper)}>
      <If
        condition={targetLink}
        fallback={
          <button
            type='button'
            onClick={onClick}
            className={cn(commonTextClassNames, onClick && 'cursor-pointer')}
          >
            {label}
          </button>
        }
      >
        {(targetLink) => (
          <a href={targetLink} target='_blank' rel='noopener noreferrer' className={commonTextClassNames}>
            {label}
          </a>
        )}
      </If>
      <button
        type='button'
        onClick={handleCopy}
        aria-label={`Copy ${label} to clipboard`}
        className={cn('cursor-pointer', classNames?.button)}
      >
        <If condition={copied} fallback={<ClipboardIcon className='size-5' />}>
          <CheckIcon className='size-5' />
        </If>
      </button>
    </div>
  );
};
