import {
  ConnectScalar,
  ProtocolTxForm,
} from "@/components/connect/connect-scalar";
import { scalarConfig } from "@/lib/scalar";
import { KeplrProvider } from "@/providers/keplr-provider";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/explore/")({
  component: () => (
    <KeplrProvider config={scalarConfig()}>
      <Explore />
    </KeplrProvider>
  ),
});

function Explore() {
  return (
    <div className="p-2">
      <ConnectScalar />
      <ProtocolTxForm />
    </div>
  );
}
