module.exports = {
  mode: 'jit',
  purge: ['./src/templates/**/*.+(html|njk|nunjucks)'],
  darkMode: false,
  theme: {
    extend: {},
    container: {
      center: true,
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
