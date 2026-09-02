export type SheetMusicInput = {
  title: string;
  description?: string;
  price: number;
  difficulty: string;
  genre: string;
  key?: string;
  pdfFileKey: string;
  sampleImages: string[];
  audioSampleUrl: string;
};

export type SheetMusicFieldErrors = Partial<
  Record<keyof SheetMusicInput, string>
>;

export function validateSheetMusicInput(
  input: SheetMusicInput
): SheetMusicFieldErrors {
  const errors: SheetMusicFieldErrors = {};

  if (!input.title.trim()) {
    errors.title = "required";
  }
  if (!input.difficulty.trim()) {
    errors.difficulty = "required";
  }
  if (!input.genre.trim()) {
    errors.genre = "required";
  }
  if (!input.pdfFileKey.trim()) {
    errors.pdfFileKey = "required";
  }
  if (!input.audioSampleUrl.trim()) {
    errors.audioSampleUrl = "required";
  }
  if (!Number.isFinite(input.price) || input.price <= 0) {
    errors.price = "invalid";
  }

  return errors;
}
