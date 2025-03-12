import { Heading } from "@/components/common";
import { TransactionInfoCard } from "@/features/explore/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/bridge/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-5 py-[60px]">
      <Heading link={{ to: "/explore/bridge" }}>Transaction detail</Heading>
      <div className="flex flex-col gap-5">
        <TransactionInfoCard />
      </div>
    </div>
  );
}
