# ServOne / Seva Platform Backend

## Overview
This is the complete backend for the ServOne / Seva Platform, designed as an on-demand multi-service marketplace for rural and semi-urban India. The backend supports the User App, Partner App, Admin Web Panel, and Customer Website.

## Technology Stack
- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **Mongoose**
- **JavaScript (CommonJS)**
- **JWT** for Authentication
- **Joi** for request validation

## Architecture
This project follows a clean, professional, modular architecture within a single Express application.

### Folder Structure
```
backend/
├── src/
│   ├── config/          # Database and environment configs
│   ├── middlewares/     # Auth, authorize, error handling, validation
│   ├── modules/         # Business domain modules
│   │   ├── auth/        # Authentication APIs
│   │   ├── users/       # User profiles & addresses
│   │   ├── partners/    # ISP, BSP, BS functionality
│   │   ├── catalog/     # Categories, Subcategories, Services
│   │   ├── bookings/    # Booking creation, lifecycle
│   │   ├── finance/     # Transactions, payments
│   │   ├── support/     # Tickets, disputes
│   │   ├── notifications/ # User & Partner notifications
│   │   ├── content/     # CMS, Banners, FAQs
│   │   └── admin/       # Admin operations & dashboards
│   ├── utils/           # JWT, logger, response formatter
│   ├── app.js           # Express app setup
│   └── routes.js        # Main routing index
├── scripts/
│   └── seed.js          # Database seed script
├── .env.example
├── package.json
└── server.js            # Entry point
```

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   **Important:** Set your `MONGODB_URI` to a valid MongoDB Atlas connection string.

3. **Database Seeding**
   To populate the database with initial categories, services, and an admin user:
   ```bash
   node scripts/seed.js
   ```
   *Initial Admin Credentials after seeding:*
   - Email: `admin@servone.com`
   - Password: `admin123`

4. **Start the Server**
   ```bash
   # Development
   npm run dev
   # OR
   node server.js
   ```

## API Structure

All APIs are prefixed with `/api`.

- `/api/auth` - Login, OTP
- `/api/users` - Profiles, Addresses
- `/api/partners` - Provider profiles, Workers
- `/api/catalog` - Categories, Services
- `/api/bookings` - Create booking, Update status
- `/api/finance` - Transactions
- `/api/support` - Tickets, Messaging
- `/api/notifications` - Alerts, Mark as read
- `/api/content` - CMS
- `/api/admin` - Admin stats

### Authentication
JWT tokens are passed via the `Authorization: Bearer <token>` header.

### Swagger
*(To be generated - you can integrate swagger-ui-express by reading JSDoc comments or a swagger.json file)*

## Testing
To run tests (after writing test suites in `/tests`):
```bash
npm test
```
