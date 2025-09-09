/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // v0-compatible color system matching your existing variables
      colors: {
        // Ensure amber colors are available for v0 compatibility
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7', 
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706', // v0 difficulty text color
          700: '#B45309',
          800: '#92400E', // v0 level text color
          900: '#78350F',
        },
        
        // Primary brand colors
        coffee: {
          brown: '#6F4E37',
        },
        cream: {
          white: '#FEF7ED',
        },
        sugar: {
          white: '#FFFFFF',
        },
        conveyor: {
          gray: '#5A5A5A',
        },
        
        // shadcn/ui compatible colors with v0 tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#F97316", // Orange-500 for v0 compatibility
          foreground: "#FFFFFF",
          50: "#FFF7ED",
          100: "#FFEDD5", 
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316", // Main orange
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "#F44336",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#F3F4F6",
          foreground: "#1F2937",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        
        // Game-specific colors matching your current system
        success: "#4CAF50",
        warning: "#FFC107",
        danger: "#F44336",
        
        // v0 background gradients
        'game-bg': {
          from: '#BAE6FD', // sky-200
          to: '#7DD3FC',   // sky-300
        },
        'menu-bg': {
          from: '#FFFBEB', // amber-50
          to: '#FFEDD5',   // orange-100
        }
      },
      
      // Typography matching Inter font stack
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      
      // Border radius matching v0 card system
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'card': '12px',
        'card-sm': '8px',
      },
      
      // Shadows matching v0 card system
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      
      // Animation and transitions
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      
      // Breakpoints matching your mobile-first approach
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px', // Your mobile-max
        'lg': '1024px', // Your tablet-max
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}