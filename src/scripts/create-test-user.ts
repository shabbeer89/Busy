// Simple script to create test user via HTTP request to the API endpoint
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function createTestUser() {
  try {
    console.log('🚀 Creating test user via API endpoint...');

    // Use curl to call the existing API endpoint
    const { stdout, stderr } = await execAsync(
      `curl -X POST http://localhost:3000/api/test-user -H "Content-Type: application/json" -d "{}" -s`
    );

    if (stderr) {
      console.error('❌ Error calling API:', stderr);
      return;
    }

    try {
      const response = JSON.parse(stdout);
      if (response.success) {
        console.log('✅ Test user created successfully!');
        console.log('📧 Email: test@example.com');
        console.log('🔑 Password: testpassword123');
        if (response.user) {
          console.log('🆔 User ID:', response.user.id);
        }
      } else {
        console.error('❌ API Error:', response.error);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse API response:', parseError);
      console.log('Raw response:', stdout);
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

// Run the script
createTestUser();
