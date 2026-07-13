import { ArrowLeftIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import api from '../utils/api';

const AmbulanceTypeForm = ({ type, onBack, onSuccess }) => {
  const [formData, setFormData] = useState(
    type || {
      typeId: '',
      name: '',
      displayName: '',
      description: '',
      baseFare: 0,
      perKmRate: '',
      includedDistanceKm: '',
      distanceMultiplier: 1.0,
      sortOrder: 0,
      isActive: true,
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (type?._id) {
        await api.put(`/admin/ambulance-types/${type._id}`, formData);
        alert('Ambulance type updated successfully');
      } else {
        await api.post('/admin/ambulance-types', formData);
        alert('Ambulance type created successfully');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save ambulance type');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">
          {type ? 'Edit' : 'Add'} Ambulance Type
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type ID (Numeric Key)
              </label>
              <input
                type="text"
                required
                disabled={!!type}
                value={formData.typeId}
                onChange={e => setFormData({ ...formData, typeId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name (Internal)</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. basic"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. Basic Ambulance"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
               focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Short explanation shown to users (e.g. Best for emergency transport with basic facilities)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Base Fare (₹)</label>
              <input
                type="number"
                required
                value={formData.baseFare}
                onChange={e => setFormData({ ...formData, baseFare: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Per KM Rate (₹) – Optional Override
              </label>
              <input
                type="number"
                // required
                value={formData.perKmRate}
                onChange={e => setFormData({ ...formData, perKmRate: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to use global per km rate.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Included Distance (KM) – Optional
              </label>
              <input
                type="number"
                value={formData.includedDistanceKm}
                onChange={e =>
                  setFormData({
                    ...formData,
                    includedDistanceKm:
                      e.target.value === '' ? undefined : parseFloat(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Leave empty to use global default"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Distance Multiplier</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.distanceMultiplier}
                onChange={e =>
                  setFormData({ ...formData, distanceMultiplier: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                required
                value={formData.sortOrder}
                onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Is Active
              </label>
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

const AmbulanceManagement = () => {
  const [ambulanceTypes, setAmbulanceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list');
  const [selectedType, setSelectedType] = useState(null);

  const fetchAmbulanceTypes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/ambulance-types');
      setAmbulanceTypes(response.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch ambulance types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulanceTypes();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this ambulance type?')) return;
    try {
      await api.delete(`/admin/ambulance-types/${id}`);
      alert('Deleted successfully');
      fetchAmbulanceTypes();
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  if (currentView === 'form') {
    return (
      <AmbulanceTypeForm
        type={selectedType}
        onBack={() => {
          setCurrentView('list');
          setSelectedType(null);
        }}
        onSuccess={() => {
          setCurrentView('list');
          setSelectedType(null);
          fetchAmbulanceTypes();
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ambulance Types</h1>
        <button
          onClick={() => {
            setSelectedType(null);
            setCurrentView('form');
          }}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Type
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                'ID',
                'Display Name',
                'Description',
                'Base Fare',
                'Included KM',
                'Per KM',
                'Multiplier',
                'Order',
                'Status',
                'Actions',
              ].map(h => (
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
                <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : ambulanceTypes.length > 0 ? (
              ambulanceTypes.map(type => (
                <tr key={type._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {type.typeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{type.baseFare}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {type.includedDistanceKm ?? 'Global'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{type.perKmRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.distanceMultiplier}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {type.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                        type.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelectedType(type);
                          setCurrentView('form');
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(type._id)}
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
                <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                  No ambulance types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmbulanceManagement;
