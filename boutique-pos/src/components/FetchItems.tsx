import { useState } from 'react';
import service from '../appwrite/config';
import type { Item } from '../types';
import ItemsTable from './ItemsTable';

const FetchItems = () => {
  const [soldStatus, setSoldStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [itemId, setItemId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoldStatus(e.target.value);
  };

  const fetchAllItems = async () => {
    setLoading(true);
    setItemId('');
    console.log('selected radio', soldStatus);
    try {
      const fetchedItems = await service.getItems(
        soldStatus === 'ALL' ? undefined : soldStatus === 'SOLD' ? true : false
      );
      console.log(fetchedItems);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Error fetching items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItemById = async () => {
    if (!itemId.trim()) {
      alert('Please enter an item ID');
      return;
    }

    setSearchLoading(true);
    try {
      const item = await service.getItemById(itemId);
      if (item) {
        setItems([item]);
        console.log('Item found:', item);
      } else {
        alert(`No item found with ID: ${itemId}`);
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching item by ID:', error);
      alert('Error fetching item. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };
  return (
    <>
      <div className="p-6 bg-base-200 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Item Management</h2>

        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Left Section: Fetch Items with Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="btn btn-primary min-w-[100px]"
              onClick={fetchAllItems}
              disabled={loading || searchLoading}
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
                  defaultChecked
                  checked={soldStatus === 'ALL'}
                  onChange={handleOptionChange}
                />
                <span className="label-text">All</span>
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
                <span className="label-text">Sold</span>
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
                <span className="label-text">Available</span>
              </label>
            </div>
          </div>

          {/* Right Section: Search by Item ID */}
          <div className="flex gap-2 lg:ml-auto w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search by Item ID..."
              className="input input-bordered input-sm lg:input-md flex-1 lg:w-64"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchItemById()}
            />
            <button
              className="btn btn-secondary btn-sm lg:btn-md"
              onClick={fetchItemById}
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

        {/* Display the items table */}
        {items.length > 0 && (
          <div className="mt-6">
            <ItemsTable items={items} />
          </div>
        )}
      </div>
    </>
  );
};

export default FetchItems;
