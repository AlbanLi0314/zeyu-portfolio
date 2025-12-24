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
                // Midnight / Heavy R&D Theme - High Contrast Dark Teal
                professional: {
                    "primary": "#115e59",           // Deep Pine/Petrol Teal - authoritative
                    "secondary": "#042f2e",         // Midnight Teal - headings, footer
                    "accent": "#115e59",            // Same as primary for consistency
                    "neutral": "#0f172a",           // Slate 900 - almost black
                    "base-100": "#ffffff",          // Pure white background
                    "base-200": "#ffffff",          // Pure white - no light backgrounds
                    "base-300": "#e2e8f0",          // Clean light grey for dividers
                    "base-content": "#0f172a",      // Slate 900 for body text
                    "info": "#115e59",              // Deep Pine Teal
                    "success": "#10B981",           // Green for success states
                    "warning": "#F59E0B",           // Amber for warnings
                    "error": "#EF4444",             // Red for errors
                    
                    // Text colors for prose
                    "--tw-prose-body": "#0f172a",
                    "--tw-prose-headings": "#042f2e",
                    "--tw-prose-links": "#115e59",
                    "--tw-prose-bold": "#042f2e",
                    "--tw-prose-counters": "#0f172a",
                    "--tw-prose-bullets": "#115e59",
                    "--tw-prose-quotes": "#0f172a",
                    "--tw-prose-quote-borders": "#115e59",
                    "--tw-prose-captions": "#334155",
                    "--tw-prose-code": "#115e59",
                },
                // Heavy R&D Dark Theme
                "professional-dark": {
                    "primary": "#2dd4bf",           // Teal for dark mode
                    "secondary": "#5eead4",         // Lighter teal secondary
                    "accent": "#14b8a6",            // Teal accent
                    "neutral": "#0f172a",           // Dark slate
                    "base-100": "#0f172a",          // Deep slate background
                    "base-200": "#1e293b",          // Slightly lighter for cards
                    "base-300": "#334155",          // Borders and dividers
                    "base-content": "#e2e8f0",      // Light slate text
                    "info": "#2dd4bf",              // Teal info
                    "success": "#34D399",           // Green success
                    "warning": "#FBBF24",           // Amber warning
                    "error": "#F87171",             // Red error
                    
                    // Dark mode text colors
                    "--tw-prose-body": "#e2e8f0",
                    "--tw-prose-headings": "#f1f5f9",
                    "--tw-prose-links": "#2dd4bf",
                    "--tw-prose-bold": "#f1f5f9",
                    "--tw-prose-counters": "#94a3b8",
                    "--tw-prose-bullets": "#2dd4bf",
                    "--tw-prose-quotes": "#cbd5e1",
                    "--tw-prose-quote-borders": "#14b8a6",
                    "--tw-prose-captions": "#94a3b8",
                    "--tw-prose-code": "#2dd4bf",
                },
            },
            "light",
            "dark",
        ],
    },
};
