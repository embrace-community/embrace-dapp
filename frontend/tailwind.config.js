/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      serif: ['Poppins', 'serif'],
    },
    extend: {
      colors: {
      'embracebg': '#F7F6E8',
      'embracedark': '#35281E'
      }
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
