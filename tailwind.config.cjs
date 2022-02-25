// tailwind.config.cjs

module.exports = {
  // add this section
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: false, // or 'media' or 'class',
  safeList: ['bg-green-500', 'bg-yellow-500', 'bg-gray-500', 'text-green-900', 'text-red-900', 'text-gray-900', 'bg-green-100', 'bg-red-100', 'bg-gray-100'],
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}