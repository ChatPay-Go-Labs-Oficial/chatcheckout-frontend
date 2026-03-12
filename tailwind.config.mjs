const colors = {
  // Design System Tokens
  primary: {
    DEFAULT: '#1992e6', // azul principal
    dark: '#1474b8',
    light: '#75bdf0',
  },
  secondary: {
    DEFAULT: '#6f43d0', // roxo secundário
    dark: '#402184',
    light: '#a98ee3',
  },
  accent: {
    DEFAULT: '#29d6d7', // verde/accent
    dark: '#188181',
    light: '#7ee7e7',
  },
  background: {
    DEFAULT: '#f9fcfd', // fundo claro
    dark: '#181b4a', // fundo escuro
  },
  surface: {
    DEFAULT: '#ffffff', // card/modal
    dark: '#e0eff6',
  },
  text: {
    primary: '#181b4a', // texto principal escuro
    secondary: '#444cc2', // texto secundário
    onPrimary: '#ffffff', // texto sobre primary
    onSurface: '#181b4a', // texto sobre surface
  },
  error: {
    DEFAULT: '#e53935',
    light: '#ffcdd2',
    dark: '#b71c1c',
  },
  success: {
    DEFAULT: '#29d6d7',
    light: '#a9efef',
    dark: '#188181',
  },
  border: {
    DEFAULT: '#e2d9f6',
    dark: '#444cc2',
  },
  space_cadet: {
    DEFAULT: '#181b4a',
    100: '#05050f',
    200: '#090b1d',
    300: '#0e102c',
    400: '#13163b',
    500: '#181b4a',
    600: '#2c3288',
    700: '#444cc2',
    800: '#8288d7',
    900: '#c1c3eb',
  },
  majorelle_blue: {
    DEFAULT: '#6f43d0',
    100: '#150b2c',
    200: '#2b1658',
    300: '#402184',
    400: '#562cb0',
    500: '#6f43d0',
    600: '#8d69d9',
    700: '#a98ee3',
    800: '#c6b4ec',
    900: '#e2d9f6',
  },
  tufts_blue: {
    DEFAULT: '#1992e6',
    100: '#051d2e',
    200: '#0a3a5c',
    300: '#0f578a',
    400: '#1474b8',
    500: '#1992e6',
    600: '#47a7eb',
    700: '#75bdf0',
    800: '#a3d3f5',
    900: '#d1e9fa',
  },
  robin_egg_blue: {
    DEFAULT: '#29d6d7',
    100: '#082b2b',
    200: '#105656',
    300: '#188181',
    400: '#20acac',
    500: '#29d6d7',
    600: '#53dfdf',
    700: '#7ee7e7',
    800: '#a9efef',
    900: '#d4f7f7',
  },
  alice_blue: {
    DEFAULT: '#e0eff6',
    100: '#153849',
    200: '#2a7191',
    300: '#4ea4cc',
    400: '#97c9e1',
    500: '#e0eff6',
    600: '#e6f2f8',
    700: '#ecf5f9',
    800: '#f2f8fb',
    900: '#f9fcfd',
  },
};

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        ...colors,
        // Checkout-specific colors (based on the prototype)
        'background-light': '#F7F8FC',
        'card-light': '#FFFFFF',
        'border-light': '#E5E7EB',
        'gradient-from': '#3B82F6',
        'gradient-to': '#A855F7',
        'gradient-via': '#EC4899',
      },
      // Documentação rápida dos tokens
      // primary: azul principal
      // secondary: roxo secundário
      // accent: verde/accent
      // background: fundo padrão
      // surface: card/modal
      // text-primary: texto principal
      // text-secondary: texto secundário
      // error: vermelho
      // success: verde
      // border: cor de borda
    },
  },
  plugins: [],
};

export default config;
