import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentMetadata,
  RefundPaymentInput,
  RefundPaymentResult,
  VerifiedPayment,
} from "../types";
import { getAppUrl } from "../config";
import {
  decryptPayzoneRedirectData,
  isPayzonePaymentSuccessful,
  type PayzoneStatusPayload,
} from "../payzone-crypto";

const API_VERSION = "002.70";
const SHIPPING_TYPE_VIRTUAL = "Virtual";

function getPayzoneBaseUrl(): string {
  const url = process.env.PAYZONE_PAYMENT_URL || "https://paiement.payzone.ma";
  return url.endsWith("/") ? url : `${url}/`;
}

function getAuthHeader(): string {
  const originator = process.env.PAYZONE_ORIGINATOR_ID!;
  const password = process.env.PAYZONE_PASSWORD!;
  return `Basic ${Buffer.from(`${originator}:${password}`).toString("base64")}`;
}

function encodeMetadata(metadata: PaymentMetadata): string {
  return JSON.stringify(metadata);
}

function decodeMetadata(raw?: string): PaymentMetadata | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PaymentMetadata;
  } catch {
    return null;
  }
}

function mapStatus(payload: PayzoneStatusPayload): VerifiedPayment["status"] {
  if (isPayzonePaymentSuccessful(payload.errorCode)) return "paid";
  const code = String(payload.errorCode ?? "");
  if (code === "-1") return "pending";
  return "failed";
}

function toVerifiedPayment(payload: PayzoneStatusPayload): VerifiedPayment | null {
  const metadata = decodeMetadata(payload.ctrlCustomData);
  if (!metadata?.paymentId) return null;

  return {
    orderId: payload.orderID || metadata.paymentId,
    providerPaymentId: String(payload.transactionID || ""),
    status: mapStatus(payload),
    metadata,
  };
}

export async function payzoneCreatePayment(
  input: CreatePaymentInput
): Promise<CreatePaymentResult> {
  const baseUrl = getPayzoneBaseUrl();
  const appUrl = getAppUrl();

  const body = {
    apiVersion: API_VERSION,
    orderID: input.orderId,
    orderDescription: input.description,
    currency: input.currency.toUpperCase(),
    amount: input.amountCents,
    shippingType: SHIPPING_TYPE_VIRTUAL,
    paymentMode: "Single",
    paymentType: "CreditCard",
    shopperEmail: input.customerEmail,
    shopperFirstName: input.customerFirstName || undefined,
    shopperLastName: input.customerLastName || undefined,
    ctrlCustomData: encodeMetadata(input.metadata),
    ctrlRedirectURL: `${appUrl}/api/payments/payzone/return?paymentId=${input.orderId}`,
    ctrlCallbackURL: `${appUrl}/api/webhooks/payzone`,
  };

  const res = await fetch(`${baseUrl}transaction/prepare`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = (await res.json()) as {
    code?: string | number;
    message?: string;
    merchantToken?: string;
    customerToken?: string;
  };

  if (String(result.code) !== "200" || !result.customerToken || !result.merchantToken) {
    throw new Error(
      result.message || "Impossible de préparer le paiement PayZone"
    );
  }

  return {
    redirectUrl: `${baseUrl}transaction/${result.customerToken}`,
    providerSessionId: result.merchantToken,
  };
}

export async function payzoneVerifyPayment(
  merchantToken: string
): Promise<VerifiedPayment | null> {
  const baseUrl = getPayzoneBaseUrl();
  const res = await fetch(`${baseUrl}transaction/${merchantToken}/status`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
      Accept: "application/json",
    },
  });

  if (!res.ok) return null;
  const payload = (await res.json()) as PayzoneStatusPayload;
  return toVerifiedPayment(payload);
}

export function payzoneVerifyRedirect(
  encryptedData: string,
  merchantToken: string
): VerifiedPayment | null {
  try {
    const payload = decryptPayzoneRedirectData(encryptedData, merchantToken);
    return toVerifiedPayment(payload);
  } catch {
    return null;
  }
}

export function payzoneVerifyCallback(
  payload: PayzoneStatusPayload
): VerifiedPayment | null {
  return toVerifiedPayment(payload);
}

export async function payzoneRefundPayment(
  input: RefundPaymentInput
): Promise<RefundPaymentResult> {
  if (!input.providerPaymentId) {
    return { success: false, message: "Transaction introuvable" };
  }

  const baseUrl = process.env.PAYZONE_API_URL || "https://api.payzone.ma/";
  const apiUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const res = await fetch(
    `${apiUrl}transaction/${input.providerPaymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        apiVersion: API_VERSION,
        amount: input.amountCents,
        reason: input.reason,
      }),
    }
  );

  const result = (await res.json()) as { code?: string | number; message?: string };
  const success = String(result.code) === "200";

  return {
    success,
    message: result.message,
  };
}
