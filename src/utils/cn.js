/**
 * Utility function for merging Tailwind classes
 * Provides shadcn/ui compatibility without React dependency
 */

/**
 * Simple implementation of clsx for class merging
 * @param {...any} classes - Classes to merge
 * @returns {string} Merged class string
 */
export function clsx(...classes) {
  return classes
    .flat()
    .filter((cls) => typeof cls === 'string' && cls.trim())
    .join(' ');
}

/**
 * Basic Tailwind class merge utility
 * Handles conflicting utility classes by keeping the last one
 * @param {...string} classes - Tailwind classes to merge
 * @returns {string} Merged class string
 */
export function twMerge(...classes) {
  const classArray = clsx(classes).split(' ');
  const classMap = new Map();
  
  // Simple conflict resolution - keep last conflicting class
  classArray.forEach((cls) => {
    if (cls) {
      // Extract base utility (e.g., 'text-' from 'text-sm', 'bg-' from 'bg-blue-500')
      const baseUtility = cls.split('-')[0] + '-';
      if (['text-', 'bg-', 'border-', 'p-', 'm-', 'w-', 'h-', 'rounded-'].includes(baseUtility)) {
        classMap.set(baseUtility, cls);
      } else {
        classMap.set(cls, cls);
      }
    }
  });
  
  return Array.from(classMap.values()).join(' ');
}

/**
 * Main utility function for combining classes
 * Compatible with shadcn/ui's cn utility
 * @param {...string} inputs - Class inputs to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}