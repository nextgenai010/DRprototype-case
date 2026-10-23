/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dr: {
          red: '#D6001C',
          redDark: '#A80016',
          beige: '#F5F0E8',
          beigeDark: '#EAE3D6',
          ink: '#111111',
          grey: '#6B6B6B',
          line: '#E2DED6',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        sheetUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        pop: { '0%': { transform: 'scale(.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        rise: { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        progress: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        sheetUp: 'sheetUp .38s cubic-bezier(.2,.8,.2,1) both',
        fadeIn: 'fadeIn .25s ease-out both',
        pop: 'pop .3s cubic-bezier(.2,.8,.2,1) both',
        rise: 'rise .35s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
}
