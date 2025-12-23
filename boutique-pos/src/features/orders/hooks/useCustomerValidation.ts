import { useState, useCallback } from 'react';
import service from '../../../appwrite/config';

/**
 * Custom hook for validating customer phone numbers
 */
export const useCustomerValidation = () => {
  const [customerExists, setCustomerExists] = useState(false);

  const validateCustomerPhone = useCallback(async (phone: string) => {
    try {
      const customer = await service.getCustomerByPhone(phone);
      if (customer) {
        setCustomerExists(true);
        return {
          exists: true,
          name: customer.name,
        };
      } else {
        setCustomerExists(false);
        return {
          exists: false,
          name: '',
        };
      }
    } catch (error) {
      console.error('Error validating customer:', error);
      setCustomerExists(false);
      return {
        exists: false,
        name: '',
      };
    }
  }, []);

  return {
    customerExists,
    setCustomerExists,
    validateCustomerPhone,
  };
};
