import { useAuthStore } from '../store/authStore';
import { User, Mail, Phone, MapPin, Star } from 'lucide-react';

function Profile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">View your account information</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="h-10 w-10 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-600">{user.role}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{user.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="mt-1">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <label className="text-sm font-medium text-gray-600">City</label>
              <p className="mt-1">{user.city}</p>
            </div>
          </div>
        </div>
      </div>

      {user.role === 'TRANSPORTER' && (
        <div className="card bg-primary-50 border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-2">Transporter Features</h3>
          <p className="text-primary-800 text-sm">
            Visit the Transporter Profile page to manage your vehicles, view your security deposit, and update your license information.
          </p>
        </div>
      )}
    </div>
  );
}

export default Profile;
