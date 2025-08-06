/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    {
      pattern: /animate-\[text-shimmer.*\]/,
      variants: ['responsive'],
    },
    'text-shimmer',
    'gradientSlide',
    'animate-gradient-slide',
    'animate-gradient-footer',
    'bg-gradient-to-br',
    'from-indigo-900',
    'via-blue-900',
    'to-black',
    'bg-[length:400%_400%]',
    'bg-[length:400%_100%]',
    'bg-gradient-to-r',
    'from-blue-900',
    'via-blue-700',
    'to-blue-900',
    'animate-heatwave',
    'backdrop-blur-md',
    'border-blue-800/30',
    'hover:scale-110',
    'hover:shadow-[0_0_12px_4px_rgba(59,130,246,0.6)]',
    'hover:duration-100',
    'bg-red-700/90',
    'border-red-800/30',
    'hover:shadow-[0_0_12px_4px_rgba(239,68,68,0.6)]',
    'bg-[position:0%_50%]',
    'animate-safe-dial-loop',
    'lg:mb-[13px]',
    'lg:mb-[12px]',
    'lg:mb-[20px]',
    'lg:h-[180vh]',
    'h-full',
    'flex',
    'justify-end'
  ],
  theme: {
    extend: {
      keyframes: {
        lavaWave: {
          '0%': { backgroundPosition: '200% 0%' },
          '100%': { backgroundPosition: '-200% 0%' },
        },
        'luxury-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientSlide: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-50%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-out-to-top': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-30%)', opacity: '0' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' }
        },
        heatwave: {
          '0%': { backgroundPosition: '200% 0%' },
          '100%': { backgroundPosition: '-200% 0%' },
        },
        'gradient-footer': {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },
        'contactHeatWave': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        'heatwave': 'heatwave 8s linear infinite',
        'red-lava-wave': 'lavaWave 12s linear infinite',
        'luxury-fade-up': 'luxury-fade-up 1.2s cubic-bezier(0.23, 1, 0.32, 1) both',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'gradient-slide': 'gradientSlide 8s ease-in-out infinite',
        'slide-in-from-top-4': 'slide-in-from-top 0.5s ease-out',
        'slide-out-to-top-2': 'slide-out-to-top 0.4s ease-in',
        'fade-in-0': 'fadeIn 0.3s ease-out',
        'fade-out-0': 'fadeOut 0.3s ease-in',
        'gradient-footer': 'gradient-footer 15s linear infinite',
        'contactHeatWave': 'contactHeatWave 3s linear infinite',
      },
      backgroundImage: {
        'gradient-120': 'linear-gradient(120deg, var(--tw-gradient-stops))',
      },
      textShadow: {
        peach: '0 0 8px #fca17c, 0 0 12px #ff8960',
      },
      backgroundSize: {
        '400': '400% 400%',
      },
    },
  }, 
  plugins: [],
};