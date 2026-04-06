import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary, #0891b2)",
          dark: "var(--color-primary-dark, #0e7490)",
          darker: "var(--color-primary-darker, #155e75)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary, #22d3ee)",
          dark: "var(--color-secondary-dark, #06b6d4)",
          darker: "var(--color-secondary-darker, #A5D6A7)",
        },
        accent: "var(--color-accent, #A5D6A7)",
        muted: "var(--color-muted, #C8E6C9)",
        destructive: "var(--color-destructive, #F87171)",
        gray: "var(--color-gray, #6b7280)",
        white: "var(--color-white, #ffffff)",
        black: "var(--color-black, #000000)",
      },
    },
  },
  plugins: [],
};

export default config;
