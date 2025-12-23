import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Customer, Fabric, Accessory } from '../types';
import type {
  Measurement,
  StitchingOrderFormData,
  StitchingOrderItem,
  StitchingOrder,
} from '../types/stitching';
import { useApp } from '../context/AppContext';
import StitchingOrderModal from './StitchingOrderModal';
import { formatCurrency } from '../utils/currency';
import { StitchingFilters, StitchingOrdersTable } from '../features/stitching/components';

const StitchingOrderManagement = () => {
  const { privacyMode } = useApp();
  const [orders, setOrders] = useState<StitchingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'pending' | 'in-progress' | 'ready' | 'delivered' | 'stuck'
  >('ALL');
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StitchingOrder | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerMeasurements, setCustomerMeasurements] = useState<Measurement | null>(null);
  const [newMeasurements, setNewMeasurements] = useState<Measurement>({});
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);
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

  // Load inventory on mount
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
      }
    };
    loadInventory();
  }, []);

  // Calculate item total
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

  // Update total when items change
  useEffect(() => {
    const total = calculateOrderTotal();
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.items]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await service.getStitchingOrders();
      const filteredOrders =
        statusFilter === 'ALL' ? result : result.filter((o) => o.status === statusFilter);
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching stitching orders:', error);
      toast.error('Failed to fetch stitching orders');
    } finally {
      setLoading(false);
    }
  };

  const searchOrderByOrderNo = async () => {
    if (!searchOrderNo.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setSearchLoading(true);
    try {
      const allOrders = await service.getStitchingOrders();
      const foundOrder = allOrders.find(
        (order) => order.orderNo.toLowerCase() === searchOrderNo.toLowerCase()
      );

      if (foundOrder) {
        setOrders([foundOrder]);
        setSearchOrderNo('');
        toast.success(`Order found: ${foundOrder.orderNo}`);
      } else {
        toast.error(`No order found with Order No. ${searchOrderNo}`);
      }
    } catch (error) {
      toast.error('Error searching order');
    } finally {
      setSearchLoading(false);
    }
  };

  const searchCustomer = async (phone: string) => {
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      return;
    }

    try {
      const c = await service.getCustomerByPhone(phone);
      if (c) {
        setCustomer(c);
        setFormData((prev) => ({
          ...prev,
          customerName: c.name,
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
        // Don't show error - allow manual entry
      }
    } catch (error) {
      console.error('Error searching customer:', error);
      setCustomer(null);
      setCustomerMeasurements(null);
    }
  };

  const resetForm = () => {
    setCustomer(null);
    setCustomerMeasurements(null);
    setNewMeasurements({});
    setShowMeasurementForm(false);
    setFormData({
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
    setCreateError('');
  };

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

    if (formData.items.length === 0 || !formData.items[0].itemType) {
      toast.error('Please add at least one item');
      return;
    }

    setCreateLoading(true);
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
      resetForm();
      setShowCreateForm(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating stitching order:', error);
      toast.error('Failed to create stitching order');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      {selectedOrder && (
        <StitchingOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchOrders}
        />
      )}

      <div className="bg-gradient-to-br from-purple-50 via-white to-amber-50 rounded-3xl shadow-2xl border-2 border-boutique-secondary/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 p-6 border-b-2 border-boutique-secondary shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-boutique-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                  Stitching Orders
                </h2>
                <p className="text-amber-100 text-sm font-light drop-shadow">
                  Track and manage stitching orders
                </p>
              </div>
            </div>
            <button
              className={`btn btn-sm gap-2 transition-all duration-300 shadow-lg ${
                showCreateForm
                  ? 'bg-white/90 text-boutique-primary hover:bg-white border-white/50'
                  : 'bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none font-bold'
              }`}
              onClick={() => {
                if (showCreateForm) resetForm();
                setShowCreateForm(!showCreateForm);
              }}
            >
              {showCreateForm ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  New Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-gradient-to-br from-amber-50 via-slate-50 to-purple-50">
          {/* Create Form - Part 1 will be in next file due to size */}
          {showCreateForm && (
            <div className="mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-boutique-secondary/40 shadow-xl">
              <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2 text-boutique-primary">
                <div className="w-8 h-8 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-boutique-dark"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                Create New Stitching Order
              </h3>

              {createError && (
                <div className="alert alert-error mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{createError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Customer Details - Always Visible */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-boutique-primary">Customer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Customer Phone<span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="tel"
                        placeholder="10-digit phone"
                        className="ml-1 input input-bordered input-sm"
                        value={formData.customerPhone}
                        onChange={(e) => {
                          const phone = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, customerPhone: phone });
                          if (phone.length === 10) {
                            searchCustomer(phone);
                          }
                        }}
                        maxLength={10}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          Customer Name<span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter customer name"
                        className="ml-1 input input-bordered input-sm"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                    </div>
                  </div>

                  {customerMeasurements && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-sm font-semibold text-boutique-primary mb-2">
                        Customer Measurements (inches)
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                        {/* Display in specific order matching input form */}
                        {[
                          'length',
                          'waist',
                          'chest',
                          'hip',
                          'upperChest',
                          'shoulder',
                          'frontNeck',
                          'backNeck',
                          'armhole',
                          'sleeveLength',
                          'sleeveCircumference',
                        ].map((key) => {
                          const value = customerMeasurements[key as keyof Measurement];
                          return value ? (
                            <div key={key}>
                              <span className="text-gray-600">{key}:</span>{' '}
                              <span className="font-semibold">{value}"</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add/Update Measurements Section */}
                  <div className="border-2 border-dashed border-boutique-accent/40 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-semibold text-boutique-primary">
                        {customerMeasurements ? 'Update Measurements' : 'Add Measurements'}
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMeasurementForm(!showMeasurementForm);
                          if (!showMeasurementForm && customerMeasurements) {
                            setNewMeasurements(customerMeasurements);
                          }
                        }}
                        className="btn btn-xs btn-outline btn-primary"
                      >
                        {showMeasurementForm
                          ? 'Hide Form'
                          : customerMeasurements
                            ? 'Update'
                            : 'Add New'}
                      </button>
                    </div>

                    {showMeasurementForm && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {/* Body Measurements - Ordered to match display */}
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Length</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 38"
                              className="input input-bordered input-xs"
                              value={newMeasurements.length || ''}
                              onChange={(e) =>
                                setNewMeasurements({ ...newMeasurements, length: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Waist</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 32"
                              className="input input-bordered input-xs"
                              value={newMeasurements.waist || ''}
                              onChange={(e) =>
                                setNewMeasurements({ ...newMeasurements, waist: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Chest</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 36"
                              className="input input-bordered input-xs"
                              value={newMeasurements.chest || ''}
                              onChange={(e) =>
                                setNewMeasurements({ ...newMeasurements, chest: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Hip</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 38"
                              className="input input-bordered input-xs"
                              value={newMeasurements.hip || ''}
                              onChange={(e) =>
                                setNewMeasurements({ ...newMeasurements, hip: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Upper Chest</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 34"
                              className="input input-bordered input-xs"
                              value={newMeasurements.upperChest || ''}
                              onChange={(e) =>
                                setNewMeasurements({
                                  ...newMeasurements,
                                  upperChest: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Shoulder</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 15"
                              className="input input-bordered input-xs"
                              value={newMeasurements.shoulder || ''}
                              onChange={(e) =>
                                setNewMeasurements({ ...newMeasurements, shoulder: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Front Neck</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 8"
                              className="input input-bordered input-xs"
                              value={newMeasurements.frontNeck || ''}
                              onChange={(e) =>
                                setNewMeasurements({
                                  ...newMeasurements,
                                  frontNeck: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Back Neck</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 7"
                              className="input input-bordered input-xs"
                              value={newMeasurements.backNeck || ''}
                              onChange={(e) =>
                                setNewMeasurements({ ...newMeasurements, backNeck: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Armhole</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 18"
                              className="input input-bordered input-xs"
                              value={newMeasurements.armhole || ''}
                              onChange={(e) =>
                                setNewMeasurements({ ...newMeasurements, armhole: e.target.value })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Sleeve Length</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 22"
                              className="input input-bordered input-xs"
                              value={newMeasurements.sleeveLength || ''}
                              onChange={(e) =>
                                setNewMeasurements({
                                  ...newMeasurements,
                                  sleeveLength: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label py-1">
                              <span className="label-text text-xs">Sleeve Circumference</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., 14"
                              className="input input-bordered input-xs"
                              value={newMeasurements.sleeveCircumference || ''}
                              onChange={(e) =>
                                setNewMeasurements({
                                  ...newMeasurements,
                                  sleeveCircumference: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNewMeasurements({});
                            }}
                            className="btn btn-xs btn-ghost"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewMeasurements({});
                              setShowMeasurementForm(false);
                            }}
                            className="btn btn-xs btn-outline"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!formData.customerPhone || formData.customerPhone.length !== 10) {
                                toast.error('Please enter a valid customer phone number first');
                                return;
                              }
                              try {
                                // Update or create customer with measurements
                                await service.updateCustomerMeasurements(
                                  formData.customerPhone,
                                  formData.customerName,
                                  JSON.stringify(newMeasurements)
                                );
                                setCustomerMeasurements(newMeasurements);
                                setShowMeasurementForm(false);
                                toast.success('Measurements saved successfully');
                              } catch (error) {
                                console.error('Error saving measurements:', error);
                                toast.error('Failed to save measurements');
                              }
                            }}
                            className="btn btn-xs btn-primary"
                          >
                            Save Measurements
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information - Always Visible */}
                <div className="border-t-2 border-boutique-accent/30 pt-4">
                  <h4 className="text-md font-semibold text-boutique-primary mb-3">
                    Order Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                </div>

                {/* Items Section */}
                <div className="border-t-2 border-boutique-accent/30 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-boutique-primary">Order Items</h4>
                    <button
                      type="button"
                      className="btn btn-sm bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark border-none"
                      onClick={addItem}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Item
                    </button>
                  </div>

                  {formData.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="mb-4 p-4 border-2 border-boutique-accent/30 rounded-xl bg-white/80"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-boutique-primary">
                          Item #{itemIndex + 1}
                        </h5>
                        {formData.items.length > 1 && (
                          <button
                            onClick={() => removeItem(itemIndex)}
                            className="btn btn-xs btn-error btn-outline"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Basic Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-semibold text-boutique-dark">
                              Item Type <span className="text-error">*</span>
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
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
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-semibold text-boutique-dark">
                              Quantity
                            </span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(itemIndex, { quantity: parseInt(e.target.value) || 1 })
                            }
                          />
                        </div>
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-semibold text-boutique-dark">
                              Stitching Price (₹)
                            </span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                            value={item.stitchingPrice}
                            onChange={(e) =>
                              updateItem(itemIndex, {
                                stitchingPrice: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="form-control w-full mb-4">
                        <label className="label">
                          <span className="label-text font-semibold text-boutique-dark">
                            Description
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all w-full h-20"
                          placeholder="Item description, design details..."
                          value={item.description}
                          onChange={(e) => updateItem(itemIndex, { description: e.target.value })}
                        />
                      </div>

                      {/* Aster */}
                      <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <label className="label cursor-pointer gap-2 mb-2">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={item.asterRequired}
                            onChange={(e) =>
                              updateItem(itemIndex, { asterRequired: e.target.checked })
                            }
                          />
                          <span className="label-text font-semibold text-boutique-dark">
                            Aster Required
                          </span>
                        </label>
                        {item.asterRequired && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div className="form-control w-full">
                              <label className="label py-1">
                                <span className="label-text text-sm font-medium text-boutique-dark">
                                  Type
                                </span>
                              </label>
                              <select
                                className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
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
                            <div className="form-control w-full">
                              <label className="label py-1">
                                <span className="label-text text-sm font-medium text-boutique-dark">
                                  Charge (₹)
                                </span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="Enter charge"
                                className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                                value={item.asterCharge}
                                onChange={(e) =>
                                  updateItem(itemIndex, {
                                    asterCharge: parseFloat(e.target.value) || 0,
                                  })
                                }
                              />
                            </div>
                            <div className="form-control w-full">
                              <label className="label py-1">
                                <span className="label-text text-sm font-medium text-boutique-dark">
                                  Piece Given
                                </span>
                              </label>
                              <label className="label cursor-pointer justify-start gap-2 bg-white rounded-lg px-4 py-3 border-2 border-boutique-accent/40">
                                <input
                                  type="checkbox"
                                  className="checkbox checkbox-primary"
                                  checked={item.pieceGiven}
                                  onChange={(e) =>
                                    updateItem(itemIndex, { pieceGiven: e.target.checked })
                                  }
                                />
                                <span className="label-text text-boutique-dark">
                                  {item.pieceGiven ? 'Yes' : 'No'}
                                </span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fabric */}
                      <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h6 className="font-semibold text-boutique-dark mb-3">Fabric Details</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div className="form-control w-full">
                            <label className="label py-1">
                              <span className="label-text text-sm font-medium text-boutique-dark">
                                Source
                              </span>
                            </label>
                            <select
                              className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
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
                            <div className="form-control w-full">
                              <label className="label py-1">
                                <span className="label-text text-sm font-medium text-boutique-dark">
                                  Select Fabric
                                </span>
                              </label>
                              <select
                                className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                                value={item.fabric.fabricId || ''}
                                onChange={(e) => updateFabric(itemIndex, e.target.value, 'shop')}
                              >
                                <option value="">Choose fabric</option>
                                {fabrics.map((f) => (
                                  <option key={f.fabricId} value={f.fabricId}>
                                    {f.fabricId} - {f.name} {f.color} (₹{f.sellingRate}/m)
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        {(item.fabric.source === 'customer' || item.fabric.fabricId) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.fabric.source === 'customer' && (
                              <div className="form-control w-full">
                                <label className="label py-1">
                                  <span className="label-text text-sm font-medium text-boutique-dark">
                                    Description
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                                  placeholder="Fabric description"
                                  value={item.fabric.fabricDescription}
                                  onChange={(e) =>
                                    updateItem(itemIndex, {
                                      fabric: {
                                        ...item.fabric,
                                        fabricDescription: e.target.value,
                                      },
                                    })
                                  }
                                />
                              </div>
                            )}
                            <div className="form-control w-full">
                              <label className="label py-1">
                                <span className="label-text text-sm font-medium text-boutique-dark">
                                  Meters Used
                                </span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                                placeholder="0.0"
                                value={item.fabric.metersUsed}
                                onChange={(e) =>
                                  updateFabricMeters(itemIndex, parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                            {item.fabric.source === 'shop' && (
                              <>
                                <div className="form-control w-full">
                                  <label className="label py-1">
                                    <span className="label-text text-sm font-medium text-boutique-dark">
                                      Rate/Meter (₹)
                                    </span>
                                  </label>
                                  <input
                                    type="number"
                                    className="input input-bordered w-full bg-gray-100 text-boutique-dark border-2 border-gray-300 cursor-not-allowed"
                                    value={item.fabric.ratePerMeter}
                                    readOnly
                                  />
                                </div>
                                <div className="form-control w-full">
                                  <label className="label py-1">
                                    <span className="label-text text-sm font-medium text-boutique-dark">
                                      Total Cost (₹)
                                    </span>
                                  </label>
                                  <input
                                    type="number"
                                    className="input input-bordered w-full bg-gray-100 text-boutique-primary font-semibold border-2 border-gray-300 cursor-not-allowed"
                                    value={item.fabric.fabricCost}
                                    readOnly
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Accessories */}
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-semibold text-boutique-dark">Accessories</h6>
                          <select
                            className="select select-bordered select-sm bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all max-w-xs"
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
                            <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-boutique-dark/70 mb-1">
                              <div>Type</div>
                              <div>Quantity</div>
                              <div>Unit Price</div>
                              <div>Total</div>
                              <div>Action</div>
                            </div>
                            {item.accessories.map((acc, accIndex) => (
                              <div
                                key={accIndex}
                                className="grid grid-cols-5 gap-2 items-center p-3 bg-white rounded-lg border border-boutique-accent/30 text-sm"
                              >
                                <div className="font-medium text-boutique-dark">{acc.type}</div>
                                <input
                                  type="number"
                                  min="1"
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                                  value={acc.quantityUsed}
                                  onChange={(e) =>
                                    updateAccessory(itemIndex, accIndex, {
                                      quantityUsed: parseInt(e.target.value) || 1,
                                    })
                                  }
                                />
                                <div className="text-boutique-dark">₹{acc.unitPrice}</div>
                                <div className="font-semibold text-boutique-primary">
                                  ₹{acc.totalCost}
                                </div>
                                <button
                                  onClick={() => removeAccessory(itemIndex, accIndex)}
                                  className="btn btn-xs btn-error btn-outline"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No accessories added yet</p>
                        )}
                      </div>

                      {/* Additional Charges */}
                      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-semibold text-boutique-dark">Additional Charges</h6>
                          <button
                            onClick={() => addAdditionalCharge(itemIndex)}
                            className="btn btn-xs bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none"
                          >
                            + Add Charge
                          </button>
                        </div>
                        {item.additionalCharges.length > 0 ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-boutique-dark/70 mb-1">
                              <div>Type</div>
                              <div>Description</div>
                              <div>Amount (₹)</div>
                              <div>Action</div>
                            </div>
                            {item.additionalCharges.map((charge, chargeIndex) => (
                              <div
                                key={chargeIndex}
                                className="grid grid-cols-4 gap-2 items-center p-3 bg-white rounded-lg border border-boutique-accent/30"
                              >
                                <select
                                  className="select select-bordered select-sm bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                                  value={charge.type}
                                  onChange={(e) =>
                                    updateAdditionalCharge(itemIndex, chargeIndex, {
                                      type: e.target.value,
                                    })
                                  }
                                >
                                  <option value="">Select Type</option>
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
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
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
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                                  placeholder="0"
                                  value={charge.amount}
                                  onChange={(e) =>
                                    updateAdditionalCharge(itemIndex, chargeIndex, {
                                      amount: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                />
                                <button
                                  onClick={() => removeAdditionalCharge(itemIndex, chargeIndex)}
                                  className="btn btn-sm btn-error btn-outline"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No additional charges added yet
                          </p>
                        )}
                      </div>

                      {/* Item Total */}
                      <div className="pt-3 border-t-2 border-boutique-accent/30 flex justify-between items-center">
                        <span className="text-boutique-dark font-medium">Item Total:</span>
                        <span className="text-lg font-bold text-boutique-primary">
                          {formatCurrency(calculateItemTotal(item))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="border-t-2 border-boutique-accent/30 pt-4">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-amber-100 rounded-xl mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Order Total:</div>
                      <div className="text-right font-semibold">
                        {formatCurrency(formData.totalAmount)}
                      </div>
                      <div>Amount Paid:</div>
                      <div className="text-right font-semibold">
                        {formatCurrency(formData.amountPaid)}
                      </div>
                      <div className="text-lg font-bold text-boutique-primary">Balance Due:</div>
                      <div className="text-lg text-right font-bold text-boutique-primary">
                        {formatCurrency(formData.totalAmount - formData.amountPaid)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Amount Paid (₹)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input input-bordered"
                        value={formData.amountPaid || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amountPaid: parseFloat(e.target.value) || 0,
                          })
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
                          setFormData({
                            ...formData,
                            status: e.target.value as typeof formData.status,
                          })
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
                      className="textarea textarea-bordered h-20"
                      placeholder="Special instructions..."
                      value={formData.tailorRemarks}
                      onChange={(e) => setFormData({ ...formData, tailorRemarks: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t-2 border-boutique-accent/30">
                  <button
                    onClick={() => {
                      resetForm();
                      setShowCreateForm(false);
                    }}
                    className="btn btn-outline"
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={createLoading}
                  >
                    {createLoading ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          {!showCreateForm && (
            <StitchingFilters
              statusFilter={statusFilter}
              searchOrderNo={searchOrderNo}
              loading={loading}
              searchLoading={searchLoading}
              disabled={false}
              onStatusFilterChange={setStatusFilter}
              onSearchChange={setSearchOrderNo}
              onSearch={searchOrderByOrderNo}
              onFetchOrders={fetchOrders}
            />
          )}

          {/* Orders Table */}
          {!showCreateForm && (
            <div className="bg-white/90 rounded-xl border-boutique-accent/30 shadow-md overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <span className="loading loading-spinner loading-lg text-boutique-primary"></span>
                </div>
              ) : (
                <StitchingOrdersTable
                  orders={orders}
                  onViewOrder={setSelectedOrder}
                  privacyMode={privacyMode}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StitchingOrderManagement;
