/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#eefbf9",
          100: "#d4f4ef",
          200: "#aae8e0",
          300: "#75d6ca",
          400: "#43bcae",
          500: "#289e93",
          600: "#1c7f78",
          700: "#1a6862",
          800: "#1a5450",
          900: "#194644",
          950: "#0a2827"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
