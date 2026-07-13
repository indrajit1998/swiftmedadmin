import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const DriverPaymentHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const driverId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [stats, setStats] = useState({});
  const [rides, setRides] = useState([]);

  useEffect(() => {
    if (!driverId) {
      navigate('/payments/drivers');
      return;
    }

    const fetchData = async () => {
      try {
        // ✅ Updated endpoint to match new backend route
        const res = await api.get(`/admin/dashboard/drivers/payments/${driverId}`);
        setDriver(res.data.driver);
        setStats(res.data.stats);
        setRides(res.data.rides);
      } catch (err) {
        console.error('❌ Failed to fetch driver payment history:', err);
        alert('Failed to load driver payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [driverId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="p-6">
        <p className="text-red-600">Driver not found</p>
        <button
          onClick={() => navigate('/payments/drivers')}
          className="mt-4 text-indigo-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/payments/drivers')}
          className="text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Payment History</h1>
          <p className="text-sm text-gray-600 mt-1">
            {driver.name} ({driver.driverId})
          </p>
        </div>
      </div>

      {/* Driver Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Driver Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{driver.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{driver.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{driver.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Rides" value={stats.totalRides} />
        <StatCard label="Total Earnings" value={`₹${stats.totalEarnings?.toFixed(2)}`} green />
        <StatCard label="Addon Earnings" value={`₹${stats.addonEarnings?.toFixed(2)}`} />
      </div>

      {/* Rides Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['S.No', 'Date', 'User', 'From', 'To', 'Distance', 'Fare', 'Payment'].map(h => (
                  <th key={h} className="px-3 py-3.5 text-left font-semibold text-gray-900">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {rides.length > 0 ? (
                rides.map((ride, idx) => (
                  <tr key={ride._id}>
                    <td className="px-3 py-4">{idx + 1}</td>
                    <td className="px-3 py-4">
                      {new Date(ride.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-3 py-4">{ride.user?.name || 'Unknown'}</td>
                    <td className="px-3 py-4">{ride.pickup}</td>
                    <td className="px-3 py-4">{ride.destination}</td>
                    <td className="px-3 py-4">
                      {ride.distance ? `${(ride.distance / 1000).toFixed(2)} km` : 'N/A'}
                    </td>
                    <td className="px-3 py-4">₹{ride.fare?.toFixed(2)}</td>
                    <td className="px-3 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded font-semibold ${
                          ride.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {ride.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No completed rides yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, green }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-2xl font-semibold ${green ? 'text-green-700' : ''}`}>{value}</p>
  </div>
);

export default DriverPaymentHistory;
