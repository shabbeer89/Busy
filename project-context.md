# Project Context

## Platform Overview
This is a comprehensive business investment platform called "Strategic Partnership" that connects entrepreneurs with investors through intelligent matching and real-time communication. The platform serves as a bridge between creators (entrepreneurs) with innovative business ideas and investors looking for promising opportunities.

## Technology Stack (Updated)

### Web Application
- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Backend**: Convex (currently) → **Migrating to Supabase + PostgreSQL**
- **Auth**: NextAuth with multiple providers
- **Database**: PostgreSQL (via Supabase)
- **Real-time**: Supabase Realtime

### Mobile Application (New)
- **Framework**: React Native 0.73+ with Expo SDK 50+
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand + TanStack Query
- **UI**: React Native Paper + React Native Elements
- **Backend**: Shared Supabase + PostgreSQL
- **Real-time**: Supabase Realtime
- **Auth**: Supabase Auth with biometric support

## Core Features

### User Authentication
- Phone OTP verification (Twilio integration)
- Email/password registration
- Social OAuth (Google, LinkedIn, Apple, GitHub)
- Progressive signup (creator vs investor distinction)
- JWT token management with automatic refresh
- Biometric Authentication (Fingerprint/Face ID)
- Secure credential storage with React Native Keychain

### Business Idea Management
- Full CRUD operations for business ideas
- Rich text editor with media upload support
- Pitch deck and business plan management
- Funding goals, equity offered, business stage tracking
- Status management: draft → published → funded
- Idea discovery with advanced filtering
- Analytics: view counts, engagement metrics, investor interest

### Investment Management
- Detailed investment offer creation
- Amount ranges, terms, and preferences
- Due diligence tools and document management
- Investment portfolio tracking
- Performance metrics and ROI calculations
- Negotiation history and contract management

### Intelligent Matching Algorithm
- Compatibility scoring based on multiple factors:
  - Industry alignment
  - Investment range compatibility
  - Geographic preferences
  - Risk tolerance matching
  - Growth stage alignment
- Geolocation-based discovery
- Swipe-style matching interface (dating app pattern)
- Real-time match notifications
- Detailed compatibility breakdowns

### Real-time Communication
- Instant messaging between matched users
- Message status indicators (read receipts, typing)
- File sharing capabilities
- Video calling integration (WebRTC/third-party)
- Group chats for project discussions
- Smart notification management

### Dashboard & Analytics
- Personal performance metrics
- Match history and success rates
- Investment portfolio analytics
- Platform-wide market trends
- Goal tracking and achievements
- Real-time activity feeds

### Profile Management
- Comprehensive user profiles
- Verification status and badges
- Business details for creators
- Investment preferences for investors
- Media uploads and social links
- Professional networking features

### Search & Discovery
- Advanced filtering options
- Location-based search
- Industry and category browsing
- Saved search preferences
- Recommendation algorithms

### Favorites & Bookmarks
- Save interesting ideas and offers
- Organized bookmark collections
- Quick access from dashboard
- Notification preferences

### Notifications System
- Push notifications for matches, messages, activities
- Rich content with images and actions
- Scheduled notifications
- Smart categorization and management

### Offline Capability
- Basic functionality without internet
- Data synchronization when online
- Cached content for improved UX
- Offline indicators and sync status

## Detailed Feature Breakdown

### 1. Authentication Flow
- **Phone/OTP verification**: Integrated with existing Twilio infrastructure
- **Multi-provider social login**: Google, Apple, GitHub, LinkedIn
- **Progressive user onboarding**: Creator vs Investor path differentiation
- **Token security**: Automatic refresh with secure storage
- **Biometric integration**: Native device authentication

### 2. Profile Management
**Creator Profiles:**
- Company information and branding
- Industry expertise and experience
- Business track record and achievements
- Team composition and key personnel

**Investor Profiles:**
- Investment focus areas and preferences
- Typical investment ranges and terms
- Risk tolerance assessments
- Preferred industries and geographies
- Track record of successful investments

**Shared Features:**
- Professional avatar and branding
- Comprehensive bio and background
- Location and geographic preferences
- Social media and professional links
- Skills endorsements and verification

### 3. Idea Management (Creator-Focused)
- **Rich Content Creation**: Advanced editor with formatting, media embedding
- **Multi-format Support**: Images, videos, documents, pitch decks
- **Financial Modeling**: Funding goals, equity structures, projections
- **Business Documentation**: Full plans, financials, team details
- **Publishing Workflow**: Draft → Review → Publish lifecycle
- **Analytics Integration**: Track engagement and investor interest
- **Status Management**: Active, Funded, Closed, On Hold

### 4. Investment Offers (Investor-Focused)
- **Structured Proposals**: Clear terms, amounts, conditions
- **Preference Matching**: Industry, stage, geography targeting
- **Due Diligence Workflow**: Document collection and verification
- **Negotiation Tracking**: Terms evolution and communication history
- **Contract Management**: Digital signatures and binding agreements
- **Portfolio Integration**: Performance tracking and reporting

### 5. Matching System Architecture
- **Algorithm Factors**:
  - Industry alignment (35% weight)
  - Investment range compatibility (25% weight)
  - Geographic proximity (15% weight)
  - Risk tolerance match (15% weight)
  - Experience correlation (10% weight)
- **Real-time Processing**: Live compatibility updates
- **User Interaction**: Intuitive swipe interface
- **Feedback Learning**: Continuous algorithm improvement

### 6. Messaging System
- **Real-time Communication**: WebSocket-based instant messaging
- **Rich Content Support**: Text, images, documents, voice notes
- **Thread Management**: Conversation history and organization
- **Notification Integration**: Smart alerts with priority levels
- **Multi-device Sync**: Seamless experience across devices

### 7. Analytics Dashboard
- **User Metrics**: Activity levels, engagement rates, response times
- **Business Intelligence**: Match success rates, ROI tracking
- **Platform Insights**: Market trends, popular sectors
- **Performance Indicators**: Goal progress, achievement tracking

### 8. Social & Networking Features
- **Event Integration**: Local business meetups and conferences
- **Professional Networking**: LinkedIn-style connection building
- **Endorsement System**: Skills verification and recommendations
- **Content Sharing**: Success stories and industry insights

### 9. Crypto Wallet & Blockchain Integration
- **Multi-chain Support**: Ethereum, Polygon, Binance Smart Chain
- **Secure Transactions**: Smart contract-based investments
- **Wallet Management**: Multiple wallet support with security
- **Token Integration**: Platform tokens for premium features
- **Price Tracking**: Real-time crypto market data

## Technical Specifications

### Database Architecture (PostgreSQL via Supabase)
```sql
-- Core user management
users (id, email, phone, name, type, verified, created_at)
business_ideas (id, creator_id, title, description, funding, status, created_at)
investment_offers (id, investor_id, amount_range, preferences, created_at)
matches (id, idea_id, investor_id, score, factors, status)
conversations (id, match_id, last_message_at)
messages (id, conversation_id, sender_id, content, read_status)
analytics_events (user_id, event_type, data, timestamp)
crypto_transactions (match_id, wallet_address, amount, chain, status)
```

### API Architecture
- **GraphQL**: Apollo Client for efficient data fetching
- **REST**: Axios for legacy API compatibility
- **Real-time**: Supabase subscriptions for live updates
- **File Storage**: Supabase Storage with CDN optimization

### Security Implementation
- **Row Level Security (RLS)**: Database-level access control
- **SSL Pinning**: Certificate validation for API calls
- **End-to-end Encryption**: Sensitive message encryption
- **Secure Key Management**: Hardware-backed key storage

### Performance Optimizations
- **Lazy Loading**: Progressive content loading
- **Image Optimization**: Automatic compression and WebP conversion
- **Pagination**: Efficient large dataset handling
- **Caching Strategy**: Multi-level caching (memory, disk, network)
- **Background Sync**: Offline data reconciliation

## Business Strategy & KPIs

### Revenue Streams
- Premium subscriptions with advanced features
- Transaction fees on successful investments (1-3%)
- Featured listing promotions
- Enterprise white-label solutions
- API access for third-party integrations

### Key Performance Indicators
- **Acquisition**: MAU growth, conversion rates, user retention
- **Engagement**: Session duration, feature usage, daily active users
- **Business Impact**: Matches completed, investments facilitated, user ROI
- **Technical**: App performance, crash rates, load times

### Monetization Strategy
- Freemium model with premium feature unlocks
- Tiered subscription plans (Basic, Pro, Enterprise)
- Commission-based transaction fees
- Featured placement and priority matching

## Implementation Roadmap

### Phase 1: Foundation (Q1)
- Supabase migration from Convex
- React Native project setup
- Core authentication and profiles
- Basic idea/investment CRUD

### Phase 2: Core Features (Q2)
- Intelligent matching algorithm
- Real-time messaging system
- Advanced search and filtering
- Dashboard and analytics

### Phase 3: Advanced Features (Q3)
- Crypto wallet integration
- Video calling and media sharing
- Offline mode and background sync
- AI-powered recommendations

### Phase 4: Scale & Optimize (Q4)
- Performance monitoring and optimization
- Advanced analytics and reporting
- Enterprise features and white-label
- International expansion preparation

## Technology Migration Strategy

### From Convex to Supabase
1. **Schema Migration**: Convert existing Convex schema to Supabase PostgreSQL
2. **Data Export/Import**: Migrate existing user and business data
3. **Function Conversion**: Reimplement Convex functions as Supabase Edge Functions
4. **Real-time Implementation**: Convert Convex subscriptions to Supabase channels
5. **Security Migration**: Implement RLS policies to replace Convex permissions

### Mobile App Development Strategy
1. **Expo Setup**: Configure managed workflow with TypeScript
2. **Supabase Integration**: Shared auth and database with web app
3. **UI Component Library**: Implement consistent design system
4. **Offline-First**: Implement data sync and caching strategies
5. **Cross-platform Testing**: Ensure consistent UX across iOS/Android

This comprehensive platform serves as a critical bridge between visionary entrepreneurs and strategic investors, facilitating meaningful business partnerships and successful growth opportunities.
