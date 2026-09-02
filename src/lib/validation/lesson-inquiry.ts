export type LessonInquiryInput = {
  name: string;
  email: string;
  phone?: string;
  details: string;
  honeypot: string;
  formLoadedAt: number;
};

export type LessonInquiryFieldErrors = Partial<
  Record<keyof LessonInquiryInput, string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared by the client form (instant field feedback) and the server action
// (final gate) - see design.md, Decision 2. Keep this the single source of
// truth for what counts as a valid inquiry.
export function validateLessonInquiry(
  input: LessonInquiryInput
): LessonInquiryFieldErrors {
  const errors: LessonInquiryFieldErrors = {};

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

  return errors;
}
