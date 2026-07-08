export type PaymentProviderId = "payzone" | "stripe";

export type PaymentItemType = "booking" | "course";

export interface PaymentMetadata {
  type: PaymentItemType;
  paymentId: string;
  userId: string;
  bookingId?: string;
  courseId?: string;
}

export interface CreatePaymentInput {
  provider: PaymentProviderId;
  orderId: string;
  amountCents: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerFirstName?: string | null;
  customerLastName?: string | null;
  metadata: PaymentMetadata;
  successPath: string;
  cancelPath: string;
}

export interface CreatePaymentResult {
  redirectUrl: string;
  providerSessionId: string;
}

export type PaymentVerificationStatus = "paid" | "failed" | "pending";

export interface VerifiedPayment {
  orderId: string;
  providerPaymentId: string;
  status: PaymentVerificationStatus;
  metadata: PaymentMetadata;
}

export interface RefundPaymentInput {
  provider: PaymentProviderId;
  providerPaymentId: string;
  amountCents?: number;
  reason?: string;
}

export interface RefundPaymentResult {
  success: boolean;
  message?: string;
}

export interface PaymentProviderConfig {
  id: PaymentProviderId;
  label: string;
  description: string;
  flag: string;
  available: boolean;
}
