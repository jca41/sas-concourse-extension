/** @type {import('tailwindcss').Config}*/
const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // safelist: process.env.NODE_ENV === "development" ? [{ pattern: /./ }] : [],
};

module.exports = config;
