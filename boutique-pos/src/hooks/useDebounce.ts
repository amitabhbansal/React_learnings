import { useRef, useCallback } from 'react';

/**
 * Custom hook for debouncing function calls
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 */
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/**
 * Custom hook for managing multiple debounce timers (for arrays/lists)
 */
export const useMultiDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const timersRef = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});

  const debounce = useCallback(
    (index: number, ...args: Parameters<T>) => {
      if (timersRef.current[index]) {
        clearTimeout(timersRef.current[index]);
      }

      timersRef.current[index] = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  const clearAll = useCallback(() => {
    Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    timersRef.current = {};
  }, []);

  return { debounce, clearAll };
};
