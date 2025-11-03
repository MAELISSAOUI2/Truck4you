import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paymentAPI } from '../services/api';
import { DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

function Payments() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getAll();
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInstallment = async (installmentId: string) => {
    try {
      await paymentAPI.payInstallment(installmentId);
      fetchPayments();
    } catch (error) {
      console.error('Failed to pay installment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.payments')}</h1>
        <p className="text-gray-600 mt-1">Manage your payments and installments</p>
      </div>

      {payments.length === 0 ? (
        <div className="card text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No payments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {payment.amount} {payment.currency}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      Shipment: {payment.shipment.pickupCity} → {payment.shipment.deliveryCity}
                    </p>
                    <p>Method: {payment.method}</p>
                    <p>Created: {format(new Date(payment.createdAt), 'PPP')}</p>

                    {payment.isEscrow && (
                      <div className="flex items-center gap-2 mt-2 text-orange-600">
                        <Clock className="h-4 w-4" />
                        {payment.escrowReleased ? (
                          <span>Escrow released on {format(new Date(payment.escrowReleaseDate), 'PPP')}</span>
                        ) : (
                          <span>Held in escrow - awaiting delivery confirmation</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Installments */}
              {payment.installments && payment.installments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium mb-3">Installment Plan ({payment.installments.length} payments)</h4>
                  <div className="space-y-2">
                    {payment.installments.map((installment: any) => (
                      <div
                        key={installment.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {installment.status === 'COMPLETED' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium">
                              Installment {installment.installmentNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              Due: {format(new Date(installment.dueDate), 'PPP')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            {installment.amount} {payment.currency}
                          </span>
                          {installment.status === 'PENDING' &&
                            new Date(installment.dueDate) <= new Date() && (
                              <button
                                onClick={() => handlePayInstallment(installment.id)}
                                className="btn btn-primary text-sm"
                              >
                                Pay Now
                              </button>
                            )}
                          {installment.status === 'COMPLETED' && (
                            <span className="text-sm text-green-600">
                              Paid {format(new Date(installment.paidDate), 'PP')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Payments;
