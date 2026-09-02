// Bot heuristics shared by lesson-inquiry and commission-inquiry - see
// openspec/changes/inquiry-spam-protection/design.md. Neither check should
// ever surface to the caller as an error; both forms treat a detected bot
// as a normal successful submission that simply never writes a row.
export function isLikelyBot({
  honeypot,
  formLoadedAt,
}: {
  honeypot: string;
  formLoadedAt: number;
}): boolean {
  if (honeypot.trim().length > 0) return true;
  return Date.now() - formLoadedAt < 1500;
}
