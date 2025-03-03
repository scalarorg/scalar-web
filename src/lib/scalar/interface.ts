import { EncodeObject } from "@cosmjs/proto-signing";

export const TYPE_URL_MSG_CREATE_PROTOCOL =
  "/scalar.protocol.v1beta1.MsgCreateProtocol";

export interface MsgCreateProtocolEncodeObject extends EncodeObject {
  readonly typeUrl: typeof TYPE_URL_MSG_CREATE_PROTOCOL;
  readonly value: {
    sender: Uint8Array;
    bitcoin_pubkey: Uint8Array;
    scalar_pubkey: Uint8Array;
    name: string;
    tag: string;
    attributes: {
      model: number;
    };
    custodian_group_uid: string;
    avatar: Uint8Array;
  };
}
