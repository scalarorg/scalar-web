// Please follow: https://github.com/scalarorg/scalar-core/blob/dev/x/covenant/types/types.go#L211
// func (p *RedeemUPCPayload) AbiPack() ([]byte, error) {
// 	return p.Psbt, nil
// }

// @ 0x01 is the prefix of redeem UPC payload
export const encodeUPCPayload = (data: string) => {
  return `0x01${data}`;
};
