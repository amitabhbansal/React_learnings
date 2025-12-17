import React from 'react';

interface OrderFiltersProps {
  statusFilter: 'ALL' | 'pending' | 'completed' | 'stuck';
  onStatusFilterChange: (status: 'ALL' | 'pending' | 'completed' | 'stuck') => void;
  searchBillNo: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onFetchOrders: () => void;
  loading: boolean;
  searchLoading: boolean;
  disabled: boolean;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  searchBillNo,
  onSearchChange,
  onSearch,
  onFetchOrders,
  loading,
  searchLoading,
  disabled,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 p-4 rounded-2xl border-2 border-boutique-accent/30 shadow-lg mb-6">
      {/* Left Section: Fetch Orders with Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none min-w-[120px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
          onClick={onFetchOrders}
          disabled={loading || disabled}
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
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
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
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
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
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
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
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
            />
            <span className="label-text font-medium text-boutique-dark">Stuck</span>
          </label>
        </div>
      </div>

      {/* Right Section: Search by Bill No. */}
      <div className="flex flex-col gap-2 lg:ml-auto w-full lg:w-auto">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Search by Bill No..."
              className="input input-bordered input-sm lg:input-md w-full lg:w-64 bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
              value={searchBillNo}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              disabled={disabled}
            />
          </div>

          <button
            className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none btn-sm lg:btn-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold"
            onClick={onSearch}
            disabled={searchLoading || loading || disabled}
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
  );
};

export default OrderFilters;
