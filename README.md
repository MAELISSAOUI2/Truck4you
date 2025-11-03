# Truck4You - B2B Logistics Platform for Tunisia

A comprehensive B2B logistics platform designed specifically for the Tunisian market, addressing local challenges such as payment fragmentation and lack of insurance coverage.

## Features

### Core Logistics Features
- **Shipment Management**: Create, track, and manage shipments
- **Real-time Tracking**: Live GPS tracking of shipments
- **Driver/Transporter Management**: Onboard and manage transport providers
- **Route Optimization**: Efficient route planning for deliveries
- **Multi-party Bookings**: Support for multiple pickup and delivery points

### Tunisian Market Specificities

#### Payment Fragmentation
- **Multiple Payment Methods**: Cash, bank transfer, mobile payment, checks
- **Installment Payments**: Split payments over time with flexible schedules
- **Escrow System**: Secure payment holding until delivery confirmation
- **Payment Milestones**: Release payments based on shipment status
- **Multi-currency Support**: TND primary, with EUR/USD for international

#### Insurance Alternatives
Since traditional insurance is limited in Tunisia, we provide:
- **Reputation System**: Rating and review system for transporters
- **Security Deposits**: Refundable deposits from transporters
- **Photo/Signature Proof**: Digital proof of delivery
- **Escrow Protection**: Payment held until successful delivery
- **Damage Claims System**: Built-in dispute resolution
- **Transporter Verification**: Background checks and document verification

### Additional Features
- **Bilingual Support**: Arabic and French interfaces
- **Company Profiles**: Complete B2B company management
- **Invoice Generation**: Automated billing and invoicing
- **Analytics Dashboard**: Business insights and reporting
- **Mobile Responsive**: Works on all devices

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Leaflet for maps
- i18next for internationalization

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- bcrypt for password hashing

## Project Structure

```
truck4you/
├── packages/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── context/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── package.json
│   └── backend/           # Node.js backend API
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── utils/
│       ├── prisma/
│       └── package.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Truck4you
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create `.env` file in `packages/backend/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/truck4you"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV=development
```

Create `.env` file in `packages/frontend/`:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Set up the database:
```bash
cd packages/backend
npx prisma migrate dev
npx prisma generate
```

5. Start the development servers:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend on `http://localhost:3001`.

## Usage

### For Businesses (Shippers)
1. Register your company account
2. Create shipment requests with pickup/delivery details
3. Review and select transporter bids
4. Set up payment terms (full payment or installments)
5. Track shipments in real-time
6. Confirm delivery and release payment

### For Transporters
1. Register as a transporter with vehicle details
2. Provide security deposit
3. Browse available shipment requests
4. Submit bids with pricing
5. Update shipment status during delivery
6. Receive payments upon successful delivery

## API Documentation

API endpoints are available at `/api` base path:

- `POST /api/auth/register` - Register new company
- `POST /api/auth/login` - Login
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `GET /api/shipments/:id` - Get shipment details
- `PUT /api/shipments/:id/status` - Update shipment status
- `POST /api/payments/installments` - Create payment plan
- `POST /api/payments/release` - Release escrow payment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@truck4you.tn or open an issue in the repository.
