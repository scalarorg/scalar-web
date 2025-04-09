// import { useKeplr } from "@/providers/keplr-provider";
// import { useMutation } from "@tanstack/react-query";

// interface ProtocolTxPayload {
//   attribute: { model: number };
//   avatar: string;
//   bitcoin_pubkey: string;
//   custodian_group_uid: string;
//   name: string;
//   tag: string;
//   asset: { chain_name: string; asset_name: string };
// }

// export const useProtocolTx = () => {
//   const { signAndBroadcast, address } = useKeplr();

//   return useMutation({
//     mutationFn: async (payload: ProtocolTxPayload) => {
//       if (!address) throw new Error("Wallet not connected");

//       // Prepare the transaction message
//       const message = {
//         typeUrl: "/protocol.MsgAdd",
//         value: {
//           creator: address,
//           attribute: payload.attribute,
//           avatar: payload.avatar,
//           bitcoin_pubkey: payload.bitcoin_pubkey,
//           custodian_group_uid: payload.custodian_group_uid,
//           name: payload.name,
//           tag: payload.tag,
//           asset: payload.asset,
//         },
//       };

//       // Sign and broadcast
//       const txHash = await signAndBroadcast([message]);

//       // Optionally store the transaction via ScalarAPI
//       // await ScalarAPI.useMutation("post", "/", {
//       //     body: { txHash, payload },
//       // });

//       return txHash;
//     },
//   });
// };
