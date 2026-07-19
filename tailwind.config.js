/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm premium palette
        background: '#3B2C3A',      // deep plum base
        surface: '#6B4E5A',         // mid mauve for cards
        surfaceHighlight: '#A67B8B', // accent for active states / highlights
        primary: '#A67B8B',         // primary action color
        textPrimary: '#FDF7F8',     // off-white text
        textSecondary: '#E8D5D7',   // soft rose for secondary text
        border: '#E8D5D7',          // base border color (opacity used in components)
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}