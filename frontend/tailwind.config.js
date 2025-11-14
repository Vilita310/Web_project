/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Tech theme colors
        tech: {
          primary: '#00d4ff',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          warning: '#f59e0b',
          success: '#10b981',
          error: '#ef4444',
          background: '#0a0e27',
          surface: '#1a1d3e',
          border: '#374151'
        },
        // Furniture-remix color palette
        ctaBlue: '#BEE1E6',
        furniture: {
          black: '#0E0E0E',
          white: '#ffffff',
          grey: '#F5F5F5',
          grey2: '#F9F9F9',
          grey3: '#8F8F8F',
          grey4: '#DFDFDF',
          grey5: '#BBBBBB',
          grey6: '#565959',
          buttonBg1: '#FBDCCE',
          buttonBg2: '#FAD2E1',
          buttonText: '#9E8376',
          green: '#DAF5CB',
          green2: '#3C583F',
          textBlack: '#0E0E0E',
          pink: '#FCE8F0',
          red: '#ef233c',
          footerBg: '#17282B',
        }
      },
      spacing: {
        content: '1040px',
        container: '1400px',
        card: '730px',
        layout: '1600px',
      },
      fontFamily: {
        furniture: ['Raleway', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        full: '1000px',
      },
    },
  },
  darkMode: "class",
  plugins: [],
}