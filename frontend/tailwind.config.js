/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				// Deep Space Palette
				canvas: '#0B0F19', // Main background
				surface: '#151B2B', // Card background
				surfaceHighlight: '#1E293B', // Hover/Active states
				brand: {
					400: '#818CF8',
					500: '#6366F1', // Primary Indigo
					600: '#4F46E5',
					glow: 'rgba(99, 102, 241, 0.5)'
				},
				accent: {
					400: '#34D399',
					500: '#10B981', // Emerald Success
					600: '#059669',
				},
				ink: {
					100: '#F1F5F9', // Primary Text
					200: '#E2E8F0',
					400: '#94A3B8', // Secondary Text
					600: '#475569', // Muted
				},
				border: '#1E293B',
			},
			fontFamily: {
				sans: ['Inter', 'Outfit', 'sans-serif'],
				display: ['Outfit', 'sans-serif'],
			},
			boxShadow: {
				'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
				'glow-hover': '0 0 30px rgba(99, 102, 241, 0.3)',
				'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
			},
			backgroundImage: {
				'gradient-brand': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
				'gradient-dark': 'linear-gradient(to bottom, #0B0F19 0%, #111827 100%)',
			},
			animation: {
				'float': 'float 6s ease-in-out infinite',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				}
			}
		},
	},
	plugins: [],
}