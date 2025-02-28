import {
  useAccount,
  useBalance,
  useConnectKeplr,
  useDisconnectKeplr,
} from "@/providers/keplr-provider";

export const ConnectScalar = () => {
  const { account, isConnected } = useAccount();
  const { connect } = useConnectKeplr();
  const { disconnect } = useDisconnectKeplr();
  const { data: balance } = useBalance();

  return (
    <div className="flex w-full flex-col gap-2">
      <h2>Connect Scalar</h2>
      <button
        type="button"
        className="w-40 cursor-pointer rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
        onClick={() => (isConnected ? disconnect() : connect())}
      >
        {isConnected ? "Disconnect" : "Connect"}
      </button>
      <p>Address: {account?.address}</p>
      <p>Balance: {balance ?? "~"} $ASCAL</p>
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
