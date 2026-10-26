/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bfe0',
          400: '#609ed1',
          500: '#3b82c0',
          600: '#2a67a6',
          700: '#235286',
          800: '#1f456e',
          900: '#1d3b5b',
          950: '#0f1f33',
        },
        brand: {
          dark: '#0f172a',    // Slate 900
          navy: '#1e293b',    // Slate 800
          blue: '#2563eb',    // Royal Blue 600
          sky: '#38bdf8',     // Sky 400
          accent: '#4f46e5',  // Indigo 600
          light: '#f8fafc',   // Slate 50
          border: '#e2e8f0',  // Slate 200
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
