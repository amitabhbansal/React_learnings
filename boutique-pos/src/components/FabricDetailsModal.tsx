import { useState, useEffect } from 'react';
import type { Fabric } from '../types';
import type { StitchingOrder } from '../types/stitching';
import service from '../appwrite/config';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

interface FabricDetailsModalProps {
  fabric: Fabric;
  onClose: () => void;
}

interface FabricUsage {
  orderNo: string;
  customerName: string;
  orderDate: string;
  metersUsed: number;
  itemDescription: string;
}

const FabricDetailsModal = ({ fabric, onClose }: FabricDetailsModalProps) => {
  const { privacyMode } = useApp();
  const [loading, setLoading] = useState(false);
  const [usageHistory, setUsageHistory] = useState<FabricUsage[]>([]);

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

  const availableMeters = fabric.totalMeters - (fabric.usedMeters || 0);
  const usagePercentage = fabric.totalMeters > 0 ? ((fabric.usedMeters || 0) / fabric.totalMeters) * 100 : 0;

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
              <p className="text-amber-100 text-sm">
                Complete inventory and usage information
              </p>
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
                  <span className="font-semibold">{fabric.name}</span>
                </p>
                {fabric.color && (
                  <p>
                    <span className="text-boutique-dark/60">Color: </span>
                    <span className="font-semibold">{fabric.color}</span>
                  </p>
                )}
                {fabric.supplier && (
                  <p>
                    <span className="text-boutique-dark/60">Supplier: </span>
                    <span className="font-semibold">{fabric.supplier}</span>
                  </p>
                )}
                {fabric.purchaseDate && (
                  <p>
                    <span className="text-boutique-dark/60">Purchase Date: </span>
                    <span className="font-semibold">{formatDate(fabric.purchaseDate)}</span>
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
                    {formatCurrency(fabric.purchaseRate)}/meter
                  </span>
                </p>
                <p>
                  <span className="text-boutique-dark/60">Selling Rate: </span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(fabric.sellingRate)}/meter
                  </span>
                </p>
                <p>
                  <span className="text-boutique-dark/60">Profit Margin: </span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(fabric.sellingRate - fabric.purchaseRate)}/meter
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
                  {fabric.totalMeters.toFixed(2)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-boutique-dark/60">Used</p>
                <p className="text-2xl font-bold text-red-600">
                  {(fabric.usedMeters || 0).toFixed(2)}m
                </p>
              </div>
              <div>
                <p className="text-xs text-boutique-dark/60">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {availableMeters.toFixed(2)}m
                </p>
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
          {fabric.remarks && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-boutique-primary mb-2">Remarks</h4>
              <p className="text-sm text-boutique-dark/80">{fabric.remarks}</p>
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
                      <tr key={index} className="border-b border-boutique-accent/20 hover:bg-purple-50/50">
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
                        {(fabric.usedMeters || 0).toFixed(2)}m
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
                <p className="text-sm text-boutique-dark/40">This fabric hasn't been used in any orders yet</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 justify-end">
            <button
              className="btn bg-white hover:bg-slate-100 text-boutique-primary border-2 border-boutique-accent/30"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FabricDetailsModal;
