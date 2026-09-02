export type CommissionInquiryType = "TRANSCRIPTION" | "COLLABORATION";

export type CommissionInquiryInput = {
  type: CommissionInquiryType;
  name: string;
  email: string;
  phone?: string;
  audioUrl?: string;
  details: string;
  honeypot: string;
  formLoadedAt: number;
};

export type CommissionInquiryFieldErrors = Partial<
  Record<keyof CommissionInquiryInput, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Deliberately separate from lesson-inquiry's validator - see design.md,
// Decision 2. The field shapes differ enough (selectable type, optional
// reference link) that sharing would need a branching generic form.
export function validateCommissionInquiry(
  input: CommissionInquiryInput
): CommissionInquiryFieldErrors {
  const errors: CommissionInquiryFieldErrors = {};

  if (!input.name.trim()) {
    errors.name = "required";
  }

  if (!input.email.trim()) {
    errors.email = "required";
  } else if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = "invalid";
  }

  if (!input.details.trim()) {
    errors.details = "required";
  }

  if (input.audioUrl?.trim() && !isValidUrl(input.audioUrl.trim())) {
    errors.audioUrl = "invalid";
  }

  return errors;
}
