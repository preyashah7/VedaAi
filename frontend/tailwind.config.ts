import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/store/**/*.{ts,tsx}',
    './src/types/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        veda: {
          red: '#C0350A',
          orange: '#FF7950',
          dark: '#303030',
          bg: '#F5F5F0',
          muted: '#5E5E5E',
          label: '#5E6268',
          white: '#FFFFFF',
          overlay: '#FFFFFF80',
        },
      },
      boxShadow: {
        soft: '0 12px 32px rgba(48, 48, 48, 0.08)',
      },
      backgroundImage: {
        'veda-gradient': 'linear-gradient(135deg, #C0350A 0%, #FF7950 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
