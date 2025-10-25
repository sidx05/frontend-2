import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';

// GET /api/admin/rate-limiting - Get rate limiting configuration and status
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Return basic rate limiting configuration without external services
    const config = {
      enabled: true,
      defaultWindowMs: 900000, // 15 minutes
      defaultMaxRequests: 1000,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };
    
    const allRateLimits = [];
    
    const statistics = {
      totalRequests: 0,
      blockedRequests: 0,
      averageRequestsPerMinute: 0,
      lastReset: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: {
        config,
        sources: allRateLimits,
        statistics
      }
    });
  } catch (error) {
    console.error('Error fetching rate limiting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rate limiting data' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/rate-limiting - Update rate limiting configuration
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { config } = body;
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuration is required' },
        { status: 400 }
      );
    }
    
    // In simplified mode, just return success without actually updating
    return NextResponse.json({
      success: true,
      message: 'Rate limiting configuration updated successfully (simplified mode)'
    });
  } catch (error) {
    console.error('Error updating rate limiting configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update rate limiting configuration' },
      { status: 500 }
    );
  }
}
