import {
  ArrowLeftIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import api from '../utils/api';

const AddOnForm = ({ addOn, zones, onBack, onSuccess }) => {
  const [formData, setFormData] = useState(
    addOn || {
      title: '',
      description: '',
      price: 0,
      type: 'service',
      isActive: true,
      zonePriceOverrides: [],
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (addOn?._id) {
        await api.put(`/admin/addons/${addOn._id}`, formData);
        alert('Add-on updated successfully');
      } else {
        await api.post('/admin/addons', formData);
        alert('Add-on created successfully');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save add-on');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOverride = () => {
    setFormData({
      ...formData,
      zonePriceOverrides: [...formData.zonePriceOverrides, { zoneId: '', price: 0 }],
    });
  };

  const handleRemoveOverride = (index) => {
    const newOverrides = [...formData.zonePriceOverrides];
    newOverrides.splice(index, 1);
    setFormData({ ...formData, zonePriceOverrides: newOverrides });
  };

  const handleOverrideChange = (index, field, value) => {
    const newOverrides = [...formData.zonePriceOverrides];
    newOverrides[index][field] = value;
    setFormData({ ...formData, zonePriceOverrides: newOverrides });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">
          {addOn ? 'Edit' : 'Add'} Add-On
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. Oxygen Cylinder"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Base Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="service">Service (Fixed)</option>
                <option value="person">Person (Qty based)</option>
                <option value="ac">AC</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Is Active
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Zone Price Overrides</h3>
              <button
                type="button"
                onClick={handleAddOverride}
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <PlusIcon className="h-4 w-4" /> Add Override
              </button>
            </div>
            <div className="space-y-4">
              {formData.zonePriceOverrides.map((override, index) => (
                <div key={index} className="flex gap-4 items-end bg-gray-50 p-3 rounded-md">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Zone</label>
                    <select
                      required
                      value={override.zoneId?._id || override.zoneId}
                      onChange={(e) => handleOverrideChange(index, 'zoneId', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Zone</option>
                      {zones.map((z) => (
                        <option key={z._id} value={z._id}>
                          {z.displayName} ({z.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-gray-500 uppercase">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={override.price}
                      onChange={(e) => handleOverrideChange(index, 'price', parseFloat(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOverride(index)}
                    className="p-2 text-red-600 hover:text-red-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {formData.zonePriceOverrides.length === 0 && (
                <p className="text-sm text-gray-500 italic">No overrides added. Default price will be used in all zones.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onBack}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddOnManagement = () => {
  const [addOns, setAddOns] = useState([]);
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list');
  const [selectedAddOn, setSelectedAddOn] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [addonsRes, zonesRes] = await Promise.all([
        api.get('/admin/addons'),
        api.get('/admin/zones'),
      ]);
      setAddOns(addonsRes.data.data || []);
      setZones(zonesRes.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this add-on?')) return;
    try {
      await api.delete(`/admin/addons/${id}`);
      alert('Deleted successfully');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  if (currentView === 'form') {
    return (
      <AddOnForm
        addOn={selectedAddOn}
        zones={zones}
        onBack={() => {
          setCurrentView('list');
          setSelectedAddOn(null);
        }}
        onSuccess={() => {
          setCurrentView('list');
          setSelectedAddOn(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add-Ons Management</h1>
        <button
          onClick={() => {
            setSelectedAddOn(null);
            setCurrentView('form');
          }}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Add-On
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Title', 'Type', 'Base Price', 'Overrides', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : addOns.length > 0 ? (
              addOns.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {item.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{item.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.zonePriceOverrides?.length || 0} zones
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                        item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelectedAddOn(item);
                          setCurrentView('form');
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                  No add-ons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddOnManagement;
