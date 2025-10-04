/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {
            fontFamily: {
                // Headings: Geometric sans-serif for precision and intelligence
                sans: ['Inter', 'IBM Plex Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                // Body: Humanist sans-serif for readability and warmth
                body: ['Source Sans 3', 'Open Sans', 'system-ui', 'sans-serif'],
                // Quotes/Highlights: Serif for scholarly depth
                serif: ['Merriweather', 'Lora', 'Georgia', 'serif'],
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
                // Custom Professional Light Theme
                professional: {
                    "primary": "#1F4D7A",           // Indigo blue - trustworthy, intelligent
                    "secondary": "#2563EB",         // Lighter blue for secondary actions
                    "accent": "#0E7490",            // Teal - subtle, professional, less attention-grabbing
                    "neutral": "#374151",           // Dark gray for neutral elements
                    "base-100": "#F7FAFC",          // Cool off-white background
                    "base-200": "#E5E7EB",          // Slightly darker for cards/sections
                    "base-300": "#D1D5DB",          // Border and divider color
                    "base-content": "#111827",      // Deep gray-blue for body text
                    "info": "#3B82F6",              // Blue for informational elements
                    "success": "#10B981",           // Green for success states
                    "warning": "#F59E0B",           // Amber for warnings
                    "error": "#EF4444",             // Red for errors
                    
                    // Text colors for prose
                    "--tw-prose-body": "#111827",
                    "--tw-prose-headings": "#1F4D7A",
                    "--tw-prose-links": "#1F4D7A",
                    "--tw-prose-bold": "#0F172A",
                    "--tw-prose-counters": "#6B7280",
                    "--tw-prose-bullets": "#6B7280",
                    "--tw-prose-quotes": "#374151",
                    "--tw-prose-quote-borders": "#0E7490",
                    "--tw-prose-captions": "#6B7280",
                    "--tw-prose-code": "#1F4D7A",
                },
                // Custom Professional Dark Theme
                "professional-dark": {
                    "primary": "#3B82F6",           // Brighter blue for dark mode
                    "secondary": "#60A5FA",         // Lighter blue secondary
                    "accent": "#22D3EE",            // Cyan - softer glow on dark backgrounds
                    "neutral": "#1F2937",           // Dark neutral
                    "base-100": "#0F172A",          // Deep blue-gray background
                    "base-200": "#1E293B",          // Slightly lighter for cards
                    "base-300": "#334155",          // Borders and dividers
                    "base-content": "#E5E7EB",      // Light gray text (not pure white)
                    "info": "#60A5FA",              // Blue info
                    "success": "#34D399",           // Green success
                    "warning": "#FBBF24",           // Amber warning
                    "error": "#F87171",             // Red error
                    
                    // Dark mode text colors - increased weight for legibility
                    "--tw-prose-body": "#E5E7EB",
                    "--tw-prose-headings": "#F2F3F5",
                    "--tw-prose-links": "#60A5FA",
                    "--tw-prose-bold": "#F2F3F5",
                    "--tw-prose-counters": "#9CA3AF",
                    "--tw-prose-bullets": "#9CA3AF",
                    "--tw-prose-quotes": "#D1D5DB",
                    "--tw-prose-quote-borders": "#22D3EE",
                    "--tw-prose-captions": "#9CA3AF",
                    "--tw-prose-code": "#60A5FA",
                },
            },
            "light",
            "dark",
        ],
    },
};
