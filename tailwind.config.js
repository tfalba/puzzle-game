/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        nickBlack: "#303030",
        nickBrown: "#745939",
        nickRust: "#d26d45",
        nickTeal: "#69a9b1",
        nickBlush: "#f4b4a8",
        nickCream: "#ede0ca",
      },
    },
  },
  plugins: [],
};
