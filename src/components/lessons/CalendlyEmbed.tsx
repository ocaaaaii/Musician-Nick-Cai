export function CalendlyEmbed({ calendlyUrl }: { calendlyUrl: string }) {
  return (
    <iframe
      src={calendlyUrl}
      title="Calendly"
      className="h-[700px] w-full border border-ink/10"
    />
  );
}
