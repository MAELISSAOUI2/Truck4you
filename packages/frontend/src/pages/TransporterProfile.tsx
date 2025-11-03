import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { transporterAPI } from '../services/api';
import { Truck, Plus, Shield } from 'lucide-react';

function TransporterProfile() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deposit, setDeposit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');
  const [vehicleData, setVehicleData] = useState({
    type: 'SMALL_VAN',
    licensePlate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: '',
  });

  useEffect(() => {
    if (user?.role !== 'TRANSPORTER') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [profileRes, vehiclesRes, depositRes] = await Promise.all([
        transporterAPI.getProfile(),
        transporterAPI.getVehicles(),
        transporterAPI.getDeposit().catch(() => ({ data: null })),
      ]);

      setProfile(profileRes.data);
      setVehicles(vehiclesRes.data);
      setDeposit(depositRes.data);
    } catch (error) {
      console.error('Failed to fetch transporter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transporterAPI.addVehicle({
        ...vehicleData,
        year: parseInt(vehicleData.year.toString()),
        capacity: parseFloat(vehicleData.capacity),
      });
      setShowVehicleForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add vehicle:', error);
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transporterAPI.submitDeposit(parseFloat(depositAmount));
      setShowDepositForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to submit deposit:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transporter Profile</h1>
        <p className="text-gray-600 mt-1">Manage your transporter information and vehicles</p>
      </div>

      {/* Profile Info */}
      {profile && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">License Number</label>
              <p className="mt-1 font-medium">{profile.licenseNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Vehicles</label>
              <p className="mt-1 font-medium">{profile.vehicleCount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Active Shipments</label>
              <p className="mt-1 font-medium">{profile.activeShipments}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Completed</label>
              <p className="mt-1 font-medium">{profile.completedShipments}</p>
            </div>
          </div>

          {profile.documentsVerified ? (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">✓ Your documents are verified</p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠ Your documents are pending verification
              </p>
            </div>
          )}
        </div>
      )}

      {/* Security Deposit */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600" />
              Security Deposit
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              A security deposit builds trust and increases your visibility
            </p>
          </div>
          {!deposit?.held && (
            <button
              onClick={() => setShowDepositForm(true)}
              className="btn btn-primary"
            >
              Submit Deposit
            </button>
          )}
        </div>

        {deposit?.held ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-900">
              Deposit Submitted: {deposit.amount} {deposit.currency}
            </p>
            <p className="text-sm text-green-700 mt-1">
              Your security deposit is held and can be refunded upon request
            </p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700">No security deposit submitted yet</p>
          </div>
        )}
      </div>

      {/* Vehicles */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Vehicles</h2>
          <button
            onClick={() => setShowVehicleForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Vehicle
          </button>
        </div>

        {vehicles.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No vehicles added yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Truck className="h-8 w-8 text-primary-600" />
                    <div>
                      <p className="font-semibold">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-600">
                        {vehicle.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Capacity: {vehicle.capacity} kg
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {vehicle.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showVehicleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add Vehicle</h2>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="label">Vehicle Type</label>
                <select
                  className="input"
                  value={vehicleData.type}
                  onChange={(e) => setVehicleData({ ...vehicleData, type: e.target.value })}
                  required
                >
                  <option value="SMALL_VAN">Small Van</option>
                  <option value="LARGE_VAN">Large Van</option>
                  <option value="SMALL_TRUCK">Small Truck</option>
                  <option value="LARGE_TRUCK">Large Truck</option>
                  <option value="REFRIGERATED">Refrigerated</option>
                  <option value="FLATBED">Flatbed</option>
                </select>
              </div>

              <div>
                <label className="label">License Plate</label>
                <input
                  type="text"
                  className="input"
                  value={vehicleData.licensePlate}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, licensePlate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Make</label>
                  <input
                    type="text"
                    className="input"
                    value={vehicleData.make}
                    onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Model</label>
                  <input
                    type="text"
                    className="input"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Year</label>
                  <input
                    type="number"
                    className="input"
                    value={vehicleData.year}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, year: parseInt(e.target.value) })
                    }
                    required
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <label className="label">Capacity (kg)</label>
                  <input
                    type="number"
                    className="input"
                    value={vehicleData.capacity}
                    onChange={(e) =>
                      setVehicleData({ ...vehicleData, capacity: e.target.value })
                    }
                    required
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Add Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => setShowVehicleForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Submit Security Deposit</h2>
            <form onSubmit={handleSubmitDeposit} className="space-y-4">
              <div>
                <label className="label">Deposit Amount (TND)</label>
                <input
                  type="number"
                  className="input"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  required
                  min="100"
                  step="1"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Recommended: 500 TND or higher for better visibility
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Your security deposit will be held and can be refunded when you close your transporter account.
                  It helps build trust with shippers.
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowDepositForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransporterProfile;
