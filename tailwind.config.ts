import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                "background-alt": "var(--background-alt)",
                foreground: "var(--foreground)",
                primary: "var(--primary)",
                "primary-glow": "var(--primary-glow)",
                "primary-dark": "var(--primary-dark)",
                glass: "var(--glass-surface)",
                "glass-border": "var(--glass-border)",
                "text-gray": "var(--text-gray)",
            },
            fontFamily: {
                display: "var(--font-display)",
                body: "var(--font-body)",
            },
            animation: {
                "spin-slow": "spin 3s linear infinite",
            },
        },
    },
    plugins: [],
};
export default config;
