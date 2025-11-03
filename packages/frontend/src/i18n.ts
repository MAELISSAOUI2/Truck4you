import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      'app.title': 'Truck4You',
      'app.tagline': 'B2B Logistics Platform for Tunisia',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.submit': 'Submit',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.edit': 'Edit',
      'common.delete': 'Delete',
      'common.search': 'Search',
      'common.filter': 'Filter',

      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.companyName': 'Company Name',
      'auth.phone': 'Phone',
      'auth.address': 'Address',
      'auth.city': 'City',

      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.shipments': 'Shipments',
      'nav.payments': 'Payments',
      'nav.profile': 'Profile',
      'nav.availableShipments': 'Available Shipments',

      // Shipments
      'shipments.create': 'Create Shipment',
      'shipments.pickup': 'Pickup',
      'shipments.delivery': 'Delivery',
      'shipments.status': 'Status',
      'shipments.price': 'Price',
      'shipments.weight': 'Weight (kg)',

      // Payments
      'payments.escrow': 'Escrow Payment',
      'payments.installment': 'Installment Payment',
      'payments.release': 'Release Payment',
      'payments.method': 'Payment Method',
    }
  },
  fr: {
    translation: {
      // Common
      'app.title': 'Truck4You',
      'app.tagline': 'Plateforme de Logistique B2B pour la Tunisie',
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.submit': 'Soumettre',
      'common.cancel': 'Annuler',
      'common.save': 'Enregistrer',
      'common.edit': 'Modifier',
      'common.delete': 'Supprimer',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',

      // Auth
      'auth.login': 'Connexion',
      'auth.register': 'S\'inscrire',
      'auth.logout': 'Déconnexion',
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.companyName': 'Nom de l\'entreprise',
      'auth.phone': 'Téléphone',
      'auth.address': 'Adresse',
      'auth.city': 'Ville',

      // Navigation
      'nav.dashboard': 'Tableau de bord',
      'nav.shipments': 'Expéditions',
      'nav.payments': 'Paiements',
      'nav.profile': 'Profil',
      'nav.availableShipments': 'Expéditions disponibles',

      // Shipments
      'shipments.create': 'Créer une expédition',
      'shipments.pickup': 'Ramassage',
      'shipments.delivery': 'Livraison',
      'shipments.status': 'Statut',
      'shipments.price': 'Prix',
      'shipments.weight': 'Poids (kg)',

      // Payments
      'payments.escrow': 'Paiement sécurisé',
      'payments.installment': 'Paiement échelonné',
      'payments.release': 'Libérer le paiement',
      'payments.method': 'Méthode de paiement',
    }
  },
  ar: {
    translation: {
      // Common
      'app.title': 'Truck4You',
      'app.tagline': 'منصة لوجستية للشركات في تونس',
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      'common.submit': 'إرسال',
      'common.cancel': 'إلغاء',
      'common.save': 'حفظ',
      'common.edit': 'تعديل',
      'common.delete': 'حذف',
      'common.search': 'بحث',
      'common.filter': 'تصفية',

      // Auth
      'auth.login': 'تسجيل الدخول',
      'auth.register': 'تسجيل',
      'auth.logout': 'تسجيل الخروج',
      'auth.email': 'البريد الإلكتروني',
      'auth.password': 'كلمة المرور',
      'auth.companyName': 'اسم الشركة',
      'auth.phone': 'الهاتف',
      'auth.address': 'العنوان',
      'auth.city': 'المدينة',

      // Navigation
      'nav.dashboard': 'لوحة التحكم',
      'nav.shipments': 'الشحنات',
      'nav.payments': 'المدفوعات',
      'nav.profile': 'الملف الشخصي',
      'nav.availableShipments': 'الشحنات المتاحة',

      // Shipments
      'shipments.create': 'إنشاء شحنة',
      'shipments.pickup': 'الاستلام',
      'shipments.delivery': 'التسليم',
      'shipments.status': 'الحالة',
      'shipments.price': 'السعر',
      'shipments.weight': 'الوزن (كجم)',

      // Payments
      'payments.escrow': 'دفع آمن',
      'payments.installment': 'دفع بالتقسيط',
      'payments.release': 'إطلاق الدفع',
      'payments.method': 'طريقة الدفع',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default to French for Tunisia
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
