# Freelancer Backend API

A complete Express.js backend server for handling payments, user authentication, orders, and contact forms.

## Features

✅ **User Authentication** - Registration and login with JWT tokens
✅ **Payment Processing** - Razorpay integration with webhook support
✅ **Order Management** - Create, read, update, and delete customer orders
✅ **Form Submissions** - Contact form and inquiry management
✅ **Email Service** - SMTP-based email notifications
✅ **User Profiles** - Complete user profile management
✅ **RLS Security** - Row-level security for all database tables
✅ **Error Handling** - Comprehensive error handling and validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- Supabase account and project
- Razorpay account
- SMTP email configuration

### Installation

1. Install dependencies:
```bash
cd backend
npm install
# or
pnpm install
```

2. Create `.env` file in the backend directory:
```bash
cp .env.example .env
```

3. Configure your environment variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

RAZORPAY_ID=your_razorpay_id
RAZORPAY_SECRET=your_razorpay_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL_1=mdmarufalam315@gmail.com
ADMIN_EMAIL_2=khandanish0503@gmail.com

PORT=3000
NODE_ENV=development
```

### Running the Server

Development mode (with hot reload):
```bash
npm run dev
# or
pnpm dev
```

Production mode:
```bash
npm start
# or
pnpm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

### Users

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password

### Payments

- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify-payment` - Verify payment signature
- `POST /api/payments/webhook` - Razorpay webhook receiver

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Forms

- `POST /api/forms/contact` - Submit contact form
- `GET /api/forms/submissions/:type` - Get form submissions
- `PUT /api/forms/submissions/:id` - Update submission status

## Email Templates

The email service includes pre-built templates for:

- Contact form confirmation
- Admin contact notifications
- Payment confirmation
- Admin payment notifications

## Database Schema

### Tables

- **users** - User accounts and profiles
- **orders** - Customer service orders
- **payments** - Payment transaction records
- **form_submissions** - Contact form submissions

All tables include:
- Row Level Security (RLS) policies
- Proper indexes for performance
- Timestamps for audit trails

## Security

- JWT-based authentication
- RLS policies on all tables
- Input validation with express-validator
- CORS configuration
- Helmet for HTTP headers
- Password hashing with bcryptjs

## Error Handling

The API returns standardized error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

## Deployment

### Hosting Options

1. **Heroku** - Easy deployment with Procfile
2. **Railway** - Simple git-based deployment
3. **Render** - Free tier available
4. **AWS/GCP/Azure** - For production applications

### Database

All data is stored in Supabase (PostgreSQL), so no database migrations are needed during deployment.

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

Update this README when adding new endpoints or features.

## Support

For issues or questions, contact the admin emails configured in the environment.
