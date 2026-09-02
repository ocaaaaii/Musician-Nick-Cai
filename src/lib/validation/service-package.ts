export type ServicePackageType = "TRANSCRIPTION" | "LESSON" | "COLLABORATION";

const VALID_TYPES: ServicePackageType[] = [
  "TRANSCRIPTION",
  "LESSON",
  "COLLABORATION",
];

export type ServicePackageInput = {
  type: ServicePackageType;
  title: string;
  priceInfo: string;
  description: string;
  sortOrder: number;
};

export type ServicePackageFieldErrors = Partial<
  Record<keyof ServicePackageInput, string>
>;

export function validateServicePackageInput(
  input: ServicePackageInput
): ServicePackageFieldErrors {
  const errors: ServicePackageFieldErrors = {};

  if (!VALID_TYPES.includes(input.type)) {
    errors.type = "invalid";
  }
  if (!input.title.trim()) {
    errors.title = "required";
  }
  if (!input.priceInfo.trim()) {
    errors.priceInfo = "required";
  }
  if (!input.description.trim()) {
    errors.description = "required";
  }

  return errors;
}
