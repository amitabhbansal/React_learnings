import { useState } from 'react';
import service from '../appwrite/config';

const FetchItems = () => {
  const [soldStatus, setSoldStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSoldStatus(e.target.value);
  };

  const fetchAllItems = async () => {
    setLoading(true);
    console.log('selected radio', soldStatus);
    try {
      const items = await service.getItems(
        soldStatus === 'ALL' ? undefined : soldStatus === 'SOLD' ? true : false
      );
      console.log(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Error fetching items. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <button className="btn" onClick={fetchAllItems}>
        {loading ? (
          <div>
            <span className="loading loading-spinner"></span>Loading
          </div>
        ) : (
          'Fetch all items'
        )}
      </button>
      <label className="text-black ml-5 cursor-pointer">
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
      <label className="text-black ml-3 cursor-pointer">
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
      <label className="text-black ml-3 cursor-pointer">
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
    </>
  );
};

export default FetchItems;
