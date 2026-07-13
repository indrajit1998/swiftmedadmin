import {
  ArrowLeftIcon,
  MapIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  DrawingManager,
  GoogleMap,
  Polygon,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

const libraries = ['drawing'];
const mapContainerStyle = {
  width: '100%',
  height: '500px',
};
const center = {
  lat: 22.5726, // Kolkata default
  lng: 88.3639,
};

const ZoneForm = ({ zone, onBack, onSuccess }) => {
  const [formData, setFormData] = useState(
    zone || {
      name: '',
      displayName: '',
      multiplier: 1.0,
      nightMultiplier: 1.2,
      city: '',
      isActive: true,
      boundaries: {
        type: 'Polygon',
        coordinates: [[]],
      },
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawingManager, setDrawingManager] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onPolygonComplete = (polygon) => {
    const coords = polygon
      .getPath()
      .getArray()
      .map((latLng) => [latLng.lng(), latLng.lat()]);
    
    // GeoJSON Polygon needs to close the loop
    if (coords.length > 0) {
      coords.push(coords[0]);
    }

    setFormData({
      ...formData,
      boundaries: {
        type: 'Polygon',
        coordinates: [coords],
      },
    });

    polygon.setMap(null); // Remove the drawn polygon as we'll render it from state
  };

  const onLoad = (manager) => {
    setDrawingManager(manager);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.boundaries.coordinates[0].length === 0) {
      alert('Please draw a zone on the map');
      return;
    }
    const { boundaries, ...rest } = formData;
    const payload = {
      ...rest,
      coordinates: boundaries.coordinates,
      type: boundaries.type
    };

    setIsSubmitting(true);
    try {
      if (zone?._id) {
        await api.put(`/admin/zones/${zone._id}`, payload);
        alert('Zone updated successfully');
      } else {
        await api.post('/admin/zones', payload);
        alert('Zone created successfully');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save zone');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 ml-4">
          {zone ? 'Edit' : 'Add'} Pricing Zone
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Internal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. kolkata_center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. Central Kolkata"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. Kolkata"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.multiplier}
                  onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Night Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.nightMultiplier}
                  onChange={(e) => setFormData({ ...formData, nightMultiplier: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Is Active
                </label>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Instructions:</p>
              <ul className="text-sm text-gray-500 list-disc ml-5 space-y-1">
                <li>Use the polygon tool on the map to define the zone boundary.</li>
                <li>Click to add points, and click the first point to close the shape.</li>
                <li>Only one polygon is supported per zone.</li>
              </ul>
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
                {isSubmitting ? 'Saving...' : 'Save Zone'}
              </button>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-[600px] h-[500px] bg-white rounded-lg shadow overflow-hidden relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={
                formData.boundaries.coordinates[0].length > 0 
                ? { lat: formData.boundaries.coordinates[0][0][1], lng: formData.boundaries.coordinates[0][0][0] }
                : center
            }
            zoom={12}
          >
            <DrawingManager
              onLoad={onLoad}
              onPolygonComplete={onPolygonComplete}
              options={{
                drawingControl: true,
                drawingControlOptions: {
                  position: window.google.maps.ControlPosition.TOP_CENTER,
                  drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
                },
                polygonOptions: {
                  fillColor: '#6366f1',
                  fillOpacity: 0.3,
                  strokeWeight: 2,
                  clickable: true,
                  editable: true,
                  zIndex: 1,
                },
              }}
            />
            {formData.boundaries.coordinates[0].length > 0 && (
              <Polygon
                path={formData.boundaries.coordinates[0].map(c => ({ lat: c[1], lng: c[0] }))}
                options={{
                  fillColor: '#6366f1',
                  fillOpacity: 0.3,
                  strokeWeight: 2,
                  strokeColor: '#6366f1',
                }}
              />
            )}
          </GoogleMap>
          <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded shadow text-xs font-semibold text-gray-600">
            {formData.boundaries.coordinates[0].length > 0 ? 'Zone Defined' : 'No Zone Drawn'}
          </div>
        </div>
      </div>
    </div>
  );
};

const ZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('list');
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchZones = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/zones');
      setZones(response.data.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch zones');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      '⚠️ WARNING: Are you sure you want to delete this zone?\n\n' +
      'This will also PERMANENTLY delete any specific price overrides for this zone set on ALL Add-Ons. ' +
      'Add-on prices in this area will fallback to their original base pricing.\n\n' +
      'This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      await api.delete(`/admin/zones/${id}`);
      alert('Zone and associated overrides deleted successfully');
      fetchZones();
    } catch (err) {
      console.error(err);
      alert('Failed to delete zone');
    }
  };

  if (currentView === 'form') {
    return (
      <ZoneForm
        zone={selectedZone}
        onBack={() => {
          setCurrentView('list');
          setSelectedZone(null);
        }}
        onSuccess={() => {
          setCurrentView('list');
          setSelectedZone(null);
          fetchZones();
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pricing Zones</h1>
        <button
          onClick={() => {
            setSelectedZone(null);
            setCurrentView('form');
          }}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <PlusIcon className="h-5 w-5" />
          Create New Zone
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10 text-gray-500">Loading...</div>
        ) : zones.length > 0 ? (
          zones.map((zone) => (
            <div key={zone._id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <MapIcon className="h-6 w-6 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{zone.displayName}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{zone.city}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${
                      zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {zone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-5 bg-gray-50 p-3 rounded-md">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Multiplier</label>
                    <p className="text-sm font-bold text-gray-900">{zone.multiplier}x</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Night Rate</label>
                    <p className="text-sm font-bold text-gray-900">{zone.nightMultiplier}x</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedZone(zone);
                      setCurrentView('form');
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDelete(zone._id)}
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg shadow">
            No zones created yet. Click "Create New Zone" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneManagement;
