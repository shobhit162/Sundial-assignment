/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-green': '#119F97',
        'custom-red': '#FF5D39',
      },
    },
  },
  plugins: [],
}

