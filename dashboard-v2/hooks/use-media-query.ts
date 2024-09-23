import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set the initial value
    setMatches(mediaQuery.matches);

    // Define a callback function to handle changes
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener('change', handler);

    // Clean up
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}