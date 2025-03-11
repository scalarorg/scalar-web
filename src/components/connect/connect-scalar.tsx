import { Clipboard } from "@/components/common";
import { Button } from "@/components/ui/button";
import { usePathname } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  useAccount,
  useConnectKeplr,
  useDisconnectKeplr,
} from "@/providers/keplr-provider";
import { Power } from "lucide-react";

export const ConnectScalar = () => {
  const { account, isConnected } = useAccount();
  const { connect } = useConnectKeplr();
  const { disconnect } = useDisconnectKeplr();
  const pathname = usePathname();

  const isProtocolPage = pathname.includes("/protocols");

  return (
    <div className={cn("flex items-center gap-1", !isProtocolPage && "hidden")}>
      {isConnected ? (
        <>
          <Clipboard
            label={account?.address || ""}
            text={account?.address || ""}
          />
          <button
            type="button"
            onClick={() => disconnect()}
            className="cursor-pointer"
          >
            <Power className="size-5" />
          </button>
        </>
      ) : (
        <Button onClick={() => connect()} size="lg">
          Connect Scalar
        </Button>
      )}
    </div>
  );
};

export const ProtocolTxForm = () => {
  // const { connectWallet, address } = useKeplr();
  // const mutation = useProtocolTx();
  // const [formData, _setFormData] = useState({
  //     attribute: { model: 0 },
  //     avatar: "nVJ5",
  //     bitcoin_pubkey:
  //         "03620a0b56223990b75c28dded4f30c854e0918e52179d5a7dfbf79df89fce7bcd",
  //     custodian_group_uid: "310b805d-8d15-4dee-9a30-c5bd89214ce9",
  //     name: "lalaa",
  //     tag: "pepeS",
  //     asset: { chain_name: "bitcoin|4", asset_name: "Zbtc" },
  // });

  // const handleSubmit = async () => {
  //     try {
  //         if (!address) await connectWallet();
  //         const txHash = await mutation.mutateAsync(formData);
  //         alert(`Transaction sent! Hash: ${txHash}`);
  //     } catch (error) {
  //         console.error("Transaction failed:", error);
  //         alert("Transaction failed");
  //     }
  // };

  return (
    <div>
      <h2 className="font-bold text-2xl">Submit Protocol Transaction</h2>
      {/* <button
                type="button"
                onClick={handleSubmit}
                disabled={mutation.isPending}
            >
                {mutation.isPending ? "Submitting..." : "Submit"}
            </button> */}
    </div>
  );
};
