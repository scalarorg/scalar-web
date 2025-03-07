import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/redeem/")({
  component: Redeem,
});

function Redeem() {
  return <div>Hello "/explore/redeem/"!</div>;
}
