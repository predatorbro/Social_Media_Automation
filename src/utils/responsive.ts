// Responsive design utilities and breakpoint helpers

export const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export const mediaQueries = {
  mobile: `(min-width: ${breakpoints.mobile}px)`,
  tablet: `(min-width: ${breakpoints.tablet}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
} as const;

export const useResponsiveValue = <T>(values: {
  mobile?: T;
  tablet?: T; 
  desktop?: T;
  wide?: T;
  default: T;
}) => {
  // This would be implemented with a proper hook in a real app
  // For now, return the default value
  return values.default;
};

// Common responsive classes
export const responsiveClasses = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    twoCol: 'grid grid-cols-1 lg:grid-cols-2',
    threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  spacing: {
    section: 'py-8 md:py-12 lg:py-16',
    card: 'p-4 md:p-6 lg:p-8',
  },
  text: {
    heading: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
    subheading: 'text-lg md:text-xl lg:text-2xl',
    body: 'text-sm md:text-base',
  },
  button: {
    touch: 'min-h-[44px] min-w-[44px]', // Minimum touch target size
  }
} as const;