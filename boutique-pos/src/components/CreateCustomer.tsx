import { useState } from 'react';
import type { Customer } from '../types';
import service from '../appwrite/config';

const CreateCustomer = () => {
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!customer.name.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!/^\d{10}$/.test(customer.phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      // Check if phone exists
      const exists = await service.getCustomerByPhone(customer.phone);
      if (exists) {
        alert(`Phone number already registered with name: ${exists.name}`);
        return;
      }

      // Create customer
      await service.createCustomer(customer);
      alert(`Customer ${customer.name} created successfully!`);
      setCustomer({ name: '', phone: '' });
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="p-6 bg-dark rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-black">Name</legend>
            <input
              type="text"
              value={customer?.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="input"
              placeholder="Type here"
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-black">Contact Number</legend>
            <input
              type="text"
              value={customer?.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="input"
              placeholder="Type here"
            />
          </fieldset>
          <button
            className="bg-black text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateCustomer;
