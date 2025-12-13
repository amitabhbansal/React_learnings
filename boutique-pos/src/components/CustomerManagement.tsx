import { useState } from 'react';
import service from '../appwrite/config';
import type { Customer } from '../types';

const CustomerManagement = () => {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Form state for creating customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setNewCustomer({
      name: '',
      phone: '',
    });
  };

  const fetchCustomer = async () => {
    if (!phone.trim() || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setSearchLoading(true);
    try {
      const c = await service.getCustomerByPhone(phone);
      console.log('Customer fetched:', c);

      if (c == null) {
        alert('No customer found with this phone number');
        setCustomer(null);
      } else {
        const customerData: Customer = {
          phone: c.phone,
          name: c.name,
        };
        setCustomer(customerData);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      alert('Error fetching customer. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const createCustomer = async () => {
    // Validation
    if (!newCustomer.name.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!/^\d{10}$/.test(newCustomer.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setCreateLoading(true);
    try {
      // Check if phone exists
      const exists = await service.getCustomerByPhone(newCustomer.phone);
      if (exists) {
        alert(`Phone number already registered with name: ${exists.name}`);
        return;
      }

      // Create customer
      await service.createCustomer(newCustomer);
      alert(`Customer ${newCustomer.name} created successfully!`);
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-6 bg-base-200 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <button
          className="btn btn-success btn-sm gap-2"
          onClick={() => setShowCreateForm(!showCreateForm)}
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
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Add New Customer
            </>
          )}
        </button>
      </div>

      {/* Create Customer Form */}
      {showCreateForm && (
        <div className="mb-6 p-6 bg-base-300 rounded-lg border-2 border-success shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-success"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Create New Customer
          </h3>

          <div className="space-y-4">
            {/* Customer Name */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  Customer Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., John Doe"
                className="input input-bordered w-full"
                value={newCustomer.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Phone Number */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">
                  Phone Number <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="10-digit phone number"
                className="input input-bordered w-full"
                value={newCustomer.phone}
                onChange={handleInputChange}
                maxLength={10}
              />
              <label className="label">
                <span className="label-text-alt">Must be exactly 10 digits</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                className="btn btn-success gap-2"
                onClick={createCustomer}
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
                    Create Customer
                  </>
                )}
              </button>
              <button className="btn btn-ghost gap-2" onClick={resetForm} disabled={createLoading}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Customer Section */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Search Customer</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter 10-digit phone number..."
            className="input input-bordered flex-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchCustomer()}
            disabled={createLoading}
            maxLength={10}
          />
          <button
            className="btn btn-primary gap-2"
            onClick={fetchCustomer}
            disabled={searchLoading || createLoading}
          >
            {searchLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Searching...
              </>
            ) : (
              <>
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </>
            )}
          </button>
        </div>
      </div>

      {/* Display Customer Details */}
      {customer && (
        <div className="mt-6 p-6 bg-base-300 rounded-lg border border-success shadow">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Name</span>
              </label>
              <div className="p-3 bg-base-100 rounded border border-base-content/20">
                {customer.name}
              </div>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Phone Number</span>
              </label>
              <div className="p-3 bg-base-100 rounded border border-base-content/20">
                {customer.phone}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
