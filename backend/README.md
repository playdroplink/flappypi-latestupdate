# Flappy Pi - Pi Network Payment System

This is the backend service for Flappy Pi that handles Pi Network A2U (App-to-User) payments using the official [pi-backend](https://github.com/pi-apps/pi-nodejs.git) package.

## Features

- ✅ Complete A2U payment flow (create, submit, complete)
- ✅ Payment tracking and database storage
- ✅ Error handling and validation
- ✅ Mainnet configuration
- ✅ Supabase integration
- ✅ CORS support
- ✅ Health check endpoints

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see Environment Configuration below)

3. Set up database schema:
```sql
-- Run the SQL from database/paymentSchema.sql in your Supabase database
```

4. Start the server:
```bash
npm start
```

## Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Pi Network Configuration - MAINNET
PI_API_KEY=your_pi_api_key_here
PI_WALLET_PRIVATE_SEED=your_merchant_wallet_private_seed_here

Notes:
- `PI_WALLET_PRIVATE_SEED` is required for server-side payment flows (create/submit/complete).
- Keep this value secret. Never commit it to the repository.
- Use environment variables in the deployment environment or a secrets manager.
PI_WALLET_PRIVATE_SEED=S_your_wallet_private_seed_here
PI_NETWORK_APP_ID=your_app_id_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Server Configuration
PORT=3001
NODE_ENV=production
ALLOWED_ORIGINS=https://flappypi.fun,https://flappypi2807.pinet.com
```

## API Endpoints

### Payment Endpoints

#### Create A2U Payment
```
POST /api/payments/create
Content-Type: application/json

{
  "amount": 1.0,
  "memo": "Reward for high score",
  "metadata": {
    "gameMode": "classic",
    "score": 100
  },
  "uid": "user_123"
}
```

#### Submit Payment to Blockchain
```
POST /api/payments/submit
Content-Type: application/json

{
  "paymentId": "payment_id_here"
}
```

#### Complete Payment
```
POST /api/payments/complete
Content-Type: application/json

{
  "paymentId": "payment_id_here",
  "txid": "transaction_id_here"
}
```

#### Process Complete A2U Payment Flow
```
POST /api/payments/process-a2u
Content-Type: application/json

{
  "amount": 1.0,
  "memo": "Reward for high score",
  "metadata": {
    "gameMode": "classic",
    "score": 100
  },
  "uid": "user_123"
}
```

#### Get Payment Details
```
GET /api/payments/:paymentId
```

#### Cancel Payment
```
POST /api/payments/cancel
Content-Type: application/json

{
  "paymentId": "payment_id_here"
}
```

#### Get Incomplete Payments
```
GET /api/payments/incomplete/list
```

### Health Check
```
GET /api/health
```

## Payment Flow

### A2U (App-to-User) Payment Process

1. **Create Payment**: Create a payment with amount, memo, metadata, and user ID
2. **Store in Database**: Payment is stored in Supabase for tracking
3. **Submit to Blockchain**: Payment is submitted to Pi Network blockchain
4. **Update Database**: Transaction ID is stored
5. **Complete Payment**: Payment is marked as completed
6. **Final Update**: Payment status is updated to completed

### Database Schema

The system uses a `payments` table with the following structure:

```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    user_uid VARCHAR(255) NOT NULL,
    amount DECIMAL(18, 6) NOT NULL,
    memo TEXT NOT NULL,
    metadata JSONB,
    txid VARCHAR(255),
    status VARCHAR(50) DEFAULT 'created',
    direction VARCHAR(20) DEFAULT 'app_to_user',
    network VARCHAR(20) DEFAULT 'mainnet',
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);
```

## Error Handling

The system includes comprehensive error handling:

- Input validation for all endpoints
- Database error handling with fallbacks
- Pi Network API error handling
- CORS error handling
- 404 and 500 error responses

## Security

- CORS configuration for allowed origins
- Input validation and sanitization
- Environment variable protection
- Database connection security

## Monitoring

- Health check endpoint for service monitoring
- Payment tracking and statistics
- Error logging and monitoring
- Performance monitoring

## Development

### Running in Development Mode

```bash
npm run dev
```

### Testing

Test the payment system with the following curl commands:

```bash
# Health check
curl http://localhost:3001/api/health

# Create payment
curl -X POST http://localhost:3001/api/payments/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1.0,
    "memo": "Test payment",
    "uid": "test_user"
  }'
```

## Production Deployment

1. Set up environment variables for production
2. Configure Supabase database
3. Set up Pi Network mainnet credentials
4. Configure CORS for your domain
5. Deploy to your hosting platform

## Support

For issues and questions:
- Check the [Pi Network documentation](https://developers.minepi.com/)
- Review the [pi-backend package documentation](https://github.com/pi-apps/pi-nodejs.git)
- Check server logs for error details
