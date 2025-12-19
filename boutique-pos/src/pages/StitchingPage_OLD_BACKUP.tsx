import { useState } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import { useApp } from '../context/AppContext';
import type { StitchingOrder } from '../types/stitching';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import StitchingOrderModal from '../components/StitchingOrderModal';
import CreateStitchingOrderModal from '../components/CreateStitchingOrderModal';

const StitchingPage = () => {
  const { privacyMode } = useApp();
  const [orders, setOrders] = useState<StitchingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'pending' | 'in-progress' | 'ready' | 'delivered' | 'stuck'
  >('ALL');
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<StitchingOrder | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await service.getStitchingOrders();
      setOrders(result);
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

  const fetchFilteredOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await service.getStitchingOrders();
      const filteredOrders =
        statusFilter === 'ALL'
          ? fetchedOrders
          : fetchedOrders.filter((order) => order.status === statusFilter);
      setOrders(filteredOrders);
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (order: StitchingOrder) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedOrder(null);
    setShowEditModal(false);
  };

  const handleOrderUpdate = () => {
    fetchFilteredOrders();
    closeEditModal();
  };

  const handleCreateSuccess = () => {
    fetchFilteredOrders();
  };
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
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (index: number, field: keyof StitchingOrderItem, value: any) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    calculateTotal();
  };

  const updateFabricDetail = (
    index: number,
    field: keyof FabricDetail,
    value: string | number | null
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      fabric: { ...updatedItems[index].fabric, [field]: value },
    };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    calculateTotal();
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    calculateTotal();
  };

  const addAdditionalCharge = () => {
    const newCharge: AdditionalCharge = {
      type: '',
      description: '',
      amount: 0,
    };
    setFormData((prev) => ({
      ...prev,
      additionalCharges: [...prev.additionalCharges, newCharge],
    }));
  };

  const updateAdditionalCharge = (
    index: number,
    field: keyof AdditionalCharge,
    value: string | number
  ) => {
    const updated = [...formData.additionalCharges];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, additionalCharges: updated }));
    calculateTotal();
  };

  const removeAdditionalCharge = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      additionalCharges: prev.additionalCharges.filter((_, i) => i !== index),
    }));
    calculateTotal();
  };

  const calculateTotal = () => {
    setTimeout(() => {
      setFormData((prev) => {
        let total = 0;

        // Items stitching prices
        prev.items.forEach((item) => {
          total += item.stitchingPrice * item.quantity;
        });

        // Fabric costs
        prev.items.forEach((item) => {
          if (item.fabric.source === 'shop') {
            total += item.fabric.metersUsed * item.fabric.ratePerMeter;
          }
        });

        // Additional charges
        prev.additionalCharges.forEach((charge) => {
          total += charge.amount;
        });

        return { ...prev, totalAmount: total };
      });
    }, 0);
  };

  const addPayment = () => {
    const amount = prompt('Enter payment amount:');
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      const payment: PaymentRecord = {
        amount: Number(amount),
        date: new Date().toISOString().split('T')[0],
        method: 'cash',
        remarks: '',
      };
      setFormData((prev) => ({
        ...prev,
        paymentHistory: [...prev.paymentHistory, payment],
        amountPaid: prev.amountPaid + Number(amount),
      }));
    }
  };

  const createOrder = async () => {
    if (!customer) {
      toast.error('Please search and select a customer first');
      return;
    }

    if (!formData.orderNo.trim()) {
      toast.error('Please enter order number');
      return;
    }

    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    if (!formData.promiseDate) {
      toast.error('Please select promise date');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerPhone: customer.phone,
        customerName: customer.name,
        orderNo: formData.orderNo,
        orderDate: formData.orderDate,
        promiseDate: formData.promiseDate,
        items: JSON.stringify(formData.items),
        additionalCharges: JSON.stringify(formData.additionalCharges),
        accessoriesUsed: JSON.stringify(formData.accessoriesUsed),
        totalAmount: formData.totalAmount,
        amountPaid: formData.amountPaid,
        status: formData.status,
        tailorRemarks: formData.tailorRemarks,
        paymentHistory: JSON.stringify(formData.paymentHistory),
      };

      await service.createStitchingOrder(orderData);
      toast.success('Stitching order created successfully!');
      resetForm();
      setShowCreateForm(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating stitching order:', error);
      toast.error('Failed to create stitching order');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCustomer(null);
    setCustomerMeasurements(null);
    setCustomerPhone('');
    setFormData({
      orderNo: '',
      orderDate: new Date().toISOString().split('T')[0],
      promiseDate: '',
      items: [],
      additionalCharges: [],
      accessoriesUsed: [],
      totalAmount: 0,
      amountPaid: 0,
      status: 'pending',
      tailorRemarks: '',
      paymentHistory: [],
    });
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

  const fetchFilteredOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await service.getStitchingOrders();
      const filteredOrders =
        statusFilter === 'ALL'
          ? fetchedOrders
          : fetchedOrders.filter((order) => order.status === statusFilter);
      setOrders(filteredOrders);
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (order: StitchingOrder) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedOrder(null);
    setShowEditModal(false);
  };

  const handleOrderUpdate = () => {
    fetchFilteredOrders();
    closeEditModal();
  };

  return (
    <>
      {/* Create Modal */}
      {showCreateModal && (
        <CreateStitchingOrderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Modal */}
      {selectedOrder && showEditModal && (
        <StitchingOrderModal
          order={selectedOrder}
          onClose={closeEditModal}
          onUpdate={handleOrderUpdate}
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
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                  Stitching Orders
                </h2>
                <p className="text-amber-100 text-sm font-light drop-shadow">
                  Manage custom stitching orders with measurements
                </p>
              </div>
            </div>
            <button
              className="btn btn-sm gap-2 transition-all duration-300 shadow-lg bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none font-bold"
              onClick={() => setShowCreateModal(true)}
            >
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
            </button>
          </div>
        </div>
                if (showCreateForm) {
                  resetForm();
                }
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

        {/* Content Section */}
        <div className="p-6 bg-gradient-to-br from-amber-50 via-slate-50 to-purple-50">
          {/* Create Form */}
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

              <div className="space-y-4">
                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Customer Phone <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit phone"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={customerPhone}
                      onChange={(e) => {
                        const phone = e.target.value;
                        setCustomerPhone(phone);
                        if (phone.length === 10 && /^[6-9]\d{9}$/.test(phone)) {
                          searchCustomer();
                        } else if (phone.length < 10) {
                          setCustomer(null);
                          setCustomerMeasurements(null);
                        }
                      }}
                      maxLength={10}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Customer Name <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      className={`input input-bordered w-full text-boutique-dark border-2 focus:outline-none transition-all ${
                        customer
                          ? 'bg-gray-100 border-boutique-accent/40 cursor-not-allowed'
                          : 'bg-white border-boutique-accent/40 focus:border-boutique-secondary'
                      }`}
                      value={customer ? customer.name : ''}
                      readOnly={!!customer}
                      disabled={customerPhone.length !== 10}
                    />
                    {customer && customerMeasurements && (
                      <label className="label">
                        <span className="label-text-alt text-green-600 font-semibold">
                          ✓ Customer found with measurements
                        </span>
                      </label>
                    )}
                    {customer && !customerMeasurements && (
                      <label className="label">
                        <span className="label-text-alt text-amber-600 font-semibold">
                          ⚠ Customer found but no measurements saved
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Measurements Display - Compact */}
                {customerMeasurements && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-xs font-semibold text-boutique-primary mb-2">
                      Customer Measurements (inches)
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                      {customerMeasurements.length && (
                        <div>
                          <span className="text-boutique-dark/60">Length:</span>{' '}
                          <span className="font-semibold">{customerMeasurements.length}"</span>
                        </div>
                      )}
                      {customerMeasurements.waist && (
                        <div>
                          <span className="text-boutique-dark/60">Waist:</span>{' '}
                          <span className="font-semibold">{customerMeasurements.waist}"</span>
                        </div>
                      )}
                      {customerMeasurements.chest && (
                        <div>
                          <span className="text-boutique-dark/60">Chest:</span>{' '}
                          <span className="font-semibold">{customerMeasurements.chest}"</span>
                        </div>
                      )}
                      {customerMeasurements.hip && (
                        <div>
                          <span className="text-boutique-dark/60">Hip:</span>{' '}
                          <span className="font-semibold">{customerMeasurements.hip}"</span>
                        </div>
                      )}
                      {customerMeasurements.upperChest && (
                        <div>
                          <span className="text-boutique-dark/60">Upper Chest:</span>{' '}
                          <span className="font-semibold">{customerMeasurements.upperChest}"</span>
                        </div>
                      )}
                      {customerMeasurements.shoulder && (
                        <div>
                          <span className="text-boutique-dark/60">Shoulder:</span>{' '}
                          <span className="font-semibold">{customerMeasurements.shoulder}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details */}
              {customer && (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-boutique-accent/30">
                    <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary">
                      Order Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold text-boutique-dark">
                            Order No. <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., ST-001"
                          className="input input-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none"
                          value={formData.orderNo}
                          onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold text-boutique-dark">
                            Order Date
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none"
                          value={formData.orderDate}
                          onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold text-boutique-dark">
                            Promise Date <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none"
                          value={formData.promiseDate}
                          onChange={(e) =>
                            setFormData({ ...formData, promiseDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-boutique-accent/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif font-semibold text-boutique-primary">
                        Items to Stitch
                      </h3>
                      <button
                        className="btn btn-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none gap-2"
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

                    {formData.items.length === 0 ? (
                      <div className="text-center py-8 text-boutique-dark/60">
                        <p>No items added yet. Click "Add Item" to start.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.items.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white rounded-lg border-2 border-boutique-accent/20 shadow-sm space-y-3"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-boutique-primary">
                                Item #{index + 1}
                              </span>
                              <button
                                className="btn btn-sm btn-error gap-2"
                                onClick={() => removeItem(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs font-semibold">
                                    Item Type
                                  </span>
                                </label>
                                <select
                                  className="select select-bordered select-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                  value={item.itemType}
                                  onChange={(e) => updateItem(index, 'itemType', e.target.value)}
                                >
                                  <option value="">Select type</option>
                                  <option value="shirt">Shirt</option>
                                  <option value="pant">Pant</option>
                                  <option value="kurta">Kurta</option>
                                  <option value="pajama">Pajama</option>
                                  <option value="blouse">Blouse</option>
                                  <option value="salwar">Salwar</option>
                                  <option value="suit">Suit</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs font-semibold">
                                    Description
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Full sleeve shirt"
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                  value={item.description}
                                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                                />
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs font-semibold">Quantity</span>
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                                  }
                                />
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs font-semibold">
                                    Stitching Price
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                  value={item.stitchingPrice}
                                  onChange={(e) => {
                                    updateItem(
                                      index,
                                      'stitchingPrice',
                                      parseFloat(e.target.value) || 0
                                    );
                                    calculateTotal();
                                  }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="form-control">
                                <label className="label py-1 cursor-pointer">
                                  <span className="label-text text-xs font-semibold">
                                    Aster Required
                                  </span>
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-sm"
                                    checked={item.asterRequired}
                                    onChange={(e) =>
                                      updateItem(index, 'asterRequired', e.target.checked)
                                    }
                                  />
                                </label>
                              </div>
                              {item.asterRequired && (
                                <>
                                  <div className="form-control">
                                    <label className="label py-1">
                                      <span className="label-text text-xs font-semibold">
                                        Aster Type
                                      </span>
                                    </label>
                                    <select
                                      className="select select-bordered select-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                      value={item.asterType || ''}
                                      onChange={(e) =>
                                        updateItem(index, 'asterType', e.target.value || null)
                                      }
                                    >
                                      <option value="">Select Type</option>
                                      <option value="cotton">Cotton</option>
                                      <option value="tapeta">Tapeta</option>
                                    </select>
                                  </div>
                                  <div className="form-control">
                                    <label className="label py-1">
                                      <span className="label-text text-xs font-semibold">
                                        Aster Charge (₹)
                                      </span>
                                    </label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                      value={item.asterCharge}
                                      onChange={(e) =>
                                        updateItem(index, 'asterCharge', Number(e.target.value))
                                      }
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs font-semibold">
                                    Fabric Source
                                  </span>
                                </label>
                                <select
                                  className="select select-bordered select-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                  value={item.fabric.source}
                                  onChange={(e) =>
                                    updateFabricDetail(
                                      index,
                                      'source',
                                      e.target.value as 'shop' | 'customer'
                                    )
                                  }
                                >
                                  <option value="customer">Customer Provided</option>
                                  <option value="shop">Shop Provided</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs font-semibold">
                                    Fabric Description
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Blue cotton"
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                  value={item.fabric.fabricDescription}
                                  onChange={(e) =>
                                    updateFabricDetail(index, 'fabricDescription', e.target.value)
                                  }
                                />
                              </div>
                              <div className="form-control">
                                <label className="label py-1">
                                  <span className="label-text text-xs font-semibold">
                                    Meters Used
                                  </span>
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                  value={item.fabric.metersUsed}
                                  onChange={(e) => {
                                    updateFabricDetail(
                                      index,
                                      'metersUsed',
                                      parseFloat(e.target.value) || 0
                                    );
                                    calculateTotal();
                                  }}
                                />
                              </div>
                              {item.fabric.source === 'shop' && (
                                <div className="form-control">
                                  <label className="label py-1">
                                    <span className="label-text text-xs font-semibold">
                                      Rate per Meter
                                    </span>
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="input input-bordered input-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                                    value={item.fabric.ratePerMeter}
                                    onChange={(e) => {
                                      updateFabricDetail(
                                        index,
                                        'ratePerMeter',
                                        parseFloat(e.target.value) || 0
                                      );
                                      calculateTotal();
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Charges */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-boutique-accent/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif font-semibold text-boutique-primary">
                        Additional Charges
                      </h3>
                      <button
                        className="btn btn-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none gap-2"
                        onClick={addAdditionalCharge}
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
                        Add Charge
                      </button>
                    </div>

                    {formData.additionalCharges.length === 0 ? (
                      <div className="text-center py-4 text-boutique-dark/60 text-sm">
                        No additional charges
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.additionalCharges.map((charge, index) => (
                          <div
                            key={index}
                            className="flex items-end gap-3 p-3 bg-white rounded-lg border border-boutique-accent/20"
                          >
                            <div className="form-control flex-1">
                              <label className="label py-1">
                                <span className="label-text text-xs font-semibold">
                                  Charge Type
                                </span>
                              </label>
                              <select
                                className="select select-bordered select-sm bg-white text-boutique-dark"
                                value={charge.type}
                                onChange={(e) =>
                                  updateAdditionalCharge(index, 'type', e.target.value)
                                }
                              >
                                <option value="">Select type</option>
                                <option value="dye">Dye</option>
                                <option value="fall-pico">Fall-Pico</option>
                                <option value="kaaj">Kaaj (Button Loops)</option>
                                <option value="embroidery">Embroidery</option>
                                <option value="lining">Lining</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="form-control flex-1">
                              <label className="label py-1">
                                <span className="label-text text-xs font-semibold">
                                  Description
                                </span>
                              </label>
                              <input
                                type="text"
                                placeholder="Details"
                                className="input input-bordered input-sm bg-white text-boutique-dark"
                                value={charge.description}
                                onChange={(e) =>
                                  updateAdditionalCharge(index, 'description', e.target.value)
                                }
                              />
                            </div>
                            <div className="form-control w-32">
                              <label className="label py-1">
                                <span className="label-text text-xs font-semibold">Amount</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="input input-bordered input-sm bg-white text-boutique-dark"
                                value={charge.amount}
                                onChange={(e) => {
                                  updateAdditionalCharge(
                                    index,
                                    'amount',
                                    parseFloat(e.target.value) || 0
                                  );
                                  calculateTotal();
                                }}
                              />
                            </div>
                            <button
                              className="btn btn-sm btn-error"
                              onClick={() => removeAdditionalCharge(index)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Summary & Payment */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-boutique-accent/30">
                    <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary">
                      Order Summary & Payment
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="font-semibold text-boutique-dark">Total Amount:</span>
                          <span className="text-xl font-bold text-green-700">
                            {formatCurrency(formData.totalAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="font-semibold text-boutique-dark">Amount Paid:</span>
                          <span className="text-xl font-bold text-blue-700">
                            {formatCurrency(formData.amountPaid)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="font-semibold text-boutique-dark">Balance Due:</span>
                          <span
                            className={`text-xl font-bold ${
                              formData.totalAmount - formData.amountPaid > 0
                                ? 'text-orange-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatCurrency(formData.totalAmount - formData.amountPaid)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button className="btn btn-sm btn-info w-full gap-2" onClick={addPayment}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path
                              fillRule="evenodd"
                              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add Payment
                        </button>

                        {formData.paymentHistory.length > 0 && (
                          <div className="p-3 bg-white rounded-lg max-h-32 overflow-y-auto">
                            <div className="text-xs font-semibold text-boutique-dark mb-2">
                              Payment History:
                            </div>
                            {formData.paymentHistory.map((payment, index) => (
                              <div key={index} className="text-xs flex justify-between py-1">
                                <span>{formatDate(payment.date)}</span>
                                <span className="font-semibold">
                                  {formatCurrency(payment.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="form-control">
                          <label className="label py-1">
                            <span className="label-text text-xs font-semibold">Order Status</span>
                          </label>
                          <select
                            className="select select-bordered select-sm bg-white text-boutique-dark border-2 border-boutique-accent/40"
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value as
                                  | 'pending'
                                  | 'in-progress'
                                  | 'ready'
                                  | 'delivered'
                                  | 'stuck',
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
                    </div>

                    <div className="form-control mt-4">
                      <label className="label">
                        <span className="label-text font-semibold text-boutique-dark">
                          Tailor Remarks
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none h-20"
                        placeholder="Special instructions, notes..."
                        value={formData.tailorRemarks}
                        onChange={(e) =>
                          setFormData({ ...formData, tailorRemarks: e.target.value })
                        }
                      ></textarea>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        resetForm();
                        setShowCreateForm(false);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={createOrder}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Creating...
                        </>
                      ) : (
                        'Create Order'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Filters & Search Section */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
            {/* Left Section: Fetch Orders with Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none min-w-[120px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
                onClick={fetchFilteredOrders}
                disabled={loading || searchLoading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Loading
                  </>
                ) : (
                  'Fetch Orders'
                )}
              </button>
              <div className="divider divider-horizontal hidden lg:flex mx-0"></div>
              <div className="flex items-center gap-2">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="status-filter"
                    className="radio radio-primary radio-sm"
                    value="ALL"
                    checked={statusFilter === 'ALL'}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  />
                  <span className="label-text font-medium text-boutique-dark">All</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="status-filter"
                    className="radio radio-primary radio-sm"
                    value="pending"
                    checked={statusFilter === 'pending'}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  />
                  <span className="label-text font-medium text-boutique-dark">Pending</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="status-filter"
                    className="radio radio-primary radio-sm"
                    value="in-progress"
                    checked={statusFilter === 'in-progress'}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  />
                  <span className="label-text font-medium text-boutique-dark">In Progress</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="status-filter"
                    className="radio radio-primary radio-sm"
                    value="delivered"
                    checked={statusFilter === 'delivered'}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  />
                  <span className="label-text font-medium text-boutique-dark">Delivered</span>
                </label>
              </div>
            </div>

            {/* Right Section: Search by Order No */}
            <div className="flex gap-2 lg:ml-auto w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search by Order No..."
                className="input input-bordered input-sm lg:input-md w-full lg:w-64 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                value={searchOrderNo}
                onChange={(e) => setSearchOrderNo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchOrderByOrderNo()}
              />
              <button
                className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none btn-sm lg:btn-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
                onClick={searchOrderByOrderNo}
                disabled={searchLoading || loading}
              >
                {searchLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="hidden sm:inline">Searching</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg text-boutique-secondary"></span>
            </div>
          ) : (
            orders.length > 0 && (
              <div className="w-full bg-gradient-to-br from-purple-50 via-white to-amber-50 rounded-2xl shadow-xl border-2 border-boutique-secondary/30 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-serif font-bold text-boutique-primary flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-boutique-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                      />
                    </svg>
                    Stitching Orders ({orders.length})
                  </h2>
                </div>

                <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
                  <table className="table table-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 text-white border-b-2 border-boutique-secondary">
                        <th className="text-white">#</th>
                        <th className="text-white">Order No.</th>
                        <th className="text-white">Customer</th>
                        {!privacyMode && <th className="text-white">Phone</th>}
                        <th className="text-white">Order Date</th>
                        <th className="text-white">Promise Date</th>
                        <th className="text-white">Status</th>
                        {!privacyMode && <th className="text-right text-white">Total Amount</th>}
                        {!privacyMode && <th className="text-right text-white">Amount Due</th>}
                        {!privacyMode && <th className="text-white">Payment</th>}
                        <th className="text-white">Items</th>
                        <th className="text-white">Remarks</th>
                        <th className="text-center text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {orders
                        .sort(
                          (a, b) =>
                            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
                        )
                        .map((order, index) => {
                          const amountDue = order.totalAmount - order.amountPaid;
                          let orderItems = [];
                          try {
                            orderItems = JSON.parse(order.items);
                          } catch (e) {
                            orderItems = [];
                          }

                          const getStatusBadge = (status: string) => {
                            const badges = {
                              pending: 'badge bg-amber-100 text-amber-700 border-amber-300',
                              'in-progress': 'badge bg-blue-100 text-blue-700 border-blue-300',
                              ready: 'badge bg-purple-100 text-purple-700 border-purple-300',
                              delivered: 'badge bg-green-100 text-green-700 border-green-300',
                              stuck: 'badge bg-red-100 text-red-700 border-red-300',
                            };
                            return badges[status as keyof typeof badges] || badges.pending;
                          };

                          return (
                            <tr
                              key={order.$id}
                              className="text-boutique-dark border-b border-boutique-accent/20 hover:bg-purple-50/50 transition-colors"
                            >
                              <td className="font-medium">{index + 1}</td>
                              <td className="font-mono text-sm font-bold text-boutique-secondary">
                                {order.orderNo}
                              </td>
                              <td>
                                <span className="font-semibold text-boutique-primary">
                                  {order.customerName}
                                </span>
                              </td>
                              {!privacyMode && (
                                <td className="text-sm text-boutique-dark/60">
                                  {order.customerPhone}
                                </td>
                              )}
                              <td className="text-sm">{formatDate(order.orderDate)}</td>
                              <td className="text-sm">{formatDate(order.promiseDate)}</td>
                              <td>
                                <span
                                  className={`${getStatusBadge(order.status)} badge-sm font-semibold uppercase`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              {!privacyMode && (
                                <td className="text-right font-bold text-boutique-primary">
                                  {formatCurrency(order.totalAmount)}
                                </td>
                              )}
                              {!privacyMode && (
                                <td className="text-right">
                                  <span
                                    className={`font-semibold ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}
                                  >
                                    {formatCurrency(amountDue)}
                                  </span>
                                </td>
                              )}
                              {!privacyMode && (
                                <td>
                                  <span className="text-sm text-boutique-dark/80">
                                    {formatCurrency(order.amountPaid)}
                                  </span>
                                </td>
                              )}
                              <td>
                                <span className="badge badge-sm bg-purple-100 text-purple-700 border-purple-300">
                                  {orderItems.length} items
                                </span>
                              </td>
                              <td className="text-xs text-boutique-dark/60 max-w-[150px] truncate">
                                {order.tailorRemarks || '-'}
                              </td>
                              <td className="text-center">
                                <button
                                  onClick={() => openEditModal(order)}
                                  className="btn btn-xs bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                  Edit
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default StitchingPage;
