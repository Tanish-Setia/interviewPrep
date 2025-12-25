# Quick Start Guide

This guide will help you get InterviewBit up and running quickly.

## Prerequisites

Before you begin, make sure you have:
- Node.js (v16 or higher) installed
- MongoDB installed locally OR a MongoDB Atlas account
- A Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))
- A Stripe account for payments ([Sign up here](https://stripe.com))

## Step 1: Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/interviewbit`

### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace `<password>` with your database password

## Step 3: Configure Environment Variables

### Backend (.env)
Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-random-secret-key-here
JWT_EXPIRE=7d
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
Create `frontend/.env` file (optional):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 4: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## Step 5: Create an Admin User (Optional)

To create an admin user, you can use MongoDB shell or a tool like MongoDB Compass:

```javascript
// In MongoDB shell or Compass
use interviewbit
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Step 6: Set Up Stripe Webhooks (For Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret to your `.env` file

## Step 7: Test the Application

1. Open `http://localhost:3000` in your browser
2. Sign up for a new account
3. Upload a resume (PDF or TXT format)
4. Click "Analyze with AI" to test resume parsing
5. Try the chatbot feature
6. Browse practice questions

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify all environment variables are set
- Check if port 5000 is available

### Frontend won't start
- Make sure backend is running first
- Check if port 3000 is available
- Clear browser cache

### Resume parsing fails
- Verify Gemini API key is correct
- Check if you have API credits/quota
- Ensure resume file is in supported format (PDF, TXT)

### Stripe payments not working
- Use test mode keys for development
- Verify webhook URL is correct
- Check Stripe dashboard for webhook events

## Next Steps

- Add sample questions via admin panel
- Create companies in the database
- Customize the UI to match your brand
- Deploy to production (see README.md for deployment instructions)

## Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints in the README
- Check console logs for error messages

Happy coding! 🚀

