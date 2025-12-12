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
    <div className="w-full bg-gray-900 rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Items ({items.length})</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="text-gray-300 border-b border-gray-700">
              <th>#</th>
              <th>Item ID</th>
              <th>Title</th>
              <th>Color</th>
              <th>Size</th>
              <th className="text-right">Cost</th>
              <th className="text-right">Marked</th>
              <th className="text-right">Selling</th>
              <th className="text-right">Profit</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 py-8">
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
                    ? 'text-gray-200'
                    : profit >= 0
                      ? 'text-green-400'
                      : 'text-red-400';

                return (
                  <tr
                    key={item.$id || index}
                    className={`text-gray-200 border-b border-gray-800 hover:bg-gray-800 ${item.sold ? 'opacity-50' : ''}`}
                  >
                    <td>{index + 1}</td>
                    <td className="font-mono text-sm">{item.itemId}</td>
                    <td>{item.title || '-'}</td>
                    <td>{item.color || '-'}</td>
                    <td>{item.size || '-'}</td>
                    <td className="text-right">{formatCurrency(item.costPrice)}</td>
                    <td className="text-right">{formatCurrency(item.markedPrice)}</td>
                    <td className="text-right">
                      {hasSellingPrice ? formatCurrency(sellingPrice) : '-'}
                    </td>
                    <td className={`text-right font-semibold ${profitColor}`}>
                      {profit !== null ? formatCurrency(profit) : '-'}
                    </td>
                    <td>
                      {item.sold ? (
                        <span className="badge badge-error badge-sm">SOLD</span>
                      ) : (
                        <span className="badge badge-success badge-sm">AVAILABLE</span>
                      )}
                    </td>
                    <td className="text-sm text-gray-400">{item.remarks || '-'}</td>
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
