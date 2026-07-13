import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import {
  MapPinIcon, UserIcon, ArrowTrendingUpIcon, WalletIcon, UserGroupIcon,
  UserPlusIcon, PhoneIcon, BanknotesIcon, TruckIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api'; // Import the central API instance

// Mapping of backend keys to frontend labels and icons
const statMap = {
  userCount: { title: 'Total Users', icon: <UserGroupIcon className="h-8 w-8"/>, value: 0 },
  driverCount: { title: 'Total Drivers', icon: <TruckIcon className="h-8 w-8"/>, value: 0 },
  activeDrivers: { title: 'On Trip Drivers', icon: <TruckIcon className="h-8 w-8 text-green-500"/>, value: 0 },
  pendingDrivers: { title: 'Pending Drivers', icon: <UserPlusIcon className="h-8 w-8"/>, value: 0 },
  suspendedDrivers: { title: 'Reject/Suspend', icon: <UserIcon className="h-8 w-8 text-red-500"/>, value: 0 },
  ongoingBookings: { title: 'Ongoing Trips', icon: <MapPinIcon className="h-8 w-8"/>, value: 0 },
  completedBookings: { title: 'Total Trips', icon: <MapPinIcon className="h-8 w-8"/>, value: 0 },
  // Add other stats you want to display
  totalEarnings: { title: 'Monthly Earnings', icon: <WalletIcon className="h-8 w-8"/>, value: '₹0' },
  todayEarnings: { title: 'Today\'s Earnings', icon: <BanknotesIcon className="h-8 w-8"/>, value: '₹0' },
};

const Dashboard = () => {
  const [stats, setStats] = useState(statMap);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/admin/dashboard/stats');
        const data = response.data;

        // Map fetched data to our statMap
        setStats(prevStats => ({
          userCount: { ...prevStats.userCount, value: data.userCount || 0 },
          driverCount: { ...prevStats.driverCount, value: data.driverCount || 0 },
          activeDrivers: { ...prevStats.activeDrivers, value: data.activeDrivers || 0 },
          pendingDrivers: { ...prevStats.pendingDrivers, value: data.pendingDrivers || 0 },
          suspendedDrivers: { ...prevStats.suspendedDrivers, value: data.suspendedDrivers || 0 },
          ongoingBookings: { ...prevStats.ongoingBookings, value: data.ongoingBookings || 0 },
          completedBookings: { ...prevStats.completedBookings, value: data.completedBookings || 0 },
          // Add mappings for earnings once your backend provides them
          totalEarnings: { ...prevStats.totalEarnings, value: '₹1,35,200' }, // Placeholder
          todayEarnings: { ...prevStats.todayEarnings, value: '₹1,500' }, // Placeholder
        }));

      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard statistics.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Convert the stats object into an array for rendering
  const dashboardStats = Object.values(stats);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <StatCard 
            key={index} 
            title={stat.title} 
            value={stat.value} 
            icon={stat.icon}
            isLoading={isLoading} // Pass loading state to StatCard
          />
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <p className="mt-2 text-gray-600">Activity sections like recent user signups or latest trip completions can go here.</p>
      </div>
    </div>
  );
};

export default Dashboard;