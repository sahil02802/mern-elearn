/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium Light Palette
        canvas: "#F8F6F2", // Main background
        surface: "#FFFFFF", // Card background
        surfaceHighlight: "#EEE8DF", // Hover/Active states
        brand: {
          200: "#2C7DA0",
          300: "#2C7DA0",
          400: "#2C7DA0",
          500: "#1F3A5F", // Primary Blue
          600: "#1F3A5F",
          glow: "rgba(31, 58, 95, 0.22)",
        },
        accent: {
          400: "#1B9AAA",
          500: "#1B9AAA",
          600: "#1B9AAA",
        },
        cta: {
          400: "#F4A261",
          500: "#F4A261",
          600: "#F4A261",
        },
        error: {
          400: "#E76F51",
          500: "#E76F51",
          600: "#E76F51",
        },
        ink: {
          100: "#1E293B", // Primary Text
          200: "#1E293B",
          300: "#64748B",
          400: "#64748B", // Secondary Text
          500: "#64748B",
          600: "#64748B", // Muted
        },
        border: "#EEE8DF",
      },
      fontFamily: {
        sans: ["Inter", "Outfit", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        glow: "0 8px 24px rgba(31, 58, 95, 0.14)",
        "glow-hover": "0 14px 34px rgba(31, 58, 95, 0.2)",
        card: "0 12px 30px -20px rgba(30, 41, 59, 0.22), 0 3px 10px rgba(30, 41, 59, 0.08)",
        glass: "0 16px 40px -28px rgba(30, 41, 59, 0.25)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #1F3A5F 0%, #2C7DA0 100%)",
        "gradient-dark": "linear-gradient(to bottom, #F8F6F2 0%, #EEE8DF 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
