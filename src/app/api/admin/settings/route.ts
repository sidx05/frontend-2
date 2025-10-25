import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Settings } from '@/models/Settings';

// GET /api/admin/settings - Get settings
export async function GET() {
  try {
    await connectDB();
    
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings
      settings = new Settings({
        siteName: 'NewsHub',
        siteDescription: 'Your trusted source for news',
        siteUrl: 'http://localhost:3000',
        adminEmail: 'admin@newshub.com',
        enableRegistration: false,
        enableComments: true,
        enableNotifications: true,
        maxArticlesPerPage: 20,
        cacheTimeout: 3600,
        maintenanceMode: false,
        seoTitle: 'NewsHub - Latest News',
        seoDescription: 'Stay updated with the latest news from around the world',
        seoKeywords: 'news, latest, updates, world news, breaking news'
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      settings: settings.toObject()
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(body);
    } else {
      Object.assign(settings, body);
    }
    
    await settings.save();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: settings.toObject()
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}