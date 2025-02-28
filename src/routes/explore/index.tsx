import {
  ConnectScalar,
  ProtocolTxForm,
} from "@/components/connect/connect-scalar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/")({
  component: Explore,
});

function Explore() {
  return (
    <div className="p-2">
      <ConnectScalar />
      <ProtocolTxForm />
    </div>
  );
}
