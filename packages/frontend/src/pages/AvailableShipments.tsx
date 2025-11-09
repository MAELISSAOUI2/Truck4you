import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { shipmentAPI, transporterAPI } from '../services/api';
import { MapPin, Package, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

function AvailableShipments() {
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidData, setBidData] = useState<{ [key: string]: { price: string; days: string; message: string } }>({});
  const [showBidForm, setShowBidForm] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableShipments();
  }, []);

  const fetchAvailableShipments = async () => {
    try {
      const response = await shipmentAPI.getAll({ status: 'PENDING,BIDDING' });
      // Filter only shipments in PENDING or BIDDING status
      const available = response.data.filter((s: any) =>
        ['PENDING', 'BIDDING'].includes(s.status)
      );
      setShipments(available);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (shipmentId: string) => {
    try {
      const bid = bidData[shipmentId];
      if (!bid) return;

      await transporterAPI.submitBid({
        shipmentId,
        price: parseFloat(bid.price),
        estimatedDays: parseInt(bid.days),
        message: bid.message,
      });

      setShowBidForm(null);
      setBidData({ ...bidData, [shipmentId]: { price: '', days: '', message: '' } });
      fetchAvailableShipments();
    } catch (error) {
      console.error('Failed to submit bid:', error);
    }
  };

  const updateBidData = (shipmentId: string, field: string, value: string) => {
    setBidData({
      ...bidData,
      [shipmentId]: {
        ...(bidData[shipmentId] || { price: '', days: '', message: '' }),
        [field]: value,
      },
    });
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.availableShipments')}</h1>
        <p className="text-gray-600 mt-1">Browse and bid on available shipment requests</p>
      </div>

      {shipments.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No available shipments at the moment</p>
          <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {shipments.map((shipment) => {
            const currentBid = bidData[shipment.id] || { price: '', days: '', message: '' };

            return (
              <div key={shipment.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="font-semibold text-lg">
                        {shipment.pickupCity} → {shipment.deliveryCity}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{shipment.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <label className="text-gray-500">Pickup Date</label>
                        <p className="font-medium">
                          {format(new Date(shipment.pickupDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-500">Weight</label>
                        <p className="font-medium">{shipment.weight} kg</p>
                      </div>
                      <div>
                        <label className="text-gray-500">Shipper Rating</label>
                        <p className="font-medium">⭐ {shipment.shipper.rating.toFixed(1)}</p>
                      </div>
                      {shipment.estimatedPrice && (
                        <div>
                          <label className="text-gray-500">Est. Budget</label>
                          <p className="font-medium text-primary-600">
                            {shipment.estimatedPrice} TND
                          </p>
                        </div>
                      )}
                    </div>

                    {(shipment.fragile || shipment.requiresRefrigeration) && (
                      <div className="flex gap-2 mt-3">
                        {shipment.fragile && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Fragile
                          </span>
                        )}
                        {shipment.requiresRefrigeration && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Refrigerated
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {shipment.status}
                    </span>
                    {shipment.bids && shipment.bids.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {shipment.bids.length} bid(s)
                      </p>
                    )}
                  </div>
                </div>

                {showBidForm === shipment.id ? (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary-600" />
                      Submit Your Bid
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Your Price (TND)</label>
                        <input
                          type="number"
                          className="input"
                          value={currentBid.price}
                          onChange={(e) => updateBidData(shipment.id, 'price', e.target.value)}
                          placeholder="Enter your price"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div>
                        <label className="label">Estimated Days</label>
                        <input
                          type="number"
                          className="input"
                          value={currentBid.days}
                          onChange={(e) => updateBidData(shipment.id, 'days', e.target.value)}
                          placeholder="Delivery timeframe"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Message (Optional)</label>
                      <textarea
                        className="input min-h-[80px]"
                        value={currentBid.message}
                        onChange={(e) => updateBidData(shipment.id, 'message', e.target.value)}
                        placeholder="Add a message to the shipper..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleSubmitBid(shipment.id)}
                        className="btn btn-primary"
                        disabled={!currentBid.price || !currentBid.days}
                      >
                        Submit Bid
                      </button>
                      <button
                        onClick={() => setShowBidForm(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4">
                    <button
                      onClick={() => setShowBidForm(shipment.id)}
                      className="btn btn-primary"
                    >
                      Place Bid
                    </button>
                    <Link
                      to={`/shipments/${shipment.id}`}
                      className="btn btn-secondary"
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AvailableShipments;
