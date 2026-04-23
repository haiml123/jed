import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0079c2', dark: '#0d3f6e', light: '#ebf4fc' },
        accent: { green: '#5a9e2f', amber: '#f59e0b', orange: '#d08700' },
        surface: { DEFAULT: '#f5f8ff', card: '#ffffff' },
        border: { DEFAULT: '#d8e6f0', light: '#e5e7eb', dark: '#d1d5dc' },
        muted: { DEFAULT: '#a8b5c5', dark: '#6b7280', darker: '#4a5565' },
        text: { DEFAULT: '#333333', dark: '#101828', heading: '#374151' },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        panel: '20px',
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '0.9', transform: 'translateX(-50%) scale(0.9)' },
          '20%': { opacity: '1', transform: 'translateX(-50%) scale(1)' },
          '100%': { opacity: '0', transform: 'translateX(-50%) scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
