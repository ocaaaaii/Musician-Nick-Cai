export type ProfileUpdateInput = {
  heroTitle: string;
  heroSubtitle: string;
  aboutBio: string;
  styleTags: string[];
  instagramUrl?: string;
  youtubeUrl?: string;
  contactEmail?: string;
  calendlyUrl?: string;
};

export type ProfileUpdateFieldErrors = Partial<
  Record<keyof ProfileUpdateInput, string>
>;

export type VideoPlatform = "YOUTUBE" | "INSTAGRAM";

export type FeaturedVideoInput = {
  title: string;
  videoUrl: string;
  platform: VideoPlatform;
};

export type FeaturedVideoFieldErrors = Partial<
  Record<keyof FeaturedVideoInput, string>
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

export function validateProfileUpdate(
  input: ProfileUpdateInput
): ProfileUpdateFieldErrors {
  const errors: ProfileUpdateFieldErrors = {};

  if (!input.heroTitle.trim()) {
    errors.heroTitle = "required";
  }
  if (!input.heroSubtitle.trim()) {
    errors.heroSubtitle = "required";
  }
  if (!input.aboutBio.trim()) {
    errors.aboutBio = "required";
  }

  if (input.instagramUrl?.trim() && !isValidUrl(input.instagramUrl.trim())) {
    errors.instagramUrl = "invalid";
  }
  if (input.youtubeUrl?.trim() && !isValidUrl(input.youtubeUrl.trim())) {
    errors.youtubeUrl = "invalid";
  }
  if (input.calendlyUrl?.trim() && !isValidUrl(input.calendlyUrl.trim())) {
    errors.calendlyUrl = "invalid";
  }
  if (
    input.contactEmail?.trim() &&
    !EMAIL_PATTERN.test(input.contactEmail.trim())
  ) {
    errors.contactEmail = "invalid";
  }

  return errors;
}

export function validateFeaturedVideoInput(
  input: FeaturedVideoInput
): FeaturedVideoFieldErrors {
  const errors: FeaturedVideoFieldErrors = {};

  if (!input.title.trim()) {
    errors.title = "required";
  }
  if (!input.videoUrl.trim()) {
    errors.videoUrl = "required";
  } else if (!isValidUrl(input.videoUrl.trim())) {
    errors.videoUrl = "invalid";
  }

  return errors;
}
