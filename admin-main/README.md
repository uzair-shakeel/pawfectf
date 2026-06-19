# Ojest Admin Panel

A beautiful and comprehensive admin dashboard for the Ojest car marketplace platform, built with React, Tailwind CSS, Chart.js, and Clerk authentication.

![Ojest Admin Dashboard](public/screenshot-dashboard.png)

## Features

### 🏠 Dashboard Overview

- **Real-time Statistics**: Total users, cars, buyer requests, and average budget metrics
- **Growth Charts**: Visual representation of platform growth over time
- **Data Insights**: User types distribution, top car makes, request status analytics
- **Responsive Design**: Beautiful dark theme with glassmorphism effects

### 👥 User Management

- **User Listing**: Paginated view of all platform users
- **Role Management**: Change user roles (user/admin)
- **Account Control**: Block/unblock user accounts
- **Filtering & Search**: Advanced filtering by role, seller type, status
- **User Analytics**: Statistics on active users, blocked users, company sellers

### 🚗 Car Management

- **Car Inventory**: Complete overview of all cars in the system
- **Status Management**: Update car status (available, sold, pending, suspended)
- **Advanced Filtering**: Filter by make, model, status, condition
- **Seller Information**: View car seller details and contact information
- **Car Analytics**: Statistics by make, status, seller type, and pricing

### 🛒 Buyer Requests Management

- **Request Overview**: Manage all buyer requests in the platform
- **Status Control**: Update request status (Active, Fulfilled, Expired, Cancelled)
- **Offer Tracking**: View number of offers per request
- **Budget Analysis**: Average budgets and pricing insights
- **Request Analytics**: Status distribution and market demand insights

### 🔐 Authentication & Security

- **Clerk Integration**: Secure authentication with Clerk
- **Role-based Access**: Admin-only access with role verification
- **Session Management**: Automatic token refresh and secure API calls

## Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Chart.js, React Chart.js 2
- **Authentication**: Clerk
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons (Feather)

## Setup Instructions

### Prerequisites

- Node.js 16+
- Clerk account and publishable key
- Running Ojest API server

### Installation

1. **Clone and Install Dependencies**

```bash
cd admin
npm install
```

2. **Environment Configuration**
   Create a `.env` file in the admin directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key-here
REACT_APP_API_BASE_URL=http://localhost:5000/api
NODE_ENV=development
```

3. **Clerk Setup**

- Create a Clerk application
- Configure sign-in/sign-up options
- Add the publishable key to your `.env` file
- Set up user metadata for admin roles

4. **API Configuration**
   Ensure your Ojest API server has the admin endpoints:

- User admin routes: `/api/user/admin/*`
- Car admin routes: `/api/car/admin/*`
- Buyer request admin routes: `/api/buyer-request/admin/*`

### Running the Application

**Development Mode**

```bash
npm run dev
```

**Production Build**

```bash
npm run build
npm run preview
```

## API Endpoints

### User Admin Endpoints

- `GET /api/user/admin/stats` - User statistics
- `GET /api/user/admin/all` - All users with pagination
- `PATCH /api/user/admin/:userId/toggle-block` - Block/unblock user
- `PATCH /api/user/admin/:userId/role` - Change user role

### Car Admin Endpoints

- `GET /api/car/admin/stats` - Car statistics
- `GET /api/car/admin/all` - All cars with pagination
- `PATCH /api/car/admin/:carId/status` - Update car status

### Buyer Request Admin Endpoints

- `GET /api/buyer-request/admin/stats` - Request statistics
- `GET /api/buyer-request/admin/all` - All requests with pagination
- `PATCH /api/buyer-request/admin/:requestId/status` - Update request status

## User Roles & Permissions

### Admin Users

- Full access to all admin features
- Can manage users, cars, and buyer requests
- Can view comprehensive analytics and statistics
- Cannot be blocked by other admins

### Regular Users

- Redirected to main dashboard
- No access to admin-specific features

## Authentication Flow

1. **User Access**: User visits admin panel
2. **Clerk Authentication**: Redirected to Clerk sign-in if not authenticated
3. **Role Verification**: Check if user has admin role in publicMetadata
4. **API Authorization**: All API calls include Clerk JWT token
5. **Admin Access**: Full admin features available

## Setting Up Admin Users

To make a user an admin:

1. **Via Clerk Dashboard**:

   - Go to Users section
   - Select user
   - Add to publicMetadata: `{ "role": "admin" }`

2. **Via API** (if you have user management endpoints):
   ```javascript
   // Update user metadata
   await clerkClient.users.updateUserMetadata(userId, {
     publicMetadata: { role: "admin" },
   });
   ```

## Development Guidelines

### Code Structure

```
admin/
├── src/
│   ├── components/
│   │   └── shared/          # Reusable components
│   ├── pages/               # Main pages
│   ├── services/            # API services
│   ├── context/             # React contexts
│   └── App.jsx              # Main app component
├── public/                  # Static assets
└── package.json
```

### Adding New Features

1. **New Page**: Create component in `src/pages/`
2. **API Service**: Add functions to `src/services/api.js`
3. **Route**: Add route to `App.jsx`
4. **Navigation**: Update sidebar in `components/shared/Sidebar.jsx`

### Styling Guidelines

- Use Tailwind CSS classes
- Follow dark theme color palette
- Use glassmorphism effects for cards
- Implement responsive design patterns

## Troubleshooting

### Common Issues

1. **Clerk Key Missing**

   - Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env`
   - Verify the key is correct from Clerk dashboard

2. **API Connection Issues**

   - Check `REACT_APP_API_BASE_URL` in `.env`
   - Ensure API server is running
   - Verify CORS settings on API server

3. **Authentication Problems**

   - Check user has admin role in Clerk metadata
   - Verify JWT token is being sent with requests
   - Check API middleware for Clerk token validation

4. **Data Loading Issues**
   - Check browser network tab for API errors
   - Verify admin endpoints exist on API server
   - Check user permissions and role validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Ojest platform and follows the same licensing terms.

## Support

For support and questions:

- Check the troubleshooting section
- Review API documentation
- Contact the development team
