import type { Config } from "tailwindcss";

// Tailwind 4 config can be kept for IDE support and content detection, 
// though most tokens are now in globals.css
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Tokens are primarily handled via CSS variables in globals.css
    },
  },
  plugins: [],
};

export default config;
