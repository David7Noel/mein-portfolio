/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", // Sucht nach Klassen in allen HTML-Dateien im Stammverzeichnis
    "./*.js"    // Sucht nach Klassen in allen JavaScript-Dateien im Stammverzeichnis
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}