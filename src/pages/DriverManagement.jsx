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

// FIX: This now imports your new, separate file
import DocumentVerification from './DocumentVerification';

// --- SUB-COMPONENT: View Only Details for Active Drivers (UPDATED) ---
const ViewDriverDetails = ({ driver, onBack }) => {
  const displayValue = value => value || 'N/A';

  // Helper to format dates
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">View Driver Details</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">
              Personal Information
            </h2>
            <dl className="divide-y divide-gray-200 mt-4">
              <DataRow label="Name" value={displayValue(driver.name)} />
              <DataRow label="Phone Number" value={displayValue(driver.phone)} />
              <DataRow label="Alternative Phone" value={displayValue(driver.alternativePhone)} />
              <DataRow label="Email" value={displayValue(driver.email)} />
              <DataRow label="Experience" value={`${displayValue(driver.experience)} Years`} />
              <DataRow label="Speaking Skills" value={displayValue(driver.speakingSkills)} />
            </dl>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Address</h2>
            <dl className="divide-y divide-gray-200 mt-4">
              <DataRow
                label="House / Building No."
                value={displayValue(driver.address?.houseOrBuildingNo)}
              />
              <DataRow
                label="Road / Area / Colony"
                value={displayValue(driver.address?.roadOrAreaOrColony)}
              />
              <DataRow label="City / Village" value={displayValue(driver.address?.cityOrVillage)} />
              <DataRow label="Pincode" value={displayValue(driver.address?.pincode)} />
            </dl>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Bank Details</h2>
            <dl className="mt-4 space-y-2">
              <DataRowSm
                label="Account Holder"
                value={displayValue(driver.bankDetails?.accountHolderName)}
              />
              <DataRowSm
                label="Account Number"
                value={displayValue(driver.bankDetails?.accountNumber)}
              />
              <DataRowSm label="Bank Name" value={displayValue(driver.bankDetails?.bankName)} />
              <DataRowSm label="IFSC Code" value={displayValue(driver.bankDetails?.ifscCode)} />
            </dl>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">
              Vehicle & Documents
            </h2>
            <dl className="mt-4 space-y-2">
              <DataRowSm
                label="Vehicle Registration"
                value={displayValue(driver.vehicleDetails?.registrationNumber)}
              />
              <DataRowSm
                label="Registration Valid Upto"
                value={formatDate(driver.vehicleDetails?.validUpto)}
              />
              <DataRowSm
                label="Insurance Number"
                value={displayValue(driver.insuranceDetails?.insuranceNumber)}
              />
              <DataRowSm
                label="Insurance Valid Upto"
                value={formatDate(driver.insuranceDetails?.validUpTo)}
              />
              <DataRowSm
                label="License Number"
                value={displayValue(driver.drivingLicenseFile?.licenseNumber)}
              />
              <DataRowSm
                label="PAN/Aadhaar Number"
                value={displayValue(driver.panAadharDetails?.panAadhaarNumber)}
              />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components for the ViewDriverDetails
const DataRow = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value}</dd>
  </div>
);
const DataRowSm = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900">{value}</dd>
  </div>
);
// --- SUB-COMPONENT: Editable View for VERIFIED but Inactive/Suspended Drivers ---
const ManageDriver = ({ driver, onBack }) => {
  const [isActive] = useState(driver.isActive); // Track initial state (read-only in UI)
  const [isLoading, setIsLoading] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState(driver.deactivationReason || '');
  const [showReasonInput, setShowReasonInput] = useState(false);

  // ✅ Uber-style deactivation reasons
  const deactivationReasons = [
    'Low Rating (Below 4.0)',
    'Multiple Customer Complaints',
    'Fraudulent Activity',
    'Expired Documents',
    'Vehicle Safety Issues',
    'Policy Violation',
    'Failed Background Check',
    'Driver Request',
    'Other',
  ];

  const handleUpdateStatus = async newStatus => {
    if (!newStatus && !deactivationReason) {
      alert('Please select a deactivation reason.');
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/admin/dashboard/drivers/${driver.driverId}/status`, {
        isActive: newStatus,
        deactivationReason: !newStatus ? deactivationReason : null,
      });
      alert(`Driver has been ${newStatus ? 're-activated' : 'deactivated'}.`);
      onBack();
    } catch (err) {
      console.error(err);
      alert('Failed to update driver status.');
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
        <h1 className="text-2xl font-bold text-gray-900 ml-4">Manage Driver Status</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Driver: {driver.name}</h2>

        <div className="mt-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              Verification Status:{' '}
              <span className="font-semibold text-gray-900">{driver.verificationStatus}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Current Status:{' '}
              <span
                className={`font-semibold ${driver.isActive ? 'text-green-600' : 'text-red-600'}`}
              >
                {driver.isActive ? 'Active' : 'Deactivated'}
              </span>
            </p>
            {driver.deactivationReason && (
              <p className="text-sm text-gray-600 mt-1">
                Reason:{' '}
                <span className="font-semibold text-gray-900">{driver.deactivationReason}</span>
              </p>
            )}
          </div>

          {/* ✅ Warning for expired documents */}
          {checkExpiredDocuments(driver) && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">⚠️</div>
                <div className="ml-3">
                  <p className="text-sm text-orange-700 font-semibold">
                    Expired Documents Detected
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    This driver has expired license, insurance, or RC. Update documents before
                    reactivating.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 pt-6 mt-6 border-t">
          {isActive ? (
            <div>
              <button
                onClick={() => setShowReasonInput(!showReasonInput)}
                className="w-full rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                Deactivate Driver
              </button>

              {showReasonInput && (
                <div className="mt-4 space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Deactivation Reason *
                  </label>
                  <select
                    value={deactivationReason}
                    onChange={e => setDeactivationReason(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select reason...</option>
                    {deactivationReasons.map(reason => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleUpdateStatus(false)}
                    disabled={isLoading || !deactivationReason}
                    className="w-full rounded-md bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Deactivating...' : 'Confirm Deactivation'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleUpdateStatus(true)}
              disabled={isLoading || checkExpiredDocuments(driver)}
              className="w-full rounded-md bg-green-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Activating...' : 'Re-Activate Driver'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to check expired documents (needed by ManageDriver)
const checkExpiredDocuments = driver => {
  const today = new Date();

  if (driver.drivingLicenseFile?.validUpto) {
    const licenseExpiry = new Date(driver.drivingLicenseFile.validUpto);
    if (licenseExpiry < today) return true;
  }

  if (driver.insuranceDetails?.validUpTo) {
    const insuranceExpiry = new Date(driver.insuranceDetails.validUpTo);
    if (insuranceExpiry < today) return true;
  }

  if (driver.vehicleDetails?.validUpto) {
    const rcExpiry = new Date(driver.vehicleDetails.validUpto);
    if (rcExpiry < today) return true;
  }

  return false;
};

// --- SUB-COMPONENT: Main Driver List with Filters, Table, and Pagination ---
const DriverList = ({
  stats,
  drivers,
  pagination,
  onFilterChange,
  onPageChange,
  onViewDriver,
  onDownload,
}) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    experience: 'All',
  });

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };
  const getDriverStatus = driver => {
    if (driver.verificationStatus === 'PENDING')
      return { text: 'Pending', class: 'bg-red-100 text-red-800' };
    if (driver.verificationStatus === 'REJECTED')
      return { text: 'Rejected', class: 'bg-red-100 text-red-800' };
    // This line is now fixed. It shows "Suspended" (or "Inactive")
    if (driver.verificationStatus === 'VERIFIED' && !driver.isActive)
      return { text: 'Suspended', class: 'bg-yellow-100 text-yellow-800' };
    if (driver.verificationStatus === 'VERIFIED' && driver.isActive)
      return { text: 'Active', class: 'bg-green-100 text-green-800' };
    return { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  // Removed unused getCategoryClass - categories disabled in filters

  const displayStat = value => (value !== undefined ? value : '...');

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center mb-8">
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Driver</p>
          <p className="text-2xl font-bold">{displayStat(stats.driverCount)}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">On Trip Driver</p>
          <p className="text-2xl font-bold">{displayStat(stats.onTripDrivers)}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">Off Trip</p>
          <p className="text-2xl font-bold">{displayStat(stats.offTripDrivers)}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-sm">Pending Drivers</p>
          <p className="text-2xl font-bold">{displayStat(stats.pendingDrivers)}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow sm:col-span-2 md:col-span-1">
          <p className="text-gray-600 text-sm">Reject/Suspend</p>
          <p className="text-2xl font-bold">{displayStat(stats.suspendedDrivers)}</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-auto flex-grow">
            <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="search"
              placeholder="Search by Name, Email, or Phone..."
              value={localFilters.search}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 pl-10 py-2.5"
            />
          </div>
          <select
            name="category"
            disabled
            className="w-full md:w-auto rounded-md border-gray-300 shadow-sm bg-gray-100 py-2.5"
          >
            <option value="All">All Categories</option>
          </select>

          <select
            name="status"
            value={localFilters.status}
            onChange={handleFilterChange}
            className="w-full md:w-auto rounded-md border-gray-300 shadow-sm py-2.5"
          >
            <option value="All">All Status</option>
            <option value="verified">Active (Verified)</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            name="experience"
            disabled
            className="w-full md:w-auto rounded-md border-gray-300 shadow-sm bg-gray-100 py-2.5"
          >
            <option value="All">Experience Level</option>
          </select>
          <button
            onClick={handleApplyFilters}
            className="w-full md:w-auto rounded-md bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
              >
                CSV <ChevronDownIcon className="h-4 w-4" />
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
            <button
              onClick={() => onDownload('csv')}
              className="rounded-md bg-blue-800 px-6 py-2 text-sm font-semibold text-white"
            >
              Download
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                {[
                  'Name',
                  'License',
                  'Email',
                  'Experience',
                  'Status',
                  'Total Trip',
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
              {drivers.length > 0 ? (
                drivers.map(driver => {
                  const driverStatus = getDriverStatus(driver);
                  const hasExpired = checkExpiredDocuments(driver);

                  console.log('DRIEVRRRRR => ', driver);

                  return (
                    <tr key={driver.driverId} className={hasExpired ? 'bg-orange-50' : ''}>
                      <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                        {driver.name}
                        {hasExpired && (
                          <span className="ml-2 text-xs text-orange-600 font-semibold">
                            ⚠️ Expired
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {driver.drivingLicenseFile?.licenseNumber || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {driver.email || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {driver.experience || 0} Years
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${driverStatus.class}`}
                        >
                          {driverStatus.icon} {driverStatus.text}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {driver.totalTrips || 0}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {driver.cancelledTrips || 0}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm">
                        <button
                          onClick={() => onViewDriver(driver)}
                          className="text-gray-500 hover:text-indigo-600"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No drivers match the current filters.
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
              {drivers.length > 0 ? (pagination.currentPage - 1) * 10 + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {(pagination.currentPage - 1) * 10 + drivers.length}
            </span>{' '}
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
const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ status: 'All', page: 1, search: '' });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch stats for the cards
        const statsResponse = await api.get('/admin/dashboard/stats');
        setStats(statsResponse.data);

        console.log('STATS => ', statsResponse.data);

        // Fetch drivers for the list
        const params = {
          page: filters.page,
          limit: 10,
          status: filters.status === 'All' ? undefined : filters.status,
          search: filters.search || undefined,
        };
        const driversResponse = await api.get('/admin/dashboard/drivers', { params });

        console.log('DRIVERs => ', driversResponse.data.drivers);

        setDrivers(driversResponse.data.drivers || []);
        setPagination({
          currentPage: driversResponse.data.currentPage,
          totalPages: driversResponse.data.totalPages,
          total: driversResponse.data.total,
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch data.';
        setError(errorMsg);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [filters]);

  const handleViewDriver = async driver => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/dashboard/drivers/${driver.driverId}`);
      const fullDriverDetails = response.data.driver;
      setSelectedDriver(fullDriverDetails);

      console.log('DRIVER => ', fullDriverDetails);

      if (fullDriverDetails.verificationStatus === 'PENDING') {
        setCurrentView('verify');
      } else if (
        fullDriverDetails.verificationStatus === 'VERIFIED' &&
        fullDriverDetails.isActive
      ) {
        setCurrentView('details');
      } else {
        setCurrentView('manage');
      }
    } catch (err) {
      alert('Failed to fetch driver details.', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedDriver(null);
    setCurrentView('list');
    setFilters(prev => ({ ...prev, page: 1, timestamp: Date.now() }));
  };

  const handleFilterChange = newFilters => {
    setFilters({
      ...filters,
      status: newFilters.status,
      search: newFilters.search,
      page: 1,
    });
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDownload = format => {
    const dataToExport = drivers.map(d => ({
      Name: d.name,
      Phone: d.phone,
      Email: d.email,
      Status:
        d.verificationStatus === 'VERIFIED' && d.isActive
          ? 'Active'
          : d.verificationStatus === 'PENDING'
          ? 'Pending'
          : 'Suspended/Rejected',
      Experience: `${d.experience || 0} Years`,
    }));
    if (format === 'csv') {
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'drivers.csv');
      link.click();
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Drivers');
      XLSX.writeFile(workbook, 'drivers.xlsx');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.autoTable({
        head: [Object.keys(dataToExport[0])],
        body: dataToExport.map(Object.values),
      });
      doc.save('drivers.pdf');
    }
  };

  // Show loading state on stat cards while drivers list is also loading
  if (isLoading && drivers.length === 0) {
    return (
      <DriverList
        stats={stats} // Show stats even if they load first
        drivers={[]}
        pagination={{ currentPage: 1, totalPages: 1, total: 0 }}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        onViewDriver={handleViewDriver}
        onDownload={handleDownload}
      />
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  if (currentView === 'details') {
    return <ViewDriverDetails driver={selectedDriver} onBack={handleBackToList} />;
  }

  if (currentView === 'manage') {
    return <ManageDriver driver={selectedDriver} onBack={handleBackToList} />;
  }

  if (currentView === 'verify') {
    return <DocumentVerification driver={selectedDriver} onBack={handleBackToList} />;
  }

  return (
    <DriverList
      stats={stats}
      drivers={drivers}
      pagination={pagination}
      onFilterChange={handleFilterChange}
      onPageChange={handlePageChange}
      onViewDriver={handleViewDriver}
      onDownload={handleDownload}
    />
  );
};

export default DriverManagement;
