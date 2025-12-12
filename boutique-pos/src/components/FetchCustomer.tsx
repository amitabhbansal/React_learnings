import { useState } from 'react';
import service from '../appwrite/config';
import type { Customer } from '../types';

export default function FetchCustomer() {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchCustomer() {
    if (!phone.trim() || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const c = await service.getCustomerByPhone(phone);
      console.log('Customer fetched:', c);

      if (c == null) {
        alert('No customer found with this phone number');
        setCustomer(null);
        return;
      }

      const customerData: Customer = {
        phone: c.phone,
        name: c.name,
      };

      setCustomer(customerData);
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Error fetching customer. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Search Customer</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter phone number"
          className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && fetchCustomer()}
        />
        <button
          className="btn btn-primary px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={fetchCustomer}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {customer && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Customer Details</h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong className="font-medium">Name:</strong> {customer.name}
            </p>
            <p className="text-gray-700">
              <strong className="font-medium">Phone:</strong> {customer.phone}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
