/**
 * Format date to Indian locale
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "17 Dec 2025")
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format date and time to Indian locale
 * @param dateString - ISO date string
 * @returns Formatted datetime string (e.g., "17 Dec 2025, 02:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Today's date string
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};
