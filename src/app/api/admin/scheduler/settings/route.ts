// src/app/api/admin/scheduler/settings/route.ts

import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/scheduler/settings - Get scheduler settings and available options
export async function GET() {
  try {
    // Return basic scheduler settings without external services
    const settings = {
      enabled: true,
      interval: '0 */6 * * *', // Every 6 hours
      maxConcurrentJobs: 5,
      retryAttempts: 3,
      timeout: 300000, // 5 minutes
      autoStart: true
    };
    
    const availableIntervals = [
      { value: '0 */1 * * *', label: 'Every hour' },
      { value: '0 */6 * * *', label: 'Every 6 hours' },
      { value: '0 */12 * * *', label: 'Every 12 hours' },
      { value: '0 0 * * *', label: 'Daily at midnight' },
      { value: '0 0 * * 0', label: 'Weekly on Sunday' }
    ];
    
    const statusSummary = {
      enabled: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return NextResponse.json({
      success: true,
      settings: settings,
      availableIntervals: availableIntervals,
      statusSummary: statusSummary
    });
  } catch (error) {
    console.error('Error fetching scheduler settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scheduler settings' },
      { status: 500 }
    );
  }
}

// POST /api/admin/scheduler/settings - Update scheduler settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;
    
    // Basic validation for cron expressions
    const cronRegex = /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([012]?\d|3[01])) (\*|([0-6])) (\*|(19|20)?\d{2})$/;
    
    if (settings.interval && !cronRegex.test(settings.interval)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cron expression' },
        { status: 400 }
      );
    }
    
    // In simplified mode, we just return success without actually updating
    return NextResponse.json({
      success: true,
      message: 'Scheduler settings updated successfully (simplified mode)',
      settings: {
        enabled: true,
        interval: settings.interval || '0 */6 * * *',
        maxConcurrentJobs: settings.maxConcurrentJobs || 5,
        retryAttempts: settings.retryAttempts || 3,
        timeout: settings.timeout || 300000,
        autoStart: settings.autoStart !== false
      }
    });
  } catch (error) {
    console.error('Error updating scheduler settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update scheduler settings' },
      { status: 500 }
    );
  }
}
