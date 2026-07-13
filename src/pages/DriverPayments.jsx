import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { useAuth } from '../context/AuthContext';

const DriverPayments = () => {
  const { user } = useAuth(); // logged-in admin
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  // 🔹 Map backend → UI format
  const mapBackendDrivers = backendDrivers => {
    console.log('backendDrivers: ', backendDrivers);

    return backendDrivers.map(d => ({
      id: d._id,
      name: d.name || 'Unknown Driver',
      totalRides: d.totalRides || 0,
      email: d.email || '-',
      phone: d.phone || '-',
      earnings: d.earnings || 0,
      addonEarnings: d.addonEarnings || 0,
      cancelledByDriver: d.cancelledByDriver || 0,
      isActive: d.isActive,
    }));
  };

  // 🔥 Fetch driver payouts
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get(`/admin/dashboard/drivers/payments`);

        console.log('RAW BACKEND RESPONSE:', res.data);
        console.log('BACKEND DRIVERS ARRAY:', res.data.drivers);

        const mapped = mapBackendDrivers(res.data.drivers);
        setDrivers(mapped);
      } catch (err) {
        console.error('❌ Driver payment fetch error:', err);
      }
    };

    fetchDrivers();
  }, [user]);

  // 🧮 Stats
  const stats = useMemo(() => {
    const totalDrivers = drivers.length;
    const totalEarnings = drivers.reduce((s, d) => s + d.earnings, 0);
    const totalCancelled = drivers.reduce((s, d) => s + d.cancelledByDriver, 0);
    const totalAddon = drivers.reduce((s, d) => s + d.addonEarnings, 0);
    return { totalDrivers, totalEarnings, totalCancelled, totalAddon };
  }, [drivers]);

  // 🔍 Search + filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter(d => {
      if (statusFilter !== 'All' && d.status !== statusFilter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q)
      );
    });
  }, [drivers, search, statusFilter]);

  const viewDetails = id => navigate(`/payments/drivers/history?id=${id}`);

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Driver Payouts</h2>
          <p className="mt-2 text-sm text-gray-700">Overview of drivers and earnings</p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search driver, ID, email, phone..."
            className="block w-full sm:w-72 rounded-md border px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="block w-full sm:w-44 rounded-md border px-3 py-2 text-sm bg-white"
          >
            <option value="All">All Drivers</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Stat label="Total Drivers" value={stats.totalDrivers} />
        <Stat label="Driver Earnings" value={`₹${stats.totalEarnings.toFixed(2)}`} green />
        <Stat label="Cancelled" value={stats.totalCancelled} yellow />
        <Stat label="Addon Earnings" value={`₹${stats.totalAddon.toFixed(2)}`} />
      </div>

      {/* Table */}
      <div className="mt-8 overflow-x-auto shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-300 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                'S.No',
                'Driver Name',
                'Driver ID',
                'Total Rides',
                'Email',
                'Phone',
                'Earnings',
                'Status',
                'Action',
              ].map(h => (
                <th key={h} className="px-3 py-3.5 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y bg-white">
            {filtered.map((d, idx) => (
              <tr key={d.id}>
                <td className="px-3 py-4">{idx + 1}</td>
                <td className="px-3 py-4">{d.name}</td>
                <td className="px-3 py-4">{d.id}</td>
                <td className="px-3 py-4">{d.totalRides}</td>
                <td className="px-3 py-4">{d.email}</td>
                <td className="px-3 py-4">{d.phone}</td>
                <td className="px-3 py-4">₹{d.earnings.toFixed(2)}</td>
                <td className="px-3 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded font-semibold ${
                      d.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {d.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <button
                    onClick={() => viewDetails(d.id)}
                    className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded hover:bg-indigo-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  No drivers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat = ({ label, value, green, yellow }) => (
  <div className="rounded-lg bg-white p-4 shadow">
    <p className="text-sm text-gray-500">{label}</p>
    <p
      className={`text-2xl font-semibold ${
        green ? 'text-green-700' : yellow ? 'text-yellow-700' : ''
      }`}
    >
      {value}
    </p>
  </div>
);

export default DriverPayments;
