// Fallback for routes that don't even match the [locale] segment. Since
// there's no root app/layout.tsx (locale routing owns <html>/<body> - see
// src/app/[locale]/layout.tsx), Next.js requires this file to provide its
// own document shell. The common case - a 404 inside a valid locale, e.g.
// /ko/sheets/unknown-id - is handled by src/app/[locale]/not-found.tsx
// instead, which inherits the real layout and design system.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "4rem 1.5rem",
        }}
      >
        <p>404</p>
        <p>This page could not be found.</p>
        <a href="/">Go home</a>
      </body>
    </html>
  );
}
