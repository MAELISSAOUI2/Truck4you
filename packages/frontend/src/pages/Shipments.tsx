import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { shipmentAPI } from '../services/api';
import { Plus, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

function Shipments() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [shipments, setShipments] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, [filter]);

  const fetchShipments = async () => {
    try {
      const params = filter !== 'ALL' ? { status: filter } : {};
      const response = await shipmentAPI.getAll(params);
      setShipments(response.data);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      BIDDING: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DISPUTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.shipments')}</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'SHIPPER'
              ? 'Manage your shipment requests'
              : 'View your assigned shipments'}
          </p>
        </div>
        {user?.role === 'SHIPPER' && (
          <Link to="/shipments/new" className="btn btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('shipments.create')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'BIDDING', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments List */}
      {shipments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No shipments found</p>
          {user?.role === 'SHIPPER' && (
            <Link to="/shipments/new" className="btn btn-primary mt-4 inline-block">
              Create your first shipment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {shipments.map((shipment) => (
            <Link
              key={shipment.id}
              to={`/shipments/${shipment.id}`}
              className="card hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="font-semibold text-lg">
                      {shipment.pickupCity} → {shipment.deliveryCity}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{shipment.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(shipment.pickupDate), 'MMM dd, yyyy')}
                    </div>
                    <span>Weight: {shipment.weight} kg</span>
                    {shipment.finalPrice && (
                      <span className="font-semibold text-primary-600">
                        {shipment.finalPrice} {shipment.currency}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                  {shipment.status}
                </span>
              </div>

              {shipment.bids && shipment.bids.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    {shipment.bids.length} bid(s) received
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Shipments;
