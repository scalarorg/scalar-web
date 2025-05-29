import { Heading } from '@/components/common';
import { Badge } from '@/components/ui/badge';
import { TransactionInfoCard } from '@/features/explore/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore/transfer/$slug/$status')({
  component: RouteComponent
});

function RouteComponent() {
  const { slug } = Route.useParams();

  return (
    <div className='flex flex-col gap-5 py-15'>
      <Heading link={{ to: '/explore/transfer/$slug', params: { slug } }}>Transaction detail</Heading>
      <div className='flex flex-col gap-5'>
        <TransactionInfoCard />
        <Heading>Events</Heading>
        <TransactionInfoCard isSecondary title={<Badge>Transfer</Badge>} />
      </div>
    </div>
  );
}
