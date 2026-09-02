export function FadeDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`h-px w-full bg-gradient-to-r from-transparent via-ink/15 to-transparent ${className}`}
    />
  );
}
