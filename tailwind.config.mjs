/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {
            fontFamily: {
                // All text: Inter for readability and professionalism
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                // Body: Also Inter for consistency
                body: ['Inter', 'system-ui', 'sans-serif'],
                // Technical/Code: Roboto Mono for engineering feel
                mono: ['Roboto Mono', 'monospace'],
            },
            lineHeight: {
                'relaxed-plus': '1.75',  // Body text - enhanced readability
                'loose-plus': '1.8',     // Dark mode body text
            },
        },
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {
        themes: [
            {
                // Precision Biotech Light Theme - Deep Teal & Muted Cyan
                professional: {
                    "primary": "#0e7490",           // Deep Teal - primary buttons, active states
                    "secondary": "#164e63",         // Midnight Cyan - headings, footer, strong text
                    "accent": "#06b6d4",            // Bright Cyan - key impact numbers, highlights
                    "neutral": "#334155",           // Slate Grey - body text
                    "base-100": "#ffffff",          // Pure white background
                    "base-200": "#ecfeff",          // Pale Cyan - badges, tag backgrounds
                    "base-300": "#cbd5e1",          // Light Slate - borders, dividers
                    "base-content": "#334155",      // Slate Grey for body text
                    "info": "#0e7490",              // Deep Teal
                    "success": "#10B981",           // Green for success states
                    "warning": "#F59E0B",           // Amber for warnings
                    "error": "#EF4444",             // Red for errors
                    
                    // Text colors for prose
                    "--tw-prose-body": "#334155",
                    "--tw-prose-headings": "#164e63",
                    "--tw-prose-links": "#0e7490",
                    "--tw-prose-bold": "#164e63",
                    "--tw-prose-counters": "#334155",
                    "--tw-prose-bullets": "#0e7490",
                    "--tw-prose-quotes": "#334155",
                    "--tw-prose-quote-borders": "#06b6d4",
                    "--tw-prose-captions": "#334155",
                    "--tw-prose-code": "#0e7490",
                },
                // Precision Biotech Dark Theme
                "professional-dark": {
                    "primary": "#22d3ee",           // Bright Cyan for dark mode
                    "secondary": "#67e8f9",         // Lighter cyan secondary
                    "accent": "#06b6d4",            // Cyan accent
                    "neutral": "#1e293b",           // Dark slate
                    "base-100": "#0f172a",          // Deep slate background
                    "base-200": "#1e293b",          // Slightly lighter for cards
                    "base-300": "#334155",          // Borders and dividers
                    "base-content": "#e2e8f0",      // Light slate text
                    "info": "#22d3ee",              // Cyan info
                    "success": "#34D399",           // Green success
                    "warning": "#FBBF24",           // Amber warning
                    "error": "#F87171",             // Red error
                    
                    // Dark mode text colors
                    "--tw-prose-body": "#e2e8f0",
                    "--tw-prose-headings": "#f1f5f9",
                    "--tw-prose-links": "#22d3ee",
                    "--tw-prose-bold": "#f1f5f9",
                    "--tw-prose-counters": "#94a3b8",
                    "--tw-prose-bullets": "#22d3ee",
                    "--tw-prose-quotes": "#cbd5e1",
                    "--tw-prose-quote-borders": "#06b6d4",
                    "--tw-prose-captions": "#94a3b8",
                    "--tw-prose-code": "#22d3ee",
                },
            },
            "light",
            "dark",
        ],
    },
};
