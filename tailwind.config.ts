import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg))",
        fg: "rgb(var(--fg))",
        muted: "rgb(var(--muted))",
        card: "rgb(var(--card))",
        border: "rgb(var(--border))",
        accent: "rgb(var(--accent))",
        accent2: "rgb(var(--accent-2))",
        accent3: "rgb(var(--accent-3))",
        good: "rgb(var(--good))",
        warn: "rgb(var(--warn))",
        danger: "rgb(var(--danger))",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        flush: "var(--shadow-flush)",
        soft: "var(--shadow-soft)",
        raised: "var(--shadow-raised)",
        floating: "var(--shadow-floating)",
        hard: "var(--shadow-hard)",
        inset: "var(--inset-shadow)",
        "card-highlight": "var(--card-highlight)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
    },
  },
  plugins: [],
};

export default config;
