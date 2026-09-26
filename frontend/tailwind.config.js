/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        farmgreen: {
          50: "#f0f9f0",
          100: "#dcf0dc",
          500: "#2e7d32",
          600: "#256a29",
          700: "#1b5e20",
        },
      },
    },
  },
  plugins: [],
};
