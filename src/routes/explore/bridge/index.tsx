import { COMMON_DEFAULT_PAGE_SIZE, COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { EExploreType, ExploreLinks, ExploreTable, useExploreQuery } from "@/features/explore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/bridge/")({
  component: ExploreBridge,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS
});

function ExploreBridge() {
  const { size = COMMON_DEFAULT_PAGE_SIZE, page = 0 } = Route.useSearch();

  const { data, isLoading, isRefetching } = useExploreQuery.useList({
    size,
    page,
    type: EExploreType.BRIDGE
  });

  return (
    <div className='flex flex-col gap-5 py-15'>
      <ExploreLinks type={EExploreType.BRIDGE} />
      <ExploreTable
        data={data ?? { data: [], total: 0 }}
        isLoading={isLoading}
        isRefetching={isRefetching}
        size={size}
        page={page}
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
