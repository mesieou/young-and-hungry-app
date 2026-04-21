import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0F1A",
        navy: "#0F1629",
        panel: "#121A2B",
        line: "#1E2A3D",
        "line-hover": "#2B3A55",
        "text-primary": "#FFFFFF",
        "text-secondary": "#A9B4C7",
        "text-muted": "#6B778C",
        disabled: "#3A465A",
        violet: "#7C3AED",
        blue: "#3B82F6",
        "violet-soft": "#A855F7",
        "blue-soft": "#60A5FA",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6"
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px"
      },
      boxShadow: {
        card: "0 10px 30px rgba(0, 0, 0, 0.35)",
        lift: "0 14px 40px rgba(0, 0, 0, 0.45)",
        glow: "0 0 20px rgba(99, 102, 241, 0.25)"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.18)" },
          "50%": { boxShadow: "0 0 30px rgba(99, 102, 241, 0.32)" }
        }
      },
      animation: {
        "fade-up": "fade-up 360ms ease-out both",
        "pulse-glow": "pulse-glow 2.8s ease-in-out infinite"
      }
    }
  },
  plugins: [animate]
};

export default config;
