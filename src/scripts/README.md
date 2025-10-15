# Data Population Scripts

This directory contains scripts for populating the database with test data to solve the "no data" issue in the application.

## 🚨 CRITICAL: Authentication ID Mismatch Fix Required

**Before running these scripts, you MUST fix the authentication issue that was causing no data to display in matches, messages, and favorites pages.**

### The Problem
Your authentication system was creating two different user IDs for the same user:
- **Supabase Auth user ID** (proper UUID from `auth.users` table)
- **Custom users table ID** (randomly generated UUID)

This caused queries to look for data with mismatched user IDs.

### The Fix Applied
The `src/lib/auth.ts` file has been updated to:
- ✅ Use Supabase Auth user IDs instead of random UUIDs
- ✅ Properly link authentication with user profiles
- ✅ Ensure consistent user IDs across all tables

### Required Actions Before Running Scripts
1. **Deploy the updated authentication code**
2. **Clear existing user data** in your Supabase database (see cleanup section below)
3. **Clear browser cache/cookies**
4. **Re-login** to create properly linked user records

## Available Scripts

### `populate-test-data.ts`
Comprehensive data population script that creates:
- 8 test users (4 creators, 4 investors) with realistic profiles
- 5 sample business ideas across different industries
- 4 investment offers with various criteria
- Smart matches between compatible ideas and offers
- Sample favorites and conversations

### `create-test-user.ts`
Simple script to create a single test user via HTTP API call.

### `create-test-user-simple.js`
JavaScript version that creates a test user directly in Supabase.

## Setup Instructions

### 1. Environment Variables
Before running the scripts, ensure you have the following environment variables set:

```bash
# Required for data population scripts
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional - for authentication features
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
LINKEDIN_CLIENT_ID=your_linkedin_client_id
```

### 2. Install Dependencies
```bash
npm install --save-dev ts-node
```

### 3. Run Database Schema
Ensure your database schema is set up by running:
```bash
# Apply the complete schema
psql -d your_database -f complete-fixed-schema.sql
```

## Usage

### Populate All Test Data
```bash
# Run the comprehensive data population script
npx ts-node src/scripts/populate-test-data.ts
```

### Create Single Test User
```bash
# Using TypeScript version (HTTP API)
npx ts-node src/scripts/create-test-user.ts

# Using JavaScript version (direct database)
node src/scripts/create-test-user-simple.js
```

## What Gets Created

After running the comprehensive script, your database will contain:

### Users (8 total)
**Creators:**
- Sarah Chen (EcoTech Solutions) - Clean Technology
- Mike Rodriguez (HealthAI) - Healthcare
- Amina Benali (EduChain) - Education
- David Kim (FinFlow) - Fintech

**Investors:**
- Alexandra Foster - Healthcare focus
- James Wilson - AI/SaaS focus
- Priya Patel - Social impact focus
- Robert Taylor - Hardware/CleanTech focus

### Business Ideas (5 total)
1. **AI-Powered Personal Finance Advisor** (Fintech)
2. **Sustainable Packaging Revolution** (Clean Technology)
3. **Telemedicine Platform for Mental Health** (Healthcare)
4. **Blockchain-Based Educational Credentials** (Education)
5. **Smart City Traffic Optimization** (Technology)

### Investment Offers (4 total)
1. **Healthcare Innovation Fund**
2. **Clean Tech Investment Opportunity**
3. **AI-First SaaS Fund**
4. **Education Technology Fund**

### Smart Matches
The script creates intelligent matches based on:
- Industry alignment
- Investment stage preferences
- Funding amount compatibility
- Equity range fit

### Sample Data
- Favorites between compatible users
- Conversations with realistic message exchanges
- Proper relationships between all entities

## Test Credentials

All created users have the password: `password123`

You can use any of the created user emails to log in and test the application.

## Troubleshooting

### Environment Variables Not Set
```bash
# Check if variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Script Fails to Connect
1. Verify your Supabase project is active
2. Check that the service role key is correct
3. Ensure Row Level Security policies allow the operations

### Data Already Exists
The script checks for existing data and skips duplicates, so it's safe to run multiple times.

## Database Cleanup (Required for Authentication Fix)

Since the authentication fix requires consistent user IDs, you need to clear existing data that has mismatched IDs:

### Option 1: Manual Cleanup via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Clear these tables in order:
   - `favorites` (safest to clear first)
   - `matches`
   - `conversations`
   - `messages`
   - `business_ideas`
   - `investment_offers`
   - `users` (⚠️ This will require users to re-register)

### Option 2: SQL Cleanup Script
Run the provided cleanup script in your Supabase SQL Editor:
```bash
# Run the cleanup script
psql -d your_database -f test-data-population.sql
```
Or copy and paste the cleanup section from the top of `test-data-population.sql` into your Supabase SQL Editor.

### After Cleanup
1. **Deploy your updated authentication code**
2. **Clear browser cache/cookies**
3. **Re-login** to your application (this will create properly linked user records)
4. **Run the data population script**

## ✅ FIXED: Authentication Integration Issue

**The authentication mismatch issue has been resolved!** Here's what was fixed:

### The Problem (Before)
- ❌ Users table contained `test@example.com` but Supabase Auth didn't know about this user
- ❌ RLS policies failed due to auth context mismatches
- ❌ Queries failed because of inconsistent user IDs

### The Solution (After)
- ✅ **Fixed API endpoint** (`src/app/api/test-user/route.ts`): Now properly creates Supabase Auth users first, then creates profile records with matching IDs
- ✅ **Fixed direct script** (`src/scripts/create-test-user-direct.js`): Updated to use proper Supabase Auth admin API and service role key
- ✅ **Consistent user IDs**: Both Supabase Auth and custom users table now use the same UUID

### Key Changes Made

1. **API Endpoint (`/api/test-user`)**:
   ```typescript
   // ✅ Creates Supabase Auth user first
   const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
     email: testEmail,
     password: testPassword,
     email_confirm: true
   });

   // ✅ Then creates profile using auth user ID
   const { data: newProfile, error: profileError } = await supabase
     .from('users')
     .insert({
       id: authUser!.id, // Uses Supabase Auth user ID
       email: testEmail,
       // ... other profile data
     });
   ```

2. **Direct Script (`create-test-user-direct.js`)**:
   - ✅ Uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations
   - ✅ Properly handles Supabase Auth admin API endpoints
   - ✅ Creates auth user first, then profile with matching ID

### Testing the Fix

To test that the authentication integration is working:

1. **Clear existing inconsistent data** (see cleanup section above)

2. **Create Auth Users** - Run this command in your terminal:
   ```bash
   node src/scripts/create-auth-users.js
   ```

3. **Verify in Supabase Dashboard**:
   - **Authentication > Users** - should see all 9 test users
   - **Table Editor > users** - should see matching profiles with same IDs

4. **Test login** with any of these credentials:
   ```bash
   # Main test user
   test@example.com / testpassword123

   # Creator users
   sarah.chen@example.com / password123
   mike.rodriguez@example.com / password123
   amina.benali@example.com / password123
   david.kim@example.com / password123

   # Investor users
   alexandra.foster@example.com / password123
   james.wilson@example.com / password123
   priya.patel@example.com / password123
   robert.taylor@example.com / password123
   ```

5. **Verify data access**:
   - Check that matches, messages, favorites pages load without errors
   - RLS policies should now work correctly

### Benefits of This Fix

- ✅ **Proper Authentication**: Users can now login/logout correctly
- ✅ **Working RLS Policies**: Database security policies work as intended
- ✅ **Consistent Data Access**: No more auth context mismatches
- ✅ **Future-Proof**: New user creation will work correctly
- ✅ **Maintainable**: Clean separation between auth and profile data

## Manual Testing

After running the script, you can verify the data was created by:

1. **Checking the application pages:**
   - `/matches` - Should show matches between ideas and offers
   - `/messages` - Should show conversations
   - `/favorites` - Should show favorited items
   - `/offers` - Should show investment offers
   - `/ideas` - Should show business ideas

2. **Database queries:**
   ```sql
   -- Count records in each table
   SELECT 'users' as table_name, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'business_ideas', COUNT(*) FROM business_ideas
   UNION ALL
   SELECT 'investment_offers', COUNT(*) FROM investment_offers
   UNION ALL
   SELECT 'matches', COUNT(*) FROM matches
   UNION ALL
   SELECT 'favorites', COUNT(*) FROM favorites
   UNION ALL
   SELECT 'conversations', COUNT(*) FROM conversations
   UNION ALL
   SELECT 'messages', COUNT(*) FROM messages;
   ```

## Cleaning Up Test Data

To remove all test data:
```sql
-- Delete in reverse dependency order
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM favorites;
DELETE FROM matches;
DELETE FROM business_ideas;
DELETE FROM investment_offers;
DELETE FROM users WHERE email LIKE '%@example.com';
```

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your environment variables
3. Ensure your Supabase project is properly configured
4. Check that Row Level Security policies are set up correctly
