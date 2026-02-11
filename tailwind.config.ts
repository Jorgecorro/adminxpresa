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
                // Dark theme palette
                background: {
                    DEFAULT: "#0f0f1a",
                    secondary: "#1a1a2e",
                    tertiary: "#2a2a4a",
                },
                accent: {
                    DEFAULT: "#FACC15",
                    hover: "#EAB308",
                    light: "#FDE047",
                },
                card: {
                    DEFAULT: "#1e1e32",
                    hover: "#252542",
                    border: "#3a3a5a",
                },
                text: {
                    primary: "#ffffff",
                    secondary: "#a1a1aa",
                    muted: "#71717a",
                },
                status: {
                    pendiente: "#f97316",
                    cotizado: "#3b82f6",
                    pagado: "#22c55e",
                    enviado: "#8b5cf6",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
            },
            boxShadow: {
                glow: "0 0 20px rgba(250, 204, 21, 0.3)",
                card: "0 4px 20px rgba(0, 0, 0, 0.4)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
