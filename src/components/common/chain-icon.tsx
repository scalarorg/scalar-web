import DEFAULT_ICON from '@/assets/images/default-icon.png';
import { Chains } from '@/lib/chains';
import { cn } from '@/lib/utils';
import { SupportedChains } from '@/types/chains';

export const ChainIcon = ({
  chain,
  showName,
  customName,
  classNames
}: {
  chain: SupportedChains;
  showName?: boolean;
  customName?: string;
  classNames?: Partial<{
    wrapper: string;
    name: string;
    icon: string;
  }>;
}) => {
  const chainInfo = Chains[chain];

  return (
    <div className={cn('flex items-center gap-2', classNames?.wrapper)}>
      <img
        src={chainInfo?.icon || DEFAULT_ICON}
        alt={chain}
        className={cn('size-6 shrink-0 rounded-full', classNames?.icon)}
      />
      {showName && (customName || chainInfo?.name) && (
        <p className={cn(classNames?.name)}>{customName || chainInfo?.name}</p>
      )}
    </div>
  );
};
