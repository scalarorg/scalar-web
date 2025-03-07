import { Heading } from "@/components/common";
import { COMMON_VALIDATE_PAGE_SEARCH_PARAMS } from "@/constants";
import { useExploreBridgeQuery } from "@/features/explore";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/bridge/")({
  component: ExploreBridge,
  validateSearch: COMMON_VALIDATE_PAGE_SEARCH_PARAMS,
});

function ExploreBridge() {
  const { size, offset } = Route.useSearch();

  useExploreBridgeQuery.useList({
    size: size || 10,
    offset: offset || 0,
  });

  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading>Bridge</Heading>
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
