/**
 * Sanitize phone number input (digits only, max 10 characters)
 * @param value - Input value
 * @returns Sanitized phone number
 */
export const sanitizePhone = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 10);
};

/**
 * Validate if phone number is complete
 * @param phone - Phone number to validate
 * @returns True if valid (10 digits)
 */
export const isValidPhone = (phone: string): boolean => {
  return phone.length === 10;
};
