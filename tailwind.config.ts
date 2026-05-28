import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Align UI inspired semantic foundation for ChainCore.
        // Use semantic names in components instead of one-off colors.
        bg: {
          weak: "#F5F7FA",
          soft: "#F2F5F8",
          surface: "#FFFFFF",
          sub: "#F8FAFC",
          strong: "#0E121B",
        },
        surface: "#FFFFFF",
        "surface-muted": "#F5F7FA",
        "surface-muted2": "#F8FAFC",
        border: "#E1E4EA",
        "border-soft": "#EEF1F5",
        "border-strong": "#CACFD8",
        text: {
          primary: "#0E121B",
          secondary: "#525866",
          muted: "#99A0AE",
          subtle: "#A5ADBA",
          inverse: "#FFFFFF",
        },
        "text-primary": "#0E121B",
        "text-secondary": "#525866",
        "text-muted": "#99A0AE",
        "text-subtle": "#A5ADBA",
        primary: "#335CFF",
        "primary-hover": "#2547D0",
        "primary-soft": "#EBF1FF",
        success: "#1FC16B",
        "success-soft": "#EAF8F0",
        warning: "#F6B51E",
        "warning-soft": "#FFF7E6",
        danger: "#FB3748",
        "danger-soft": "#FFF1F3",
        info: "#47C2FF",
        "info-soft": "#EAF8FF",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(14, 18, 27, 0.04)",
        sm: "0 1px 3px rgba(14, 18, 27, 0.08), 0 1px 2px rgba(14, 18, 27, 0.04)",
        md: "0 8px 16px rgba(14, 18, 27, 0.08)",
        lg: "0 16px 32px rgba(14, 18, 27, 0.10)",
        overlay: "0 24px 64px rgba(14, 18, 27, 0.16)",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      fontFamily: {
        // Align UI uses Inter/Inter Display. Use installed Inter when available,
        // then the bundled Geist font, then platform fallbacks.
        sans: ["Inter", "var(--font-geist)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Inter Display", "Inter", "var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        md: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "38px" }],
      },
    },
  },
  plugins: [],
};

export default config;
