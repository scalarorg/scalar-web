export const decodeScalarBytes = (scalarBytes: string) => {
  return Buffer.from(scalarBytes, "base64");
};

export const decodeScalarBytesToString = (scalarBytes: string) => {
  return Buffer.from(decodeScalarBytes(scalarBytes)).toString("utf-8");
};
