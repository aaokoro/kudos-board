module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f54278",
        secondary: "#ff6b6b",
        hotpink: {
          DEFAULT: "#f54278",
          dark: "#d93267",
        },
      },
      backgroundColor: {
        dark: "#000000",
        box: "#000000",
        header: "#f54278",
        darkgrey: "#333333",
        // Light mode colors
        lightBg: "#f8f9fa",
        lightBox: "#ffffff",
        lightHeader: "#f54278",
        lightDarkgrey: "#e9ecef",
      },
      textColor: {
        light: "#FFFFFF",
        dark: "#212529",
      },
      borderColor: {
        pink: "#f54278",
        dark: "#333333",
        lightBorder: "#dee2e6",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
