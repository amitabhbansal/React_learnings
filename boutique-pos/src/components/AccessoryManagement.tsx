import { useState } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Accessory } from '../types';
import AccessoryDetailsModal from './AccessoryDetailsModal';

const AccessoryManagement = () => {
  const [loading, setLoading] = useState(false);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [accessoryId, setAccessoryId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState<Accessory | null>(null);

  // Form state for creating accessory
  const [newAccessory, setNewAccessory] = useState({
    accessoryId: '',
    type: '',
    description: '',
    unit: 'piece' as 'piece' | 'meter' | 'set',
    quantityInStock: '',
    purchaseRate: '',
    sellingRate: '',
    supplier: '',
    remarks: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewAccessory((prev) => ({ ...prev, [name]: value }));
    setCreateError('');
  };

  const resetForm = () => {
    setNewAccessory({
      accessoryId: '',
      type: '',
      description: '',
      unit: 'piece' as 'piece' | 'meter' | 'set',
      quantityInStock: '',
      purchaseRate: '',
      sellingRate: '',
      supplier: '',
      remarks: '',
    });
    setCreateError('');
  };

  const fetchAllAccessories = async () => {
    setLoading(true);
    setAccessoryId('');
    try {
      const fetchedAccessories = await service.getAccessories();
      setAccessories(fetchedAccessories);
      toast.success(`Fetched ${fetchedAccessories.length} accessories`);
    } catch (error) {
      console.error('Error fetching accessories:', error);
      toast.error('Error fetching accessories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessoryById = async () => {
    if (!accessoryId.trim()) {
      toast.error('Please enter an accessory ID');
      return;
    }

    setSearchLoading(true);
    try {
      const accessory = await service.getAccessoryById(accessoryId);
      if (accessory) {
        setAccessories([accessory]);
        toast.success('Accessory found!');
      } else {
        toast.error(`No accessory found with ID: ${accessoryId}`);
        setAccessories([]);
      }
    } catch (error) {
      console.error('Error fetching accessory by ID:', error);
      toast.error('Error fetching accessory. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const createAccessory = async () => {
    setCreateError('');
    // Validate required fields
    if (!newAccessory.accessoryId.trim()) {
      setCreateError('Accessory ID is required');
      return;
    }
    if (!newAccessory.type.trim()) {
      setCreateError('Accessory type is required');
      return;
    }
    if (!newAccessory.description.trim()) {
      setCreateError('Accessory description is required');
      return;
    }
    if (!newAccessory.quantityInStock || parseInt(newAccessory.quantityInStock) < 0) {
      setCreateError('Valid quantity is required');
      return;
    }
    if (!newAccessory.purchaseRate || parseFloat(newAccessory.purchaseRate) <= 0) {
      setCreateError('Valid purchase rate is required');
      return;
    }
    if (!newAccessory.sellingRate || parseFloat(newAccessory.sellingRate) <= 0) {
      setCreateError('Valid selling rate is required');
      return;
    }

    setCreateLoading(true);
    try {
      // Check if accessory ID already exists
      const existingAccessory = await service.getAccessoryById(newAccessory.accessoryId.trim());
      if (existingAccessory) {
        setCreateError('Accessory ID already exists. Please use a different ID.');
        toast.error('Accessory ID already exists!');
        setCreateLoading(false);
        return;
      }

      const accessoryData: Omit<Accessory, '$id' | '$createdAt' | '$updatedAt'> = {
        accessoryId: newAccessory.accessoryId.trim(),
        type: newAccessory.type.trim(),
        description: newAccessory.description.trim(),
        unit: newAccessory.unit,
        quantityInStock: parseInt(newAccessory.quantityInStock),
        quantityUsed: 0,
        purchaseRate: parseFloat(newAccessory.purchaseRate),
        sellingRate: parseFloat(newAccessory.sellingRate),
        supplier: newAccessory.supplier.trim() || undefined,
        remarks: newAccessory.remarks.trim() || undefined,
      };

      await service.createAccessory(accessoryData);
      toast.success('Accessory created successfully!');
      resetForm();
      setShowCreateForm(false);
      if (accessories.length > 0) {
        await fetchAllAccessories();
      }
    } catch (error) {
      console.error('Error creating accessory:', error);
      setCreateError('Error creating accessory. Please try again.');
      toast.error('Error creating accessory. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <>
      {selectedAccessory && (
        <AccessoryDetailsModal
          accessory={selectedAccessory}
          onClose={() => setSelectedAccessory(null)}
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
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                  Accessory Inventory
                </h2>
                <p className="text-amber-100 text-sm font-light drop-shadow">
                  Manage buttons, borders, and accessories
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
                  New Accessory
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-gradient-to-br from-amber-50 via-slate-50 to-purple-50">
          {/* Create Accessory Form */}
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
                Add New Accessory
              </h3>

              <div className="space-y-4">
                {/* Row 1: Accessory ID, Type, Unit, Description */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Accessory ID <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="accessoryId"
                      placeholder="e.g., ACC001"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newAccessory.accessoryId}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Type <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="type"
                      className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newAccessory.type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select type</option>
                      <option value="button">Button</option>
                      <option value="border">Border/Lace</option>
                      <option value="zipper">Zipper</option>
                      <option value="hook">Hook</option>
                      <option value="thread">Thread</option>
                      <option value="patch">Patch</option>
                      <option value="sequin">Sequin</option>
                      <option value="pad">Pad</option>
                      <option value="chain">Chain</option>
                      <option value="lining">Lining</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Unit <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="unit"
                      className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newAccessory.unit}
                      onChange={handleInputChange}
                    >
                      <option value="piece">Piece</option>
                      <option value="meter">Meter</option>
                      <option value="set">Set</option>
                    </select>
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Quantity <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="quantityInStock"
                      placeholder="0"
                      min="0"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newAccessory.quantityInStock}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Row 2: Description (full width) */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">
                      Description <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="e.g., Golden metal button with embossed design, 2cm diameter"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                    value={newAccessory.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Row 3: Purchase Rate, Selling Rate, Supplier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Purchase Rate (₹) <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="purchaseRate"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newAccessory.purchaseRate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Selling Rate (₹) <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="sellingRate"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newAccessory.sellingRate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">Supplier</span>
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      placeholder="Supplier name"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newAccessory.supplier}
                      onChange={handleInputChange}
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
                    placeholder="Additional notes about the accessory..."
                    className="textarea textarea-bordered h-20 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all resize-none"
                    value={newAccessory.remarks}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                {/* Error Message */}
                {createError && (
                  <div className="alert alert-error shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current flex-shrink-0 h-6 w-6"
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

                {/* Action Buttons */}
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
                    className="btn bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-none"
                    onClick={createAccessory}
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
                        Create Accessory
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
            <button
              className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none min-w-[140px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
              onClick={fetchAllAccessories}
              disabled={loading || searchLoading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Loading
                </>
              ) : (
                'Fetch All Accessories'
              )}
            </button>

            <div className="flex gap-2 lg:ml-auto w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search by Accessory ID..."
                className="input input-bordered input-sm lg:input-md w-full lg:w-64 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                value={accessoryId}
                onChange={(e) => {
                  setAccessoryId(e.target.value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && fetchAccessoryById()}
              />
              <button
                className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none btn-sm lg:btn-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
                onClick={fetchAccessoryById}
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

          {/* Accessories Table */}
          {accessories.length > 0 && (
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  Accessory Inventory ({accessories.length})
                </h2>
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
                <table className="table table-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 text-white border-b-2 border-boutique-secondary">
                      <th className="text-white">#</th>
                      <th className="text-white">Accessory ID</th>
                      <th className="text-white">Type</th>
                      <th className="text-white">Description</th>
                      <th className="text-white">Unit</th>
                      <th className="text-right text-white">In Stock</th>
                      <th className="text-right text-white">Used</th>
                      <th className="text-right text-white">Purchase Rate</th>
                      <th className="text-right text-white">Selling Rate</th>
                      <th className="text-right text-white">Stock Value</th>
                      <th className="text-white">Supplier</th>
                      <th className="text-white">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {accessories.map((accessory, index) => (
                      <tr
                        key={accessory.$id}
                        className="hover:bg-purple-50 transition-colors border-b border-boutique-accent/10"
                      >
                        <td className="font-medium text-boutique-dark">{index + 1}</td>
                        <td>
                          <button
                            className="font-semibold text-boutique-primary hover:text-boutique-secondary underline cursor-pointer transition-all"
                            onClick={() => setSelectedAccessory(accessory)}
                          >
                            {accessory.accessoryId}
                          </button>
                        </td>
                        <td>
                          <span className="badge badge-sm bg-blue-100 text-blue-700 border-blue-300">
                            {accessory.type}
                          </span>
                        </td>
                        <td className="text-boutique-dark max-w-xs truncate">
                          {accessory.description}
                        </td>
                        <td className="text-center">
                          <span className="badge badge-sm bg-gray-100 text-gray-700">
                            {accessory.unit}
                          </span>
                        </td>
                        <td className="text-right font-semibold text-blue-600">
                          {accessory.quantityInStock}
                        </td>
                        <td className="text-right font-semibold text-gray-600">
                          {accessory.quantityUsed || 0}
                        </td>
                        <td className="text-right font-semibold text-orange-600">
                          {formatCurrency(accessory.purchaseRate)}
                        </td>
                        <td className="text-right font-semibold text-green-600">
                          {formatCurrency(accessory.sellingRate)}
                        </td>
                        <td className="text-right font-bold text-amber-700">
                          {formatCurrency(accessory.quantityInStock * accessory.purchaseRate)}
                        </td>
                        <td className="text-boutique-dark text-sm">{accessory.supplier || '-'}</td>
                        <td className="text-boutique-dark text-xs max-w-xs truncate">
                          {accessory.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AccessoryManagement;
