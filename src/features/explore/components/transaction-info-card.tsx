import { ChainIcon, Clipboard, If } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Chains } from '@/lib/chains';
import { cn, formatDate, handle0xString, isBtcChain, isEvmChain } from '@/lib/utils';
import { SupportedChains } from '@/types/chains';
import { isEmpty } from 'lodash';
import { ReactNode } from 'react';
import { TExploreDetail } from '../models';
import { StatusStepper } from './status-stepper';

export type TTransactionInfoCardItem = {
  label: string;
  content: ReactNode;
};

type Props = {
  title?: ReactNode;
  isSecondary?: boolean;
  data?: TExploreDetail | null;
};

const Item = ({ label, content }: TTransactionInfoCardItem) => {
  return (
    <div className='flex gap-1 py-3.5'>
      <span className='w-45 font-medium text-base text-text-primary-500'>{label}</span>
      <div className='flex-1 text-base'>{content}</div>
    </div>
  );
};

const handleChain = (chain: string, text: string) => {
  const { remove, add } = handle0xString(text);

  const label = remove;
  const link = isBtcChain(chain) ? remove : isEvmChain(chain) ? add : text;

  return { label, link };
};

export const TransactionInfoCard = ({ data, isSecondary = false, title }: Props) => {
  const { source, destination, type } = data || {};

  const { label: sourceLabel } = handleChain(source?.chain || '', source?.tx_hash || '');

  const { blockExplorer: sourceBlockExplorer } = Chains[source?.chain as SupportedChains] || {};
  const { blockExplorer: destinationBlockExplorer } = Chains[destination?.chain as SupportedChains] || {};

  const senderLink = sourceBlockExplorer && `${sourceBlockExplorer}/address/${source?.sender}`;

  const receiverLink =
    destinationBlockExplorer && `${destinationBlockExplorer}/address/${destination?.receiver}`;

  const items: TTransactionInfoCardItem[] = [
    { label: 'Type', content: <Badge className='capitalize'>{type}</Badge> },
    { label: 'Status', content: <StatusStepper /> },
    {
      label: 'Source Chain',
      content: <ChainIcon chain={source?.chain as SupportedChains} showName customName={source?.chain_name} />
    },
    {
      label: 'Destination Chain',
      content: (
        <ChainIcon
          chain={destination?.chain as SupportedChains}
          showName
          customName={destination?.chain_name}
        />
      )
    },
    { label: 'Asset', content: source?.asset.symbol },
    { label: 'Transfer Fee', content: source?.fee },
    {
      label: 'Sender',
      content: (
        <Clipboard
          targetLink={senderLink}
          label={source?.sender}
          text={source?.sender || ''}
          classNames={{ wrapper: 'max-w-50' }}
        />
      )
    },
    {
      label: 'Recipient',
      content: (
        <Clipboard
          targetLink={receiverLink}
          label={destination?.receiver}
          text={destination?.receiver || ''}
          classNames={{ wrapper: 'max-w-50' }}
        />
      )
    },
    { label: 'Transfer ID', content: '...' },
    {
      label: 'Created',
      content: source?.created_at && formatDate(source.created_at, 'DD/MM/YYYY HH:mm')
    },
    { label: 'Time Spent', content: '...' }
  ];

  return (
    <Card className={cn('gap-0 rounded-lg p-0', isSecondary && 'bg-background-secondary')}>
      <If
        condition={isEmpty(data)}
        fallback={
          <>
            <CardHeader className='border-b px-4 py-3.5'>
              <CardTitle>
                {title ||
                  (sourceLabel && (
                    <Clipboard label={sourceLabel} text={sourceLabel} classNames={{ wrapper: 'max-w-50' }} />
                  ))}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col divide-y px-4 py-0'>
              {items.map((item) => (
                <Item key={item.label} {...item} />
              ))}
            </CardContent>
          </>
        }
      >
        <p className='my-3 text-center font-semibold text-lg text-primary'>No data</p>
      </If>
    </Card>
  );
};

export const TransactionInfoCardSkeleton = () => {
  return <Skeleton className='h-50 w-full' />;
};
