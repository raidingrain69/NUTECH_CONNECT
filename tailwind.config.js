/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: "rgba(19, 17, 24, 0.8)",
          card: "rgba(30, 27, 38, 0.45)",
          border: "rgba(255, 255, 255, 0.08)",
          primary: "#A084E8",
          secondary: "#8BE8CB",
          textDark: "#E2E0E6",
          textSub: "#918E99",
        }
      }
    },
  },
  plugins: [],
}
