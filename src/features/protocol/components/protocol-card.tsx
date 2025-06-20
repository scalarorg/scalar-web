import { Clipboard } from '@/components/common';
import { ChainIcon } from '@/components/common/chain-icon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getChainProps } from '@/lib/chains';
import { cn } from '@/lib/utils';
import { SupportedChains } from '@/types/chains';
import { TProtocolDetails } from '@/types/types';
import { isEmpty } from 'lodash';
import { ReactNode } from 'react';
import { PROTOCOL_STATUS } from '../constans';

type ProtocolCardProps = {
  data: TProtocolDetails;
};

type TItem = {
  label: string;
  content: ReactNode;
};

const Item = ({ label, content }: TItem) => {
  if (isEmpty(content)) return null;
  return (
    <div className='flex items-start gap-5 py-2 text-sm'>
      <span className='w-30 shrink-0 font-medium text-text-primary-500'>{label}</span>
      <div className='flex-1 overflow-hidden'>{content}</div>
    </div>
  );
};

export const ProtocolCard = ({ data }: ProtocolCardProps) => {
  const { name, asset, status, chains, custodian_group } = data;

  const { label, variant, className } = PROTOCOL_STATUS.OBJECT[status];

  return (
    <div className='main-card-shadow flex flex-col gap-4 rounded-lg p-4'>
      <div className='flex items-center gap-2'>
        <div className='truncate font-semibold text-text-primary-500 text-xl'>
          {asset?.symbol}
          <p className='text-gray-600 text-sm font-medium capitalize'>By {name}</p>
        </div>
        <ChainIcon
          chain={asset?.chain as SupportedChains}
          showName
          classNames={{
            wrapper: 'ml-auto w-fit shrink-0',
            icon: 'size-5',
            name: 'text-sm font-semibold'
          }}
        />
        <Badge variant={variant} className={cn('px-4 text-sm', className)} ghost>
          {label}
        </Badge>
      </div>
      <div className='flex grow flex-col divide-y border-hovering text-sm'>
        <Item label='Custodian Group' content={custodian_group?.name} />
        <Item
          label='Supported Chains'
          content={
            <div className='flex flex-col gap-2'>
              {chains?.map((chain) => (
                <div key={chain.chain} className='flex w-full items-center gap-2'>
                  <ChainIcon
                    chain={chain.chain as SupportedChains}
                    showName
                    classNames={{
                      name: 'text-text-primary-500 text-xs w-20 truncate',
                      wrapper: 'w-27.5',
                      icon: 'size-4'
                    }}
                  />
                  <div className='flex-1 overflow-hidden'>
                    <Clipboard
                      label={chain.address}
                      text={chain.address || ''}
                      classNames={{ text: 'text-sm' }}
                      targetLink={`${getChainProps(chain.chain as SupportedChains, 'blockExplorer')}/address/${chain.address}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
};

export const ProtocolCardSkeleton = () => (
  <div className='main-card-shadow flex h-65 flex-col gap-4 rounded-lg p-4'>
    <div className='flex h-7.5 items-center gap-2'>
      <Skeleton className='h-full w-25' />
      <Skeleton className='ml-auto h-full w-25' />
      <Skeleton className='h-full w-25 rounded-full' />
    </div>
    <Skeleton className='grow' />
  </div>
);
