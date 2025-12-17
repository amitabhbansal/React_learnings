import { useCallback } from 'react';
import toast from 'react-hot-toast';
import service from '../../../appwrite/config';
import type { OrderItem } from '../../../types/order';

/**
 * Custom hook for validating item IDs against the database
 */
export const useItemValidation = (
  orderItems: OrderItem[],
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>
) => {
  const validateItemId = useCallback(
    async (index: number, itemId: string) => {
      const updatedItems = [...orderItems];

      try {
        const item = await service.getItemById(itemId);
        if (item && !item.sold) {
          // Item exists and is available
          updatedItems[index] = {
            ...updatedItems[index],
            itemId: itemId,
            costPrice: item.costPrice,
            markedPrice: item.markedPrice,
            discount: 0,
            sellingPrice: 0,
            itemExists: true,
            isValidating: false,
          };
          toast.success(`Item ${itemId} found!`);
        } else if (item && item.sold) {
          // Item exists but is sold
          updatedItems[index] = {
            ...updatedItems[index],
            itemId: itemId,
            costPrice: 0,
            markedPrice: 0,
            discount: 0,
            sellingPrice: 0,
            itemExists: false,
            isValidating: false,
          };
          toast.error(`Item ${itemId} is already sold!`);
        } else {
          // Item doesn't exist
          updatedItems[index] = {
            ...updatedItems[index],
            itemId: itemId,
            costPrice: 0,
            markedPrice: 0,
            discount: 0,
            sellingPrice: 0,
            itemExists: false,
            isValidating: false,
          };
          toast.error(`Item ${itemId} not found in database!`);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        updatedItems[index] = {
          ...updatedItems[index],
          itemId: itemId,
          costPrice: 0,
          markedPrice: 0,
          discount: 0,
          sellingPrice: 0,
          itemExists: false,
          isValidating: false,
        };
      }

      setOrderItems(updatedItems);
    },
    [orderItems, setOrderItems]
  );

  return { validateItemId };
};
