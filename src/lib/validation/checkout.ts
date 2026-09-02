export type CheckoutPaymentMethod = "credit" | "webatm" | "cvs";

export type CheckoutInput = {
  email: string;
  paymentMethod: CheckoutPaymentMethod;
};

export type CheckoutFieldErrors = Partial<Record<keyof CheckoutInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PAYMENT_METHODS: CheckoutPaymentMethod[] = [
  "credit",
  "webatm",
  "cvs",
];

export function validateCheckoutInput(
  input: CheckoutInput
): CheckoutFieldErrors {
  const errors: CheckoutFieldErrors = {};

  if (!input.email.trim()) {
    errors.email = "required";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "invalid";
  }

  if (!VALID_PAYMENT_METHODS.includes(input.paymentMethod)) {
    errors.paymentMethod = "invalid";
  }

  return errors;
}
