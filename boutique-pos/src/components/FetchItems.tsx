import { useState } from 'react';
import service from '../appwrite/config';
import type { Item } from '../types';
import ItemsTable from './ItemsTable';

const FetchItems = () => {
  const [soldStatus, setSoldStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoldStatus(e.target.value);
  };

  const fetchAllItems = async () => {
    setLoading(true);
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
  return (
    <>
      <div className="p-6 bg-base-200 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Fetch Items</h2>
        <button className="btn btn-primary" onClick={fetchAllItems}>
          {loading ? (
            <div>
              <span className="loading loading-spinner"></span>Loading
            </div>
          ) : (
            'Fetch'
          )}
        </button>
        <label className="ml-5 cursor-pointer">
          <input
            type="radio"
            name="radio-1"
            className="radio radio-primary"
            value="ALL"
            defaultChecked
            checked={soldStatus === 'ALL'}
            onChange={handleOptionChange}
          />
          <span className="ml-1">ALL</span>
        </label>
        <label className=" ml-3 cursor-pointer">
          <input
            type="radio"
            name="radio-1"
            className="radio radio-primary"
            value="SOLD"
            checked={soldStatus === 'SOLD'}
            onChange={handleOptionChange}
          />
          <span className="ml-1">SOLD</span>
        </label>
        <label className=" ml-3 cursor-pointer">
          <input
            type="radio"
            name="radio-1"
            className="radio radio-primary"
            value="UNSOLD"
            checked={soldStatus === 'UNSOLD'}
            onChange={handleOptionChange}
          />
          <span className="ml-1">UNSOLD</span>
        </label>

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
