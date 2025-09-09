/**
 * Button Component - shadcn/ui compatible
 * Vanilla JavaScript implementation for game project
 */

import { cn } from '../../lib/utils.js';

/**
 * Button variants configuration
 */
const buttonVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
};

/**
 * Create a button element with shadcn/ui styling
 * @param {Object} options - Button configuration
 * @param {string} options.variant - Button variant (default, destructive, outline, etc.)
 * @param {string} options.size - Button size (default, sm, lg, icon)
 * @param {string} options.className - Additional CSS classes
 * @param {string} options.id - Button ID
 * @param {string} options.innerHTML - Button content HTML
 * @param {Function} options.onClick - Click handler
 * @param {boolean} options.disabled - Disabled state
 * @param {string} options.title - Title attribute
 * @returns {HTMLButtonElement} Configured button element
 */
export function createButton({
  variant = 'default',
  size = 'default',
  className = '',
  id = '',
  innerHTML = '',
  onClick = null,
  disabled = false,
  title = ''
} = {}) {
  const button = document.createElement('button');
  
  // Set base button classes
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  // Combine classes
  const combinedClasses = cn(
    baseClasses,
    buttonVariants.variant[variant] || buttonVariants.variant.default,
    buttonVariants.size[size] || buttonVariants.size.default,
    className
  );
  
  // Set attributes
  button.className = combinedClasses;
  if (id) button.id = id;
  if (innerHTML) button.innerHTML = innerHTML;
  if (disabled) button.disabled = disabled;
  if (title) button.title = title;
  
  // Add click handler
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

/**
 * Update existing button with new styling
 * @param {HTMLButtonElement} button - Existing button element
 * @param {Object} options - New button configuration
 */
export function updateButton(button, options = {}) {
  const {
    variant = 'default',
    size = 'default',
    className = '',
    disabled = false
  } = options;
  
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  button.className = cn(
    baseClasses,
    buttonVariants.variant[variant] || buttonVariants.variant.default,
    buttonVariants.size[size] || buttonVariants.size.default,
    className
  );
  
  if (disabled !== undefined) {
    button.disabled = disabled;
  }
}

/**
 * Header button specific variant for game UI
 * @param {Object} options - Button configuration
 * @returns {HTMLButtonElement} Configured header button
 */
export function createHeaderButton(options = {}) {
  return createButton({
    variant: 'outline',
    size: 'icon',
    className: 'w-9 h-9 border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 hover:text-gray-700',
    ...options
  });
}