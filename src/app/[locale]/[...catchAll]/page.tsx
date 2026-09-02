import { notFound } from "next/navigation";

// Catches any path that middleware has already locale-prefixed but that
// doesn't match a real page (e.g. /zh-TW/typo). Calling notFound() here
// bubbles to src/app/[locale]/not-found.tsx, which has a valid layout to
// render under - unlike the root app/not-found.tsx, which errors with
// "doesn't have a root layout" because [locale]/layout.tsx (not a plain
// app/layout.tsx) owns <html>/<body> here.
export default function CatchAll() {
  notFound();
}
