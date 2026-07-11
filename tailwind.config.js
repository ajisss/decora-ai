/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral base — clean minimal
        ink: {
          DEFAULT: '#1a1815',
          soft: '#4a463f',
          muted: '#78726a',
        },
        paper: {
          DEFAULT: '#ffffff',
          soft: '#faf9f7',
          line: '#ece8e2',
        },
        // Single accent — warm clay, premium but restrained
        clay: {
          DEFAULT: '#c05f3c',
          soft: '#f6e9e3',
          deep: '#9c4a2d',
        },
        danger: {
          DEFAULT: '#b3423a',
          soft: '#f9e9e7',
        },
        success: {
          DEFAULT: '#3d7a55',
        },
      },
      fontFamily: {
        sans: ['Karla', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
      },
      maxWidth: {
        content: '72rem',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
