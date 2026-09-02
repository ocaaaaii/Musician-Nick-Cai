import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/i18n/navigation";

type UnderlineLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  className?: string;
};

export function UnderlineLink({
  className = "",
  children,
  ...props
}: UnderlineLinkProps) {
  return (
    <Link
      className={`group relative inline-block ${className}`}
      {...props}
    >
      {children}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
      />
    </Link>
  );
}
