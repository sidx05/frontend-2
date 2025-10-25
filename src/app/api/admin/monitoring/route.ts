import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';

// GET /api/admin/monitoring - Get monitoring data
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Return basic monitoring data without external services
    const systemMetrics = {
      cpuUsage: 25.5,
      memoryUsage: 60.2,
      diskUsage: 45.8,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
    
    const sourceMetrics = {
      totalSources: 0,
      activeSources: 0,
      lastScraped: new Date().toISOString(),
      averageResponseTime: 0
    };
    
    const sourceHealth = {
      healthy: 0,
      warning: 0,
      critical: 0,
      lastCheck: new Date().toISOString()
    };
    
    const rateLimitStats = {
      totalRequests: 0,
      blockedRequests: 0,
      averageRequestsPerMinute: 0
    };
    
    const recentRuns = [];
    
    return NextResponse.json({
      success: true,
      data: {
        system: systemMetrics,
        sources: sourceMetrics,
        health: sourceHealth,
        rateLimiting: rateLimitStats,
        recentRuns: recentRuns
      }
    });
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}
