/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "\"Microsoft JhengHei\"",
          "\"微軟正黑體\"",
          "\"PingFang TC\"",
          "\"Noto Sans TC\"",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      colors: {
        cutePink: "#f9a8d4",
        cuteBlue: "#93c5fd",
        cuteYellow: "#fde68a"
      }
    }
  },
  plugins: []
};

