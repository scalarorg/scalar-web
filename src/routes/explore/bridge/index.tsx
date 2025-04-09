import { Heading } from "@/components/common";
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { ExploreTable, useExploreQuery } from "@/features/explore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/bridge/")({
  component: ExploreBridge,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS,
});

function ExploreBridge() {
  const { size = 10, offset = 0 } = Route.useSearch();

  const { data, isLoading, isRefetching } = useExploreQuery.useList({
    size,
    offset,
    type: "bridge",
  });

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading>Bridge</Heading>
      <ExploreTable
        data={data ?? { data: [], total: 0 }}
        isLoading={isLoading}
        isRefetching={isRefetching}
        size={size}
        offset={offset}
      />
      {/* <Card className="bg-[#EDF1FF]">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-5">
            <img src={LOGO} alt="logo" className="w-[210px]" />
            <p className="text-[34px]">explorer</p>
          </div>
          <InputSearchBox
            className="bg-white"
            placeholder="Search by Txhash / Address / Block"
          />
        </CardContent>
      </Card> */}
    </div>
  );
}
