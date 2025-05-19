/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
<<<<<<< HEAD
    fontFamily: {
      sans: ['Pretendard', 'sans-serif'],
    },
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryBold: 'var(--color-primaryBold)',
=======
    extend: {
      colors: {
        primary: 'var(--color-primary)',
>>>>>>> dev
        secondary: 'var(--color-secondary)',
        'white-bage': 'var(--white-bage)',
        'white-blue': 'var(--white-blue)',
        'gray-light': 'var(--gray-light)',
        'gray-dark': 'var(--gray-dark)',
        'black-light': 'var(--black-light)',
      }
    },
  },
  plugins: [],
}