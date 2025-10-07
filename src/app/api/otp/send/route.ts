import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, sendOTP as sendOTPService, storeOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP for verification
    storeOTP(phoneNumber, otp);

    // Send OTP via SMS
    const sent = await sendOTPService(phoneNumber, otp);

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please check your phone number.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}