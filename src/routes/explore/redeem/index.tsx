import { Heading } from "@/components/common";
import { COMMON_DEFAULT_PAGE_SIZE, COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { ExploreTable, useExploreQuery } from "@/features/explore";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/explore/redeem/")({
  component: Redeem,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS,
});

function Redeem() {
  const { size = COMMON_DEFAULT_PAGE_SIZE, page = 0 } = Route.useSearch();

  const { data, isLoading, isRefetching } = useExploreQuery.useList({
    size,
    page,
    type: "redeem",
  });

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading>Redeem</Heading>
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
