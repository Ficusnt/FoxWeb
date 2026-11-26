/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        accent: "#1565c0",
        accentDark: "#0d47a1",
        accentLight: "#e3f2fd",

        // Surface
        bg: "#f8fafc",
        bgTable: "#ffffff",
        surface: "#f1f5f9",

        // Borders
        border: "#e2e8f0",
        borderLight: "#f8fafc",

        // Text
        text: "#0f172a",
        textMuted: "#64748b",
        textLight: "#94a3b8",

        // Status
        success: "#059669",
        successBg: "#ecfdf5",
        error: "#dc2626",
        errorBg: "#fef2f2",
        warning: "#d97706",
        warningBg: "#fffbeb",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -7px rgb(0 0 0 / 0.1)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [],
}
