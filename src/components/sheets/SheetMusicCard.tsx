import { Link } from "@/i18n/navigation";
import type { SerializedSheetMusic } from "@/lib/content/sheet-music";

export function SheetMusicCard({ sheet }: { sheet: SerializedSheetMusic }) {
  return (
    <Link
      href={`/sheets/${sheet.id}`}
      className="group block border border-ink/10 p-5 transition-colors hover:border-brass"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50">
        {sheet.genre}
      </p>
      <h3 className="mt-2 font-display text-lg text-ink transition-colors group-hover:text-brass">
        {sheet.title}
      </h3>
      <div className="mt-4 flex items-center justify-between font-mono text-xs uppercase tracking-[0.1em] text-ink/60">
        <span>{sheet.difficulty}</span>
        <span className="text-ink">NT$ {sheet.price.toLocaleString()}</span>
      </div>
    </Link>
  );
}
