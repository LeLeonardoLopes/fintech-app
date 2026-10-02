import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          border: "var(--sidebar-border)",
        },
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          800: "#18181b",
          850: "#121214",
          900: "#0c0c0e",
          950: "#08080a",
        },
        border: "var(--border)",
        brand: {
          DEFAULT: "#10b981", // Emerald accent for positive/finance
          dark: "#059669",
          light: "#34d399",
        },
      },
      fontFamily: {
        sans: ["Tahoma", "Geneva", "Verdana", "sans-serif"],
        mono: ["Tahoma", "Geneva", "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
