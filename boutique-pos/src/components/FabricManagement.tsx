import { useState } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Fabric } from '../types';

const FabricManagement = () => {
  const [loading, setLoading] = useState(false);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [fabricId, setFabricId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Form state for creating fabric
  const [newFabric, setNewFabric] = useState({
    fabricId: '',
    name: '',
    color: '',
    totalMeters: '',
    purchaseRate: '',
    sellingRate: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewFabric((prev) => ({ ...prev, [name]: value }));
    setCreateError('');
  };

  const resetForm = () => {
    setNewFabric({
      fabricId: '',
      name: '',
      color: '',
      totalMeters: '',
      purchaseRate: '',
      sellingRate: '',
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setCreateError('');
  };

  const fetchAllFabrics = async () => {
    setLoading(true);
    setFabricId('');
    try {
      const fetchedFabrics = await service.getFabrics();
      setFabrics(fetchedFabrics);
      toast.success(`Fetched ${fetchedFabrics.length} fabrics`);
    } catch (error) {
      console.error('Error fetching fabrics:', error);
      toast.error('Error fetching fabrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFabricById = async () => {
    if (!fabricId.trim()) {
      toast.error('Please enter a fabric ID');
      return;
    }

    setSearchLoading(true);
    try {
      const fabric = await service.getFabricById(fabricId);
      if (fabric) {
        setFabrics([fabric]);
        toast.success('Fabric found!');
      } else {
        toast.error(`No fabric found with ID: ${fabricId}`);
        setFabrics([]);
      }
    } catch (error) {
      console.error('Error fetching fabric by ID:', error);
      toast.error('Error fetching fabric. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const createFabric = async () => {
    setCreateError('');
    // Validate required fields
    if (!newFabric.fabricId.trim()) {
      setCreateError('Fabric ID is required');
      return;
    }
    if (!newFabric.name.trim()) {
      setCreateError('Fabric name is required');
      return;
    }
    if (!newFabric.totalMeters || parseFloat(newFabric.totalMeters) < 0) {
      setCreateError('Valid quantity is required');
      return;
    }
    if (!newFabric.purchaseRate || parseFloat(newFabric.purchaseRate) <= 0) {
      setCreateError('Valid purchase rate is required');
      return;
    }
    if (!newFabric.sellingRate || parseFloat(newFabric.sellingRate) <= 0) {
      setCreateError('Valid selling rate is required');
      return;
    }

    setCreateLoading(true);
    try {
      // Check if fabric ID already exists
      const existingFabric = await service.getFabricById(newFabric.fabricId.trim());
      if (existingFabric) {
        setCreateError('Fabric ID already exists. Please use a different ID.');
        toast.error('Fabric ID already exists!');
        setCreateLoading(false);
        return;
      }

      const fabricData: Omit<Fabric, '$id' | '$createdAt' | '$updatedAt'> = {
        fabricId: newFabric.fabricId.trim(),
        name: newFabric.name.trim(),
        color: newFabric.color.trim() || undefined,
        totalMeters: parseFloat(newFabric.totalMeters),
        usedMeters: 0,
        purchaseRate: parseFloat(newFabric.purchaseRate),
        sellingRate: parseFloat(newFabric.sellingRate),
        supplier: newFabric.supplier.trim() || undefined,
        purchaseDate: newFabric.purchaseDate || undefined,
        remarks: newFabric.remarks.trim() || undefined,
      };

      await service.createFabric(fabricData);
      toast.success('Fabric created successfully!');
      resetForm();
      setShowCreateForm(false);
      if (fabrics.length > 0) {
        await fetchAllFabrics();
      }
    } catch (error) {
      console.error('Error creating fabric:', error);
      setCreateError('Error creating fabric. Please try again.');
      toast.error('Error creating fabric. Please try again.');
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
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                  Fabric Inventory
                </h2>
                <p className="text-amber-100 text-sm font-light drop-shadow">
                  Manage fabric stock and pricing
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
                  New Fabric
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 bg-gradient-to-br from-amber-50 via-slate-50 to-purple-50">
          {/* Create Fabric Form */}
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
                Add New Fabric
              </h3>

              <div className="space-y-4">
                {/* Row 1: Fabric ID, Name, Color */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Fabric ID <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="fabricId"
                      placeholder="e.g., FAB001"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newFabric.fabricId}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Fabric Name <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g., Cotton Print"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newFabric.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">Color</span>
                    </label>
                    <input
                      type="text"
                      name="color"
                      placeholder="e.g., Red, Blue"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newFabric.color}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Row 2: Quantity, Purchase Rate, Selling Rate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Quantity (Meters) <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="totalMeters"
                      placeholder="0.0"
                      step="0.1"
                      min="0"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newFabric.totalMeters}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Purchase Rate (₹/m) <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="purchaseRate"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newFabric.purchaseRate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Row 3: Selling Rate, Supplier, Purchase Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Selling Rate (₹/m) <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="sellingRate"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newFabric.sellingRate}
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
                      value={newFabric.supplier}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold text-boutique-dark">
                        Purchase Date
                      </span>
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                      value={newFabric.purchaseDate}
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
                    placeholder="Additional notes about the fabric..."
                    className="textarea ml-4 textarea-bordered h-20 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all resize-none"
                    value={newFabric.remarks}
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
                    onClick={createFabric}
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
                        Create Fabric
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
              className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none min-w-[120px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
              onClick={fetchAllFabrics}
              disabled={loading || searchLoading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Loading
                </>
              ) : (
                'Fetch All Fabrics'
              )}
            </button>

            <div className="flex gap-2 lg:ml-auto w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search by Fabric ID..."
                className="input input-bordered input-sm lg:input-md w-full lg:w-64 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                value={fabricId}
                onChange={(e) => {
                  setFabricId(e.target.value);
                }}
                onKeyPress={(e) => e.key === 'Enter' && fetchFabricById()}
              />
              <button
                className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none btn-sm lg:btn-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
                onClick={fetchFabricById}
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

          {/* Fabrics Table */}
          {fabrics.length > 0 && (
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
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                  Fabric Inventory ({fabrics.length})
                </h2>
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
                <table className="table table-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 text-white border-b-2 border-boutique-secondary">
                      <th className="text-white">#</th>
                      <th className="text-white">Fabric ID</th>
                      <th className="text-white">Name</th>
                      <th className="text-white">Color</th>
                      <th className="text-right text-white">Total (m)</th>
                      <th className="text-right text-white">Used (m)</th>
                      <th className="text-right text-white">Purchase Rate</th>
                      <th className="text-right text-white">Selling Rate</th>
                      <th className="text-right text-white">Stock Value</th>
                      <th className="text-white">Supplier</th>
                      <th className="text-white">Purchase Date</th>
                      <th className="text-white">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {fabrics.map((fabric, index) => (
                      <tr
                        key={fabric.$id}
                        className="hover:bg-purple-50 transition-colors border-b border-boutique-accent/10"
                      >
                        <td className="font-medium text-boutique-dark">{index + 1}</td>
                        <td className="font-semibold text-boutique-primary">{fabric.fabricId}</td>
                        <td className="text-boutique-dark">{fabric.name || '-'}</td>
                        <td className="text-boutique-dark">{fabric.color || '-'}</td>
                        <td className="text-right font-semibold text-blue-600">
                          {fabric.totalMeters.toFixed(1)} m
                        </td>
                        <td className="text-right font-semibold text-gray-600">
                          {fabric.usedMeters ? fabric.usedMeters.toFixed(1) : '0.0'} m
                        </td>
                        <td className="text-right font-semibold text-orange-600">
                          {formatCurrency(fabric.purchaseRate)}
                        </td>
                        <td className="text-right font-semibold text-green-600">
                          {formatCurrency(fabric.sellingRate)}
                        </td>
                        <td className="text-right font-bold text-amber-700">
                          {formatCurrency(fabric.totalMeters * fabric.purchaseRate)}
                        </td>
                        <td className="text-boutique-dark text-sm">{fabric.supplier || '-'}</td>
                        <td className="text-boutique-dark text-sm">
                          {fabric.purchaseDate
                            ? new Date(fabric.purchaseDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="text-boutique-dark text-xs max-w-xs truncate">
                          {fabric.remarks || '-'}
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

export default FabricManagement;
