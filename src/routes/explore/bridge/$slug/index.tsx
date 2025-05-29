import { Heading } from '@/components/common';
import { TransactionInfoCard, TransactionInfoCardSkeleton } from '@/features/explore/components';
import { useExploreQuery } from '@/features/explore/hooks/use-explore-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore/bridge/$slug/')({
  component: RouteComponent
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data, isLoading } = useExploreQuery.useDetail(slug, 'bridge');

  return (
    <div className='flex flex-col gap-5 py-[60px]'>
      <Heading link={{ to: '/explore/bridge' }}>Transaction detail</Heading>
      <div className='flex flex-col gap-5'>
        {isLoading ? <TransactionInfoCardSkeleton /> : <TransactionInfoCard data={data} />}
      </div>
    </div>
  );
}
