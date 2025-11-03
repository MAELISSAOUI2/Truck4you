import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { shipmentAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

function CreateShipment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
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
      };

      await shipmentAPI.create(data);
      navigate('/shipments');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/shipments')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('shipments.create')}</h1>
          <p className="text-gray-600 mt-1">Fill in the details of your shipment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Pickup Details */}
        <div className="space-y-4">
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
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleChange}
                className="input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="label">Pickup Address</label>
            <input
              type="text"
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        {/* Delivery Details */}
        <div className="space-y-4">
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
            <input
              type="text"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        {/* Shipment Details */}
        <div className="space-y-4">
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
