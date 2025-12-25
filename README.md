# InterviewBit - AI-Powered Interview Preparation Platform

A modern, professional interview-preparation web application that helps users practice company-specific interview questions with AI-powered resume analysis and chatbot assistance.

## Features

- 🔐 **Authentication**: Sign up / Sign in with email and password
- 👤 **User Profile**: Editable profile with personal information
- 📄 **Resume Upload & AI Analysis**: Upload resume (PDF, DOCX, TXT) and get AI-powered analysis
- 💬 **AI Chatbot**: Conversational assistant for interview preparation
- 📚 **Practice Questions**: Browse and filter questions by company, difficulty, and topic
- 💳 **Subscription System**: Premium plans with Stripe integration for company-specific questions
- 🎨 **Modern UI**: Clean, responsive design with CSS modules

## Tech Stack

### Frontend
- React (JavaScript)
- React Router
- Axios
- CSS Modules

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- OpenAI API
- Stripe

## Project Structure

```
InterviewPrep/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (AI, payments)
│   │   ├── middlewares/     # Auth middleware
│   │   └── utils/           # Utility functions
│   ├── uploads/             # Uploaded resume files
│   ├── server.js            # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API service
│   │   └── styles/          # CSS files
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key
- Stripe account (for payments)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/interviewbit
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewbit

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT expiration time (default: 7d)
- `GEMINI_API_KEY`: Google Gemini API key for AI features
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend (.env)

- `REACT_APP_API_URL`: Backend API URL (default: /api)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Resume
- `POST /api/resume/upload` - Upload resume file
- `POST /api/resume/parse` - Parse resume with AI

### Questions
- `GET /api/questions` - Get questions with filters
- `GET /api/questions/:id` - Get single question

### Chat
- `GET /api/chat/session` - Get or create chat session
- `POST /api/chat/message` - Send message to chatbot
- `DELETE /api/chat/session` - Clear chat session

### Subscriptions
- `GET /api/subscriptions/status` - Get subscription status
- `GET /api/subscriptions/plans` - Get available plans
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout session

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Admin
- `GET /api/admin/questions` - Get all questions (admin)
- `POST /api/admin/questions` - Create question (admin)
- `PUT /api/admin/questions/:id` - Update question (admin)
- `DELETE /api/admin/questions/:id` - Delete question (admin)
- `GET /api/admin/companies` - Get all companies (admin)
- `POST /api/admin/companies` - Create company (admin)

## Database Schema

### Collections

- **users**: User accounts
- **profiles**: User profiles with resume info
- **companies**: Company information
- **questions**: Interview questions
- **subscriptions**: User subscriptions
- **payments**: Payment records
- **chat_sessions**: Chatbot conversation sessions

## Stripe Integration

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up webhooks:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook secret to your `.env` file

## Google Gemini Integration

1. Create a Google AI Studio account at https://aistudio.google.com
2. Generate an API key
3. Add the key to your backend `.env` file as `GEMINI_API_KEY`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment

Recommended platforms:
- Render
- Heroku
- AWS
- Google Cloud Platform

Make sure to:
- Set all environment variables
- Use MongoDB Atlas for production database
- Configure CORS for your frontend domain
- Set up Stripe webhooks with production URL

### Frontend Deployment

Recommended platforms:
- Vercel
- Netlify
- AWS Amplify

Make sure to:
- Set `REACT_APP_API_URL` to your production backend URL
- Configure build settings

## Security Considerations

- Passwords are hashed using bcrypt
- JWT tokens stored in HTTP-only cookies
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- File upload validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For support, email support@interviewbit.com or open an issue in the repository.

