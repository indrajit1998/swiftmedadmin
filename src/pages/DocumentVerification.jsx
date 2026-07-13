import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import api from '../utils/api';
import S3MediaViewer from '../components/S3MediaViewer';

// Helper for a row with text and a media link
const DocRow = ({ label, documentPath, numberValue, numberLabel }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 px-4 transition-colors hover:bg-gray-50/50">
        {/* Left Side: Label and Number */}
        <div className="flex-grow">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {numberValue && (
                <p className="text-xs text-gray-500 mt-1">
                    {numberLabel || 'Number'}: <span className="font-semibold text-gray-800">{numberValue}</span>
                </p>
            )}
        </div>
        
        {/* Right Side: View Link */}
        <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
            <S3MediaViewer s3Key={documentPath} label={label} mode="link" />
        </div>
    </div>
  );
};

// Helper component for the "Driver Information" card
const DataRow = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{value}</dd>
  </div>
);
// --- END OF MISSING HELPER COMPONENT ---


// --- Granular Status Row Component ---
const StatusRow = ({ title, doc, docType, driverId, onUpdate }) => {
  const [reason, setReason] = useState(doc?.rejectionReason || ''); // Pre-fill reason
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const status = doc?.status || 'PENDING';
  const rejectionReason = doc?.rejectionReason;

  const handleUpdate = async (newStatus) => {
    if (newStatus === 'REJECTED' && !reason) {
      alert('Rejection reason is required.');
      return;
    }
    setIsLoading(true);
    try {
      // This endpoint is correct based on your router
      await api.put(`/admin/dashboard/drivers/${driverId}/verify`, {
        docType,
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? reason : null
      });
      onUpdate(); // Tell the parent to refetch all data
      setShowRejectInput(false);
    } catch (err) {
      console.error(err);
      alert(`Failed to update ${title}`);
    } finally {
      setIsLoading(false);
    }
  };

  let statusColor = "text-yellow-600";
  if (status === 'VERIFIED') statusColor = "text-green-600";
  if (status === 'REJECTED') statusColor = "text-red-600";

  return (
    <div className="py-4 px-4 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center">
        <div>
          <h4 className="text-md font-semibold text-gray-800">{title}</h4>
          <p className={`text-sm font-bold ${statusColor}`}>{status}</p>
          {status === 'REJECTED' && rejectionReason && (
            <p className="text-xs text-red-700 italic mt-1">Reason: {rejectionReason}</p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0 flex-shrink-0">
          {status !== 'VERIFIED' && (
            <button onClick={() => handleUpdate('VERIFIED')} disabled={isLoading} className="rounded bg-green-50 px-2.5 py-1.5 text-sm font-semibold text-green-600 shadow-sm hover:bg-green-100">
              <CheckCircleIcon className="h-5 w-5" />
            </button>
          )}
          {status !== 'REJECTED' && (
            <button onClick={() => setShowRejectInput(true)} disabled={isLoading} className="rounded bg-red-50 px-2.5 py-1.5 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100">
              <XCircleIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      {showRejectInput && status !== 'REJECTED' && (
        <div className="mt-3">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={`Reason for rejecting ${title}...`}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => setShowRejectInput(false)} className="text-sm text-gray-600">Cancel</button>
            <button onClick={() => handleUpdate('REJECTED')} className="text-sm font-semibold text-red-600">Confirm Reject</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Verification Component ---
const DocumentVerification = ({ driver: initialDriver, onBack, onUpdate }) => {
  const [driver, setDriver] = useState(initialDriver);

  const handleDataRefresh = async () => {
    try {
      const response = await api.get(`/admin/dashboard/drivers/${driver.driverId}`);
      setDriver(response.data.driver);
      // Pass the update up to the parent component (DriverManagement)
      if (onUpdate) {
        onUpdate(response.data.driver);
      }
    } catch (err) {
      console.error("Failed to refetch driver data", err);
      alert('Failed to refresh driver data.');
    }
  };
  
  const documentList = [
    { title: 'Profile Photo', doc: driver.profileStatus, docType: 'profile' },
    { title: 'Address', doc: driver.addressStatus, docType: 'address' },
    { title: 'Bank Details', doc: driver.bankDetails?.documentStatus, docType: 'bank' },
    { title: 'Driving License', doc: driver.drivingLicenseDetails?.documentStatus, docType: 'license' },
    { title: 'Govt. ID (PAN/Aadhaar)', doc: driver.panAadharDetails?.documentStatus, docType: 'panAadhaar' },
    { title: 'Vehicle RC', doc: driver.vehicleDetails?.registrationStatus, docType: 'vehicle' },
    { title: 'Vehicle Insurance', doc: driver.insuranceDetails?.documentStatus, docType: 'insurance' },
    ...(driver.vehicleDetails?.carselection ? [{
      title: 'Ambulance Photos',
      doc: driver.vehicleDetails?.ambulancePhotosStatus,
      docType: 'ambulancePhotos',
    }] : [])
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900"><ArrowLeftIcon className="h-6 w-6" /></button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">Driver Verification</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info & Photos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Driver Information</h2>
            <dl className="divide-y divide-gray-200 mt-4">
              {/* This is where the crash was happening */}
              <DataRow label="Name" value={driver.name} />
              <DataRow label="Phone" value={driver.phone} />
              <DataRow label="Email" value={driver.email || 'N/A'} />
              <DataRow label="Address" value={`${driver.address?.houseOrBuildingNo}, ${driver.address?.roadOrAreaOrColony}, ${driver.address?.cityOrVillage} - ${driver.address?.pincode}`} />
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 p-6 border-b">Document Details & Images</h2>
            <dl className="divide-y divide-gray-200">
              <DocRow label="Driving License" documentPath={driver.drivingLicenseDetails?.front} numberValue={driver.drivingLicenseDetails?.licenseNumber} numberLabel="License #" />
              <div className="py-2 px-4 flex justify-end">
                <S3MediaViewer s3Key={driver.drivingLicenseDetails?.back} label="View License Back" mode="link" />
              </div>
              <DocRow label="PAN/Aadhaar" documentPath={driver.panAadharDetails?.frontPicture} numberValue={driver.panAadharDetails?.panAadhaarNumber} numberLabel="ID #" />
              <div className="py-2 px-4 flex justify-end">
                <S3MediaViewer s3Key={driver.panAadharDetails?.backPicture} label="View ID Back" mode="link" />
              </div>
              <DocRow label="Vehicle RC" documentPath={driver.vehicleDetails?.registrationCardFile} numberValue={driver.vehicleDetails?.registrationNumber} numberLabel="RC #" />
              <DocRow label="Insurance" documentPath={driver.insuranceDetails?.insuranceImage} numberValue={driver.insuranceDetails?.insuranceNumber} numberLabel="Policy #" />
              <DocRow label="Bank Passbook" documentPath={driver.bankDetails?.passbookPicture} numberValue={driver.bankDetails?.accountNumber} numberLabel="Account #" />
            </dl>
          </div>

          {driver.vehicleDetails?.carselection && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-4">Ambulance Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Front</label>
                  <S3MediaViewer s3Key={driver.vehicleDetails?.ambulancePhotos?.front} label="Front" className="w-full h-40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Back</label>
                  <S3MediaViewer s3Key={driver.vehicleDetails?.ambulancePhotos?.back} label="Back" className="w-full h-40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Interior</label>
                  <S3MediaViewer s3Key={driver.vehicleDetails?.ambulancePhotos?.interior} label="Interior" className="w-full h-40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Cylinders</label>
                  <S3MediaViewer s3Key={driver.vehicleDetails?.ambulancePhotos?.cylinders} label="Cylinders" className="w-full h-40" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">AC Vents</label>
                  <S3MediaViewer s3Key={driver.vehicleDetails?.ambulancePhotos?.acVents} label="AC Vents" className="w-full h-40" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Profile Photo & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Profile Photo</h2>
            <S3MediaViewer s3Key={driver.ProfilePicture} label="Profile Photo" mode="circular" className="mx-auto w-40 h-40 shadow-lg border-4 border-white" />
          </div>

          <div className="bg-white rounded-lg shadow sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 p-6 border-b">Verification Actions</h2>
            <div className="divide-y divide-gray-200">
              {documentList.map(item => (
                // Only render a row if the document is relevant
                item.doc ? (
                  <StatusRow
                    key={item.docType}
                    title={item.title}
                    doc={item.doc}
                    docType={item.docType}
                    driverId={driver.driverId}
                    onUpdate={handleDataRefresh}
                  />
                ) : null
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;