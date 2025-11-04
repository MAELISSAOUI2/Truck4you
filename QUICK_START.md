# Quick Start Guide - Truck4You

This guide will walk you through setting up and testing the Truck4You B2B logistics platform.

## Prerequisites

Before starting, make sure you have installed:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (version 14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

Check your installations:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
psql --version  # Should be PostgreSQL 14 or higher
```

## Step 1: Clone the Repository (if not already done)

```bash
git clone <your-repo-url>
cd Truck4you
```

## Step 2: Install Dependencies

Install all dependencies for both frontend and backend:

```bash
# Install root dependencies
npm install

# This will automatically install dependencies for both packages
```

Or manually install for each package:

```bash
# Install backend dependencies
cd packages/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ../..
```

## Step 3: Set Up PostgreSQL Database

### Option A: Using PostgreSQL locally

1. **Start PostgreSQL service:**
   - **Windows**: Open Services and start "postgresql-x64-14"
   - **Mac**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`

2. **Create a database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql, create the database:
CREATE DATABASE truck4you;

# Create a user (optional but recommended):
CREATE USER truck4you_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE truck4you TO truck4you_user;

# Exit psql
\q
```

### Option B: Using Docker (easier)

```bash
# Run PostgreSQL in Docker
docker run --name truck4you-postgres \
  -e POSTGRES_DB=truck4you \
  -e POSTGRES_USER=truck4you_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

## Step 4: Configure Environment Variables

### Backend Configuration

```bash
cd packages/backend
cp .env.example .env
```

Edit `packages/backend/.env`:

```env
DATABASE_URL="postgresql://truck4you_user:your_password@localhost:5432/truck4you"
JWT_SECRET="your-very-secret-jwt-key-change-this-in-production"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

**Important**: Replace `your_password` with the password you set in Step 3.

### Frontend Configuration

```bash
cd packages/frontend
cp .env.example .env
```

Edit `packages/frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Step 5: Set Up the Database Schema

```bash
cd packages/backend

# Generate Prisma Client
npx prisma generate

# Run database migrations (creates all tables)
npx prisma migrate dev --name init

# You should see output like:
# ✔ Generated Prisma Client
# ✔ Applied migration: init
```

**Optional**: View your database with Prisma Studio:
```bash
npx prisma studio
# Opens at http://localhost:5555
```

## Step 6: Start the Application

### Option A: Start both servers together (recommended)

From the root directory:

```bash
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:5173

### Option B: Start servers separately

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
npm run dev
```

## Step 7: Test the Application

### 7.1 Open the Application

Open your browser and go to: **http://localhost:5173**

You should see the Truck4You login page.

### 7.2 Create Test Accounts

#### Create a Shipper Account:

1. Click "Register"
2. Fill in the form:
   - **Account Type**: Shipper (Business)
   - **Company Name**: Test Shipping Co
   - **Email**: shipper@test.com
   - **Password**: test123
   - **Phone**: +216 12 345 678
   - **City**: Tunis
   - **Address**: 123 Test Street
3. Click "Register"
4. You'll be automatically logged in

#### Create a Transporter Account:

1. Logout (click the logout icon in the top right)
2. Click "Register" again
3. Fill in the form:
   - **Account Type**: Transporter (Driver)
   - **Company Name**: Fast Transport
   - **Email**: transporter@test.com
   - **Password**: test123
   - **Phone**: +216 98 765 432
   - **City**: Sfax
   - **Address**: 456 Transport Ave
4. Click "Register"

### 7.3 Test as Shipper

Login as **shipper@test.com** / **test123**

#### Create a Shipment:

1. Click "Create New Shipment" on the dashboard
2. Fill in the shipment form:
   - **Pickup City**: Tunis
   - **Pickup Date**: Tomorrow's date
   - **Pickup Address**: 10 Avenue Habib Bourguiba
   - **Delivery City**: Sfax
   - **Delivery Address**: 25 Rue de la République
   - **Description**: Electronics equipment - 5 boxes
   - **Weight**: 150 kg
   - **Estimated Price**: 300 TND (optional)
   - Check "Fragile Items"
3. Click "Create Shipment"
4. You should see your shipment in the shipments list

### 7.4 Test as Transporter

Logout and login as **transporter@test.com** / **test123**

#### Set Up Transporter Profile:

1. Go to "Transporter Profile" from the menu
2. Click "Add Vehicle":
   - **Type**: Small Truck
   - **License Plate**: TUN-1234
   - **Make**: Mercedes
   - **Model**: Sprinter
   - **Year**: 2020
   - **Capacity**: 2000 kg
3. Click "Add Vehicle"

4. Click "Submit Deposit":
   - **Amount**: 500 TND
5. Click "Submit"

#### Place a Bid:

1. Go to "Available Shipments"
2. You should see the shipment created by the shipper
3. Click "Place Bid"
4. Fill in:
   - **Your Price**: 280 TND
   - **Estimated Days**: 1
   - **Message**: "Experienced driver, guaranteed delivery"
5. Click "Submit Bid"

### 7.5 Test the Complete Workflow

#### Accept Bid (as Shipper):

1. Logout and login as **shipper@test.com**
2. Go to "Shipments" → Click on your shipment
3. You should see the bid from the transporter
4. Click "Accept Bid"

#### Create Payment (as Shipper):

1. In the shipment details, click "Create Payment"
2. Choose payment options:
   - **Method**: Escrow (Recommended)
   - Check "Pay in Installments"
   - **Number of Installments**: 3
3. Click "Create"

#### Update Shipment Status (as Transporter):

1. Logout and login as **transporter@test.com**
2. Go to "Shipments" (you'll see your accepted shipments)
3. Click on the shipment
4. The shipper can update status, but you can view tracking

#### Complete Delivery (as Transporter):

1. On the shipment detail page, update status to "IN_TRANSIT"
2. Then update to "DELIVERED"
3. Add proof of delivery (optional in this test)

#### Release Payment (as Shipper):

1. Logout and login as **shipper@test.com**
2. Go to "Shipments" → Click on the delivered shipment
3. Scroll to Payments section
4. Click "Release Payment" (this releases the escrow)

#### Leave a Review:

1. Still as shipper, click "Leave Review"
2. Rate the transporter (1-5 stars)
3. Add a comment
4. Click "Submit"

### 7.6 Test Payment Installments

1. As shipper, go to "Payments"
2. You should see the payment with 3 installments
3. Click "Pay Now" on the first installment (if due date has passed)
4. The installment status will change to "COMPLETED"

### 7.7 Test Language Switching

1. Click the globe icon 🌐 in the top menu
2. The interface will cycle through: English → French → Arabic

## Step 8: Check API Health

Test the backend API directly:

```bash
# Check API health
curl http://localhost:3001/health

# Should return: {"status":"ok","message":"Truck4You API is running"}
```

## Troubleshooting

### Problem: "Cannot connect to database"

**Solution:**
- Make sure PostgreSQL is running
- Check your DATABASE_URL in `.env`
- Verify the database exists: `psql -U postgres -l`

### Problem: "Port 3001 is already in use"

**Solution:**
```bash
# Find and kill the process
# Mac/Linux:
lsof -ti:3001 | xargs kill -9

# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Problem: "Module not found"

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json
npm install
```

### Problem: Prisma errors

**Solution:**
```bash
cd packages/backend
npx prisma generate
npx prisma migrate reset  # Warning: This deletes all data!
npx prisma migrate dev
```

### Problem: Frontend build errors

**Solution:**
```bash
cd packages/frontend
rm -rf node_modules package-lock.json
npm install
```

## Testing Checklist

- [ ] Can register as shipper
- [ ] Can register as transporter
- [ ] Can create a shipment
- [ ] Can add vehicle (transporter)
- [ ] Can submit security deposit (transporter)
- [ ] Can place bid on shipment
- [ ] Can accept bid (shipper)
- [ ] Can create payment with installments
- [ ] Can create escrow payment
- [ ] Can update shipment status
- [ ] Can release escrow payment
- [ ] Can leave review
- [ ] Can switch languages
- [ ] Dashboard shows correct statistics

## Next Steps

- Customize the application for your needs
- Add real payment gateway integration
- Add real-time GPS tracking
- Deploy to production (Vercel for frontend, Railway/Render for backend)
- Set up a production PostgreSQL database
- Configure proper environment variables for production

## Support

If you encounter issues:
1. Check the browser console for errors (F12)
2. Check the backend terminal for API errors
3. Check the database connection
4. Verify all environment variables are correct

## Production Deployment

See `DEPLOYMENT.md` for production deployment instructions.
