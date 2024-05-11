import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {},
      borderWidth: {
        1: "1px",
      },
    },
  },
  plugins: [],
};
export default config;
