import { useState } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Item } from '../types';
import ItemsTable from './ItemsTable';

const ItemManagement = () => {
  const [soldStatus, setSoldStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [itemId, setItemId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [createError, setCreateError] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Form state for creating item
  const [newItem, setNewItem] = useState({
    itemId: '',
    title: '',
    color: '',
    size: '',
    costPrice: '',
    markedPrice: '',
    defaultSellingPrice: '',
    remarks: '',
  });

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoldStatus(e.target.value);
    setFetchError(''); // Clear error when filter changes
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
    setCreateError(''); // Clear error when user types
  };

  const resetForm = () => {
    setNewItem({
      itemId: '',
      title: '',
      color: '',
      size: '',
      costPrice: '',
      markedPrice: '',
      defaultSellingPrice: '',
      remarks: '',
    });
    setCreateError(''); // Clear error when reset
  };

  const fetchAllItems = async () => {
    setLoading(true);
    setItemId('');
    setFetchError('');
    console.log('selected radio', soldStatus);
    try {
      const fetchedItems = await service.getItems(
        soldStatus === 'ALL' ? undefined : soldStatus === 'SOLD' ? true : false
      );
      console.log(fetchedItems);
      setItems(fetchedItems);
      toast.success(`Fetched ${fetchedItems.length} items`);
    } catch (error) {
      console.error('Error fetching items:', error);
      setFetchError('Error fetching items. Please try again.');
      toast.error('Error fetching items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemById = async () => {
    setSearchError('');
    if (!itemId.trim()) {
      setSearchError('Please enter an item ID');
      return;
    }

    setSearchLoading(true);
    try {
      const item = await service.getItemById(itemId);
      if (item) {
        setItems([item]);
        console.log('Item found:', item);
        toast.success('Item found!');
      } else {
        setSearchError(`No item found with ID: ${itemId}`);
        toast.error(`No item found with ID: ${itemId}`);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      setSearchError('Error fetching item. Please try again.');
      toast.error('Error fetching item. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const createItem = async () => {
    setCreateError('');
    // Validate required fields
    if (!newItem.itemId.trim()) {
      setCreateError('Item ID is required');
      return;
    }
    if (!newItem.costPrice || parseFloat(newItem.costPrice) <= 0) {
      setCreateError('Valid cost price is required');
      return;
    }
    if (!newItem.markedPrice || parseFloat(newItem.markedPrice) <= 0) {
      setCreateError('Valid marked price is required');
      return;
    }

    setCreateLoading(true);
    try {
      const itemData: Omit<Item, '$id' | '$createdAt' | '$updatedAt'> = {
        itemId: newItem.itemId.trim(),
        title: newItem.title.trim() || undefined,
        color: newItem.color.trim() || undefined,
        size: newItem.size.trim() || undefined,
        costPrice: parseFloat(newItem.costPrice),
        markedPrice: parseFloat(newItem.markedPrice),
        defaultSellingPrice: newItem.defaultSellingPrice
          ? parseFloat(newItem.defaultSellingPrice)
          : undefined,
        remarks: newItem.remarks.trim() || undefined,
        sold: false,
      };

      await service.createItem(itemData);
      toast.success('Item created successfully!');
      resetForm();
      setShowCreateForm(false);
      // Optionally refresh the items list
      if (items.length > 0) {
        await fetchAllItems();
      }
    } catch (error) {
      console.error('Error creating item:', error);
      setCreateError('Error creating item. Please try again.');
      toast.error('Error creating item. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };
  return (
    <>
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                  Item Management
                </h2>
                <p className="text-amber-100 text-sm font-light drop-shadow">
                  Manage your boutique inventory
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
                if (showCreateForm) {
                  // Reset form and errors when closing
                  resetForm();
                  setCreateError('');
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
                  New Item
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-gradient-to-br from-amber-50 via-slate-50 to-purple-50">
          {/* Create Item Form */}
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
                Create New Item
              </h3>

              <div className="space-y-4">
                {/* Row 1: Item ID and Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Item ID <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="itemId"
                      placeholder="e.g., ITM001"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newItem.itemId}
                      onChange={handleInputChange}
                    />
                    {createError && createError.includes('Item ID') && (
                      <div className="text-error text-xs flex items-center gap-1 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{createError}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">Title</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g., Cotton T-Shirt"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newItem.title}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Row 2: Color and Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">Color</span>
                    </label>
                    <input
                      type="text"
                      name="color"
                      placeholder="e.g., Blue"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newItem.color}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">Size</span>
                    </label>
                    <input
                      type="text"
                      name="size"
                      placeholder="e.g., M, L, XL"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newItem.size}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Row 3: Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Cost Price <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      placeholder="0.00"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newItem.costPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                    {createError && createError.includes('cost price') && (
                      <div className="text-error text-xs flex items-center gap-1 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{createError}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Marked Price <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="markedPrice"
                      placeholder="0.00"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newItem.markedPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                    {createError && createError.includes('marked price') && (
                      <div className="text-error text-xs flex items-center gap-1 mt-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{createError}</span>
                      </div>
                    )}
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Selling Price
                      </span>
                    </label>
                    <input
                      type="number"
                      name="defaultSellingPrice"
                      placeholder="0.00"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newItem.defaultSellingPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Row 4: Remarks */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Remarks</span>
                  </label>
                  <textarea
                    name="remarks"
                    placeholder="Additional notes or comments..."
                    className="textarea textarea-bordered bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all w-full h-20"
                    value={newItem.remarks}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-bold"
                    onClick={createItem}
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
                        Create Item
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

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-boutique-accent/30 shadow-lg mb-6">
            {/* Left Section: Fetch Items with Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none min-w-[120px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
                onClick={fetchAllItems}
                disabled={loading || searchLoading || createLoading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Loading
                  </>
                ) : (
                  'Fetch Items'
                )}
              </button>
              <div className="divider divider-horizontal hidden lg:flex mx-0"></div>
              <div className="flex items-center gap-2">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-1"
                    className="radio radio-primary radio-sm"
                    value="ALL"
                    checked={soldStatus === 'ALL'}
                    onChange={handleOptionChange}
                  />
                  <span className="label-text font-medium text-boutique-dark">All</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-1"
                    className="radio radio-primary radio-sm"
                    value="SOLD"
                    checked={soldStatus === 'SOLD'}
                    onChange={handleOptionChange}
                  />
                  <span className="label-text font-medium text-boutique-dark">Sold</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="radio-1"
                    className="radio radio-primary radio-sm"
                    value="UNSOLD"
                    checked={soldStatus === 'UNSOLD'}
                    onChange={handleOptionChange}
                  />
                  <span className="label-text font-medium text-boutique-dark">Available</span>
                </label>
              </div>
              {/* Fetch Error Display */}
              {fetchError && (
                <div className="text-error text-xs flex items-center gap-1 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{fetchError}</span>
                </div>
              )}
            </div>

            {/* Right Section: Search by Item ID */}
            <div className="flex flex-col gap-2 lg:ml-auto w-full lg:w-auto">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by Item ID..."
                    className="input input-bordered input-sm lg:input-md w-full lg:w-64 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                    value={itemId}
                    onChange={(e) => {
                      setItemId(e.target.value);
                      setSearchError(''); // Clear error when user types
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && fetchItemById()}
                    disabled={createLoading}
                  />
                  {/* Search Error Display */}
                  {searchError && (
                    <div className="text-error text-xs flex items-center gap-1 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{searchError}</span>
                    </div>
                  )}
                </div>
                <button
                  className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none btn-sm lg:btn-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
                  onClick={fetchItemById}
                  disabled={searchLoading || loading || createLoading}
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
          </div>

          {/* Display the items table */}
          {items.length > 0 && (
            <div className="mt-6">
              <ItemsTable items={items} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemManagement;
