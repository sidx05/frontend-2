import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username and password are required'
      }, { status: 400 });
    }

    // Get client information for session tracking
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Authenticate user
    const authResult = await AuthService.login(username, password, userAgent, ipAddress);

    if (authResult.success) {
      return NextResponse.json({
        success: true,
        message: authResult.message,
        token: authResult.token,
        refreshToken: authResult.refreshToken,
        user: authResult.user
      });
    } else {
      return NextResponse.json({
        success: false,
        message: authResult.message
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred during login'
    }, { status: 500 });
  }
}
