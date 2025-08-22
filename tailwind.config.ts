import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2.5rem',
				'2xl': '3rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '480px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'xl1440': '1440px',
			'2xl': '1536px',
		},
  extend: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      inter: ['Inter', 'sans-serif'],
    },
    spacing: {
      '18': '4.5rem',   // 72px
      '22': '5.5rem',   // 88px
      '26': '6.5rem',   // 104px
      '30': '7.5rem',   // 120px
      '34': '8.5rem',   // 136px
      '38': '9.5rem',   // 152px
      // Token-based spacing
      '1': 'var(--space-1)',
      '2': 'var(--space-2)',
      '3': 'var(--space-3)',
      '5': 'var(--space-5)',
      '10': 'var(--space-10)',
      '20': 'var(--space-20)',
      '24': 'var(--space-24)',
    },
    zIndex: {
      'base': 'var(--z-base)',
      'raised': 'var(--z-raised)',
      'sticky': 'var(--z-sticky)',
      'fixed': 'var(--z-fixed)',
      'overlay': 'var(--z-overlay)',
      'dropdown': 'var(--z-dropdown)',
      'sheet': 'var(--z-sheet)',
      'toast': 'var(--z-toast)',
      'modal': 'var(--z-modal)',
      'tooltip': 'var(--z-tooltip)',
    },
    transitionDuration: {
      'fast': 'var(--motion-duration-fast)',
      'base': 'var(--motion-duration-base)', 
      'slow': 'var(--motion-duration-slow)',
    },
    transitionTimingFunction: {
      'standard': 'var(--motion-easing-standard)',
      'decelerate': 'var(--motion-easing-decelerate)',
      'accelerate': 'var(--motion-easing-accelerate)',
    },
    colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				brand: {
					DEFAULT: 'hsl(var(--brand))',
					foreground: 'hsl(var(--brand-foreground))',
					50: 'hsl(var(--brand-50))',
					100: 'hsl(var(--brand-100))',
					200: 'hsl(var(--brand-200))',
					600: 'hsl(var(--brand-600))',
					700: 'hsl(var(--brand-700))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					50: 'hsl(var(--success-50))',
					100: 'hsl(var(--success-100))',
					500: 'hsl(var(--success-500))',
					600: 'hsl(var(--success-600))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					50: 'hsl(var(--warning-50))',
					100: 'hsl(var(--warning-100))',
					500: 'hsl(var(--warning-500))',
					600: 'hsl(var(--warning-600))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
		keyframes: {
			'accordion-down': {
				from: { height: '0', opacity: '0' },
				to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
			},
			'accordion-up': {
				from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
				to: { height: '0', opacity: '0' }
			},
			'fade-in': {
				'0%': { opacity: '0', transform: 'translateY(10px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			'fade-out': {
				'0%': { opacity: '1', transform: 'translateY(0)' },
				'100%': { opacity: '0', transform: 'translateY(10px)' }
			},
			'scale-in': {
				'0%': { transform: 'scale(0.95)', opacity: '0' },
				'100%': { transform: 'scale(1)', opacity: '1' }
			},
			'scale-out': {
				'0%': { transform: 'scale(1)', opacity: '1' },
				'100%': { transform: 'scale(0.95)', opacity: '0' }
			},
			'slide-in-right': {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(0)' }
			},
			'slide-out-right': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(100%)' }
			}
		},
		animation: {
			'accordion-down': 'accordion-down var(--motion-duration-base) var(--motion-easing-standard)',
			'accordion-up': 'accordion-up var(--motion-duration-base) var(--motion-easing-standard)',
			'fade-in': 'fade-in var(--motion-duration-base) var(--motion-easing-standard)',
			'fade-out': 'fade-out var(--motion-duration-base) var(--motion-easing-standard)',
			'scale-in': 'scale-in var(--motion-duration-fast) var(--motion-easing-standard)',
			'scale-out': 'scale-out var(--motion-duration-fast) var(--motion-easing-standard)',
			'slide-in-right': 'slide-in-right var(--motion-duration-base) var(--motion-easing-decelerate)',
			'slide-out-right': 'slide-out-right var(--motion-duration-base) var(--motion-easing-accelerate)',
			'enter': 'fade-in var(--motion-duration-base) var(--motion-easing-standard)',
			'exit': 'fade-out var(--motion-duration-base) var(--motion-easing-standard)'
		}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
