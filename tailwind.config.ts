import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  // UPDATED PATHS:
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
        // ... keep your existing theme settings ...
        // (You can leave the rest of the file exactly as it was)
        borderRadius: {
            lg: ".5625rem",
            md: ".375rem",
            sm: ".1875rem",
        },
        colors: {
            // ... keep your colors ...
            background: "hsl(var(--background) / <alpha-value>)",
            foreground: "hsl(var(--foreground) / <alpha-value>)",
            border: "hsl(var(--border) / <alpha-value>)",
            input: "hsl(var(--input) / <alpha-value>)",
            primary: {
                DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
                border: "var(--primary-border)",
            },
            // ... include the rest of your colors ...
        }
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;