// Simple test script to verify Node.js can access files and environment variables
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Check if .env.local exists and load environment variables
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
console.log('.env.local exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
}

console.log('Test completed successfully');