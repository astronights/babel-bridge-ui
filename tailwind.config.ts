import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink: '#1a1a2e',
        cream: '#faf8f3',
        accent: '#e8643a',
        accent2: '#4a9eff',
        gold: '#d4a843',
        success: '#3dba7e',
        border: '#e8e4dc',
        muted: '#8a8578',
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease forwards',
        'typing': 'typing 1.4s infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
