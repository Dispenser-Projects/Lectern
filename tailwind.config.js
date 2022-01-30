module.exports = {
  content: ["./src/**/*.{html,js}", "./public/**/*.{html,js}"],
  theme: {
    fontFamily: {
      sans: ['Roboto', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
    extend: {
      colors: {
        primary: '#3062eb',
        text: '#f5f5f5',
        'paper': {
          DEFAULT: '#1A2327',
          '50': '#707BA0',
          '100': '#637295',
          '200': '#51617A',
          '300': '#3F4E5E',
          '400': '#2C3943',
          '500': '#1A2327',
          '600': '#141C1E',
          '700': '#0E1415',
          '800': '#080B0B',
          '900': '#020202'
        },
        'background': {
          DEFAULT: '#0D1518',
          '50': '#2D3A54',
          '100': '#2A374D',
          '200': '#233040',
          '300': '#1B2832',
          '400': '#141F25',
          '500': '#0D1518',
          '600': '#0B1315',
          '700': '#091111',
          '800': '#080E0E',
          '900': '#060B0A'
        },
      },
    },
  },
  plugins: [],
}