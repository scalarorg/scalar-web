import { Heading } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { TransactionInfoCard } from '@/features/explore/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore/bridge/$slug/$status')({
  component: RouteComponent
});

function RouteComponent() {
  const { slug } = Route.useParams();

  return (
    <div className='flex flex-col gap-5 py-[60px]'>
      <Heading link={{ to: '/explore/bridge/$slug', params: { slug } }}>Transaction detail</Heading>
      <div className='flex flex-col gap-5'>
        <TransactionInfoCard />
        <Heading>Events</Heading>
        <TransactionInfoCard isSecondary title={<Badge>Bridge</Badge>} />
      </div>
    </div>
  );
}
