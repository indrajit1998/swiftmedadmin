import { useEffect, useState } from 'react';
import api from '../utils/api';

const PricingConfig = () => {
  const [formData, setFormData] = useState({
    defaultPerKmRate: 10,
    gstPercentage: 5,
    tdsPercentage: 1,
    fallbackMultiplier: 1.0,
    includedDistanceKm: 12,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/admin/pricing-config');
        if (response.data.data) {
          setFormData({
            defaultPerKmRate: response.data.data.defaultPerKmRate,
            gstPercentage: response.data.data.gstPercentage,
            tdsPercentage: response.data.data.tdsPercentage,
            fallbackMultiplier: response.data.data.fallbackMultiplier,
            includedDistanceKm: response.data.data.includedDistanceKm,
          });
        }
      } catch (err) {
        console.error(err);
        alert('Failed to fetch pricing configuration');
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put('/admin/pricing-config', formData);
      alert('Global pricing configuration updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Global Pricing Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Control the default rates and tax percentages applied across the system.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Per KM Rate (₹)
              </label>
              <input
                type="number"
                required
                value={formData.defaultPerKmRate}
                onChange={e =>
                  setFormData({ ...formData, defaultPerKmRate: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GST Percentage (%)</label>
              <input
                type="number"
                required
                value={formData.gstPercentage}
                onChange={e =>
                  setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">TDS Percentage (%)</label>
              <input
                type="number"
                required
                value={formData.tdsPercentage}
                onChange={e =>
                  setFormData({ ...formData, tdsPercentage: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Applied to driver payout calculation.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fallback Zone Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.fallbackMultiplier}
                onChange={e =>
                  setFormData({ ...formData, fallbackMultiplier: parseFloat(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Used when no other zone matches.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Included Distance (KM)
              </label>
              <input
                type="number"
                required
                value={formData.includedDistanceKm}
                onChange={e =>
                  setFormData({
                    ...formData,
                    includedDistanceKm: parseFloat(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Base fare will cover this many kilometers before per-km charges apply.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PricingConfig;
