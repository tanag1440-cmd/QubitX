/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // semantic surfaces & text (CSS variables, switched by .dark on <html>)
        page: "var(--bg)",
        card: "var(--surface)",
        card2: "var(--surface-2)",
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        ink: {
          DEFAULT: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
          // legacy surface scale remapped onto themed surfaces
          950: "var(--bg)",
          900: "var(--surface-2)",
          850: "var(--surface)",
          800: "var(--surface)",
          700: "var(--surface-2)",
          600: "var(--border-strong)",
        },
        // single brand accent
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
        },
        // semantic states (channel vars so /opacity works)
        ok: "rgb(var(--ok) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        err: "rgb(var(--err) / <alpha-value>)",
        // quantum accents — theme-aware via channel variables
        qx: {
          violet: "rgb(var(--qx-violet) / <alpha-value>)",
          indigo: "rgb(var(--qx-indigo) / <alpha-value>)",
          cyan: "rgb(var(--qx-cyan) / <alpha-value>)",
          mint: "rgb(var(--qx-mint) / <alpha-value>)",
          amber: "rgb(var(--qx-amber) / <alpha-value>)",
          rose: "rgb(var(--qx-rose) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        panel: "var(--shadow-panel)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        "fade-up": "fadeUp 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};
