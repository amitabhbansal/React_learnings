import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Order } from '../types';
import type { OrderItem, OrderFormData } from '../types/order';
import { initialOrderFormData, initialOrderItem } from '../types/order';
import { useApp } from '../context/AppContext';
import OrderDetailsModal from './OrderDetailsModal';
import {
  OrdersTable,
  OrderItemRow,
  OrderSummary,
  OrderFilters,
} from '../features/orders/components';

const OrderManagement = () => {
  const { privacyMode } = useApp();
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'pending' | 'completed' | 'stuck'>(
    'ALL'
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [nextBillNo, setNextBillNo] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [searchBillNo, setSearchBillNo] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [customerExists, setCustomerExists] = useState(false);
  const [newOrder, setNewOrder] = useState<OrderFormData>(initialOrderFormData);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([initialOrderItem]);

  // Refs for debouncing
  const itemDebounceTimers = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});
  const customerDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Customer validation
  const validateCustomerPhone = async (phone: string) => {
    try {
      const customer = await service.getCustomerByPhone(phone);
      if (customer) {
        setCustomerExists(true);
        setNewOrder((prev) => ({ ...prev, customerName: customer.name }));
      } else {
        setCustomerExists(false);
      }
    } catch (error) {
      console.error('Error validating customer:', error);
      setCustomerExists(false);
    }
  };

  // Item validation
  const validateItemId = useCallback(
    async (index: number, itemId: string) => {
      const updatedItems = [...orderItems];
      try {
        const item = await service.getItemById(itemId);
        if (item && !item.sold) {
          updatedItems[index] = {
            ...updatedItems[index],
            itemId,
            costPrice: item.costPrice,
            markedPrice: item.markedPrice,
            discount: 0,
            sellingPrice: 0,
            itemExists: true,
            isValidating: false,
          };
          toast.success(`Item ${itemId} found!`);
        } else if (item && item.sold) {
          updatedItems[index] = {
            ...updatedItems[index],
            itemId,
            itemExists: false,
            isValidating: false,
          };
          toast.error(`Item ${itemId} is already sold!`);
        } else {
          updatedItems[index] = {
            ...updatedItems[index],
            itemId,
            itemExists: false,
            isValidating: false,
          };
          toast.error(`Item ${itemId} not found in database!`);
        }
      } catch (error) {
        updatedItems[index] = {
          ...updatedItems[index],
          itemId,
          itemExists: false,
          isValidating: false,
        };
      }
      setOrderItems(updatedItems);
    },
    [orderItems]
  );

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'customerPhone') {
      const phone = value.replace(/\D/g, '').slice(0, 10);
      setNewOrder((prev) => ({
        ...prev,
        customerPhone: phone,
        customerName: phone.length === 10 && customerExists ? prev.customerName : '',
      }));
      setCustomerExists(false);
      setCreateError('');

      if (customerDebounceTimer.current) clearTimeout(customerDebounceTimer.current);
      if (phone.length === 10) {
        customerDebounceTimer.current = setTimeout(() => validateCustomerPhone(phone), 500);
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

  // Handle item changes
  const handleItemChange = useCallback(
    (index: number, field: keyof OrderItem, value: string | number | boolean) => {
      setOrderItems((prevItems) => {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[index];

        if (field === 'itemId' && typeof value === 'string') {
          if (itemDebounceTimers.current[index]) clearTimeout(itemDebounceTimers.current[index]);

          updatedItems[index] = {
            ...currentItem,
            itemId: value,
            isValidating: value.trim().length > 0,
          };

          const trimmedValue = value.trim();
          if (trimmedValue) {
            itemDebounceTimers.current[index] = setTimeout(
              () => validateItemId(index, trimmedValue),
              1000
            );
          } else {
            updatedItems[index] = { ...currentItem, ...initialOrderItem, itemId: '' };
          }
          setCreateError('');
          return updatedItems;
        }

        if (field === 'discount' && typeof value === 'number') {
          const sellingPrice = Math.max(0, currentItem.markedPrice - value);
          updatedItems[index] = { ...currentItem, discount: value, sellingPrice };
        } else if (field === 'sellingPrice' && typeof value === 'number') {
          const discount = Math.max(0, currentItem.markedPrice - value);
          updatedItems[index] = { ...currentItem, sellingPrice: value, discount };
        } else {
          updatedItems[index] = { ...currentItem, [field]: value };
        }

        setCreateError('');
        return updatedItems;
      });
    },
    [validateItemId]
  );

  // CRUD operations
  const addItem = () => setOrderItems([...orderItems, { ...initialOrderItem }]);
  const removeItem = (index: number) => {
    if (orderItems.length > 1) setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewOrder(initialOrderFormData);
    setOrderItems([{ ...initialOrderItem }]);
    setCustomerExists(false);
    setCreateError('');
  };

  // Auto-calculate totals
  useEffect(() => {
    const validItems = orderItems.filter(
      (item) => item.itemExists && item.itemId.trim() && item.sellingPrice > 0
    );
    const totalAmount = validItems.reduce((sum, item) => sum + item.sellingPrice, 0);
    const totalCost = validItems.reduce((sum, item) => sum + item.costPrice, 0);
    setNewOrder((prev) => ({ ...prev, totalAmount, totalProfit: totalAmount - totalCost }));
  }, [orderItems]);

  // Fetch orders
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
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Create order
  const createOrder = async () => {
    setCreateError('');

    // Validation
    if (!newOrder.customerPhone || newOrder.customerPhone.length !== 10) {
      setCreateError('Valid 10-digit phone number is required');
      return;
    }
    if (!newOrder.customerName.trim()) {
      setCreateError('Customer name is required');
      return;
    }

    const validItems = orderItems.filter((item) => item.itemId.trim());
    if (validItems.length === 0) {
      setCreateError('At least one item is required');
      return;
    }

    const invalidItems = validItems.filter((item) => !item.itemExists);
    if (invalidItems.length > 0) {
      setCreateError(`${invalidItems.length} item(s) are invalid`);
      return;
    }

    const itemsWithoutPrice = validItems.filter((item) => item.sellingPrice === 0);
    if (itemsWithoutPrice.length > 0) {
      setCreateError(`Please enter selling price for all items`);
      return;
    }

    setCreateLoading(true);
    try {
      const billNo = await service.getNextBillNumber();
      const itemsToStore = validItems.map((item) => ({ itemId: item.itemId, given: item.given }));
      const paymentHistory =
        newOrder.amountPaid > 0
          ? [
              {
                amount: newOrder.amountPaid,
                date: new Date(newOrder.saleDate).toISOString(),
                method: newOrder.paymentMethod,
                remarks: 'Initial payment',
              },
            ]
          : [];

      // Auto-determine order status based on payment and items
      const amountDue = newOrder.totalAmount - newOrder.amountPaid;
      const allItemsGiven = validItems.every((item) => item.given === true);
      const autoStatus: 'pending' | 'completed' | 'stuck' =
        amountDue === 0 && allItemsGiven ? 'completed' : 'pending';

      const orderData: Omit<Order, '$id' | '$createdAt' | '$updatedAt'> = {
        billNo,
        customerPhone: newOrder.customerPhone,
        customerName: newOrder.customerName,
        items: JSON.stringify(itemsToStore),
        status: autoStatus,
        remarks: newOrder.remarks.trim() || undefined,
        totalAmount: newOrder.totalAmount,
        totalProfit: newOrder.totalProfit,
        amountPaid: newOrder.amountPaid,
        paymentHistory: JSON.stringify(paymentHistory),
        saleDate: newOrder.saleDate,
      };

      await service.createOrder(orderData);
      await Promise.all(
        validItems.map(async (item) => {
          const itemDoc = await service.getItemById(item.itemId);
          if (itemDoc?.$id) {
            await service.updateItemSoldStatus(itemDoc.$id, true, item.sellingPrice);
          }
        })
      );

      if (!customerExists) {
        await service.createCustomer({
          phone: newOrder.customerPhone,
          name: newOrder.customerName,
        });
      }

      toast.success(`Order created successfully! Bill No: ${billNo}`);
      resetForm();
      setShowCreateForm(false);
      if (orders.length > 0) await fetchOrders();
    } catch (error) {
      toast.error('Error creating order');
      setCreateError('Error creating order. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Search order
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
        setOrders([order]);
        setSearchBillNo('');
        toast.success(`Order found: Bill No. ${billNo}`);
      } else {
        toast.error(`No order found with Bill No. ${billNo}`);
        setOrders([]);
      }
    } catch (error) {
      toast.error('Error searching order');
    } finally {
      setSearchLoading(false);
    }
  };

  // Modal handlers
  const openOrderModal = (order: Order, mode: 'view' | 'edit') => {
    setSelectedOrder(order);
    setModalMode(mode);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const handleOrderUpdate = () => {
    fetchOrders();
  };

  // Fetch next bill number when form opens
  useEffect(() => {
    if (showCreateForm) {
      service
        .getNextBillNumber()
        .then(setNextBillNo)
        .catch(() => setNextBillNo(1));
    }
  }, [showCreateForm]);

  return (
    <>
      {/* Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          mode={modalMode}
          onClose={closeOrderModal}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                  Order Management
                </h2>
                <p className="text-amber-100 text-sm font-light drop-shadow">
                  Track and manage customer orders
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
                      className={`input input-bordered w-full text-boutique-dark border-2 focus:outline-none transition-all ${customerExists ? 'bg-gray-100 border-boutique-accent/40 cursor-not-allowed' : 'bg-white border-boutique-accent/40 focus:border-boutique-secondary'}`}
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
                  <div
                    className={`grid gap-2 px-3 mb-2 text-xs font-semibold text-boutique-dark/70 ${privacyMode ? 'grid-cols-10' : 'grid-cols-12'}`}
                  >
                    <div className="col-span-12 md:col-span-2">Item ID</div>
                    {!privacyMode && <div className="col-span-3 md:col-span-1">Cost</div>}
                    <div className="col-span-3 md:col-span-1">Marked</div>
                    <div className="col-span-3 md:col-span-1">Discount</div>
                    <div className="col-span-3 md:col-span-2">Selling Price</div>
                    {!privacyMode && <div className="col-span-4 md:col-span-2">Profit</div>}
                    <div className="col-span-4 md:col-span-1 text-center">Given</div>
                    <div className="col-span-4 md:col-span-2 text-center">Action</div>
                  </div>

                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <OrderItemRow
                        key={index}
                        item={item}
                        index={index}
                        onItemChange={handleItemChange}
                        onRemove={removeItem}
                        disabled={createLoading}
                        privacyMode={privacyMode}
                      />
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <OrderSummary
                  orderData={newOrder}
                  orderItems={orderItems}
                  onInputChange={handleInputChange}
                  privacyMode={privacyMode}
                />

                {/* Remarks */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Remarks</span>
                  </label>
                  <textarea
                    name="remarks"
                    placeholder="Additional notes..."
                    className="textarea textarea-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all w-full h-20"
                    value={newOrder.remarks}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Error */}
                {createError && (
                  <div className="alert alert-error shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 shrink-0 stroke-current"
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

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      resetForm();
                      setShowCreateForm(false);
                    }}
                    disabled={createLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={createOrder}
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>Creating...
                      </>
                    ) : (
                      'Create Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <OrderFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchBillNo={searchBillNo}
            onSearchChange={setSearchBillNo}
            onSearch={searchOrderByBillNo}
            onFetchOrders={fetchOrders}
            loading={loading}
            searchLoading={searchLoading}
            disabled={createLoading}
          />

          {/* Orders Table */}
          <OrdersTable
            orders={orders}
            onViewOrder={(order) => openOrderModal(order, 'view')}
            onEditOrder={(order) => openOrderModal(order, 'edit')}
            privacyMode={privacyMode}
          />
        </div>
      </div>
    </>
  );
};

export default OrderManagement;
