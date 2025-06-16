/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
    	extend: {
    		colors: {
    			primary: {
    				'800': '#0A1838',
    				'900': '#071d40',
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				'600': '#153672',
    				'700': '#122e5e',
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		fontFamily: {
    			sans: [
    				'Roboto',
    				'Open Sans',
    				'sans-serif'
    			],
    			serif: [
    				'Playfair Display',
    				'serif'
    			],
    			modern: [
    				'Open Sans',
    				'Roboto',
    				'sans-serif'
    			],
    			fancy: [
    				'Poppins',
    				'sans-serif'
    			]
    		},
    		animation: {
    			fadeIn: 'fadeIn 0.6s ease-out forwards'
    		},
    		keyframes: {
    			fadeIn: {
    				from: {
    					opacity: 0,
    					transform: 'translateY(10px)'
    				},
    				to: {
    					opacity: 1,
    					transform: 'translateY(0)'
    				}
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
}