import { Heading } from "@/components/common";
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { ExploreTable, useExploreQuery } from "@/features/explore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/transfer/")({
  component: Transfer,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS,
});

function Transfer() {
  const { size = 10, offset = 0 } = Route.useSearch();

  const { data, isLoading, isRefetching } = useExploreQuery.useList({
    size,
    offset,
    type: "transfer",
  });

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading>Transfer</Heading>
      <ExploreTable
        data={data ?? { data: [], total: 0 }}
        isLoading={isLoading}
        isRefetching={isRefetching}
        size={size}
        offset={offset}
      />
    </div>
  );
}
