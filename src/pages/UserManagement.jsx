import {
  ArrowLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import api from '../utils/api'; // Import the central API instance

// Import libraries for exporting
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// --- SUB-COMPONENT: Unified View/Edit Screen for Users ---
const ManageUserDetails = ({ user, onBack }) => {
  // eslint-disable-next-line no-unused-vars
  const [isActive, setIsActive] = useState(user.isActive);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async newStatus => {
    setIsLoading(true);
    try {
      await api.put(`/admin/dashboard/users/${user.userId}/status`, { isActive: newStatus });
      alert(`User has been ${newStatus ? 're-activated' : 'suspended'}.`);
      onBack(); // Go back to the list
    } catch (err) {
      console.error(err);
      alert('Failed to update user status.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">Manage User Details</h1>
      </div>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-base text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-base text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Phone Number</label>
              <p className="mt-1 text-base text-gray-900">{user.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p
                className={`mt-1 text-base font-semibold ${
                  isActive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isActive ? 'Active' : 'Suspended'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          {isActive ? (
            <button
              onClick={() => handleUpdateStatus(false)}
              disabled={isLoading}
              className="rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
            >
              {isLoading ? 'Suspending...' : 'Suspend User'}
            </button>
          ) : (
            <button
              onClick={() => handleUpdateStatus(true)}
              disabled={isLoading}
              className="rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Re-Activate User' : 'Re-Activate User'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Main User List with Filters, Table, and Pagination ---
const UserList = ({
  users,
  pagination,
  onFilterChange,
  onPageChange,
  onViewUser,
  onDownload,
  stats,
}) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // eslint-disable-next-line no-unused-vars
  const handleApplyFilters = () => {
    onFilterChange({ search: searchQuery, status: selectedStatus });
  };

  const getStatusClass = status => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">Active Users</p>
          <p className="text-2xl font-bold">{stats.activeUsers}</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">Inactive Users</p>
          <p className="text-2xl font-bold">{stats.inactiveUsers}</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">New This Month</p>
          <p className="text-2xl font-bold">{stats.newThisMonth}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-auto flex-grow">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by Name or Email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-md border-gray-300 pl-10 py-2.5"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full md:w-auto rounded-md border-gray-300 py-2.5 shadow-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {/* Add an Apply Filters button if you want to filter on button click */}
          {/* <button onClick={handleApplyFilters} className="rounded-md bg-blue-800 px-6 py-2 text-sm font-semibold text-white">Apply</button> */}
          <div className="relative ml-auto">
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="flex items-center gap-2 rounded-md bg-blue-800 text-white hover:bg-blue-700 px-4 py-2 text-sm font-semibold shadow-sm"
            >
              Download <ChevronDownIcon className="h-4 w-4" />
            </button>
            {isDownloadOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg z-10 ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <a
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      onDownload('csv');
                      setIsDownloadOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Download as CSV
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                {[
                  'Name',
                  'Phone Number',
                  'Email',
                  'Status',
                  'Total trip',
                  'Cancel Trip',
                  'Actions',
                ].map(h => (
                  <th key={h} className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user._id}>
                    <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {user.phone}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${getStatusClass(
                          user.isActive,
                        )}`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {user.totalTrips || 0}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {user.cancelTrips || 0}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm">
                      <button
                        onClick={() => onViewUser(user)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No users match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {users.length > 0 ? (pagination.currentPage - 1) * 10 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-medium">{(pagination.currentPage - 1) * 10 + users.length}</span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(pagination.totalPages).keys()].map(num => (
              <button
                key={num}
                onClick={() => onPageChange(num + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  pagination.currentPage === num + 1
                    ? 'z-10 bg-indigo-500 text-white'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                }`}
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={
                pagination.currentPage === pagination.totalPages || pagination.totalPages === 0
              }
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// --- MAIN CONTROLLER COMPONENT ---
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    newThisMonth: 0,
  });

  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ page: 1 }); // Add search/status filters here

  const refetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/users/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = { page: filters.page, limit: 10 };
        const response = await api.get('/admin/dashboard/users', { params });

        setUsers(response.data.users || []);

        // console.log('USERs ==> ', response.data.users);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total,
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch users.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [filters]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard/users/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Stats error:', err);
      }
    };

    fetchStats();
  }, []);

  const handleViewUser = async user => {
    // Fetch full details in case the list view is partial
    try {
      const response = await api.get(`/admin/dashboard/users/${user._id}`);
      setSelectedUser(response.data.user);
      setCurrentView('manage');
    } catch (err) {
      console.error('error in usermanagement', err);
      alert('Failed to fetch user details.');
    }
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setCurrentView('list');

    // Refresh list
    setFilters(prev => ({ ...prev, page: 1, timestamp: Date.now() }));

    // Refresh stats
    refetchStats();
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = newFilters => {
    setFilters({
      ...filters,
      status: newFilters.status, // Add filters as backend supports them
      search: newFilters.search,
      page: 1,
    });
  };

  const handleDownload = format => {
    const dataToExport = users.map(u => ({
      Name: u.name,
      Phone: u.phone,
      Email: u.email,
      Status: u.isActive ? 'Active' : 'Inactive',
      TotalTrips: u.totalTrips || 0,
      CancelledTrips: u.cancelTrips || 0,
    }));
    if (format === 'csv') {
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'users.csv');
      link.click();
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      XLSX.writeFile(workbook, 'users.xlsx');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.autoTable({
        head: [Object.keys(dataToExport[0])],
        body: dataToExport.map(Object.values),
      });
      doc.save('users.pdf');
    }
  };

  if (isLoading && !users.length) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (currentView === 'manage') {
    return <ManageUserDetails user={selectedUser} onBack={handleBackToList} />;
  }

  return (
    <UserList
      users={users}
      pagination={pagination}
      onFilterChange={handleFilterChange}
      onPageChange={handlePageChange}
      onViewUser={handleViewUser}
      onDownload={handleDownload}
      stats={stats}
    />
  );
};

export default UserManagement;
