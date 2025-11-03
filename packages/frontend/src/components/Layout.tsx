import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Truck, Package, CreditCard, User, LogOut, Globe } from 'lucide-react';

function Layout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const languages = ['en', 'fr', 'ar'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.changeLanguage(languages[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Truck4You</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-primary-600 transition">
                {t('nav.dashboard')}
              </Link>
              <Link to="/shipments" className="text-gray-700 hover:text-primary-600 transition">
                {t('nav.shipments')}
              </Link>
              {user?.role === 'TRANSPORTER' && (
                <Link to="/available-shipments" className="text-gray-700 hover:text-primary-600 transition">
                  {t('nav.availableShipments')}
                </Link>
              )}
              <Link to="/payments" className="text-gray-700 hover:text-primary-600 transition">
                {t('nav.payments')}
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                title="Change language"
              >
                <Globe className="h-5 w-5" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <Link to="/profile" className="p-2 rounded-lg hover:bg-gray-100 transition">
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 transition text-red-600"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
