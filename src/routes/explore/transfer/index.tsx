import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/transfer/")({
  component: Transfer,
});

function Transfer() {
  return <div>Hello "/explore/transfer/"!</div>;
}
