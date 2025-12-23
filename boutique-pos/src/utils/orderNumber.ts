import type { StitchingOrder } from '../types/stitching';

/**
 * Generates a unique order number in the format: ST-XXX
 * where XXX increments from the last order number
 */
export const generateStitchingOrderNumber = async (
  existingOrders: StitchingOrder[]
): Promise<string> => {
  // Find the highest sequence number from all existing orders
  let maxSequence = 0;

  existingOrders.forEach((order) => {
    // Extract number from format ST-XXX
    const match = order.orderNo.match(/^ST-(\d+)$/);
    if (match) {
      const sequence = parseInt(match[1], 10);
      if (!isNaN(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }
  });

  // Generate next sequence number
  const nextSequence = maxSequence + 1;
  const sequenceStr = String(nextSequence).padStart(3, '0');

  return `ST-${sequenceStr}`;
};
