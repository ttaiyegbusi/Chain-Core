import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Tokens taken directly from the design spec (section 17)
        surface: "#FFFFFF",
        "surface-muted": "#F5F6F8",
        "surface-muted2": "#F4F6F8",
        border: "#E5E7EB",
        "border-strong": "#DDE3EA",
        "text-primary": "#111827",
        "text-secondary": "#4B5563",
        "text-muted": "#8A93A3",
        "text-subtle": "#A0A7B3",
        primary: "#3157F6",
        "primary-hover": "#2448E8",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      fontFamily: {
        // Geist (proportional sans) everywhere
        sans: ["var(--font-geist)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist)", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
