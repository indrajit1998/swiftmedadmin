import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PhoneIcon,
  TruckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../utils/api';

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between ${bold ? 'font-semibold' : ''}`}>
    <span className="text-gray-500">{label}</span>
    <span>{value}</span>
  </div>
);

const mapStatus = (status, searchStatus) => {
  switch (status) {
    case 'completed':
      return 'Delivered';
    case 'ongoing':
      return 'On The Way';
    case 'accepted':
    case 'pickup_reached':
      return 'Driver Assigned';
    case 'cancelled':
      return 'Cancelled';
  }

  if (searchStatus === 'search_timeout') {
    return 'No Driver Found';
  }

  return 'Pending';
};

const mapBackendTravels = travels =>
  travels.map(t => ({
    id: t._id,
    bookingId: t.rideId || t.bookingId || t._id.toUpperCase(),
    status: mapStatus(t.status, t.searchStatus),
    pickupLocation: t.pickup,
    dropoffLocation: t.destination,
    dropLocation: t.destination,
    fare: t.fare ?? 0,
    driverEarning: Math.round((t.fare ?? 0) * 0.6),
    userName: t.user?.name ?? 'Unknown User',
    driverName: t.driver?.name ?? 'Unassigned',
    driverPhone: t.driver?.phone ?? '-',
    driverId: t.driver?.driverId ?? '-',
    carNumber: '-',
    vehicleInfo: null,
    addOns: [],
    lastUpdate: new Date(t.createdAt).toLocaleString(),
  }));

// --- SUB-COMPONENT: Trip Details View ---
const TripDetailsView = ({ trip, onBack }) => {
  const isCompleted = trip.status === 'Delivered';

  const getStatusClass = status => {
    if (status === 'Delivered') return 'bg-green-100 text-green-800';
    if (status === 'On The Way') return 'bg-blue-100 text-blue-800';
    if (status === 'Cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const TimelineStep = ({ time, title, status }) => (
    <div className="flex items-start">
      <div className="flex flex-col items-center mr-4">
        {status === 'complete' && <CheckCircleIconSolid className="w-6 h-6 text-green-500" />}
        {status === 'inprogress' && (
          <div className="w-6 h-6 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
        )}
        {status === 'pending' && <div className="w-6 h-6 rounded-full bg-gray-200"></div>}
        {title !== 'Delivered' && <div className="w-px h-12 bg-gray-200 mt-1"></div>}
      </div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{time}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-2"
          >
            <ArrowLeftIcon className="h-5 w-5" /> Back to List
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Booking ID #{trip.bookingId}</h1>
          <p className="text-sm text-gray-500">Last update: {trip.lastUpdate}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ${getStatusClass(
            trip.status,
          )}`}
        >
          {trip.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Journey Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Pickup Location</p>
                  <p className="font-medium">{trip.pickupLocation}</p>
                </div>
                {trip.pickupTime && <p className="text-sm text-gray-500">{trip.pickupTime}</p>}
              </div>

              {trip.distance && (
                <div className="text-sm text-gray-600 pl-4 border-l-2 border-blue-500">
                  Distance: {(trip.distance / 1000).toFixed(2)} km
                  {trip.duration && ` • Duration: ${Math.round(trip.duration / 60)} min`}
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Dropoff Location</p>
                  <p className="font-medium">{trip.dropoffLocation}</p>
                </div>
                {trip.completedTime && (
                  <p className="text-sm text-gray-500">{trip.completedTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Fare Breakdown</h3>
            {trip.fareBreakdown ? (
              <div className="space-y-2 text-sm">
                <Row label="Base Fare" value={`₹${trip.fareBreakdown.baseFare?.toFixed(2) ?? 0}`} />
                <Row
                  label="Distance Cost"
                  value={`₹${trip.fareBreakdown.distanceCost?.toFixed(2) ?? 0}`}
                />
                <Row label="Add-ons" value={`₹${trip.fareBreakdown.addOnTotal?.toFixed(2) ?? 0}`} />
                <Row label="GST" value={`₹${trip.fareBreakdown.gstAmount?.toFixed(2) ?? 0}`} />
                {trip.cancellationFee > 0 && (
                  <Row label="Cancellation Fee" value={`₹${trip.cancellationFee.toFixed(2)}`} />
                )}
                <hr className="my-2" />
                <Row label="Total Fare" value={`₹${trip.fare?.toFixed(2) ?? 0}`} bold />
                <Row
                  label="Driver Earning (60%)"
                  value={`₹${((trip.fare ?? 0) * 0.6).toFixed(2)}`}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">Fare not calculated</p>
            )}
          </div>

          {/* Payment & Trip Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Trip Details</h3>
            <div className="space-y-2 text-sm">
              <Row label="Payment Method" value={trip.paymentMethod || 'N/A'} />
              <Row label="Payment Status" value={trip.paymentStatus || 'Pending'} />
              {/* {trip.otp && <Row label="Trip OTP" value={trip.otp} />} */}
              {trip.status === 'Cancelled' && trip.cancellationReason && (
                <Row label="Cancellation Reason" value={trip.cancellationReason} />
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Trip Timeline</h3>
            <TimelineStep
              time={trip.pickupTime || 'Pending'}
              title="Pickup"
              status={
                isCompleted || trip.status === 'On The Way' || trip.status === 'Driver Assigned'
                  ? 'complete'
                  : 'pending'
              }
            />
            <TimelineStep
              time="In Transit"
              title="On The Way"
              status={
                isCompleted || trip.status === 'On The Way'
                  ? 'complete'
                  : trip.status === 'Driver Assigned'
                  ? 'inprogress'
                  : 'pending'
              }
            />
            <TimelineStep
              time={trip.completedTime || 'Pending'}
              title="Delivered"
              status={isCompleted ? 'complete' : 'pending'}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">User Information</h3>
            <div className="flex items-center gap-4 mb-4">
              <UserCircleIcon className="h-12 w-12 text-gray-400" />
              <div>
                <p className="font-semibold">{trip.userName}</p>
                <p className="text-sm text-gray-500">{trip.user?.phone || 'N/A'}</p>
              </div>
            </div>
            {trip.user?.email && <p className="text-sm text-gray-600">📧 {trip.user.email}</p>}
          </div>

          {/* Driver Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Driver Information</h3>
            <div className="flex items-center gap-4">
              <UserCircleIcon className="h-12 w-12 text-gray-400" />
              <div>
                <p className="font-semibold">{trip.driverName}</p>
                <p className="text-sm text-gray-500">Driver ID: {trip.driverId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <p className="text-sm">{trip.driverPhone}</p>
            </div>
            {trip.vehicleInfo?.registrationNumber && (
              <div className="flex items-center gap-4 mt-2">
                <TruckIcon className="h-5 w-5 text-gray-400" />
                <p className="text-sm">{trip.vehicleInfo.registrationNumber}</p>
              </div>
            )}
          </div>

          {/* Ambulance Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Ambulance Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-500">Type</p>
                <p>{trip.fareBreakdown?.carType || 'N/A'}</p>
              </div>
              {trip.vehicleInfo?.category && (
                <div className="flex justify-between">
                  <p className="text-gray-500">Category</p>
                  <p>{trip.vehicleInfo.category}</p>
                </div>
              )}
              {trip.addOns?.length > 0 && (
                <div className="flex justify-between">
                  <p className="text-gray-500">Add-ons</p>
                  <p>{trip.addOns.map(a => a.title).join(', ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Section - Only for completed trips */}
          {isCompleted && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Invoice</h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Invoice generated for completed ride</p>
                <button className="rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white">
                  Download Invoice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Main Trip List ---
const TravelList = ({ trips, onViewTrip, onDownload }) => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [filters, setFilters] = useState({ dateRange: '', loadId: '', status: 'All' });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const loadIdMatch = trip.bookingId.toLowerCase().includes(filters.loadId.toLowerCase());
      const statusMatch = filters.status === 'All' || trip.status === filters.status;
      return loadIdMatch && statusMatch;
    });
  }, [trips, filters]);

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = page => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusClass = status => {
    switch (status) {
      case 'On The Way':
        return 'bg-blue-100 text-blue-800';
      case 'Driver Assigned':
        return 'bg-indigo-100 text-indigo-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-auto">
            <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Date Range"
              value={filters.dateRange}
              onChange={e => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full md:w-auto rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300"
            />
          </div>
          <input
            type="text"
            placeholder="Search Booking ID"
            value={filters.loadId}
            onChange={e => setFilters({ ...filters, loadId: e.target.value })}
            className="w-full md:w-auto rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300"
          />
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="w-full md:w-auto rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Driver Assigned">Driver Assigned</option>
            <option value="On The Way">On The Way</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="w-full md:w-auto rounded-md bg-blue-800 px-6 py-2 text-sm font-semibold text-white">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Travel Details</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
              >
                CSV <ChevronDownIcon className="h-4 w-4" />
              </button>
              {isDownloadOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <a
                      onClick={() => {
                        onDownload('csv');
                        setIsDownloadOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Download as CSV
                    </a>
                    <a
                      onClick={() => {
                        onDownload('xlsx');
                        setIsDownloadOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Download as XLSX
                    </a>
                    <a
                      onClick={() => {
                        onDownload('pdf');
                        setIsDownloadOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      Download as PDF
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
                  'Booking ID',
                  'Driver',
                  'Vehicle',
                  'Status',
                  'User Name',
                  'Fare',
                  'Driver earning',
                  'Drop',
                  'Actions',
                ].map(h => (
                  <th
                    key={h}
                    className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTrips.length > 0 ? (
                paginatedTrips.map(trip => (
                  <tr key={trip.id}>
                    <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                      {trip.bookingId}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {trip.driverName}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {trip.carNumber}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                          trip.status,
                        )}`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {trip.userName}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      ₹{trip.fare.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      ₹{trip.driverEarning.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      {trip.dropLocation}
                    </td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm">
                      <button
                        onClick={() => onViewTrip(trip)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-500">
                    No trips match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {filteredTrips.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTrips.length)}
            </span>{' '}
            of <span className="font-medium">{filteredTrips.length}</span> results
          </div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages).keys()].map(num => (
              <button
                key={num}
                onClick={() => handlePageChange(num + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === num + 1
                    ? 'z-10 bg-indigo-500 text-white'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                }`}
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
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
const TravelManagement = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list');
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    let interval;
    let aborted = false;

    const fetchTravels = async () => {
      try {
        const res = await api.get('/admin/dashboard/travels');
        if (aborted) return;

        const mapped = mapBackendTravels(res.data.travels);
        setTrips(mapped);
        setIsLoading(false);
      } catch (err) {
        console.error('Admin travels fetch failed:', err);
        setIsLoading(false);
      }
    };

    fetchTravels();
    interval = setInterval(fetchTravels, 8000);

    return () => {
      aborted = true;
      clearInterval(interval);
    };
  }, []);

  const handleViewTrip = async trip => {
    setIsLoading(true);

    try {
      const res = await api.get(`/admin/dashboard/travels/${trip.id}`);

      const detailed = {
        ...trip,
        pickupLocation: res.data.travel.pickup,
        dropoffLocation: res.data.travel.destination,
        fare: res.data.travel.fare ?? trip.fare,
        fareBreakdown: res.data.travel.fareBreakdown ?? null,
        addOns: res.data.travel.addOns ?? [],
        paymentMethod: res.data.travel.paymentMethod ?? '-',
        paymentStatus: res.data.travel.paymentStatus ?? '-',
        cancellationFee: res.data.travel.cancellationFee ?? 0,
        cancellationReason: res.data.travel.cancellationReason ?? '-',
        otp: res.data.travel.otp,
        distance: res.data.travel.distance,
        duration: res.data.travel.duration,
        userName: res.data.travel.user?.name ?? trip.userName,
        user: res.data.travel.user,
        driverName: res.data.travel.driver?.name ?? 'Unassigned',
        driverPhone: res.data.travel.driver?.phone ?? '-',
        driver: res.data.travel.driver,
        vehicleInfo: res.data.travel.vehicle ?? null,
        pickupTime: res.data.travel.pickupTime,
        completedTime: res.data.travel.completedTime,
      };

      setSelectedTrip(detailed);
      setCurrentView('details');
    } catch (err) {
      console.error('Trip details fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedTrip(null);
    setCurrentView('list');
  };

  const handleDownload = format => {
    const dataToExport = trips.map(t => ({
      'Booking ID': t.bookingId,
      Driver: t.driverName,
      Status: t.status,
      Fare: t.fare,
      'Drop Location': t.dropLocation,
    }));
    if (format === 'csv') {
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'trips.csv');
      link.click();
    } else if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trips');
      XLSX.writeFile(workbook, 'trips.xlsx');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.autoTable({
        head: [Object.keys(dataToExport[0])],
        body: dataToExport.map(Object.values),
      });
      doc.save('trips.pdf');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (currentView === 'details') {
    return <TripDetailsView trip={selectedTrip} onBack={handleBackToList} />;
  }

  return <TravelList trips={trips} onViewTrip={handleViewTrip} onDownload={handleDownload} />;
};

export default TravelManagement;
