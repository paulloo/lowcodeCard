/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        valentine: {
          100: '#ffe6e6',
          200: '#ffcccc',
          300: '#ff9999',
          400: '#ff6666',
          500: '#ff3333',
          600: '#ff0000',
        }
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px) translateX(-50%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) translateX(-50%)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
        'pulse-soft': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.8',
          },
        },
        shine: {
          '0%, 100%': {
            transform: 'translateX(-100%)',
          },
          '50%': {
            transform: 'translateX(100%)',
          },
        },
        'float-heart': {
          '0%, 100%': {
            transform: 'translateY(0) scale(1)',
            opacity: '0.3',
          },
          '50%': {
            transform: 'translateY(-20px) scale(1.1)',
            opacity: '0.5',
          },
        },
        sparkle: {
          '0%': {
            transform: 'scale(0) rotate(0deg)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1) rotate(180deg)',
            opacity: '0.8',
          },
          '100%': {
            transform: 'scale(0) rotate(360deg)',
            opacity: '0',
          },
        },
        'confetti-left': {
          '0%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: 1
          },
          '50%': {
            transform: 'translateY(50vh) rotate(180deg)',
            opacity: 0.8
          },
          '100%': {
            transform: 'translateY(100vh) rotate(360deg)',
            opacity: 0
          }
        },
        'confetti-right': {
          '0%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: 1
          },
          '50%': {
            transform: 'translateY(50vh) rotate(-180deg)',
            opacity: 0.8
          },
          '100%': {
            transform: 'translateY(100vh) rotate(-360deg)',
            opacity: 0
          }
        },
        'float-delay': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
        'float-delay-2': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-15px)',
          },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'fade-up': 'fade-up 0.3s ease-out',
        'fade-in-delay': 'fade-in 0.6s ease-out 0.2s both',
        'fade-in-delay-2': 'fade-in 0.6s ease-out 0.4s both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        shine: 'shine 3s ease-in-out infinite',
        'float-heart': 'float-heart 3s ease-in-out infinite',
        sparkle: 'sparkle 2s ease-in-out infinite',
        'confetti-left': 'confetti-left 3s linear infinite',
        'confetti-right': 'confetti-right 3s linear infinite',
        'float-delay': 'float-delay 3s ease-in-out infinite 1s',
        'float-delay-2': 'float-delay-2 4s ease-in-out infinite 2s',
      },
      backgroundImage: {
        'hearts-pattern': "url('/images/hearts-pattern.svg')",
        'dots-pattern': "url('/images/dots-pattern.svg')",
      },
    },
  },
  plugins: [],
} 