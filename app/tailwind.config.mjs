/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0a0a0a',
                    'bg-secondary': '#111111',
                    'bg-tertiary': '#1a1a1a',
                    border: '#222222',
                    'border-light': '#333333',
                },
                text: {
                    primary: '#ffffff',
                    secondary: '#a0a0a0',
                    tertiary: '#707070',
                },
                accent: '#00ff88',
                success: '#00ff88',
                error: '#ff4757',
            },
        },
    },
    plugins: [],
}
