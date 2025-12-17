import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Order } from '../types';
import OrderDetailsModal from './OrderDetailsModal';

// Enhanced item structure for orders
interface OrderItem {
  itemId: string;
  costPrice: number;
  markedPrice: number;
  discount: number; // Discount amount
  sellingPrice: number;
  itemExists: boolean;
  isValidating: boolean; // Loading state for validation
  given: boolean; // Whether item is given to customer
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'completed' | 'stuck'>(
    'ALL'
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [nextBillNo, setNextBillNo] = useState<number>(1);

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  // Search order state
  const [searchBillNo, setSearchBillNo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Customer validation state
  const [customerExists, setCustomerExists] = useState(false);

  // Form state for creating order
  const [newOrder, setNewOrder] = useState({
    customerPhone: '',
    customerName: '',
    remarks: '',
    saleDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'completed' | 'stuck',
    totalAmount: 0,
    totalProfit: 0,
    amountPaid: 0,
    paymentMethod: 'cash' as 'cash' | 'upi',
  });

  // Array of items for the order
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      itemId: '',
      costPrice: 0,
      markedPrice: 0,
      discount: 0,
      sellingPrice: 0,
      itemExists: false,
      isValidating: false,
      given: true, // Default to true (item given immediately)
    },
  ]);

  // Debounce timers for item and customer validation
  const itemDebounceTimers = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});
  const customerDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle customer phone with validation
    if (name === 'customerPhone') {
      const phone = value.replace(/\D/g, '').slice(0, 10); // Only digits, max 10
      setNewOrder((prev) => ({
        ...prev,
        customerPhone: phone,
        customerName: phone.length === 10 && customerExists ? prev.customerName : '', // Clear name if changing phone
      }));
      setCustomerExists(false);
      setCreateError('');

      // Clear existing timer
      if (customerDebounceTimer.current) {
        clearTimeout(customerDebounceTimer.current);
      }

      // Validate when 10 digits entered
      if (phone.length === 10) {
        customerDebounceTimer.current = setTimeout(() => {
          validateCustomerPhone(phone);
        }, 500);
      }
      return;
    }

    setNewOrder((prev) => ({
      ...prev,
      [name]:
        name === 'totalAmount' || name === 'totalProfit' || name === 'amountPaid'
          ? Number(value) || 0
          : value,
    }));
    setCreateError('');
  };

  const validateCustomerPhone = async (phone: string) => {
    try {
      const customer = await service.getCustomerByPhone(phone);
      if (customer) {
        setCustomerExists(true);
        setNewOrder((prev) => ({
          ...prev,
          customerName: customer.name,
        }));
      } else {
        setCustomerExists(false);
      }
    } catch (error) {
      console.error('Error validating customer:', error);
      setCustomerExists(false);
    }
  };

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
            sellingPrice: 0, // Don't auto-fill selling price
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
    [orderItems]
  );

  const handleItemChange = useCallback(
    (index: number, field: keyof OrderItem, value: string | number | boolean) => {
      setOrderItems((prevItems) => {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[index];

        // Handle itemId with debounce
        if (field === 'itemId' && typeof value === 'string') {
          // Clear existing timer for this item
          if (itemDebounceTimers.current[index]) {
            clearTimeout(itemDebounceTimers.current[index]);
          }

          // Update itemId immediately
          updatedItems[index] = {
            ...currentItem,
            itemId: value,
            isValidating: value.trim().length > 0,
          };

          // Set new debounce timer
          const trimmedValue = value.trim();
          if (trimmedValue) {
            itemDebounceTimers.current[index] = setTimeout(() => {
              validateItemId(index, trimmedValue);
            }, 800); // Wait 800ms after user stops typing
          } else {
            // Clear validation if empty
            updatedItems[index] = {
              ...currentItem,
              itemId: '',
              costPrice: 0,
              markedPrice: 0,
              discount: 0,
              sellingPrice: 0,
              itemExists: false,
              isValidating: false,
            };
          }
          setCreateError('');
          return updatedItems;
        }

        // Handle discount change - calculate selling price
        if (field === 'discount' && typeof value === 'number') {
          const discount = value;
          const sellingPrice = Math.max(0, currentItem.markedPrice - discount);
          updatedItems[index] = {
            ...currentItem,
            discount,
            sellingPrice,
          };
        }
        // Handle selling price change - calculate discount
        else if (field === 'sellingPrice' && typeof value === 'number') {
          const sellingPrice = value;
          const discount = Math.max(0, currentItem.markedPrice - sellingPrice);
          updatedItems[index] = {
            ...currentItem,
            sellingPrice,
            discount,
          };
        } else {
          // For other fields
          updatedItems[index] = { ...currentItem, [field]: value };
        }

        setCreateError('');
        return updatedItems;
      });
    },
    [validateItemId]
  );

  const addItem = () => {
    setOrderItems([
      ...orderItems,
      {
        itemId: '',
        costPrice: 0,
        markedPrice: 0,
        discount: 0,
        sellingPrice: 0,
        itemExists: false,
        isValidating: false,
        given: true,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setNewOrder({
      customerPhone: '',
      customerName: '',
      remarks: '',
      saleDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      totalAmount: 0,
      totalProfit: 0,
      amountPaid: 0,
      paymentMethod: 'cash',
    });
    setOrderItems([
      {
        itemId: '',
        costPrice: 0,
        markedPrice: 0,
        discount: 0,
        sellingPrice: 0,
        itemExists: false,
        isValidating: false,
        given: true,
      },
    ]);
    setCustomerExists(false);
    setCreateError('');
  };

  // Auto-calculate totals whenever orderItems change
  useEffect(() => {
    const validItems = orderItems.filter((item) => item.itemExists && item.itemId.trim());
    const totalAmount = validItems.reduce((sum, item) => sum + item.sellingPrice, 0);
    const totalCost = validItems.reduce((sum, item) => sum + item.costPrice, 0);
    const totalProfit = totalAmount - totalCost;

    setNewOrder((prev) => ({
      ...prev,
      totalAmount,
      totalProfit,
    }));
  }, [orderItems]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await service.getAllOrders();

      const filteredOrders =
        statusFilter === 'ALL'
          ? fetchedOrders
          : fetchedOrders.filter((order) => order.status === statusFilter);

      setOrders(filteredOrders);
      toast.success(`Fetched ${filteredOrders.length} orders`);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error fetching orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    setCreateError('');

    // Validation
    if (!/^[6-9]\d{9}$/.test(newOrder.customerPhone)) {
      setCreateError('Please enter a valid Indian mobile number');
      return;
    }

    if (!newOrder.customerName.trim()) {
      setCreateError('Please enter customer name');
      return;
    }

    // Validate items
    const validItems = orderItems.filter((item) => item.itemId.trim());
    if (validItems.length === 0) {
      setCreateError('Please add at least one item ID');
      return;
    }

    // Check if all items exist in database
    const invalidItems = validItems.filter((item) => !item.itemExists);
    if (invalidItems.length > 0) {
      setCreateError(
        `Invalid or unavailable items: ${invalidItems.map((i) => i.itemId).join(', ')}`
      );
      return;
    }

    if (newOrder.totalAmount <= 0) {
      setCreateError('Please add valid items to calculate total amount');
      return;
    }

    setCreateLoading(true);
    try {
      // Create customer if they don't exist
      if (!customerExists && newOrder.customerPhone && newOrder.customerName.trim()) {
        try {
          await service.createCustomer({
            phone: newOrder.customerPhone,
            name: newOrder.customerName.trim(),
          });
          toast.success('New customer created!');
        } catch (error) {
          console.error('Error creating customer:', error);
          // Don't fail the order if customer creation fails
        }
      }

      // Store item IDs with given status in the order
      const itemsToStore = validItems.map((item) => ({
        itemId: item.itemId,
        given: item.given,
      }));
      const itemsJson = JSON.stringify(itemsToStore);

      // Create payment history
      const paymentHistory =
        newOrder.amountPaid > 0
          ? [
              {
                amount: newOrder.amountPaid,
                date: new Date().toISOString(),
                method: newOrder.paymentMethod,
                remarks: 'Initial payment',
              },
            ]
          : [];
      const paymentHistoryJson = JSON.stringify(paymentHistory);

      const orderData: Omit<Order, '$id' | '$createdAt' | '$updatedAt'> = {
        billNo: nextBillNo,
        customerPhone: newOrder.customerPhone,
        customerName: newOrder.customerName,
        items: itemsJson,
        status: newOrder.status,
        remarks: newOrder.remarks.trim() || undefined,
        totalAmount: newOrder.totalAmount,
        totalProfit: newOrder.totalProfit,
        amountPaid: newOrder.amountPaid,
        paymentHistory: paymentHistoryJson,
        saleDate: newOrder.saleDate,
      };

      // Create order first
      await service.createOrder(orderData);

      // Only mark items as sold after order is successfully created
      await Promise.all(
        validItems.map(async (item) => {
          try {
            // First get the item to get its document ID
            const itemDoc = await service.getItemById(item.itemId);
            if (itemDoc && itemDoc.$id) {
              await service.updateItemWithSaleDetails(itemDoc.$id, item.sellingPrice);
            }
          } catch (error) {
            console.error(`Failed to update item ${item.itemId}:`, error);
            throw new Error(`Failed to update item ${item.itemId}`);
          }
        })
      );

      toast.success('Order created successfully! Items marked as sold.');
      resetForm();
      setShowCreateForm(false);

      // Refresh orders if list is visible
      if (orders.length > 0) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setCreateError('Error creating order. Please try again.');
      toast.error('Error creating order. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'badge bg-amber-100 text-amber-700 border-amber-300',
      completed: 'badge bg-green-100 text-green-700 border-green-300',
      stuck: 'badge bg-red-100 text-red-700 border-red-300',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const searchOrderByBillNo = async () => {
    const billNo = Number(searchBillNo);
    if (!billNo || billNo <= 0) {
      toast.error('Please enter a valid bill number');
      return;
    }

    setSearchLoading(true);
    try {
      const order = await service.getOrderByBillNo(billNo);
      if (order) {
        setSelectedOrder(order);
        setModalMode('view');
        setSearchBillNo(''); // Clear search
      } else {
        toast.error(`Order with Bill No. ${billNo} not found`);
      }
    } catch (error) {
      console.error('Error searching order:', error);
      toast.error('Error searching order. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const openOrderModal = (order: Order, mode: 'view' | 'edit') => {
    setSelectedOrder(order);
    setModalMode(mode);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const handleOrderUpdate = async () => {
    await fetchOrders();
  };

  return (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                Order Management
              </h2>
              <p className="text-amber-100 text-sm font-light drop-shadow">
                Manage and track all your sales orders
              </p>
            </div>
          </div>
          <button
            className={`btn btn-sm gap-2 transition-all duration-300 shadow-lg ${
              showCreateForm
                ? 'bg-white/90 text-boutique-primary hover:bg-white border-white/50'
                : 'bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none font-bold'
            }`}
            onClick={async () => {
              if (showCreateForm) {
                resetForm();
              } else {
                // Fetch next bill number when opening form
                const billNo = await service.getNextBillNumber();
                setNextBillNo(billNo);
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
        {/* Create Order Form */}
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
              Create New Order
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
                    type="text"
                    name="customerPhone"
                    placeholder="10-digit phone"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                    value={newOrder.customerPhone}
                    onChange={handleInputChange}
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
                    name="customerName"
                    placeholder="Enter customer name"
                    className={`input input-bordered w-full text-boutique-dark border-2 focus:outline-none transition-all ${
                      customerExists
                        ? 'bg-gray-100 border-boutique-accent/40 cursor-not-allowed'
                        : 'bg-white border-boutique-accent/40 focus:border-boutique-secondary'
                    }`}
                    value={newOrder.customerName}
                    onChange={handleInputChange}
                    readOnly={customerExists}
                    disabled={newOrder.customerPhone.length !== 10}
                  />
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Bill No.</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full bg-gray-100 text-boutique-primary font-bold border-2 border-boutique-accent/40 cursor-not-allowed"
                    value={nextBillNo}
                    readOnly
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">
                      Sale Date <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    name="saleDate"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                    value={newOrder.saleDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">
                      Status <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="status"
                    className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                    value={newOrder.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="stuck">Stuck</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t-2 border-boutique-accent/30 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-boutique-primary">Order Items</h4>
                  <button
                    type="button"
                    className="btn btn-sm bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none"
                    onClick={addItem}
                    disabled={createLoading}
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

                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-2 px-3 mb-2 text-xs font-semibold text-boutique-dark/70">
                  <div className="col-span-12 md:col-span-2">Item ID</div>
                  <div className="col-span-3 md:col-span-1">Cost</div>
                  <div className="col-span-3 md:col-span-1">Marked</div>
                  <div className="col-span-3 md:col-span-1">Discount</div>
                  <div className="col-span-3 md:col-span-2">Selling Price</div>
                  <div className="col-span-4 md:col-span-2">Profit</div>
                  <div className="col-span-4 md:col-span-1 text-center">Given</div>
                  <div className="col-span-4 md:col-span-2 text-center">Action</div>
                </div>

                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border border-boutique-accent/20"
                    >
                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Item ID Input */}
                        <div className="col-span-12 md:col-span-2">
                          <input
                            type="text"
                            placeholder="Item ID*"
                            className={`input input-sm input-bordered w-full text-boutique-dark border focus:outline-none ${
                              item.isValidating
                                ? 'bg-yellow-50 border-yellow-500'
                                : item.itemExists
                                  ? 'bg-green-50 border-green-500'
                                  : item.itemId.trim() && !item.isValidating
                                    ? 'bg-red-50 border-red-500'
                                    : 'bg-white border-boutique-accent/40 focus:border-boutique-secondary'
                            }`}
                            value={item.itemId}
                            onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                          />
                          {item.isValidating && (
                            <span className="text-xs text-yellow-600 mt-1">Validating...</span>
                          )}
                        </div>

                        {/* Cost Price - Read Only */}
                        <div className="col-span-3 md:col-span-1">
                          <input
                            type="number"
                            placeholder="Cost"
                            className="input input-sm input-bordered w-full bg-gray-50 text-boutique-dark border border-boutique-accent/40 text-xs"
                            value={item.costPrice || ''}
                            readOnly
                          />
                        </div>

                        {/* Marked Price - Read Only */}
                        <div className="col-span-3 md:col-span-1">
                          <input
                            type="number"
                            placeholder="Marked"
                            className="input input-sm input-bordered w-full bg-gray-50 text-boutique-dark border border-boutique-accent/40 text-xs"
                            value={item.markedPrice || ''}
                            readOnly
                          />
                        </div>

                        {/* Discount - Editable */}
                        <div className="col-span-3 md:col-span-1">
                          <input
                            placeholder="Disc."
                            className="input input-sm input-bordered w-full bg-white text-boutique-dark border border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none"
                            value={item.discount || ''}
                            onChange={(e) =>
                              handleItemChange(index, 'discount', Number(e.target.value))
                            }
                            min="0"
                            disabled={!item.itemExists}
                          />
                        </div>

                        {/* Selling Price - Editable */}
                        <div className="col-span-3 md:col-span-2">
                          <input
                            placeholder="Selling Price*"
                            className="input input-sm input-bordered w-full bg-white text-boutique-dark border border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none"
                            value={item.sellingPrice || ''}
                            onChange={(e) =>
                              handleItemChange(index, 'sellingPrice', Number(e.target.value))
                            }
                            min="0"
                            disabled={!item.itemExists}
                          />
                        </div>

                        {/* Profit - Read Only */}
                        <div className="col-span-4 md:col-span-2">
                          <input
                            type="number"
                            placeholder="Profit"
                            className={`input input-sm input-bordered w-full text-boutique-dark border border-boutique-accent/40 cursor-not-allowed ${
                              item.sellingPrice > 0 && item.sellingPrice - item.costPrice >= 0
                                ? 'bg-green-50 text-green-700'
                                : item.sellingPrice > 0
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-gray-50'
                            }`}
                            value={item.sellingPrice > 0 ? item.sellingPrice - item.costPrice : ''}
                            readOnly
                            tabIndex={-1}
                          />
                        </div>

                        {/* Given Status - Toggle Button */}
                        <div className="col-span-4 md:col-span-1 flex items-center justify-center">
                          <button
                            type="button"
                            className={`btn btn-xs gap-1 transition-all ${
                              item.given
                                ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300'
                                : 'bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-300'
                            }`}
                            onClick={() => handleItemChange(index, 'given', !item.given)}
                            disabled={!item.itemExists}
                            title={
                              item.given ? 'Item given to customer' : 'Item pending (alterations)'
                            }
                          >
                            {item.given ? (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="hidden md:inline">Given</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="hidden md:inline">Pending</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Remove Button */}
                        <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                          {orderItems.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-circle btn-error"
                              onClick={() => removeItem(index)}
                              disabled={createLoading}
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
                          )}
                        </div>
                      </div>

                      {/* Item Status Indicator */}
                      {item.isValidating && (
                        <div className="mt-2 text-xs text-yellow-600 font-semibold">
                          🔍 Validating item...
                        </div>
                      )}
                      {!item.isValidating && item.itemId.trim() && !item.itemExists && (
                        <div className="mt-2 text-xs text-red-600 font-semibold">
                          ⚠️ Item not found or already sold
                        </div>
                      )}
                      {!item.isValidating && item.itemExists && (
                        <div className="mt-2 text-xs text-green-600 font-semibold">
                          ✓ Valid item - Enter discount or selling price
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Details - Auto Calculated */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-boutique-accent/30">
                <h4 className="font-semibold text-boutique-primary mb-3">Order Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Total Amount
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full bg-gray-100 text-boutique-primary font-bold border-2 border-boutique-accent/40 cursor-not-allowed"
                      value={newOrder.totalAmount || 0}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Total Profit
                      </span>
                    </label>
                    <input
                      type="number"
                      className={`input input-bordered w-full font-bold border-2 border-boutique-accent/40 cursor-not-allowed ${
                        newOrder.totalProfit > 0
                          ? 'bg-green-50 text-green-700'
                          : newOrder.totalProfit < 0
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-boutique-primary'
                      }`}
                      value={newOrder.totalProfit !== 0 ? newOrder.totalProfit : ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Items Count
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full bg-gray-100 text-boutique-primary font-bold border-2 border-boutique-accent/40 cursor-not-allowed"
                      value={orderItems.filter((i) => i.itemExists).length}
                      readOnly
                    />
                  </div>
                </div>

                {/* Payment Section */}
                <div className="border-t-2 border-boutique-accent/30 pt-4">
                  <h4 className="font-semibold text-boutique-primary mb-3">Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold text-boutique-dark">
                          Amount Received <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="number"
                        name="amountPaid"
                        placeholder="Enter amount received"
                        className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                        value={newOrder.amountPaid || ''}
                        onChange={handleInputChange}
                        min="0"
                        max={newOrder.totalAmount}
                      />
                      <label className="label">
                        <span className="label-text-alt text-xs text-boutique-dark/60">
                          Can be partial/advance payment
                        </span>
                      </label>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold text-boutique-dark">
                          Payment Method <span className="text-error">*</span>
                        </span>
                      </label>
                      <select
                        name="paymentMethod"
                        className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                        value={newOrder.paymentMethod}
                        onChange={handleInputChange}
                      >
                        <option value="cash">Cash</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">
                        <span className="label-text font-semibold text-boutique-dark">
                          Amount Due
                        </span>
                      </label>
                      <input
                        type="number"
                        className={`input input-bordered w-full font-bold border-2 border-boutique-accent/40 cursor-not-allowed ${
                          newOrder.totalAmount - newOrder.amountPaid > 0
                            ? 'bg-red-50 text-red-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                        value={newOrder.totalAmount - newOrder.amountPaid || 0}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-boutique-dark">Remarks</span>
                </label>
                <textarea
                  name="remarks"
                  placeholder="Additional notes or comments..."
                  className="textarea textarea-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all w-full h-20"
                  value={newOrder.remarks}
                  onChange={handleInputChange}
                />
              </div>

              {/* Error Display */}
              {createError && (
                <div className="alert alert-error shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{createError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-bold"
                  onClick={createOrder}
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating...
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
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Create Order
                    </>
                  )}
                </button>
                <button
                  className="btn bg-white hover:bg-slate-100 text-boutique-primary border-2 border-boutique-accent/30 gap-2 shadow hover:shadow-lg transition-all"
                  onClick={resetForm}
                  disabled={createLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fetch Orders Section */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-boutique-accent/30 shadow-lg mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none min-w-[120px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
              onClick={fetchOrders}
              disabled={loading || createLoading}
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
                  value="completed"
                  checked={statusFilter === 'completed'}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                />
                <span className="label-text font-medium text-boutique-dark">Completed</span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="status-filter"
                  className="radio radio-primary radio-sm"
                  value="stuck"
                  checked={statusFilter === 'stuck'}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                />
                <span className="label-text font-medium text-boutique-dark">Stuck</span>
              </label>
            </div>
          </div>
        </div>

        {/* Search Order by Bill No */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 rounded-2xl border-2 border-boutique-secondary/30 shadow-lg mb-6">
          <h3 className="text-lg font-serif font-semibold mb-3 text-boutique-primary">
            Search Order by Bill No.
          </h3>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Enter bill number..."
              className="input input-bordered flex-1 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
              value={searchBillNo}
              onChange={(e) => setSearchBillNo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') searchOrderByBillNo();
              }}
              disabled={searchLoading}
            />
            <button
              className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none min-w-[120px] shadow-lg"
              onClick={searchOrderByBillNo}
              disabled={searchLoading}
            >
              {searchLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Searching...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {orders.length > 0 && (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Orders ({orders.length})
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 text-white border-b-2 border-boutique-secondary">
                    <th className="text-white">#</th>
                    <th className="text-white">Bill No.</th>
                    <th className="text-white">Customer</th>
                    <th className="text-white">Date</th>
                    <th className="text-white">Status</th>
                    <th className="text-right text-white">Total Amount</th>
                    <th className="text-right text-white">Amount Due</th>
                    <th className="text-white">Payment</th>
                    <th className="text-right text-white">Profit</th>
                    <th className="text-white">Items</th>
                    <th className="text-white">Remarks</th>
                    <th className="text-center text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {orders.map((order, index) => {
                    // Parse items JSON
                    let parsedItems: OrderItem[] = [];
                    try {
                      parsedItems = JSON.parse(order.items);
                    } catch (error) {
                      console.error('Failed to parse items for order:', order.$id, error);
                      // If parsing fails, try to display as string
                    }

                    // Calculate payment status
                    const amountDue = order.totalAmount - (order.amountPaid || 0);
                    const getPaymentStatus = () => {
                      if (order.amountPaid === 0) return { text: 'Unpaid', class: 'badge-error' };
                      if (amountDue === 0) return { text: 'Paid', class: 'badge-success' };
                      if (order.amountPaid > 0 && amountDue > 0)
                        return { text: 'Partial', class: 'badge-warning' };
                      return { text: 'Paid', class: 'badge-success' };
                    };
                    const paymentStatus = getPaymentStatus();

                    return (
                      <tr
                        key={order.$id || index}
                        className="text-boutique-dark border-b border-boutique-accent/20 hover:bg-purple-50/50 transition-colors"
                      >
                        <td className="font-medium">{index + 1}</td>
                        <td>
                          <button
                            className="font-bold text-boutique-primary hover:text-purple-700 hover:underline cursor-pointer"
                            onClick={() => openOrderModal(order, 'view')}
                            title="Click to view details"
                          >
                            {order.billNo}
                          </button>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="font-semibold text-boutique-primary">
                              {order.customerName || 'Unknown'}
                            </span>
                            <span className="text-xs text-boutique-dark/60 font-mono">
                              {order.customerPhone}
                            </span>
                          </div>
                        </td>
                        <td className="font-medium">{formatDate(order.saleDate)}</td>
                        <td>
                          <span
                            className={`${getStatusBadge(order.status)} badge-sm font-semibold uppercase`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="text-right font-bold text-boutique-primary">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td
                          className={`text-right font-bold ${amountDue > 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {amountDue > 0 ? formatCurrency(amountDue) : '₹0'}
                        </td>
                        <td>
                          <span className={`badge ${paymentStatus.class} badge-sm font-semibold`}>
                            {paymentStatus.text}
                          </span>
                        </td>
                        <td
                          className={`text-right font-bold ${order.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {formatCurrency(order.totalProfit)}
                        </td>
                        <td>
                          <div className="text-xs">
                            {parsedItems.length > 0 ? (
                              <>
                                <span className="font-semibold text-boutique-primary mb-1 block">
                                  {parsedItems.length} {parsedItems.length === 1 ? 'item' : 'items'}
                                </span>
                                <div className="text-boutique-dark/60 space-y-1">
                                  {parsedItems.map((item: any, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between gap-2"
                                    >
                                      <span className="whitespace-nowrap">{item.itemId}</span>
                                      {item.given !== undefined && (
                                        <span
                                          className={`badge badge-xs whitespace-nowrap flex-shrink-0 ${
                                            item.given ? 'badge-success' : 'badge-warning'
                                          }`}
                                        >
                                          {item.given ? '✓' : '⏳'}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <span className="text-boutique-dark/60">
                                {order.items || 'No items'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-sm text-boutique-dark/60 max-w-[200px] truncate">
                          {order.remarks || '-'}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-xs bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-300"
                            onClick={() => openOrderModal(order, 'edit')}
                            title="Edit Order"
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
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          mode={modalMode}
          onClose={closeOrderModal}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
};

export default OrderManagement;
