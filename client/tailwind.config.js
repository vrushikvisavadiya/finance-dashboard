/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // Enable class-based dark mode toggle
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust according to your files
  ],
  theme: {
    extend: {
      // your theme extensions here
    },
  },
};
