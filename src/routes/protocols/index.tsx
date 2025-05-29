import NoteIcon from '@/assets/icons/note.svg';
import WalletIcon from '@/assets/icons/wallet.svg';
import { Heading, InputSearchBox } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from '@/constants';
import { ProtocolCard, ProtocolCardSkeleton, ProtocolForm } from '@/features/protocol';
import { useScalarProtocols } from '@/hooks';
import { cn, fuzzyMatch } from '@/lib/utils';
import { useAccount, useConnectKeplr, useKeplrClient } from '@/providers/keplr-provider';
import { fromBech32 } from '@cosmjs/encoding';
import { Link, createFileRoute } from '@tanstack/react-router';
import { isEmpty, range } from 'lodash';
import { useMemo, useState } from 'react';

export const Route = createFileRoute('/protocols/')({
  component: Protocols,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS
});

function Protocols() {
  const { data: client } = useKeplrClient();
  const { isConnected, account } = useAccount();
  const { connect } = useConnectKeplr();
  const [open, setOpen] = useState(false);
  const { q } = Route.useSearch();

  const isConnect = client && isConnected;

  const { data, isLoading } = useScalarProtocols();

  const filteredProtocols = useMemo(
    () => data?.protocols?.filter((protocol) => fuzzyMatch(protocol?.name || '', q || '')),
    [data?.protocols, q]
  );

  const accountAddress = account?.address
    ? Buffer.from(fromBech32(account?.address).data).toString('base64')
    : '';

  const isOwnCreated = useMemo(() => {
    if (isEmpty(data?.protocols) || !accountAddress) return false;

    return data?.protocols?.some((p) => p.scalar_address === accountAddress);
  }, [data?.protocols, accountAddress]);

  return (
    <div className='flex flex-col gap-5 py-[60px]'>
      <Heading>All Protocols</Heading>
      <Card className='rounded-lg p-0'>
        <CardContent className='flex items-center gap-6 p-4'>
          <div
            className={cn(
              // Flexbox Container
              'flex items-center justify-center',

              // Size
              'size-[70px]',

              // Border Radius
              'rounded-lg',

              // Color
              'bg-[#EDF1FF] text-text-primary-500'
            )}
          >
            {isConnect ? <NoteIcon /> : <WalletIcon />}
          </div>
          <p className='mr-auto text-text-primary-500'>
            {isConnect
              ? isOwnCreated
                ? 'You have created a protocol.'
                : 'Rigister your protocol.'
              : 'Connect your wallet to register protocol.'}
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            {isConnect ? (
              isOwnCreated ? (
                <Link to='/protocols/me'>
                  <Button size='lg'>View your protocol</Button>
                </Link>
              ) : (
                <DialogTrigger asChild>
                  <Button variant='black' size='lg'>
                    Register
                  </Button>
                </DialogTrigger>
              )
            ) : (
              <Button onClick={() => connect()} size='lg'>
                Connect Scalar
              </Button>
            )}
            <DialogContent closeClassName="[&_svg:not([class*='size-'])]:size-6" className='min-w-[800px]'>
              <DialogHeader>
                <DialogTitle className='text-2xl'>New Protocol</DialogTitle>
                <ProtocolForm setOpen={setOpen} />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <InputSearchBox />
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
        {isLoading ? (
          range(0, 6).map((i) => <ProtocolCardSkeleton key={i} />)
        ) : isEmpty(filteredProtocols) ? (
          <p className='col-span-full text-center font-semibold text-2xl text-text-primary-500'>No data</p>
        ) : (
          filteredProtocols?.map((protocol) => <ProtocolCard key={protocol.scalar_address} data={protocol} />)
        )}
      </div>
    </div>
  );
}
