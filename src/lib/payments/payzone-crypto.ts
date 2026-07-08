import { createDecipheriv } from "crypto";

function urlsafeBase64Decode(str: string): Buffer {
  let normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }
  return Buffer.from(normalized, "base64");
}

function pkcs5Unpad(buf: Buffer): Buffer {
  const pad = buf[buf.length - 1];
  if (!pad || pad > buf.length) return buf;
  return buf.subarray(0, buf.length - pad);
}

export interface PayzoneStatusPayload {
  orderID?: string;
  errorCode?: string | number;
  errorMessage?: string;
  transactionID?: string | number;
  merchantToken?: string;
  ctrlCustomData?: string;
  status?: string;
}

export function decryptPayzoneRedirectData(
  encryptedData: string,
  merchantToken: string
): PayzoneStatusPayload {
  const key = urlsafeBase64Decode(merchantToken);
  const binData = urlsafeBase64Decode(encryptedData);
  const decipher = createDecipheriv("aes-128-ecb", key.subarray(0, 16), null);
  decipher.setAutoPadding(false);
  let decrypted: Buffer = Buffer.concat([
    decipher.update(binData),
    decipher.final(),
  ]);
  decrypted = Buffer.from(pkcs5Unpad(decrypted));
  return JSON.parse(decrypted.toString("utf8")) as PayzoneStatusPayload;
}

export function isPayzonePaymentSuccessful(errorCode?: string | number): boolean {
  const code = String(errorCode ?? "");
  return code === "000" || code === "0";
}
