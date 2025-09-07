import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { AnalyticsData } from '@/types/tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');
    
    if (linkId) {
      // Get analytics for specific link
      const link = storage.getLink(linkId);
      if (!link) {
        return NextResponse.json(
          { success: false, error: 'Link not found' },
          { status: 404 }
        );
      }

      const events = storage.getEvents(linkId);
      const analyticsData: AnalyticsData = {
        totalLinks: 1,
        totalClicks: events.length,
        recentEvents: events.slice(0, 10), // Last 10 events
        topCountries: storage.getClicksByCountry().filter(c => 
          events.some(e => e.country === c.country)
        ),
        clicksByHour: storage.getClicksByHour(),
        deviceStats: storage.getDeviceStats().filter(d =>
          events.some(e => e.deviceType === d.type)
        )
      };

      return NextResponse.json({
        success: true,
        data: analyticsData
      });
    } else {
      // Get overall analytics
      const allLinks = storage.getAllLinks();
      const allEvents = storage.getEvents();
      
      const analyticsData: AnalyticsData = {
        totalLinks: allLinks.length,
        totalClicks: allEvents.length,
        recentEvents: allEvents.slice(0, 20), // Last 20 events
        topCountries: storage.getClicksByCountry(),
        clicksByHour: storage.getClicksByHour(),
        deviceStats: storage.getDeviceStats()
      };

      return NextResponse.json({
        success: true,
        data: analyticsData
      });
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get summary statistics
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeRange = '24h' } = body;
    
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '1h':
        cutoffDate.setHours(cutoffDate.getHours() - 1);
        break;
      case '24h':
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case '7d':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      default:
        cutoffDate.setDate(cutoffDate.getDate() - 1);
    }

    const allEvents = storage.getEvents().filter(event => 
      event.timestamp >= cutoffDate
    );

    const summary = {
      totalClicks: allEvents.length,
      uniqueCountries: new Set(allEvents.map(e => e.country).filter(Boolean)).size,
      topReferrers: [...allEvents.reduce((acc, event) => {
        if (event.referrer) {
          acc.set(event.referrer, (acc.get(event.referrer) || 0) + 1);
        }
        return acc;
      }, new Map())].sort(([,a], [,b]) => b - a).slice(0, 5),
      hourlyDistribution: storage.getClicksByHour().filter(h => h.count > 0)
    };

    return NextResponse.json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}