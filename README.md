# Personal Portfoy - Portfolio Tracker

A Next.js 15+ application with OAuth2 authentication and comprehensive portfolio tracking features.

## Features

### Authentication
- ✅ Google OAuth2 authentication
- ✅ Secure token management with httpOnly cookies
- ✅ Automatic token refresh
- ✅ Protected routes with middleware
- ✅ Server Components and Server Actions
- ✅ TypeScript with Zod validation

### Portfolio Tracker
- ✅ Portfolio management (create, read, update, delete)
- ✅ Asset tracking (stocks, crypto, forex, etc.)
- ✅ Transaction history (BUY/SELL)
- ✅ **SELL transaction quantity reduction**
- ✅ **Historical data import** (bulk transactions)
- ✅ **Multi-currency support** (USD, TRY, EUR, GBP, etc.)
- ✅ **Cost basis tracking** (FIFO method)
- ✅ **Benchmark comparison** (BIST100, SP500, etc.)
- ✅ **Advanced analytics** (portfolio performance, asset allocation)
- ✅ Comprehensive test coverage

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Authentication**: Supabase Auth (OAuth2)
- **State Management**: Zustand
- **Validation**: Zod
- **Testing**: Jest, React Testing Library, Playwright
- **Styling**: Inline styles (can be migrated to Tailwind CSS)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud Console account (for Google OAuth2)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-portfoy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Configure OAuth2 providers in Supabase:
   - See [docs/setup-step2-google.md](./docs/setup-step2-google.md) for Google setup
   - See [docs/supabase-setup.md](./docs/supabase-setup.md) for Supabase configuration

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
personal-portfoy/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── portfolios/   # Portfolio endpoints
│   │   ├── assets/       # Asset endpoints
│   │   └── transactions/ # Transaction endpoints
│   ├── login/            # Login page
│   ├── profile/          # Profile page
│   └── test/             # Test page
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # UI components
├── lib/                   # Library code
│   ├── api/              # API utilities & business logic
│   ├── auth/             # Authentication utilities
│   ├── supabase/         # Supabase clients
│   ├── store/            # State management
│   └── types/            # TypeScript types
├── supabase/             # Database migrations
│   └── migrations/       # SQL migration files
├── __tests__/            # Integration tests
├── e2e/                  # E2E tests (Playwright)
└── docs/                 # Documentation
    ├── api/              # API documentation
    └── database/         # Database documentation
```

## Authentication Flow

1. User clicks "Sign in with Google" on `/login`
2. Server Action initiates OAuth2 flow via Supabase
3. User redirected to Google OAuth2 consent screen
4. After consent, Google redirects to `/api/auth/callback`
5. Callback handler exchanges code for tokens
6. Tokens stored in httpOnly cookies by Supabase SSR
7. User redirected to `/test` or protected route
8. Middleware checks authentication on each request
9. Tokens automatically refreshed when needed

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run unit and integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run lint` - Run ESLint

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm test -- __tests__/integration
```

### E2E Tests
```bash
npm run test:e2e
```

## Documentation

### Authentication
- [Authentication Architecture](./docs/authentication/architecture.md)
- [OAuth2 Setup Guide](./docs/supabase-setup.md)
- [Token Refresh Mechanism](./docs/authentication/token-refresh.md)
- [Security Review](./docs/security-review.md)
- [Performance Testing](./docs/performance-testing.md)

### Database
- [Database Schema](./docs/database/schema.md)
- [Migration Guide](./docs/database/migration-guide.md)
- [Enhanced Features Migration](./docs/database/migration-guide-enhanced.md)
- [Security Model](./docs/database/security.md)
- [Developer Guide](./docs/database/developer-guide.md)

### API
- [API Endpoints](./docs/api/endpoints.md)
- [Enhanced Features](./docs/api/enhanced-features.md)
- [Postman Guide](./docs/api/POSTMAN_GUIDE.md)
- [Business Logic](./docs/api/business-logic.md)

## Deployment

### Environment Variables

Make sure to set these environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (production URL)

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Security Considerations

- Tokens stored in httpOnly cookies (server-side)
- Secure cookie flags enabled in production
- CSRF protection via Supabase
- Rate limiting handled by Supabase
- No sensitive data in client-side code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

