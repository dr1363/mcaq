/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0a0a0a',
        surfaceHighlight: '#121212',
        primary: '#00ff41',
        primaryDim: '#008F11',
        secondary: '#00f3ff',
        accent: '#ff003c',
        textMain: '#e0e0e0',
        textMuted: '#a0a0a0',
        border: '#333333',
        borderActive: '#00ff41',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
