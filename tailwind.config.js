/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          base: "#0D0E0F",
          card: "#121314",
          container: "#111213",
          primary: "#FFFFFF",
          secondary: "#727272",
          tertiary: "#3C3C3C",
        },
        brand: {
          carmine: "#FAB000",
          carmineLight: "#FDD679",
          carmineDeep: "#B78504",
        },
        ui: {
          errorAccent: "#FCBABA",
          errorBg: "#BF1D1D",
          successAccent: "#CEFFD7",
          successBg: "#37CB4F",
          infoAccent: "#C2F0FF",
          infoBg: "#0096DB",
          neutralAccent: "#D9D9D9",
          neutralBg: "#666666",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"],
      },
      fontSize: {
        // BASE
        base: ["15px", { lineHeight: "1.2" }],
        // HEADING
        h1: ["6.5rem", { lineHeight: "1.2", fontWeight: "600" }], // 96px = 6.5rem, Semibold (600)
        h2: ["4rem", { lineHeight: "1.2", fontWeight: "600" }], // 60px = 4rem, Semibold (600)
        h3: ["3.2rem", { lineHeight: "1.2", fontWeight: "600" }], // 48px = 3.2rem, Semibold (600)
        h4: ["2.134rem", { lineHeight: "1.2", fontWeight: "600" }], // 32px = 2.134rem, Semibold (600)
        h5: ["1.6rem", { lineHeight: "1.2", fontWeight: "600" }], // 24px = 1.6rem, Semibold (600)
        h6: ["1.334rem", { lineHeight: "1.2", fontWeight: "600" }], // 20px = 1.334rem, Semibold (600)
        // PARAGRAPH
        p3: ["1rem", { lineHeight: "1.2", fontWeight: "400" }],
        p4: ["0.8rem", { lineHeight: "1.2", fontWeight: "400" }],
        // LABEL
        l1: ["0.75rem", { lineHeight: "0.9", fontWeight: "400" }],
        l2: ["0.625rem", { lineHeight: "0.75", fontWeight: "400" }],
      },
      fontWeight: {
        extrabold: 800,
        bold: 700,
        semibold: 500,
        regular: 400,
        light: 300,
      },
      spacing: {
        0: "0px",
      },
    },
  },
  plugins: [],
};
