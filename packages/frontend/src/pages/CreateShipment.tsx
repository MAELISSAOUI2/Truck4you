import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { shipmentAPI } from '../services/api';
import { ArrowLeft, MapPin, Calendar, Upload, Truck, Package, Box, Warehouse } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationMarkerProps {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}

function LocationMarker({ position, setPosition }: LocationMarkerProps) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

type PickupType = 'pallet' | 'box' | 'package' | 'vehicle';

function CreateShipment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupCity: '',
    pickupDate: '',
    deliveryAddress: '',
    deliveryCity: '',
    description: '',
    weight: '',
    volume: '',
    fragile: false,
    requiresRefrigeration: false,
    estimatedPrice: '',
  });

  const [pickupLocation, setPickupLocation] = useState<[number, number] | null>([36.8065, 10.1815]); // Tunis default
  const [deliveryLocation, setDeliveryLocation] = useState<[number, number] | null>(null);
  const [showPickupMap, setShowPickupMap] = useState(false);
  const [showDeliveryMap, setShowDeliveryMap] = useState(false);
  const [pickupType, setPickupType] = useState<PickupType>('package');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pickupTypes = [
    { id: 'pallet' as PickupType, name: 'Pallet', icon: Warehouse, description: 'Standard pallet shipment' },
    { id: 'box' as PickupType, name: 'Box', icon: Box, description: 'Boxed items' },
    { id: 'package' as PickupType, name: 'Package', icon: Package, description: 'Small package' },
    { id: 'vehicle' as PickupType, name: 'Vehicle', icon: Truck, description: 'Full vehicle load' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    setUploadedImages([...uploadedImages, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        weight: parseFloat(formData.weight),
        volume: formData.volume ? parseFloat(formData.volume) : undefined,
        estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : undefined,
        pickupLocation: pickupLocation ? { lat: pickupLocation[0], lng: pickupLocation[1] } : undefined,
        deliveryLocation: deliveryLocation ? { lat: deliveryLocation[0], lng: deliveryLocation[1] } : undefined,
        pickupType,
      };

      await shipmentAPI.create(data);
      navigate('/shipments');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days for current month
  const generateCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      days.push({ date, isPast });
    }

    return days;
  };

  const selectDate = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setFormData({ ...formData, pickupDate: formattedDate });
    setShowCalendar(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/shipments')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('shipments.create')}</h1>
          <p className="text-gray-600 mt-1">Fill in the details of your shipment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Pickup Type Selection */}
        <div className="card">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Pickup Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pickupTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPickupType(type.id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    pickupType === type.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${
                    pickupType === type.id ? 'text-primary-600' : 'text-gray-600'
                  }`} />
                  <div className="text-sm font-medium">{type.name}</div>
                  <div className="text-xs text-gray-500">{type.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pickup Details */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Pickup Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Pickup City</label>
              <input
                type="text"
                name="pickupCity"
                value={formData.pickupCity}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Pickup Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="pickupDate"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  className="input"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded"
                >
                  <Calendar className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {showCalendar && (
                <div className="absolute z-10 mt-2 bg-white border rounded-lg shadow-lg p-4">
                  <div className="grid grid-cols-7 gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-center font-semibold text-sm text-gray-600">
                        {day}
                      </div>
                    ))}
                    {generateCalendar().map(({ date, isPast }, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={isPast}
                        onClick={() => selectDate(date)}
                        className={`p-2 text-sm rounded ${
                          isPast
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-primary-100 text-gray-700'
                        } ${
                          formData.pickupDate === date.toISOString().split('T')[0]
                            ? 'bg-primary-600 text-white'
                            : ''
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">Pickup Address</label>
            <div className="relative">
              <input
                type="text"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPickupMap(!showPickupMap)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded"
              >
                <MapPin className="h-5 w-5 text-primary-600" />
              </button>
            </div>
          </div>

          {showPickupMap && (
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer
                center={pickupLocation || [36.8065, 10.1815]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker position={pickupLocation} setPosition={setPickupLocation} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Delivery Details */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Delivery Details</h3>

          <div>
            <label className="label">Delivery City</label>
            <input
              type="text"
              name="deliveryCity"
              value={formData.deliveryCity}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Delivery Address</label>
            <div className="relative">
              <input
                type="text"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowDeliveryMap(!showDeliveryMap)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded"
              >
                <MapPin className="h-5 w-5 text-primary-600" />
              </button>
            </div>
          </div>

          {showDeliveryMap && (
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer
                center={deliveryLocation || pickupLocation || [36.8065, 10.1815]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker position={deliveryLocation} setPosition={setDeliveryLocation} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Shipment Details */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Shipment Details</h3>

          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="input"
                required
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="label">Volume (m³) - Optional</label>
              <input
                type="number"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="label">Estimated Price (TND) - Optional</label>
              <input
                type="number"
                name="estimatedPrice"
                value={formData.estimatedPrice}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="fragile"
                checked={formData.fragile}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Fragile Items</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="requiresRefrigeration"
                checked={formData.requiresRefrigeration}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Requires Refrigeration</span>
            </label>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Photos (Optional)</h3>
          <p className="text-sm text-gray-600">Upload up to 5 photos of your shipment</p>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload Photos
            </button>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={preview}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? t('common.loading') : 'Create Shipment'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="btn btn-secondary"
          >
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateShipment;
