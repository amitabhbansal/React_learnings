import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Customer, Fabric, Accessory } from '../types';
import type { Measurement, StitchingOrderFormData, StitchingOrderItem } from '../types/stitching';

interface CreateStitchingOrderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateStitchingOrderModal = ({ onClose, onSuccess }: CreateStitchingOrderModalProps) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerMeasurements, setCustomerMeasurements] = useState<Measurement | null>(null);
  const [loading, setLoading] = useState(false);

  // Fabric and Accessory inventory
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  const [formData, setFormData] = useState<StitchingOrderFormData>({
    orderNo: '',
    customerName: '',
    customerPhone: '',
    orderDate: new Date().toISOString().split('T')[0],
    promiseDate: '',
    totalAmount: 0,
    amountPaid: 0,
    status: 'pending',
    tailorRemarks: '',
    items: [
      {
        itemType: '',
        description: '',
        quantity: 1,
        stitchingPrice: 0,
        asterRequired: false,
        asterType: null,
        asterCharge: 0,
        pieceGiven: false,
        fabric: {
          source: 'customer',
          fabricId: null,
          fabricDescription: '',
          metersUsed: 0,
          ratePerMeter: 0,
          fabricCost: 0,
        },
        additionalCharges: [],
        accessories: [],
      },
    ],
    paymentHistory: [],
  });

  // Load fabric and accessory inventory on mount
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const [fabricsData, accessoriesData] = await Promise.all([
          service.getFabrics(),
          service.getAccessories(),
        ]);
        setFabrics(fabricsData);
        setAccessories(accessoriesData);
      } catch (error) {
        console.error('Error loading inventory:', error);
        toast.error('Failed to load inventory');
      }
    };
    loadInventory();
  }, []);

  // Calculate total for a single item
  const calculateItemTotal = (item: StitchingOrderItem): number => {
    let total = item.stitchingPrice * item.quantity;
    if (item.asterRequired) {
      total += item.asterCharge * item.quantity;
    }
    total += item.fabric.fabricCost;
    total += item.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    total += item.accessories.reduce(
      (sum, acc) => (acc.billedToCustomer ? sum + acc.totalCost : sum),
      0
    );
    return total;
  };

  // Calculate order total
  const calculateOrderTotal = (): number => {
    return formData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  // Update total amount whenever items change
  useEffect(() => {
    const total = calculateOrderTotal();
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.items]);

  const searchCustomer = async () => {
    if (!customerPhone.trim() || !/^[6-9]\d{9}$/.test(customerPhone)) {
      return;
    }

    try {
      const c = await service.getCustomerByPhone(customerPhone);
      if (c) {
        setCustomer(c);
        setFormData((prev) => ({
          ...prev,
          customerName: c.name,
          customerPhone: c.phone,
        }));
        if (c.measurements) {
          try {
            setCustomerMeasurements(JSON.parse(c.measurements));
          } catch (e) {
            console.error('Error parsing measurements:', e);
            setCustomerMeasurements(null);
          }
        } else {
          setCustomerMeasurements(null);
        }
      } else {
        setCustomer(null);
        setCustomerMeasurements(null);
        toast.error('Customer not found');
      }
    } catch (error) {
      console.error('Error searching customer:', error);
      setCustomer(null);
      setCustomerMeasurements(null);
    }
  };

  const handleSubmit = async () => {
    if (!customer) {
      toast.error('Please search and select a customer first');
      return;
    }

    if (!formData.orderNo.trim()) {
      toast.error('Please enter order number');
      return;
    }

    if (!formData.promiseDate) {
      toast.error('Please select promise date');
      return;
    }

    // Validate items
    if (formData.items.length === 0 || !formData.items[0].itemType) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerPhone: formData.customerPhone,
        customerName: formData.customerName,
        orderNo: formData.orderNo,
        orderDate: formData.orderDate,
        promiseDate: formData.promiseDate,
        items: JSON.stringify(formData.items),
        totalAmount: formData.totalAmount,
        amountPaid: formData.amountPaid,
        status: formData.status,
        tailorRemarks: formData.tailorRemarks,
        paymentHistory: JSON.stringify(formData.paymentHistory),
      };

      await service.createStitchingOrder(orderData);

      // Update fabric inventory
      for (const item of formData.items) {
        if (item.fabric.source === 'shop' && item.fabric.fabricId && item.fabric.metersUsed > 0) {
          try {
            const fabricInventory = await service.getFabricById(item.fabric.fabricId);
            if (fabricInventory && fabricInventory.$id) {
              const newUsedMeters = (fabricInventory.usedMeters || 0) + item.fabric.metersUsed;
              await service.updateFabric(fabricInventory.$id, {
                usedMeters: newUsedMeters,
              });
            }
          } catch (error) {
            console.error('Error updating fabric inventory:', error);
          }
        }
      }

      // Update accessory inventory
      for (const item of formData.items) {
        for (const acc of item.accessories) {
          try {
            const accessoryInventory = await service.getAccessoryById(acc.accessoryId);
            if (accessoryInventory && accessoryInventory.$id) {
              const newUsedQuantity = (accessoryInventory.quantityUsed || 0) + acc.quantityUsed;
              await service.updateAccessory(accessoryInventory.$id, {
                quantityUsed: newUsedQuantity,
              });
            }
          } catch (error) {
            console.error('Error updating accessory inventory:', error);
          }
        }
      }

      toast.success('Stitching order created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating stitching order:', error);
      toast.error('Failed to create stitching order');
    } finally {
      setLoading(false);
    }
  };

  // Item management functions
  const addItem = () => {
    const newItem: StitchingOrderItem = {
      itemType: '',
      description: '',
      quantity: 1,
      stitchingPrice: 0,
      asterRequired: false,
      asterType: null,
      asterCharge: 0,
      pieceGiven: false,
      fabric: {
        source: 'customer',
        fabricId: null,
        fabricDescription: '',
        metersUsed: 0,
        ratePerMeter: 0,
        fabricCost: 0,
      },
      additionalCharges: [],
      accessories: [],
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, updates: Partial<StitchingOrderItem>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    }));
  };

  const updateFabric = (
    itemIndex: number,
    fabricId: string | null,
    source: 'shop' | 'customer'
  ) => {
    if (source === 'customer' || !fabricId) {
      updateItem(itemIndex, {
        fabric: {
          source,
          fabricId: null,
          fabricDescription: '',
          metersUsed: 0,
          ratePerMeter: 0,
          fabricCost: 0,
        },
      });
      return;
    }

    const fabric = fabrics.find((f) => f.fabricId === fabricId);
    if (fabric) {
      updateItem(itemIndex, {
        fabric: {
          source: 'shop',
          fabricId: fabric.fabricId,
          fabricDescription: `${fabric.name || ''} ${fabric.color || ''}`.trim(),
          metersUsed: 0,
          ratePerMeter: fabric.sellingRate,
          fabricCost: 0,
        },
      });
    }
  };

  const updateFabricMeters = (itemIndex: number, meters: number) => {
    const item = formData.items[itemIndex];
    const fabricCost = meters * item.fabric.ratePerMeter;
    updateItem(itemIndex, {
      fabric: {
        ...item.fabric,
        metersUsed: meters,
        fabricCost,
      },
    });
  };

  const addAccessory = (itemIndex: number, accessoryId: string) => {
    const accessory = accessories.find((a) => a.accessoryId === accessoryId);
    if (!accessory) return;

    const item = formData.items[itemIndex];
    // Check if accessory already added
    if (item.accessories.some((a) => a.accessoryId === accessoryId)) {
      toast.error('Accessory already added');
      return;
    }

    const newAccessory = {
      accessoryId: accessory.accessoryId,
      type: accessory.type,
      quantityUsed: 1,
      unitPrice: accessory.sellingRate,
      totalCost: accessory.sellingRate,
      billedToCustomer: true,
    };

    updateItem(itemIndex, {
      accessories: [...item.accessories, newAccessory],
    });
  };

  const removeAccessory = (itemIndex: number, accIndex: number) => {
    const item = formData.items[itemIndex];
    updateItem(itemIndex, {
      accessories: item.accessories.filter((_, i) => i !== accIndex),
    });
  };

  const updateAccessory = (
    itemIndex: number,
    accIndex: number,
    updates: { quantityUsed?: number; billedToCustomer?: boolean }
  ) => {
    const item = formData.items[itemIndex];
    const updatedAccessories = item.accessories.map((acc, i) => {
      if (i === accIndex) {
        const quantity =
          updates.quantityUsed !== undefined ? updates.quantityUsed : acc.quantityUsed;
        return {
          ...acc,
          ...updates,
          quantityUsed: quantity,
          totalCost: quantity * acc.unitPrice,
        };
      }
      return acc;
    });
    updateItem(itemIndex, { accessories: updatedAccessories });
  };

  const addAdditionalCharge = (itemIndex: number) => {
    const item = formData.items[itemIndex];
    updateItem(itemIndex, {
      additionalCharges: [...item.additionalCharges, { type: '', description: '', amount: 0 }],
    });
  };

  const removeAdditionalCharge = (itemIndex: number, chargeIndex: number) => {
    const item = formData.items[itemIndex];
    updateItem(itemIndex, {
      additionalCharges: item.additionalCharges.filter((_, i) => i !== chargeIndex),
    });
  };

  const updateAdditionalCharge = (
    itemIndex: number,
    chargeIndex: number,
    updates: { type?: string; description?: string; amount?: number }
  ) => {
    const item = formData.items[itemIndex];
    const updatedCharges = item.additionalCharges.map((charge, i) =>
      i === chargeIndex ? { ...charge, ...updates } : charge
    );
    updateItem(itemIndex, { additionalCharges: updatedCharges });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-900 to-purple-950 p-6 rounded-t-2xl border-b-2 border-boutique-secondary">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-white">Create New Stitching Order gfrth</h2>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-boutique-primary">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Customer Phone <span className="text-error">*</span>
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="10-digit phone"
                    className="input input-bordered flex-1"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    maxLength={10}
                  />
                  <button
                    onClick={searchCustomer}
                    disabled={customerPhone.length !== 10}
                    className="btn btn-primary"
                  >
                    Search
                  </button>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Customer Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered bg-gray-100"
                  value={customer?.name || ''}
                  readOnly
                />
              </div>
            </div>

            {/* Customer Measurements */}
            {customerMeasurements && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-sm font-semibold text-boutique-primary mb-2">
                  Customer Measurements (inches)
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                  {Object.entries(customerMeasurements).map(([key, value]) =>
                    value ? (
                      <div key={key}>
                        <span className="text-gray-600">{key}:</span>{' '}
                        <span className="font-semibold">{value}"</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Details */}
          {customer && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-boutique-primary">Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Order No. <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., ST-001"
                    className="input input-bordered"
                    value={formData.orderNo}
                    onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Order Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Promise Date <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={formData.promiseDate}
                    onChange={(e) => setFormData({ ...formData, promiseDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-boutique-primary">Order Items</h3>
                  <button onClick={addItem} className="btn btn-sm btn-primary">
                    + Add Item
                  </button>
                </div>

                {formData.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="p-4 border-2 border-boutique-secondary/30 rounded-xl bg-gradient-to-br from-purple-50/50 to-amber-50/50"
                  >
                    {/* Item Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-boutique-primary">Item #{itemIndex + 1}</h4>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(itemIndex)}
                          className="btn btn-sm btn-error btn-outline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Basic Item Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm font-semibold">
                            Item Type <span className="text-error">*</span>
                          </span>
                        </label>
                        <select
                          className="select select-bordered select-sm"
                          value={item.itemType}
                          onChange={(e) => updateItem(itemIndex, { itemType: e.target.value })}
                        >
                          <option value="">Select Type</option>
                          <option value="blouse">Blouse</option>
                          <option value="kurti">Kurti</option>
                          <option value="suit">Suit</option>
                          <option value="lehenga">Lehenga</option>
                          <option value="saree">Saree</option>
                          <option value="dress">Dress</option>
                          <option value="alteration">Alteration</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm font-semibold">Quantity</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="input input-bordered input-sm"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(itemIndex, { quantity: parseInt(e.target.value) || 1 })
                          }
                        />
                      </div>
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-sm font-semibold">
                            Stitching Price (₹)
                          </span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          className="input input-bordered input-sm"
                          value={item.stitchingPrice}
                          onChange={(e) =>
                            updateItem(itemIndex, {
                              stitchingPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-control mb-3">
                      <label className="label py-1">
                        <span className="label-text text-sm font-semibold">Description</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered textarea-sm h-16"
                        placeholder="Item description, design details, etc."
                        value={item.description}
                        onChange={(e) => updateItem(itemIndex, { description: e.target.value })}
                      />
                    </div>

                    {/* Aster Details */}
                    <div className="mb-3 p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <label className="label cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={item.asterRequired}
                            onChange={(e) =>
                              updateItem(itemIndex, { asterRequired: e.target.checked })
                            }
                          />
                          <span className="label-text font-semibold">Aster Required</span>
                        </label>
                      </div>
                      {item.asterRequired && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-sm">Aster Type</span>
                            </label>
                            <select
                              className="select select-bordered select-sm"
                              value={item.asterType || ''}
                              onChange={(e) =>
                                updateItem(itemIndex, { asterType: e.target.value || null })
                              }
                            >
                              <option value="">Select Type</option>
                              <option value="cotton">Cotton</option>
                              <option value="tapeta">Tapeta</option>
                            </select>
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-sm">Aster Charge (₹)</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              className="input input-bordered input-sm"
                              value={item.asterCharge}
                              onChange={(e) =>
                                updateItem(itemIndex, {
                                  asterCharge: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="form-control flex items-end">
                            <label className="label cursor-pointer gap-2">
                              <span className="label-text text-sm">Piece Given</span>
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={item.pieceGiven}
                                onChange={(e) =>
                                  updateItem(itemIndex, { pieceGiven: e.target.checked })
                                }
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fabric Details */}
                    <div className="mb-3 p-3 bg-white/50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Fabric Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        <div className="form-control">
                          <label className="label py-1">
                            <span className="label-text text-sm">Fabric Source</span>
                          </label>
                          <select
                            className="select select-bordered select-sm"
                            value={item.fabric.source}
                            onChange={(e) =>
                              updateFabric(itemIndex, null, e.target.value as 'shop' | 'customer')
                            }
                          >
                            <option value="customer">Customer Provided</option>
                            <option value="shop">Shop Fabric</option>
                          </select>
                        </div>
                        {item.fabric.source === 'shop' && (
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-sm">Select Fabric</span>
                            </label>
                            <select
                              className="select select-bordered select-sm"
                              value={item.fabric.fabricId || ''}
                              onChange={(e) => updateFabric(itemIndex, e.target.value, 'shop')}
                            >
                              <option value="">Select from inventory</option>
                              {fabrics.map((f) => (
                                <option key={f.fabricId} value={f.fabricId}>
                                  {f.fabricId} - {f.name} {f.color} (₹{f.sellingRate}/m)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      {item.fabric.source === 'customer' || item.fabric.fabricId ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {item.fabric.source === 'customer' && (
                            <div className="form-control">
                              <label className="label py-1">
                                <span className="label-text text-sm">Fabric Description</span>
                              </label>
                              <input
                                type="text"
                                className="input input-bordered input-sm"
                                placeholder="e.g., Red silk"
                                value={item.fabric.fabricDescription}
                                onChange={(e) =>
                                  updateItem(itemIndex, {
                                    fabric: { ...item.fabric, fabricDescription: e.target.value },
                                  })
                                }
                              />
                            </div>
                          )}
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-sm">Meters Used</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              className="input input-bordered input-sm"
                              value={item.fabric.metersUsed}
                              onChange={(e) =>
                                updateFabricMeters(itemIndex, parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          {item.fabric.source === 'shop' && (
                            <>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-sm">Rate/Meter (₹)</span>
                                </label>
                                <input
                                  type="number"
                                  className="input input-bordered input-sm bg-gray-100"
                                  value={item.fabric.ratePerMeter}
                                  readOnly
                                />
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-sm font-semibold">
                                    Fabric Cost (₹)
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  className="input input-bordered input-sm bg-gray-100"
                                  value={item.fabric.fabricCost}
                                  readOnly
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Accessories */}
                    <div className="mb-3 p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-sm">Accessories</h5>
                        <select
                          className="select select-bordered select-sm max-w-xs"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addAccessory(itemIndex, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="">+ Add Accessory</option>
                          {accessories.map((a) => (
                            <option key={a.accessoryId} value={a.accessoryId}>
                              {a.accessoryId} - {a.type} (₹{a.sellingRate}/{a.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      {item.accessories.length > 0 ? (
                        <div className="space-y-2">
                          {item.accessories.map((acc, accIndex) => (
                            <div
                              key={accIndex}
                              className="grid grid-cols-5 gap-2 items-center p-2 bg-white rounded"
                            >
                              <div className="text-sm font-medium">{acc.type}</div>
                              <div className="form-control">
                                <input
                                  type="number"
                                  min="1"
                                  className="input input-bordered input-xs"
                                  placeholder="Qty"
                                  value={acc.quantityUsed}
                                  onChange={(e) =>
                                    updateAccessory(itemIndex, accIndex, {
                                      quantityUsed: parseInt(e.target.value) || 1,
                                    })
                                  }
                                />
                              </div>
                              <div className="text-sm">₹{acc.unitPrice}</div>
                              <div className="text-sm font-semibold">₹{acc.totalCost}</div>
                              <div className="flex items-center gap-1">
                                <label className="label cursor-pointer gap-1 flex-1">
                                  <span className="label-text text-xs">Bill</span>
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs"
                                    checked={acc.billedToCustomer}
                                    onChange={(e) =>
                                      updateAccessory(itemIndex, accIndex, {
                                        billedToCustomer: e.target.checked,
                                      })
                                    }
                                  />
                                </label>
                                <button
                                  onClick={() => removeAccessory(itemIndex, accIndex)}
                                  className="btn btn-xs btn-error btn-outline"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No accessories added</p>
                      )}
                    </div>

                    {/* Additional Charges */}
                    <div className="mb-3 p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-sm">Additional Charges</h5>
                        <button
                          onClick={() => addAdditionalCharge(itemIndex)}
                          className="btn btn-xs btn-primary btn-outline"
                        >
                          + Add Charge
                        </button>
                      </div>
                      {item.additionalCharges.length > 0 ? (
                        <div className="space-y-2">
                          {item.additionalCharges.map((charge, chargeIndex) => (
                            <div
                              key={chargeIndex}
                              className="grid grid-cols-4 gap-2 items-center p-2 bg-white rounded"
                            >
                              <select
                                className="select select-bordered select-xs col-span-1"
                                value={charge.type}
                                onChange={(e) =>
                                  updateAdditionalCharge(itemIndex, chargeIndex, {
                                    type: e.target.value,
                                  })
                                }
                              >
                                <option value="">Type</option>
                                <option value="dye">Dye</option>
                                <option value="fall-pico">Fall-Pico</option>
                                <option value="kaaj">Kaaj</option>
                                <option value="lace">Lace</option>
                                <option value="piping">Piping</option>
                                <option value="embroidery">Embroidery</option>
                                <option value="other">Other</option>
                              </select>
                              <input
                                type="text"
                                className="input input-bordered input-xs col-span-1"
                                placeholder="Description"
                                value={charge.description}
                                onChange={(e) =>
                                  updateAdditionalCharge(itemIndex, chargeIndex, {
                                    description: e.target.value,
                                  })
                                }
                              />
                              <input
                                type="number"
                                min="0"
                                className="input input-bordered input-xs col-span-1"
                                placeholder="Amount"
                                value={charge.amount}
                                onChange={(e) =>
                                  updateAdditionalCharge(itemIndex, chargeIndex, {
                                    amount: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                              <button
                                onClick={() => removeAdditionalCharge(itemIndex, chargeIndex)}
                                className="btn btn-xs btn-error btn-outline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No additional charges</p>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="pt-2 border-t border-boutique-secondary/30">
                      <div className="text-right font-semibold text-boutique-primary">
                        Item Total: ₹{calculateItemTotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-100 to-amber-100 rounded-xl">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Items Total:</div>
                  <div className="text-right font-semibold">₹{formData.totalAmount.toFixed(2)}</div>
                  <div>Amount Paid:</div>
                  <div className="text-right font-semibold">₹{formData.amountPaid.toFixed(2)}</div>
                  <div className="text-lg font-bold text-boutique-primary">Balance Due:</div>
                  <div className="text-lg text-right font-bold text-boutique-primary">
                    ₹{(formData.totalAmount - formData.amountPaid).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Amount Paid (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    className="input input-bordered"
                    value={formData.amountPaid || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as typeof formData.status })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="stuck">Stuck</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Tailor Remarks</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Enter any special instructions or notes..."
                  value={formData.tailorRemarks}
                  onChange={(e) => setFormData({ ...formData, tailorRemarks: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-outline" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading || !customer}
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStitchingOrderModal;
