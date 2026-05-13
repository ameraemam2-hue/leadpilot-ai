import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-syne)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        bg: "#0a0c10",
        surface: "#111318",
        surface2: "#181c24",
        border: "#222632",
        accent: "#00d4ff",
        accent2: "#7c5cfc",
        accent3: "#ff6b35",
        gold: "#f5c842",
        green: "#22d17a",
        red: "#ff4757",
        muted: "#7a8099",
        text: "#e8eaf0",
      },
      borderColor: { DEFAULT: "#222632" },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at 20% 0%, rgba(0,212,255,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(124,92,252,0.10) 0%, transparent 50%)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
