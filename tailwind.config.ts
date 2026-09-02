import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: "#F5F1E8",
        khaki: "#E3DCC9",
        paper: "#C4BFBA",
        ink: "#1C1D1F",
        taupe: "#6F6865",
        slate: "#8B8D95",
        mist: "#8A9492",
        brass: "#9C5B41",
        cream: "#F4F1EC",
      },
      fontFamily: {
        display: ["var(--font-fraunces)"],
        body: ["var(--font-inter)"],
        mono: ["var(--font-plex-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
