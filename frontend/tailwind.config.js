/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', '"DM Sans"', "system-ui", "sans-serif"],
        heading: ['"TT Firs Neue"', '"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        surface: { 0: "#0a0a0f", 1: "#12121a", 2: "#1a1a26", 3: "#222233" },
        accent: {
          50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4",
          400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e",
          800: "#115e59", 900: "#134e4a",
        },
      },
    },
  },
  plugins: [],
}
