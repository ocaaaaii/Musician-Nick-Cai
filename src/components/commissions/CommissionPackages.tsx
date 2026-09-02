import type { ServicePackage } from "@prisma/client";

export function CommissionPackages({
  packages,
  emptyText,
}: {
  packages: ServicePackage[];
  emptyText: string;
}) {
  if (packages.length === 0) {
    return <p className="font-body text-sm text-ink/50">{emptyText}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className="border border-ink/5 bg-bone p-6 shadow-[0_1px_3px_rgba(28,29,31,0.08)]"
        >
          <h3 className="font-display text-xl text-ink">{pkg.title}</h3>
          <p className="mt-2 font-mono text-sm uppercase tracking-[0.08em] text-brass">
            {pkg.priceInfo}
          </p>
          <p className="mt-4 font-body text-sm leading-relaxed text-ink/70">
            {pkg.description}
          </p>
        </div>
      ))}
    </div>
  );
}
