/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "dark-main": "#212121",
        // "dark-panel": "#181818",
        "dark-panel": "#070707ff",
        "dark-card": "#303030",
        "dark-raised": "#303030",
        "dark-divider": "#494952",
        "dark-elevation-1": "#2F2F2F",
        "dark-elevation-2": "#373737",
        "dark-elevation-3": "#424242",
        "dark-elevation-4": "#535353",
        "dark-text-primary": "#E2E7E3",
        "dark-text-high": "#F9F9F9",
        "dark-text-secondary": "#888788",
        "dark-text-muted": "#6C6D6D",
        "dark-text-disabled": "#A5A5A5",
        "dark-text-low": "#6C6C6C",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    base: true,
    styled: true,
    utils: true,
    themes: ["light", "dark"],
    logs: false,
    prefix: "",
  },
};
