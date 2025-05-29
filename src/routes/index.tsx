import BridgeIcon from '@/assets/icons/bridge.svg';
import RedeemIcon from '@/assets/icons/redeem.svg';
import TransfersIcon from '@/assets/icons/transfers.svg';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BridgeForm } from '@/features/bridge';
import { RedeemForm } from '@/features/redeem';
import { TransfersForm } from '@/features/transfers';
import { createFileRoute } from '@tanstack/react-router';
import { ReactNode } from 'react';

export const Route = createFileRoute('/')({
  component: Home
});

const tabs: {
  name: string;
  value: string;
  content: ReactNode;
  icon: ReactNode;
}[] = [
  {
    name: 'Bridge',
    value: 'bridge',
    content: <BridgeForm />,
    icon: <BridgeIcon className='!w-4.5' />
  },
  {
    name: 'Transfers',
    value: 'transfers',
    content: <TransfersForm />,
    icon: <TransfersIcon className='!w-3.5' />
  },
  {
    name: 'Redeem',
    value: 'redeem',
    content: <RedeemForm />,
    icon: <RedeemIcon className='!w-4.5' />
  }
] as const;

function Home() {
  return (
    <div className='flex justify-center gap-2 p-5'>
      <Tabs defaultValue={tabs[0].value} className='min-w-[500px] max-w-[800px]'>
        <TabsList className='h-fit w-full gap-3 bg-background-secondary p-2.5'>
          {tabs.map(({ name, value, icon }) => (
            <TabsTrigger value={value} key={value} className='flex-1 bg-white px-6 font-normal text-base'>
              {icon}
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map(({ value, content }) => (
          <TabsContent key={value} value={value}>
            {content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
