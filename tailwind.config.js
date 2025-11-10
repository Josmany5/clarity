/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#7C3AED',
        'primary-light': '#A78BFA',
        'bg-primary': 'var(--bg-primary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'card-bg': 'var(--card-bg)',
        'card-border': 'var(--card-border)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-border': 'var(--sidebar-border)',
        'accent': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
      }
    }
  },
  plugins: [],
}
