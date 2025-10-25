import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({
        success: false,
        message: 'Refresh token is required'
      }, { status: 400 });
    }

    // Refresh the token
    const authResult = await AuthService.refreshToken(refreshToken);

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
    console.error('Token refresh error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred during token refresh'
    }, { status: 500 });
  }
}
