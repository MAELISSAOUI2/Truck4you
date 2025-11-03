import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { shipmentAPI, paymentAPI } from '../services/api';
import { Package, Truck, DollarSign, Star } from 'lucide-react';

function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    completedShipments: 0,
    totalPayments: 0,
  });
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [shipmentsRes, paymentsRes] = await Promise.all([
        shipmentAPI.getAll(),
        paymentAPI.getAll(),
      ]);

      const shipments = shipmentsRes.data;
      setRecentShipments(shipments.slice(0, 5));

      setStats({
        totalShipments: shipments.length,
        activeShipments: shipments.filter((s: any) =>
          ['ACCEPTED', 'IN_TRANSIT'].includes(s.status)
        ).length,
        completedShipments: shipments.filter((s: any) => s.status === 'DELIVERED').length,
        totalPayments: paymentsRes.data.length,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'SHIPPER'
            ? 'Manage your shipments and track deliveries'
            : 'Find available shipments and manage your deliveries'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Shipments</p>
              <p className="text-3xl font-bold mt-2">{stats.totalShipments}</p>
            </div>
            <Package className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active</p>
              <p className="text-3xl font-bold mt-2">{stats.activeShipments}</p>
            </div>
            <Truck className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Completed</p>
              <p className="text-3xl font-bold mt-2">{stats.completedShipments}</p>
            </div>
            <Star className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Payments</p>
              <p className="text-3xl font-bold mt-2">{stats.totalPayments}</p>
            </div>
            <DollarSign className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {user?.role === 'SHIPPER' ? (
            <>
              <Link to="/shipments/new" className="btn btn-primary">
                Create New Shipment
              </Link>
              <Link to="/shipments" className="btn btn-secondary">
                View All Shipments
              </Link>
              <Link to="/payments" className="btn btn-secondary">
                Manage Payments
              </Link>
            </>
          ) : (
            <>
              <Link to="/available-shipments" className="btn btn-primary">
                Browse Available Shipments
              </Link>
              <Link to="/shipments" className="btn btn-secondary">
                My Deliveries
              </Link>
              <Link to="/transporter-profile" className="btn btn-secondary">
                Manage Profile
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Shipments</h2>
          <Link to="/shipments" className="text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>

        {recentShipments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No shipments yet</p>
        ) : (
          <div className="space-y-4">
            {recentShipments.map((shipment) => (
              <Link
                key={shipment.id}
                to={`/shipments/${shipment.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {shipment.pickupCity} → {shipment.deliveryCity}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {shipment.description}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
