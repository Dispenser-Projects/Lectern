function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`
    }
    return `rgb(var(${variable}) / ${opacityValue})`
  }
}

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
        text: withOpacityValue('--color-text'),
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
          '50': '#F7F8F9',
          '100': '#DBDEE2',
          '200': '#A3ABB4',
          '300': '#6A7A87',
          '400': '#374A54',
          '500': '#0D1518',
          '600': '#080D0E',
          '700': '#020404',
        },
      },
    },
  },
  plugins: [],
}