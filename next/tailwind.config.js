
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'givefi-blue': {
            light: '#3b82f6',
            DEFAULT: '#1e40af',
            dark: '#1e3a8a',
          },
          'givefi-green': {
            light: '#4ade80',
            DEFAULT: '#22c55e',
            dark: '#16a34a',
          },
        },
      },
    },
    plugins: [],
  }