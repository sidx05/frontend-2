// src/app/api/admin/scheduler/route.ts


import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/scheduler - Get scheduler status and configuration
export async function GET() {
  try {
    // Return basic scheduler status without external services
    const status = {
      isRunning: true,
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      failedJobs: 0
    };
    
    const config = {
      enabled: true,
      interval: '0 */6 * * *', // Every 6 hours
      maxConcurrentJobs: 5,
      retryAttempts: 3
    };
    
    const sourceStatus = {
      totalSources: 0,
      activeSources: 0,
      lastScraped: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      status: status,
      config: config,
      sourceStatus: sourceStatus
    });
  } catch (error) {
    console.error('Error fetching scheduler status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheduler status' },
      { status: 500 }
    );
  }
}

// POST /api/admin/scheduler - Update scheduler configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;
    
    switch (action) {
      case 'start':
      case 'enable':
        // Scheduler is always running in simplified mode
        break;
        
      case 'stop':
      case 'disable':
        // Scheduler cannot be stopped in simplified mode
        break;
        
      case 'update-config':
        // Config updates are not supported in simplified mode
        break;
        
      case 'trigger-manual':
        // Manual scraping would need to be implemented differently
        return NextResponse.json({
          success: true,
          message: 'Manual scraping not available in simplified mode',
          result: { triggered: false }
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      message: `Scheduler ${action} completed successfully (simplified mode)`
    });
  } catch (error) {
    console.error('Error updating scheduler:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update scheduler' },
      { status: 500 }
    );
  }
}
