/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        milho:    "#F8C23A",
        fogueira: "#E85D2A",
        zabumba:  "#B63822",
        madeira:  "#7A2E17",
        folha:    "#287A45",
        palha:    "#FFF1C7",
        noite:    "#241512",
        ouro:     "#F6D15B",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(0,0,0,.5)",
        glow: "0 0 0 1px rgba(248,194,58,.35), 0 8px 32px rgba(248,194,58,.25)",
      },
      fontFamily: {
        sans: ["Sora", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
