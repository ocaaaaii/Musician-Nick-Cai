import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh-TW", "en", "ja", "ko"],
  defaultLocale: "zh-TW",
});
