import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { shipmentAPI, paymentAPI, reviewAPI } from '../services/api';
import { ArrowLeft, Star } from 'lucide-react';
import { format } from 'date-fns';

function ShipmentDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [shipment, setShipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'ESCROW',
    isInstallment: false,
    installmentCount: 2,
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const response = await shipmentAPI.getById(id!);
      setShipment(response.data);
    } catch (error) {
      console.error('Failed to fetch shipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      await shipmentAPI.acceptBid(id!, bidId);
      fetchShipment();
    } catch (error) {
      console.error('Failed to accept bid:', error);
    }
  };

  const handleCreatePayment = async () => {
    try {
      const installments = paymentData.isInstallment
        ? Array.from({ length: paymentData.installmentCount }, (_, i) => ({
            amount: shipment.finalPrice / paymentData.installmentCount,
            dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          }))
        : undefined;

      await paymentAPI.create({
        shipmentId: id!,
        amount: shipment.finalPrice,
        method: paymentData.method,
        isEscrow: paymentData.method === 'ESCROW',
        isInstallment: paymentData.isInstallment,
        installments,
      });

      setShowPaymentModal(false);
      fetchShipment();
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };

  const handleReleasePayment = async (paymentId: string) => {
    try {
      await paymentAPI.releaseEscrow(paymentId);
      fetchShipment();
    } catch (error) {
      console.error('Failed to release payment:', error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await reviewAPI.create({
        shipmentId: id!,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setShowReviewModal(false);
      fetchShipment();
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  if (!shipment) {
    return <div className="text-center py-12">Shipment not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/shipments')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {shipment.pickupCity} → {shipment.deliveryCity}
          </h1>
          <p className="text-gray-600 mt-1">Shipment #{shipment.id.slice(0, 8)}</p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            shipment.status === 'DELIVERED'
              ? 'bg-green-100 text-green-800'
              : shipment.status === 'IN_TRANSIT'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {shipment.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Shipment Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1">{shipment.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Weight</label>
                  <p className="mt-1">{shipment.weight} kg</p>
                </div>
                {shipment.volume && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Volume</label>
                    <p className="mt-1">{shipment.volume} m³</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Pickup</label>
                  <p className="mt-1">{shipment.pickupAddress}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(shipment.pickupDate), 'PPP')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Delivery</label>
                  <p className="mt-1">{shipment.deliveryAddress}</p>
                  {shipment.deliveryDate && (
                    <p className="text-sm text-gray-500">
                      {format(new Date(shipment.deliveryDate), 'PPP')}
                    </p>
                  )}
                </div>
              </div>

              {shipment.finalPrice && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Price</label>
                  <p className="mt-1 text-2xl font-bold text-primary-600">
                    {shipment.finalPrice} {shipment.currency}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bids */}
          {shipment.bids && shipment.bids.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Bids ({shipment.bids.length})</h2>
              <div className="space-y-4">
                {shipment.bids.map((bid: any) => (
                  <div
                    key={bid.id}
                    className={`p-4 border rounded-lg ${
                      bid.accepted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{bid.transporter.name}</p>
                        <p className="text-sm text-gray-600">
                          Rating: {bid.transporter.rating.toFixed(1)} ⭐
                        </p>
                        {bid.message && <p className="text-sm mt-2">{bid.message}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {bid.price} {bid.currency}
                        </p>
                        <p className="text-sm text-gray-600">{bid.estimatedDays} days</p>
                      </div>
                    </div>
                    {!bid.accepted &&
                      shipment.shipperId === user?.id &&
                      shipment.status === 'BIDDING' && (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="btn btn-primary mt-4 w-full"
                        >
                          Accept Bid
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {shipment.payments && shipment.payments.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Payments</h2>
              <div className="space-y-4">
                {shipment.payments.map((payment: any) => (
                  <div key={payment.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {payment.amount} {payment.currency}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.method} - {payment.status}
                        </p>
                        {payment.isEscrow && !payment.escrowReleased && (
                          <p className="text-sm text-orange-600 mt-1">Held in Escrow</p>
                        )}
                      </div>
                      {payment.isEscrow &&
                        !payment.escrowReleased &&
                        payment.payerId === user?.id &&
                        shipment.status === 'DELIVERED' && (
                          <button
                            onClick={() => handleReleasePayment(payment.id)}
                            className="btn btn-primary"
                          >
                            Release Payment
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipper Info */}
          <div className="card">
            <h3 className="font-bold mb-2">Shipper</h3>
            <p className="font-medium">{shipment.shipper.name}</p>
            <p className="text-sm text-gray-600">{shipment.shipper.email}</p>
            <p className="text-sm text-gray-600">{shipment.shipper.phone}</p>
            <p className="text-sm mt-2">
              Rating: {shipment.shipper.rating.toFixed(1)} ⭐ ({shipment.shipper.totalRatings})
            </p>
          </div>

          {/* Transporter Info */}
          {shipment.transporter && (
            <div className="card">
              <h3 className="font-bold mb-2">Transporter</h3>
              <p className="font-medium">{shipment.transporter.name}</p>
              <p className="text-sm text-gray-600">{shipment.transporter.email}</p>
              <p className="text-sm text-gray-600">{shipment.transporter.phone}</p>
              <p className="text-sm mt-2">
                Rating: {shipment.transporter.rating.toFixed(1)} ⭐ (
                {shipment.transporter.totalRatings})
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="card space-y-3">
            <h3 className="font-bold">Actions</h3>
            {shipment.status === 'ACCEPTED' &&
              shipment.shipperId === user?.id &&
              (!shipment.payments || shipment.payments.length === 0) && (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="btn btn-primary w-full"
                >
                  Create Payment
                </button>
              )}
            {shipment.status === 'DELIVERED' && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Star className="h-4 w-4" />
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Payment Method</label>
                <select
                  className="input"
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                >
                  <option value="ESCROW">Escrow (Recommended)</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_PAYMENT">Mobile Payment</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paymentData.isInstallment}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, isInstallment: e.target.checked })
                  }
                />
                <span>Pay in Installments</span>
              </label>

              {paymentData.isInstallment && (
                <div>
                  <label className="label">Number of Installments</label>
                  <input
                    type="number"
                    className="input"
                    value={paymentData.installmentCount}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        installmentCount: parseInt(e.target.value),
                      })
                    }
                    min="2"
                    max="12"
                  />
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button onClick={handleCreatePayment} className="btn btn-primary flex-1">
                  Create
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-3xl ${
                        star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Comment (Optional)</label>
                <textarea
                  className="input min-h-[100px]"
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={handleSubmitReview} className="btn btn-primary flex-1">
                  Submit
                </button>
                <button onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShipmentDetail;
