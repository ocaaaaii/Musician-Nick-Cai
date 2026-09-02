import type { ComponentPropsWithoutRef } from "react";
import { ArrowUpRight } from "lucide-react";

type ArrowLinkProps = ComponentPropsWithoutRef<"a"> & {
  variant?: "solid" | "outline";
};

export function ArrowLink({
  variant = "outline",
  className = "",
  children,
  ...props
}: ArrowLinkProps) {
  const base =
    "group inline-flex items-center gap-2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.15em] transition-colors motion-reduce:transition-none";
  const styles =
    variant === "solid"
      ? "bg-ink text-cream hover:bg-brass"
      : "border border-ink/30 text-ink hover:border-brass hover:text-brass";

  return (
    <a className={`${base} ${styles} ${className}`} {...props}>
      {children}
      <ArrowUpRight
        className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        strokeWidth={1.5}
      />
    </a>
  );
}
