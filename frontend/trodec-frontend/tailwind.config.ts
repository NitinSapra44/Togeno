import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"], // Keeping content for safety, though v4 auto-detects
  theme: {
    // Theme extended in CSS
  },
  plugins: [],
};

export default config;
