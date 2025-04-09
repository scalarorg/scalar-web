import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/")({
  beforeLoad: () =>
    redirect({
      to: "/explore/bridge",
    }),
});
