import { COMMON_DEFAULT_PAGE_SIZE, COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { EExploreType, ExploreLinks, ExploreTable, useExploreQuery } from "@/features/explore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/transfer/")({
  component: Transfer,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS
});

function Transfer() {
  const { size = COMMON_DEFAULT_PAGE_SIZE, page = 0 } = Route.useSearch();

  const { data, isLoading, isRefetching } = useExploreQuery.useList({
    size,
    page,
    type: EExploreType.TRANSFER
  });

  return (
    <div className='flex flex-col gap-5 py-15'>
      <ExploreLinks type={EExploreType.TRANSFER} />
      <ExploreTable
        data={data ?? { data: [], total: 0 }}
        isLoading={isLoading}
        isRefetching={isRefetching}
        size={size}
        page={page}
      />
    </div>
  );
}
