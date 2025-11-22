/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: { 'xl2': '1.25rem' }
    }
  },
  plugins: [],
}