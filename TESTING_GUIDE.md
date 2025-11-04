# Testing Guide for Truck4You

This document provides comprehensive testing scenarios for the Truck4You platform.

## Test Accounts

Create these test accounts to simulate different user roles:

### Shipper Account 1
- Email: `shipper1@test.com`
- Password: `test123`
- Name: ABC Logistics
- City: Tunis

### Shipper Account 2
- Email: `shipper2@test.com`
- Password: `test123`
- Name: XYZ Trading
- City: Sousse

### Transporter Account 1
- Email: `transport1@test.com`
- Password: `test123`
- Name: Fast Delivery Service
- City: Sfax

### Transporter Account 2
- Email: `transport2@test.com`
- Password: `test123`
- Name: Express Transport
- City: Bizerte

## Test Scenario 1: Complete Shipment Flow

### Step 1: Shipper Creates Shipment
1. Login as `shipper1@test.com`
2. Click "Create New Shipment"
3. Fill in:
   - Pickup City: Tunis
   - Pickup Address: 15 Avenue de la Liberté
   - Pickup Date: Tomorrow
   - Delivery City: Sfax
   - Delivery Address: 30 Rue Habib Thameur
   - Description: Office furniture - 10 items
   - Weight: 500 kg
   - Volume: 3 m³
   - Estimated Price: 800 TND
   - Check "Fragile Items"
4. Submit
5. Verify shipment appears in dashboard
6. Note the shipment status: PENDING

### Step 2: Multiple Transporters Bid
1. Logout, login as `transport1@test.com`
2. Go to "Available Shipments"
3. Find the shipment
4. Click "Place Bid":
   - Price: 750 TND
   - Days: 1
   - Message: "Professional service, 5 years experience"
5. Submit bid

6. Logout, login as `transport2@test.com`
7. Go to "Available Shipments"
8. Bid on same shipment:
   - Price: 720 TND
   - Days: 2
   - Message: "Competitive price, insured transport"
9. Submit bid

### Step 3: Shipper Reviews and Accepts Bid
1. Logout, login as `shipper1@test.com`
2. Go to shipment details
3. View both bids
4. Compare prices and ratings
5. Accept the best bid (transport2@test.com - 720 TND)
6. Verify shipment status changes to ACCEPTED

### Step 4: Shipper Creates Payment
1. Still as shipper, in shipment details
2. Click "Create Payment"
3. Select:
   - Method: Escrow
   - Enable "Pay in Installments"
   - Number: 3 installments
4. Submit
5. Verify payment created with 3 installments

### Step 5: Transporter Delivers
1. Logout, login as `transport2@test.com`
2. Go to "Shipments" → Find accepted shipment
3. Update status to "IN_TRANSIT"
4. Wait/simulate delivery
5. Update status to "DELIVERED"
6. Optional: Add delivery notes

### Step 6: Shipper Releases Payment
1. Logout, login as `shipper1@test.com`
2. Go to shipment details
3. Verify delivery confirmation
4. Click "Release Payment" in escrow section
5. Verify payment released

### Step 7: Leave Reviews
1. Still as shipper, click "Leave Review"
2. Rate: 5 stars
3. Comment: "Excellent service, on time delivery"
4. Submit

5. Logout, login as `transport2@test.com`
6. Go to shipment details
7. Click "Leave Review"
8. Rate: 5 stars
9. Comment: "Great customer, clear instructions"
10. Submit

## Test Scenario 2: Payment Installments

### Step 1: Create Shipment with High Value
1. Login as `shipper2@test.com`
2. Create shipment with price: 1500 TND

### Step 2: Accept Bid
1. Transporter bids
2. Shipper accepts

### Step 3: Create Installment Payment
1. Shipper creates payment:
   - Method: Bank Transfer
   - Installments: 6 monthly payments
   - Each: 250 TND

### Step 4: Pay Installments
1. Go to "Payments"
2. View installment schedule
3. Pay first installment (if due date passed)
4. Verify payment status: PARTIAL
5. Pay remaining installments
6. Verify payment status: COMPLETED

## Test Scenario 3: Transporter Profile Setup

### Step 1: Setup Profile
1. Login as `transport1@test.com`
2. Go to "Transporter Profile"
3. Verify license information

### Step 2: Add Multiple Vehicles
1. Click "Add Vehicle":
   - Type: Small Van
   - Plate: TUN-1111
   - Make: Ford
   - Model: Transit
   - Year: 2019
   - Capacity: 1000 kg

2. Add second vehicle:
   - Type: Large Truck
   - Plate: TUN-2222
   - Make: Volvo
   - Model: FH16
   - Year: 2021
   - Capacity: 5000 kg

3. Add refrigerated vehicle:
   - Type: Refrigerated
   - Plate: TUN-3333
   - Make: Mercedes
   - Model: Actros
   - Year: 2020
   - Capacity: 3000 kg

### Step 3: Submit Security Deposit
1. Click "Submit Deposit"
2. Amount: 1000 TND
3. Submit
4. Verify deposit appears as "held"

## Test Scenario 4: Multi-Language Support

1. Login with any account
2. Click globe icon 🌐
3. Test in French:
   - Verify all labels translate
   - Create/view shipments
   - Navigate menus
4. Switch to Arabic:
   - Verify translations
   - Check RTL layout (if implemented)
5. Switch back to English

## Test Scenario 5: Dashboard Statistics

1. Login as shipper with multiple shipments
2. Verify dashboard shows:
   - Total Shipments count
   - Active Shipments count
   - Completed Shipments count
   - Total Payments count
3. Create new shipment → verify count increases
4. Accept bid → verify active count increases
5. Complete delivery → verify completed count increases

## Test Scenario 6: Notification System

1. As transporter, place bid → shipper should get notification
2. As shipper, accept bid → transporter should get notification
3. Update shipment status → other party gets notification
4. Create payment → transporter gets notification
5. Release escrow → transporter gets notification
6. Leave review → reviewed party gets notification

## Test Scenario 7: Error Handling

### Test Invalid Login
1. Try login with wrong password
2. Verify error message displays

### Test Missing Fields
1. Try creating shipment with empty required fields
2. Verify validation errors

### Test Duplicate Email
1. Try registering with existing email
2. Verify error: "Email already registered"

### Test Invalid Bid
1. Try bidding on already accepted shipment
2. Verify error message

### Test Payment Without Transporter
1. Try creating payment before accepting bid
2. Verify error: "No transporter assigned"

## Test Scenario 8: Edge Cases

### Late Payment Installment
1. Create payment with past due dates
2. Verify "Pay Now" button appears
3. Pay late installment
4. Verify no penalties (or add penalty logic)

### Cancel Shipment
1. Create shipment
2. Before accepting bids, cancel it
3. Verify status changes to CANCELLED

### Dispute Shipment
1. Create shipment → complete delivery
2. Shipper disputes delivery quality
3. Verify dispute logged

## Performance Testing

### Load Test Dashboard
1. Create 50+ shipments
2. Login and check dashboard load time
3. Should load < 2 seconds

### Concurrent Bidding
1. Multiple transporters bid simultaneously
2. Verify all bids recorded correctly

## API Testing (Optional)

Use curl or Postman to test API endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"api@test.com","password":"test123","phone":"+216123","address":"Test","city":"Tunis","role":"SHIPPER"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"api@test.com","password":"test123"}'

# Get shipments (with token)
curl http://localhost:3001/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Mobile Responsive Testing

Test on different screen sizes:
- 📱 Mobile (375px)
- 📱 Tablet (768px)
- 💻 Desktop (1024px+)

## Accessibility Testing

- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ Color contrast
- ✅ Focus indicators

## Security Testing

- ✅ JWT token expiration
- ✅ Unauthorized access attempts
- ✅ SQL injection prevention (Prisma handles this)
- ✅ XSS prevention (React handles this)

## Test Checklist Summary

- [ ] User registration (Shipper & Transporter)
- [ ] User login/logout
- [ ] Create shipment
- [ ] Place bid
- [ ] Accept bid
- [ ] Create payment (multiple methods)
- [ ] Create installment payment
- [ ] Pay installment
- [ ] Update shipment status
- [ ] Complete delivery
- [ ] Release escrow payment
- [ ] Leave review
- [ ] Add vehicle
- [ ] Submit security deposit
- [ ] View dashboard statistics
- [ ] Switch languages
- [ ] Notifications
- [ ] Error handling
- [ ] Mobile responsiveness

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device information
5. Screenshots if applicable
6. Console errors (F12 → Console tab)
