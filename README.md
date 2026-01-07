# Online Stadium Management System

A comprehensive full-stack web application for managing stadium bookings, events, matches, and payments for Mogadishu Stadium.

## Features

### User Features
- User registration and authentication
- View stadium availability
- Book stadium for events
- Online payment processing (EVC/Card)
- View booking history
- Ticket management

### Admin Features
- Dashboard with analytics
- Stadium management
- Match/Event management
- Booking approval/rejection
- Payment verification
- User management
- Comprehensive reporting

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Payment**: Stripe integration

### Frontend
- **Framework**: React with Vite
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

## Project Structure

```
Online stadium Antigravity/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context for state management
│   │   └── main.jsx       # Application entry point
│   └── package.json
│
├── server/                 # Backend Express application
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── scripts/           # Utility scripts
│   ├── server.js          # Server entry point
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn package manager

### Backend Setup

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/online_stadium_management
   JWT_SECRET=your_secure_random_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

5. Generate a secure JWT secret:
   ```bash
   node scripts/generate_jwt_secret.js
   ```

6. (Optional) Create an admin user:
   ```bash
   node create_new_admin.js
   ```

7. Start the server:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

### Frontend Setup

1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin)
- `DELETE /api/auth/users/:id` - Delete user (Admin)

### Stadiums
- `GET /api/stadiums` - Get all stadiums
- `POST /api/stadiums` - Create stadium (Admin)
- `PUT /api/stadiums/:id` - Update stadium (Admin)
- `DELETE /api/stadiums/:id` - Delete stadium (Admin)

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create match (Admin)
- `PUT /api/matches/:id` - Update match (Admin)
- `DELETE /api/matches/:id` - Delete match (Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/admin/all` - Get all bookings (Admin)
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/approve` - Approve booking (Admin)
- `PUT /api/bookings/:id/reject` - Reject booking (Admin)

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/verify` - Verify payment

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics (Admin)

## Utility Scripts

Located in `server/scripts/`:

- **diagnose_auth.js** - Diagnose authentication issues
- **fix_user_passwords.js** - Fix user password hashing issues
- **generate_jwt_secret.js** - Generate secure JWT secret
- **verify_auth_fixes.js** - Verify authentication system integrity

## Security Features

- Automatic password hashing with bcrypt
- JWT-based authentication
- Email normalization for case-insensitive login
- Protected admin routes
- Soft delete for user accounts
- Input validation and sanitization

## Recent Updates

### Authentication Persistence Fix (2026-01-01)
- Enhanced User model with automatic password hashing
- Improved authentication controller with detailed logging
- Robust database connection handling
- Updated JWT secret for security
- Created diagnostic and fix tools
- Email normalization for reliable login

## Troubleshooting

### Authentication Issues
If users cannot log in after server restart:

1. Run diagnostic script:
   ```bash
   cd server
   node scripts/diagnose_auth.js
   ```

2. If issues found, run fix script:
   ```bash
   node scripts/fix_user_passwords.js
   ```

For more details, see `server/scripts/README.md`

### Database Connection
Ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software for Mogadishu Stadium Management.

## Support

For support and questions, please contact the development team.

---

**Last Updated**: January 1, 2026
**Version**: 1.0.0
