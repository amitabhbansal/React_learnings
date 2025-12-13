import type { Item } from '../types';

interface ItemsTableProps {
  items: Item[];
}

const ItemsTable = ({ items }: ItemsTableProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 via-white to-amber-50 rounded-2xl shadow-xl border-2 border-boutique-secondary/30 p-6 mt-6">
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
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Items ({items.length})
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border-2 border-boutique-accent/30">
        <table className="table table-sm">
          <thead>
            <tr className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 text-white border-b-2 border-boutique-secondary">
              <th className="text-white">#</th>
              <th className="text-white">Item ID</th>
              <th className="text-white">Title</th>
              <th className="text-white">Color</th>
              <th className="text-white">Size</th>
              <th className="text-right text-white">Cost</th>
              <th className="text-right text-white">Marked</th>
              <th className="text-right text-white">Selling</th>
              <th className="text-right text-white">Profit</th>
              <th className="text-white">Status</th>
              <th className="text-white">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-boutique-dark/50 py-8">
                  No items found
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const sellingPrice = item.defaultSellingPrice ?? 0;
                const hasSellingPrice = sellingPrice > 0;
                const profit = hasSellingPrice ? sellingPrice - item.costPrice : null;
                const profitColor =
                  profit === null
                    ? 'text-boutique-dark/70'
                    : profit >= 0
                      ? 'text-green-600 font-semibold'
                      : 'text-red-600 font-semibold';

                return (
                  <tr
                    key={item.$id || index}
                    className={`text-boutique-dark border-b border-boutique-accent/20 hover:bg-purple-50/50 transition-colors ${item.sold ? 'opacity-50' : ''}`}
                  >
                    <td className="font-medium">{index + 1}</td>
                    <td className="font-mono text-sm font-semibold text-boutique-primary">
                      {item.itemId}
                    </td>
                    <td className="font-medium">{item.title || '-'}</td>
                    <td>{item.color || '-'}</td>
                    <td>{item.size || '-'}</td>
                    <td className="text-right font-medium">{formatCurrency(item.costPrice)}</td>
                    <td className="text-right font-medium">{formatCurrency(item.markedPrice)}</td>
                    <td className="text-right font-medium">
                      {hasSellingPrice ? formatCurrency(sellingPrice) : '-'}
                    </td>
                    <td className={`text-right ${profitColor}`}>
                      {profit !== null ? formatCurrency(profit) : '-'}
                    </td>
                    <td>
                      {item.sold ? (
                        <span className="badge bg-red-100 text-red-700 border-red-300 badge-sm font-semibold">
                          SOLD
                        </span>
                      ) : (
                        <span className="badge bg-green-100 text-green-700 border-green-300 badge-sm font-semibold">
                          AVAILABLE
                        </span>
                      )}
                    </td>
                    <td className="text-sm text-boutique-dark/60">{item.remarks || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemsTable;
