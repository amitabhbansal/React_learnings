import { useState, useEffect } from 'react';
import type { Fabric, StockAdjustment } from '../types';
import type { StitchingOrder } from '../types/stitching';
import service from '../appwrite/config';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

interface FabricDetailsModalProps {
  fabric: Fabric;
  onClose: () => void;
  onUpdate?: () => void;
}

interface FabricUsage {
  orderNo: string;
  customerName: string;
  orderDate: string;
  metersUsed: number;
  itemDescription: string;
}

const FabricDetailsModal = ({ fabric, onClose, onUpdate }: FabricDetailsModalProps) => {
  const { privacyMode } = useApp();
  const [loading, setLoading] = useState(false);
  const [usageHistory, setUsageHistory] = useState<FabricUsage[]>([]);
  const [currentFabric, setCurrentFabric] = useState(fabric);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  
  // Adjustment form state
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'reduce'>('reduce');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState<'sold' | 'damaged' | 'lost' | 'return' | 'correction' | 'other'>('sold');
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().split('T')[0]);

  const adjustmentHistory: StockAdjustment[] = (() => {
    try {
      return JSON.parse(currentFabric.adjustmentHistory || '[]');
    } catch (error) {
      return [];
    }
  })();

  useEffect(() => {
    fetchUsageHistory();
  }, [fabric.fabricId]);

  const fetchUsageHistory = async () => {
    setLoading(true);
    try {
      // Fetch all stitching orders
      const orders = await service.getStitchingOrders();

      const usages: FabricUsage[] = [];

      // Parse each order's items and check for fabric usage
      orders.forEach((order: StitchingOrder) => {
        try {
          const items = JSON.parse(order.items);
          items.forEach((item: any) => {
            if (item.fabric?.fabricId === fabric.fabricId) {
              usages.push({
                orderNo: order.orderNo,
                customerName: order.customerName,
                orderDate: order.orderDate,
                metersUsed: item.fabric.metersUsed || 0,
                itemDescription: item.description || item.itemType,
              });
            }
          });
        } catch (error) {
          console.error('Error parsing order items:', error);
        }
      });

      // Sort by date (most recent first)
      usages.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

      setUsageHistory(usages);
    } catch (error) {
      console.error('Error fetching usage history:', error);
      toast.error('Failed to load usage history');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (adjustmentQuantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    // Calculate current used meters from orders
    const currentUsed = usageHistory.reduce((sum, usage) => sum + usage.metersUsed, 0);
    const currentAvailable = currentFabric.totalMeters - currentUsed;
    
    if (adjustmentType === 'reduce' && adjustmentQuantity > currentAvailable) {
      toast.error('Cannot reduce more than available stock');
      return;
    }

    setAdjustLoading(true);
    try {
      const newAdjustment: StockAdjustment = {
        date: new Date(adjustmentDate).toISOString(),
        type: adjustmentType,
        quantity: adjustmentQuantity,
        reason: adjustmentReason,
        amount: adjustmentReason === 'sold' ? adjustmentAmount : undefined,
        notes: adjustmentNotes.trim() || undefined,
      };

      const updatedHistory = [...adjustmentHistory, newAdjustment];
      
      // Only 'add' type increases totalMeters (new purchases)
      // 'reduce' type is just tracked in adjustments and counted as 'used'
      let newTotalMeters = currentFabric.totalMeters;
      if (adjustmentType === 'add') {
        newTotalMeters += adjustmentQuantity;
      }

      const updates = {
        totalMeters: newTotalMeters,
        adjustmentHistory: JSON.stringify(updatedHistory),
      };

      await service.updateFabric(currentFabric.$id!, updates);

      // Update local state with proper numeric conversion
      const updatedFabric = {
        ...currentFabric,
        totalMeters: newTotalMeters,
        adjustmentHistory: JSON.stringify(updatedHistory),
      };
      setCurrentFabric(updatedFabric);

      // Reset form
      setAdjustmentQuantity(0);
      setAdjustmentAmount(0);
      setAdjustmentNotes('');
      setAdjustmentDate(new Date().toISOString().split('T')[0]);
      setShowAdjustForm(false);

      toast.success('Stock adjusted successfully!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to adjust stock');
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleDeleteAdjustment = async (indexToDelete: number) => {
    setAdjustLoading(true);
    try {
      const adjustmentToDelete = adjustmentHistory[indexToDelete];
      
      // Rollback the quantity change
      let newTotalMeters = currentFabric.totalMeters;
      if (adjustmentToDelete.type === 'add') {
        // If it was an add, subtract it back
        newTotalMeters -= adjustmentToDelete.quantity;
      }
      // Note: 'reduce' type doesn't affect totalMeters, so no rollback needed

      // Remove the adjustment from history
      const updatedHistory = adjustmentHistory.filter((_, index) => index !== indexToDelete);

      const updates = {
        totalMeters: newTotalMeters,
        adjustmentHistory: JSON.stringify(updatedHistory),
      };

      await service.updateFabric(currentFabric.$id!, updates);

      const updatedFabric = {
        ...currentFabric,
        totalMeters: newTotalMeters,
        adjustmentHistory: JSON.stringify(updatedHistory),
      };
      setCurrentFabric(updatedFabric);

      toast.success('Adjustment deleted and changes rolled back!');
      setDeleteConfirmIndex(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      toast.error('Failed to delete adjustment');
    } finally {
      setAdjustLoading(false);
    }
  };

  // Calculate total used from actual usage history
  const totalUsedFromOrders = usageHistory.reduce((sum, usage) => sum + usage.metersUsed, 0);
  
  // Calculate total reduced from adjustments (sold, damaged, lost, etc.)
  const totalReducedFromAdjustments = adjustmentHistory
    .filter(adj => adj.type === 'reduce')
    .reduce((sum, adj) => sum + adj.quantity, 0);
  
  const totalUsed = totalUsedFromOrders + totalReducedFromAdjustments;
  const availableMeters = currentFabric.totalMeters - totalUsed;
  const usagePercentage =
    currentFabric.totalMeters > 0 ? (totalUsed / currentFabric.totalMeters) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 p-6 border-b-2 border-boutique-secondary sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif font-bold text-white">
                Fabric Details - {fabric.fabricId}
              </h3>
              <p className="text-amber-100 text-sm">Complete inventory and usage information</p>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
              onClick={onClose}
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-boutique-primary mb-3">Fabric Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-boutique-dark/60">Name: </span>
                  <span className="font-semibold">{currentFabric.name}</span>
                </p>
                {currentFabric.color && (
                  <p>
                    <span className="text-boutique-dark/60">Color: </span>
                    <span className="font-semibold">{currentFabric.color}</span>
                  </p>
                )}
                {currentFabric.supplier && (
                  <p>
                    <span className="text-boutique-dark/60">Supplier: </span>
                    <span className="font-semibold">{currentFabric.supplier}</span>
                  </p>
                )}
                {currentFabric.purchaseDate && (
                  <p>
                    <span className="text-boutique-dark/60">Purchase Date: </span>
                    <span className="font-semibold">{formatDate(currentFabric.purchaseDate)}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-boutique-primary mb-3">Pricing Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-boutique-dark/60">Purchase Rate: </span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(currentFabric.purchaseRate)}/meter
                  </span>
                </p>
                <p>
                  <span className="text-boutique-dark/60">Selling Rate: </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(currentFabric.sellingRate)}/meter
                  </span>
                </p>
                <p>
                  <span className="text-boutique-dark/60">Profit Margin: </span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(currentFabric.sellingRate - currentFabric.purchaseRate)}/meter
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-boutique-accent/30">
            <h4 className="font-semibold text-boutique-primary mb-3">Stock Summary</h4>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-boutique-dark/60">Total Stock</p>
                <p className="text-2xl font-bold text-boutique-primary">
                  {currentFabric.totalMeters.toFixed(2)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-boutique-dark/60">Used</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalUsed.toFixed(2)}m
                </p>
                <p className="text-[10px] text-boutique-dark/50">
                  Orders: {totalUsedFromOrders.toFixed(2)}m | Direct: {totalReducedFromAdjustments.toFixed(2)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-boutique-dark/60">Available</p>
                <p className="text-2xl font-bold text-green-600">{availableMeters.toFixed(2)}m</p>
              </div>
            </div>

            {/* Usage Progress Bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-boutique-dark/60 mb-1">
                <span>Usage: {usagePercentage.toFixed(1)}%</span>
                <span>{usageHistory.length} orders</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    usagePercentage < 50
                      ? 'bg-green-500'
                      : usagePercentage < 80
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {currentFabric.remarks && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-boutique-primary mb-2">Remarks</h4>
              <p className="text-sm text-boutique-dark/80">{currentFabric.remarks}</p>
            </div>
          )}

          {/* Usage History */}
          <div>
            <h4 className="font-semibold text-boutique-primary mb-3 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-boutique-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Usage History ({usageHistory.length})
            </h4>

            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-boutique-secondary"></span>
              </div>
            ) : usageHistory.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
                <table className="table table-sm bg-white">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="text-boutique-dark">#</th>
                      <th className="text-boutique-dark">Order No</th>
                      <th className="text-boutique-dark">Customer</th>
                      <th className="text-boutique-dark">Order Date</th>
                      <th className="text-boutique-dark">Item</th>
                      <th className="text-right text-boutique-dark">Meters Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageHistory.map((usage, index) => (
                      <tr
                        key={index}
                        className="border-b border-boutique-accent/20 hover:bg-purple-50/50"
                      >
                        <td className="font-medium">{index + 1}</td>
                        <td>
                          <span className="badge badge-sm bg-boutique-secondary/20 text-boutique-dark border-boutique-secondary/40">
                            {usage.orderNo}
                          </span>
                        </td>
                        <td className="font-semibold">
                          {privacyMode ? '***' : usage.customerName}
                        </td>
                        <td className="text-sm">{formatDate(usage.orderDate)}</td>
                        <td className="text-sm text-boutique-dark/70">{usage.itemDescription}</td>
                        <td className="text-right font-bold text-red-600">
                          {usage.metersUsed.toFixed(2)}m
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-amber-50 font-semibold">
                      <td colSpan={5} className="text-right text-boutique-dark">
                        Total Used:
                      </td>
                      <td className="text-right text-red-600 font-bold">
                        {totalUsedFromOrders.toFixed(2)}m
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-boutique-dark/30 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-boutique-dark/60">No usage history found</p>
                <p className="text-sm text-boutique-dark/40">
                  This fabric hasn't been used in any orders yet
                </p>
              </div>
            )}
          </div>

          {/* Manual Adjustments History */}
          {adjustmentHistory.length > 0 && (
            <div>
              <h4 className="font-semibold text-boutique-primary mb-3 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-boutique-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Manual Adjustments ({adjustmentHistory.length})
              </h4>
              <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
                <table className="table table-sm bg-white">
                  <thead>
                    <tr className="bg-amber-100">
                      <th className="text-boutique-dark">#</th>
                      <th className="text-boutique-dark">Date</th>
                      <th className="text-boutique-dark">Type</th>
                      <th className="text-right text-boutique-dark">Quantity</th>
                      <th className="text-boutique-dark">Reason</th>
                      <th className="text-right text-boutique-dark">Amount</th>
                      <th className="text-boutique-dark">Notes</th>
                      <th className="text-center text-boutique-dark">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustmentHistory.map((adj, index) => (
                      <tr key={index} className="border-b border-boutique-accent/20 hover:bg-amber-50/50">
                        <td className="font-medium">{index + 1}</td>
                        <td className="text-sm">{formatDate(adj.date)}</td>
                        <td>
                          <span
                            className={`badge badge-sm ${
                              adj.type === 'add'
                                ? 'bg-green-100 text-green-700 border-green-300'
                                : 'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            {adj.type === 'add' ? '+' : '-'} {adj.type}
                          </span>
                        </td>
                        <td className={`text-right font-bold ${adj.type === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                          {adj.type === 'add' ? '+' : '-'}{adj.quantity}m
                        </td>
                        <td>
                          <span className="badge badge-sm badge-outline uppercase text-xs">
                            {adj.reason}
                          </span>
                        </td>
                        <td className="text-right text-sm">
                          {adj.amount ? formatCurrency(adj.amount) : '-'}
                        </td>
                        <td className="text-sm text-boutique-dark/60">{adj.notes || '-'}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-xs btn-ghost text-red-600 hover:bg-red-100"
                            onClick={() => setDeleteConfirmIndex(index)}
                            disabled={adjustLoading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Adjustment Form */}
          {showAdjustForm && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border-2 border-orange-300">
              <h4 className="font-semibold text-boutique-primary mb-3">Adjust Stock</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'reduce')}
                    disabled={adjustLoading}
                  >
                    <option value="reduce">Reduce Stock</option>
                    <option value="add">Add Stock</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Quantity (meters)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={adjustmentQuantity || ''}
                    onChange={(e) => setAdjustmentQuantity(Number(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    disabled={adjustLoading}
                    placeholder="Enter meters"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Reason</span>
                  </label>
                  <select
                    className="select select-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value as any)}
                    disabled={adjustLoading}
                  >
                    <option value="sold">Sold to Customer</option>
                    <option value="damaged">Damaged</option>
                    <option value="lost">Lost</option>
                    <option value="return">Return</option>
                    <option value="correction">Correction</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">
                      Amount {adjustmentReason !== 'sold' && '(optional)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={adjustmentAmount || ''}
                    onChange={(e) => setAdjustmentAmount(Number(e.target.value) || 0)}
                    min="0"
                    disabled={adjustLoading}
                    placeholder="₹0"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text font-semibold text-boutique-dark">Date</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                    value={adjustmentDate}
                    onChange={(e) => setAdjustmentDate(e.target.value)}
                    disabled={adjustLoading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="label">
                  <span className="label-text font-semibold text-boutique-dark">Notes</span>
                  <span className="label-text-alt text-xs text-boutique-dark/60">(Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40"
                  rows={2}
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  disabled={adjustLoading}
                  placeholder="Additional notes..."
                ></textarea>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setShowAdjustForm(false);
                    setAdjustmentQuantity(0);
                    setAdjustmentAmount(0);
                    setAdjustmentNotes('');
                  }}
                  disabled={adjustLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-none"
                  onClick={handleAdjustStock}
                  disabled={adjustLoading}
                >
                  {adjustLoading ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Adjustment'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 justify-end">
            {!showAdjustForm && (
              <button
                className="btn bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white border-none gap-2"
                onClick={() => setShowAdjustForm(true)}
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Adjust Stock
              </button>
            )}
            <button
              className="btn bg-white hover:bg-slate-100 text-boutique-primary border-2 border-boutique-accent/30"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-boutique-primary mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Delete Adjustment?
            </h3>
            <div className="mb-4">
              <p className="text-boutique-dark/80 mb-3">
                Are you sure you want to delete this adjustment? This will:
              </p>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2 text-sm">
                <p className="font-semibold text-boutique-dark">
                  <span className={`badge badge-sm ${
                    adjustmentHistory[deleteConfirmIndex].type === 'add'
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-red-100 text-red-700 border-red-300'
                  } mr-2`}>
                    {adjustmentHistory[deleteConfirmIndex].type}
                  </span>
                  {adjustmentHistory[deleteConfirmIndex].quantity.toFixed(2)} meters
                </p>
                <p className="text-boutique-dark/70">
                  Reason: <span className="font-medium">{adjustmentHistory[deleteConfirmIndex].reason}</span>
                </p>
                <p className="text-boutique-dark/70">
                  Date: <span className="font-medium">{formatDate(adjustmentHistory[deleteConfirmIndex].date)}</span>
                </p>
              </div>
              <p className="text-red-600 font-semibold mt-3 text-sm">
                {adjustmentHistory[deleteConfirmIndex].type === 'add' 
                  ? '✓ Total meters will be reduced'
                  : '✓ This adjustment will be removed from usage history'}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="btn btn-sm bg-white hover:bg-slate-100 text-boutique-dark border-2 border-boutique-accent/30"
                onClick={() => setDeleteConfirmIndex(null)}
                disabled={adjustLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none"
                onClick={() => handleDeleteAdjustment(deleteConfirmIndex)}
                disabled={adjustLoading}
              >
                {adjustLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-boutique-primary mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Delete Adjustment?
            </h3>
            <div className="mb-4">
              <p className="text-boutique-dark/80 mb-3">
                Are you sure you want to delete this adjustment? This will:
              </p>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-2 text-sm">
                <p className="font-semibold text-boutique-dark">
                  <span className={`badge badge-sm ${
                    adjustmentHistory[deleteConfirmIndex].type === 'add'
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-red-100 text-red-700 border-red-300'
                  } mr-2`}>
                    {adjustmentHistory[deleteConfirmIndex].type}
                  </span>
                  {adjustmentHistory[deleteConfirmIndex].quantity.toFixed(2)} meters
                </p>
                <p className="text-boutique-dark/70">
                  Reason: <span className="font-medium">{adjustmentHistory[deleteConfirmIndex].reason}</span>
                </p>
                <p className="text-boutique-dark/70">
                  Date: <span className="font-medium">{formatDate(adjustmentHistory[deleteConfirmIndex].date)}</span>
                </p>
              </div>
              <p className="text-red-600 font-semibold mt-3 text-sm">
                {adjustmentHistory[deleteConfirmIndex].type === 'add' 
                  ? '✓ Total meters will be reduced'
                  : '✓ This adjustment will be removed from usage history'}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="btn btn-sm bg-white hover:bg-slate-100 text-boutique-dark border-2 border-boutique-accent/30"
                onClick={() => setDeleteConfirmIndex(null)}
                disabled={adjustLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-none"
                onClick={() => handleDeleteAdjustment(deleteConfirmIndex)}
                disabled={adjustLoading}
              >
                {adjustLoading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FabricDetailsModal;
