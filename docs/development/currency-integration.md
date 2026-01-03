# Currency Integration Guide

## Exchange Rate API Provider Selection

### Date: 2025-01-02

### Comparison Analysis

| Provider | Free Tier | Requests/Month | Update Frequency | Reliability | Documentation | Selected |
|----------|-----------|----------------|------------------|-------------|---------------|----------|
| **ExchangeRate-API** | ✅ Yes | 1,500 | Daily | High (99.9% uptime) | Excellent | ✅ **YES** |
| Open Exchange Rates | ✅ Yes | 1,000 | Hourly | High | Good | ❌ No |
| Fixer.io | ❌ No | 100 | Daily | High | Good | ❌ No |

### Selected Provider: ExchangeRate-API

**Website:** https://www.exchangerate-api.com/  
**Documentation:** https://www.exchangerate-api.com/docs/overview

#### Rationale

1. **Free Tier Advantages**
   - 1,500 requests/month (50% more than Open Exchange Rates)
   - No credit card required
   - No expiration on free tier
   - Sufficient for our caching strategy (24-hour cache = ~30 requests/month)

2. **Technical Benefits**
   - Simple REST API with JSON responses
   - Supports 160+ currencies
   - HTTPS encryption
   - CORS enabled for client-side requests
   - Fast response times (<200ms average)

3. **Reliability**
   - 99.9% uptime SLA
   - Redundant infrastructure
   - Real-time rate updates
   - Historical data available

4. **Cost Scalability**
   - Free tier: 1,500 requests/month
   - Paid tier: $9/month for 100,000 requests (if needed)
   - Enterprise options available

#### API Endpoints

**Standard Endpoint (Recommended):**
```
GET https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{BASE_CURRENCY}
```

**Pair Conversion:**
```
GET https://v6.exchangerate-api.com/v6/{API_KEY}/pair/{FROM}/{TO}
```

**Supported Codes:**
```
GET https://v6.exchangerate-api.com/v6/{API_KEY}/codes
```

#### Response Format

```json
{
  "result": "success",
  "documentation": "https://www.exchangerate-api.com/docs",
  "terms_of_use": "https://www.exchangerate-api.com/terms",
  "time_last_update_unix": 1704153601,
  "time_last_update_utc": "Tue, 02 Jan 2024 00:00:01 +0000",
  "time_next_update_unix": 1704240001,
  "time_next_update_utc": "Wed, 03 Jan 2024 00:00:01 +0000",
  "base_code": "USD",
  "conversion_rates": {
    "USD": 1,
    "AED": 3.6725,
    "AFN": 70.5,
    "ALL": 92.5,
    "AMD": 404.5,
    "ANG": 1.79,
    "AOA": 835.5,
    "ARS": 350.5,
    "AUD": 1.45,
    "EUR": 0.91,
    "GBP": 0.79,
    "JPY": 144.5,
    "TRY": 32.5,
    "...": "..."
  }
}
```

#### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| 200 | Success | Process normally |
| 404 | Invalid currency code | Validate input |
| 429 | Rate limit exceeded | Use cached data |
| 500 | Server error | Fallback to static rates |

### API Key Configuration

**Environment Variable:**
```bash
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your_api_key_here
```

**Security Notes:**
- API key is safe to expose in client-side code (read-only access)
- No sensitive operations possible with API key
- Rate limiting prevents abuse
- Can regenerate key if compromised

### Fallback Strategy

#### Primary: ExchangeRate-API
- 24-hour cache reduces requests to ~30/month
- Well within free tier limit (1,500/month)

#### Fallback 1: Cached Rates
- If API fails, use last successful response
- Cache stored in React Query with 48-hour retention
- User notified of stale data

#### Fallback 2: Static Rates
- Hardcoded rates updated monthly
- Located in `lib/constants/exchange-rates.ts`
- Used only if API and cache both unavailable
- User clearly notified of static rates

### Rate Limit Monitoring

**Current Usage Estimate:**
- Cache duration: 24 hours
- Average requests: ~30/month
- Free tier limit: 1,500/month
- Usage: ~2% of free tier

**Monitoring Strategy:**
- Log API calls in development
- Track response headers for rate limit info
- Alert if usage exceeds 80% of free tier
- Plan upgrade to paid tier if needed

### Testing

**Test API Call:**
```bash
curl "https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD"
```

**Expected Response Time:** <200ms  
**Expected Status:** 200 OK  
**Expected Format:** JSON with conversion_rates object

### Next Steps

1. ✅ API provider selected (ExchangeRate-API)
2. ✅ Documentation reviewed
3. ✅ Free tier limits understood
4. ✅ Create API account and obtain key
5. ✅ Implement API client
6. ✅ Add React Query caching
7. ⏳ Implement fallback mechanism

### Environment Setup Instructions

**Step 1: Get Your API Key**
1. Visit https://www.exchangerate-api.com/
2. Click "Get Free Key" button
3. Sign up with your email (no credit card required)
4. Copy your API key from the dashboard

**Step 2: Add to Environment Variables**

Create or update `.env.local` file in project root:

```bash
# Exchange Rate API
# Get your free API key from: https://www.exchangerate-api.com/
# Free tier: 1,500 requests/month
NEXT_PUBLIC_EXCHANGE_RATE_API_KEY=your-api-key-here
```

**Step 3: Restart Development Server**

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

**Step 4: Verify Setup**

Navigate to `/test-exchange-rates` to verify the API integration is working.

### Environment Variable Validation

The application validates the API key:
- **Missing key**: Error message with setup instructions
- **Invalid key**: User-friendly API error
- **Valid key**: Exchange rates load successfully

### Security Considerations

- `NEXT_PUBLIC_` prefix makes the key accessible client-side
- This is **safe** because the API key is designed for public use
- Rate limiting is handled by the API provider
- No sensitive data is exposed through the API
- Key can be regenerated if compromised

### References

- [ExchangeRate-API Documentation](https://www.exchangerate-api.com/docs/overview)
- [Supported Currency Codes](https://www.exchangerate-api.com/docs/supported-currencies)
- [API Status Page](https://status.exchangerate-api.com/)
- [Pricing Information](https://www.exchangerate-api.com/pricing)

### Notes

- Exchange rates update daily at midnight UTC
- Historical data available on paid tiers
- CORS enabled for client-side requests
- IPv6 support available
- No authentication required beyond API key
- Rate limiting: 1,500 requests/month on free tier
- Response caching recommended (24 hours minimum)

### Account Information

**Account Created:** 2025-01-02  
**API Key:** [To be added after account creation]  
**Tier:** Free (1,500 requests/month)  
**Upgrade Plan:** Paid tier ($9/month) if usage exceeds 1,200 requests/month
