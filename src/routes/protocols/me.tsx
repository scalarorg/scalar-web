import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/protocols/me")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/protocols/me"!</div>;
}
