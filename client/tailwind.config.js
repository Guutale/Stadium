/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1a237e', // Existing
                secondary: '#ffab00', // Existing
                'admin-dark': '#0f172a', // Sidebar/Dark BG
                'admin-card': '#1e293b', // Dark Card
                'admin-accent': '#3b82f6', // Bright Blue Accent
                'admin-text': '#f8fafc', // Light Text
                'admin-bg': '#0b1120', // Main Content BG (Very Dark Blue)
            }
        },
    },
    plugins: [],
}
