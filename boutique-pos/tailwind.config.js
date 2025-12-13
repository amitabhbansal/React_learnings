/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Elegant boutique color palette inspired by luxury fashion
        boutique: {
          primary: '#2C1654', // Deep royal purple - luxury and sophistication
          secondary: '#D4AF37', // Rich gold - premium and elegant
          accent: '#E8C4A8', // Soft champagne - warm and inviting
          dark: '#1A0B2E', // Very dark purple - depth
          light: '#F8F4F0', // Warm white - clean and elegant
          rose: '#D4A5A5', // Dusty rose - feminine touch
          purple: '#6B46C1', // Medium purple - accent
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'boutique-gradient': 'linear-gradient(135deg, #2D1B3D 0%, #1A0F26 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #C9A064 100%)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        boutique: {
          primary: '#2C1654',
          secondary: '#D4AF37',
          accent: '#E8C4A8',
          neutral: '#1A0B2E',
          'base-100': '#FFFFFF',
          'base-200': '#F8F4F0',
          'base-300': '#EAE0D5',
          info: '#8B7AB8',
          success: '#7FA879',
          warning: '#D4AF37',
          error: '#C97777',
        },
      },
    ],
  },
};
