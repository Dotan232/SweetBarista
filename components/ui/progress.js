/**
 * Progress Component - shadcn/ui compatible
 * Vanilla JavaScript implementation for timer and loading bars
 */

import { cn } from '../../lib/utils.js';

/**
 * Create a progress bar element
 * @param {Object} options - Progress configuration
 * @param {string} options.className - Additional CSS classes
 * @param {string} options.id - Progress ID
 * @param {number} options.value - Progress value (0-100)
 * @param {number} options.max - Maximum value (default 100)
 * @param {string} options.color - Progress color variant
 * @returns {Object} Progress container and fill elements
 */
export function createProgress({
  className = '',
  id = '',
  value = 0,
  max = 100,
  color = 'primary'
} = {}) {
  const container = document.createElement('div');
  const fill = document.createElement('div');
  
  // Color variants for different progress states
  const colorVariants = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    muted: 'bg-muted-foreground'
  };
  
  // Set container classes
  container.className = cn(
    'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
    className
  );
  
  // Set fill classes
  fill.className = cn(
    'h-full w-full flex-1 transition-all duration-300 ease-in-out',
    colorVariants[color] || colorVariants.primary
  );
  
  // Set attributes
  if (id) {
    container.id = id;
    fill.id = `${id}-fill`;
  }
  
  // Set initial progress
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  fill.style.transform = `translateX(-${100 - percentage}%)`;
  
  container.appendChild(fill);
  
  return { container, fill };
}

/**
 * Update progress value
 * @param {HTMLElement} fill - Progress fill element
 * @param {number} value - New progress value (0-100)
 * @param {number} max - Maximum value (default 100)
 */
export function updateProgress(fill, value, max = 100) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  fill.style.transform = `translateX(-${100 - percentage}%)`;
}

/**
 * Create timer progress bar with color transitions
 * @param {Object} options - Timer configuration
 * @returns {Object} Timer progress elements and update function
 */
export function createTimerProgress({
  className = '',
  id = 'timerProgress',
  duration = 60000 // 60 seconds in milliseconds
} = {}) {
  const { container, fill } = createProgress({
    className: cn('h-2 rounded-full', className),
    id,
    color: 'success'
  });
  
  let startTime = null;
  let animationId = null;
  
  // Timer-specific color transitions
  const updateColor = (remainingPercent) => {
    if (remainingPercent > 50) {
      fill.className = fill.className.replace(/bg-\w+-\d+/, 'bg-green-500');
    } else if (remainingPercent > 20) {
      fill.className = fill.className.replace(/bg-\w+-\d+/, 'bg-yellow-500');
    } else {
      fill.className = fill.className.replace(/bg-\w+-\d+/, 'bg-red-500');
      // Add pulsing effect for final seconds
      if (remainingPercent <= 10) {
        fill.classList.add('animate-pulse');
      }
    }
  };
  
  const startTimer = (totalDuration = duration) => {
    startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const remaining = Math.max(0, totalDuration - elapsed);
      const percentage = (remaining / totalDuration) * 100;
      
      updateProgress(fill, percentage);
      updateColor(percentage);
      
      if (remaining > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
  };
  
  const stopTimer = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
  
  const resetTimer = () => {
    stopTimer();
    updateProgress(fill, 100);
    fill.className = fill.className.replace(/bg-\w+-\d+/, 'bg-green-500');
    fill.classList.remove('animate-pulse');
  };
  
  return {
    container,
    fill,
    startTimer,
    stopTimer,
    resetTimer
  };
}

/**
 * Create loading progress bar
 * @param {Object} options - Loading configuration
 * @returns {Object} Loading progress elements and update function
 */
export function createLoadingProgress({
  className = '',
  id = 'loadingProgress'
} = {}) {
  const { container, fill } = createProgress({
    className: cn('h-2 rounded-full bg-gray-200', className),
    id,
    color: 'primary'
  });
  
  const setProgress = (percentage) => {
    updateProgress(fill, percentage);
  };
  
  return {
    container,
    fill,
    setProgress
  };
}