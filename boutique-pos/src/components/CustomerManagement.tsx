import { useState } from 'react';
import toast from 'react-hot-toast';
import service from '../appwrite/config';
import type { Customer } from '../types';

const CustomerManagement = () => {
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [createError, setCreateError] = useState('');

  // Form state for creating customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
    setCreateError(''); // Clear error when user types
  };

  const resetForm = () => {
    setNewCustomer({
      name: '',
      phone: '',
    });
    setCreateError(''); // Clear error when reset
  };

  const fetchCustomer = async () => {
    setSearchError('');
    setCustomer(null);
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone)) {
      setSearchError('Please enter a valid Indian mobile number');
      return;
    }

    setSearchLoading(true);
    setCustomer(null);
    try {
      const c = await service.getCustomerByPhone(phone);
      console.log('Customer fetched:', c);

      if (c == null) {
        setSearchError('No customer found with this phone number');
        toast.error('No customer found with this phone number');
      } else {
        const customerData: Customer = {
          phone: c.phone,
          name: c.name,
        };
        setCustomer(customerData);
        toast.success('Customer found!');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      setSearchError('Error fetching customer. Please try again.');
      toast.error('Error fetching customer. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const createCustomer = async () => {
    setCreateError('');
    // Validation
    if (!newCustomer.name.trim()) {
      setCreateError('Please enter a name');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(newCustomer.phone)) {
      setCreateError('Please enter a valid Indian mobile number');
      return;
    }

    setCreateLoading(true);
    try {
      // Check if phone exists
      const exists = await service.getCustomerByPhone(newCustomer.phone);
      if (exists) {
        setCreateError(`Phone number already registered with name: ${exists.name}`);
        toast.error(`Phone number already registered with name: ${exists.name}`);
        return;
      }

      // Create customer
      await service.createCustomer(newCustomer);
      toast.success(`Customer ${newCustomer.name} created successfully!`);
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating customer:', error);
      setCreateError('Failed to create customer. Please try again.');
      toast.error('Failed to create customer. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-amber-50 rounded-3xl shadow-2xl border-2 border-boutique-secondary/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 p-6 border-b-2 border-boutique-secondary shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-boutique-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                Customer Management
              </h2>
              <p className="text-amber-100 text-sm font-light drop-shadow">
                Search and manage your valued customers
              </p>
            </div>
          </div>
          <button
            className={`btn btn-sm gap-2 transition-all duration-300 shadow-lg ${
              showCreateForm
                ? 'bg-white/90 text-boutique-primary hover:bg-white border-white/50'
                : 'bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none font-bold'
            }`}
            onClick={() => {
              if (showCreateForm) {
                // Reset form and errors when closing
                resetForm();
                setCreateError('');
              }
              setShowCreateForm(!showCreateForm);
            }}
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
      </div>

      {/* Content Section */}
      <div className="p-6 bg-gradient-to-br from-amber-50 via-slate-50 to-purple-50">
        {/* Create Customer Form */}
        {showCreateForm && (
          <div className="mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-boutique-secondary/40 shadow-xl">
            <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2 text-boutique-primary">
              <div className="w-8 h-8 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-boutique-dark"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              Create New Customer
            </h3>

            <div className="space-y-4">
              {/* Customer Name */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-boutique-dark">
                    Customer Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., John Doe"
                  className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                  value={newCustomer.name}
                  onChange={handleInputChange}
                />
                {createError && !newCustomer.name.trim() && createError.includes('name') && (
                  <div className="text-error text-xs flex items-center gap-1 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{createError}</span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-boutique-dark">
                    Phone Number <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="10-digit phone number"
                  className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                  value={newCustomer.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                />
                {createError &&
                  (createError.includes('phone') || createError.includes('registered')) && (
                    <div className="text-error text-xs flex items-center gap-1 mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{createError}</span>
                    </div>
                  )}
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
                <button
                  className="btn btn-ghost gap-2"
                  onClick={resetForm}
                  disabled={createLoading}
                >
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
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-boutique-accent/30">
          <h3 className="text-lg font-serif font-semibold mb-4 text-boutique-primary flex items-center gap-2">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search Customer
          </h3>

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                className="input input-bordered w-full bg-white text-boutique-dark border-2 border-boutique-accent/40 focus:border-boutique-secondary focus:outline-none transition-all"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setSearchError(''); // Clear error when user types
                }}
                onKeyPress={(e) => e.key === 'Enter' && fetchCustomer()}
                disabled={createLoading}
                maxLength={10}
              />
              {searchError && (
                <div className="text-error text-xs flex items-center gap-1 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{searchError}</span>
                </div>
              )}
            </div>
            <button
              className="btn bg-gradient-to-r from-boutique-secondary to-amber-400 hover:from-amber-400 hover:to-boutique-secondary text-boutique-dark border-none shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-semibold gap-2"
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
          <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-boutique-accent/30 shadow-lg">
            <h3 className="text-lg font-serif font-semibold mb-4 flex items-center gap-2 text-boutique-primary">
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-boutique-primary">Name</span>
                </label>
                <div className="p-3 bg-white rounded-lg border-2 border-boutique-accent/20 font-medium text-boutique-dark shadow-sm">
                  {customer.name}
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-boutique-primary">
                    Phone Number
                  </span>
                </label>
                <div className="p-3 bg-white rounded-lg border-2 border-boutique-accent/20 font-medium text-boutique-dark shadow-sm">
                  {customer.phone}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
