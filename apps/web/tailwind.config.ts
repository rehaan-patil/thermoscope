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
        background: "#000000",
        surface: {
          DEFAULT: "#0a0a0a",
          elevated: "#121212",
          card: "#0d0d0d",
          sidebar: "#050505",
          border: "#1f1f1f",
        },
        brand: {
          cyan: "#00e5ff",
          blue: "#3b82f6",
          purple: "#8b5cf6",
          glow: "rgba(0, 229, 255, 0.12)",
        },
        risk: {
          safe: "#10b981",
          warning: "#f59e0b",
          critical: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "Roboto Mono",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        command: "0 20px 40px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
