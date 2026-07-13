import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import StatCard from '../components/StatCard';

const ReferralDriverSide = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [referralStats, setReferralStats] = useState({
    totalDriversWithReferrals: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    totalReferralEarnings: 0,
  });
  const [driverReferrals, setDriverReferrals] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalReferred'); // 'totalReferred', 'earnings', 'name'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'pending'

  useEffect(() => {
    fetchReferralData();
  }, []);

  useEffect(() => {
    // Filter and sort drivers based on search and filters
    let filtered = [...driverReferrals];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        driver =>
          driver.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.referralId.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(driver => driver.status === filterStatus);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'totalReferred':
          return b.totalReferred - a.totalReferred;
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        case 'name':
          return a.driverName.localeCompare(b.driverName);
        default:
          return 0;
      }
    });

    setFilteredDrivers(filtered);
  }, [searchTerm, sortBy, filterStatus, driverReferrals]);

  // const fetchReferralData = async () => {
  //   try {
  //     setIsLoading(true);
  //     const mockStats = {
  //       totalDriversWithReferrals: 45,
  //       totalReferrals: 156,
  //       activeReferrals: 128,
  //       totalReferralEarnings: 78500,
  //     };

  //     const mockDriverData = [
  //       {
  //         id: 1,
  //         driverName: 'Rajesh Kumar',
  //         referralId: 'REF001',
  //         totalReferred: 12,
  //         activeReferred: 10,
  //         pendingReferred: 2,
  //         totalEarnings: 6000,
  //         joinedDate: '2024-01-15',
  //         phoneNumber: '+91 98765 43210',
  //         status: 'active',
  //         referrals: [
  //           { name: 'Amit Singh', status: 'active', joinedDate: '2024-02-01', earnings: 500 },
  //           { name: 'Priya Sharma', status: 'active', joinedDate: '2024-02-10', earnings: 500 },
  //         ]
  //       },
  //       {
  //         id: 2,
  //         driverName: 'Suresh Patel',
  //         referralId: 'REF002',
  //         totalReferred: 8,
  //         activeReferred: 7,
  //         pendingReferred: 1,
  //         totalEarnings: 4000,
  //         joinedDate: '2024-02-20',
  //         phoneNumber: '+91 98765 43211',
  //         status: 'active',
  //         referrals: []
  //       },
  //       {
  //         id: 3,
  //         driverName: 'Mohammed Ali',
  //         referralId: 'REF003',
  //         totalReferred: 15,
  //         activeReferred: 13,
  //         pendingReferred: 2,
  //         totalEarnings: 7500,
  //         joinedDate: '2024-01-10',
  //         phoneNumber: '+91 98765 43212',
  //         status: 'active',
  //         referrals: []
  //       },
  //       {
  //         id: 4,
  //         driverName: 'Vijay Singh',
  //         referralId: 'REF004',
  //         totalReferred: 5,
  //         activeReferred: 4,
  //         pendingReferred: 1,
  //         totalEarnings: 2500,
  //         joinedDate: '2024-03-05',
  //         phoneNumber: '+91 98765 43213',
  //         status: 'active',
  //         referrals: []
  //       },
  //       {
  //         id: 5,
  //         driverName: 'Arjun Reddy',
  //         referralId: 'REF005',
  //         totalReferred: 20,
  //         activeReferred: 18,
  //         pendingReferred: 2,
  //         totalEarnings: 10000,
  //         joinedDate: '2023-12-01',
  //         phoneNumber: '+91 98765 43214',
  //         status: 'active',
  //         referrals: []
  //       },
  //     ];

  //     setReferralStats(mockStats);
  //     setDriverReferrals(mockDriverData);
  //     setFilteredDrivers(mockDriverData);

  //     // Uncomment when API is ready:
  //     // setReferralStats(data.stats);
  //     // setDriverReferrals(data.drivers);
  //     // setFilteredDrivers(data.drivers);

  //   } catch (error) {
  //     console.error('Error fetching referral data:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchReferralData = async () => {
    try {
      setIsLoading(true);

      // ---- Fetch Stats ----
      const statsRes = await api.get('/admin/driver-referral/stats');
      const stats = statsRes.data.data || {};

      setReferralStats({
        totalDriversWithReferrals: stats.totalReferrals || 0, // Mapping Total Referred Drivers
        totalReferrals: stats.totalReferrals || 0,
        activeReferrals: stats.successfulReferrals || 0,
        totalReferralEarnings: stats.totalRewardPaid || 0,
      });

      // ---- Fetch Driver Referrals ----
      const listRes = await api.get('/admin/driver-referral/list');
      const listData = listRes.data;

      const normalizedDrivers = (listData.data?.referrals || []).map(d => ({
        id: d.driverId || d._id,
        driverName: d.name, // Fixed: d.name instead of d.driverName
        referralId: d.referral?.referralCode || 'N/A', // Fixed: nested property
        phoneNumber: d.phone,
        joinedDate: d.createdAt,
        status: d.verificationStatus === 'VERIFIED' ? 'active' : 'pending', // Map status

        totalReferred: d.referral?.totalSuccessfulReferrals || 0,
        activeReferred: d.referral?.totalSuccessfulReferrals || 0, // Assumption
        pendingReferred: 0, // No data for this yet
        totalEarnings: d.totalEarnings || 0, // Now fetched from backend!

        referrals: d.referrals || [],
      }));

      setDriverReferrals(normalizedDrivers);
      setFilteredDrivers(normalizedDrivers);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Export to CSV functionality
    const csvContent = [
      [
        'Driver Name',
        'Referral ID',
        'Total Referred',
        'Active',
        'Pending',
        'Total Earnings',
        'Phone',
        'Joined Date',
      ],
      ...filteredDrivers.map(driver => [
        driver.driverName,
        driver.referralId,
        driver.totalReferred,
        driver.activeReferred,
        driver.pendingReferred,
        `₹${driver.totalEarnings}`,
        driver.phoneNumber,
        driver.joinedDate,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referral_drivers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = [
    {
      title: 'Total Drivers with Referrals',
      value: referralStats.totalDriversWithReferrals,
      icon: <UserGroupIcon className="h-8 w-8" />,
    },
    {
      title: 'Total Referrals',
      value: referralStats.totalReferrals,
      icon: <UserPlusIcon className="h-8 w-8" />,
    },
    {
      title: 'Active Referrals',
      value: referralStats.activeReferrals,
      icon: <ChartBarIcon className="h-8 w-8" />,
    },
    {
      title: 'Total Referral Earnings',
      value: `₹${referralStats.totalReferralEarnings.toLocaleString('en-IN')}`,
      icon: <CurrencyDollarIcon className="h-8 w-8" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Referral Driver Side</h2>
        <p className="text-gray-600 mt-1">Comprehensive analytics and driver referral management</p>
      </div>

      {/* Top Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 w-full lg:w-auto">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by driver name or referral ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 w-full lg:w-auto">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="totalReferred">Sort by Total Referred</option>
              <option value="earnings">Sort by Earnings</option>
              <option value="name">Sort by Name</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Driver Referral Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Referred
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                    No drivers found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredDrivers.map(driver => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {driver.driverName.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {driver.driverName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {driver.referralId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-lg font-bold text-indigo-600">
                        {driver.totalReferred}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-green-600">
                        {driver.activeReferred}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm font-semibold text-yellow-600">
                        {driver.pendingReferred}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        ₹{driver.totalEarnings.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(driver.joinedDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                        onClick={() => {
                          // Add view details functionality
                          alert(`View details for ${driver.driverName}`);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredDrivers.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">{filteredDrivers.length}</span> of{' '}
                  <span className="font-medium">{filteredDrivers.length}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {filteredDrivers.slice(0, 5).map((driver, index) => (
              <div
                key={driver.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{driver.driverName}</p>
                    <p className="text-xs text-gray-500">{driver.referralId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{driver.totalReferred} refs</p>
                  <p className="text-xs text-gray-500">
                    ₹{driver.totalEarnings.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700 font-medium">Average Referrals per Driver</span>
              <span className="text-xl font-bold text-green-600">
                {(
                  referralStats.totalReferrals / referralStats.totalDriversWithReferrals || 0
                ).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700 font-medium">Average Earnings per Driver</span>
              <span className="text-xl font-bold text-blue-600">
                ₹
                {Math.round(
                  referralStats.totalReferralEarnings / referralStats.totalDriversWithReferrals ||
                    0,
                ).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700 font-medium">Active Referral Rate</span>
              <span className="text-xl font-bold text-purple-600">
                {(
                  (referralStats.activeReferrals / referralStats.totalReferrals) * 100 || 0
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700 font-medium">Avg Earning per Referral</span>
              <span className="text-xl font-bold text-yellow-600">
                ₹
                {Math.round(
                  referralStats.totalReferralEarnings / referralStats.totalReferrals || 0,
                ).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDriverSide;
