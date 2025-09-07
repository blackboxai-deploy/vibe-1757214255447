import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { createTrackingEvent } from '@/lib/tracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, additionalData } = body;

    if (!linkId) {
      return NextResponse.json(
        { success: false, error: 'Link ID is required' },
        { status: 400 }
      );
    }

    // Verify link exists
    const link = storage.getLink(linkId);
    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    if (!link.isActive) {
      return NextResponse.json(
        { success: false, error: 'Link is inactive' },
        { status: 403 }
      );
    }

    // Create tracking event
    const trackingEvent = await createTrackingEvent(linkId, request, additionalData);
    
    // Store the event
    storage.addEvent(trackingEvent);

    return NextResponse.json({
      success: true,
      data: {
        eventId: trackingEvent.id,
        redirectUrl: link.originalUrl
      }
    });

  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get tracking events for a specific link
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');
    
    if (linkId) {
      const events = storage.getEvents(linkId);
      return NextResponse.json({
        success: true,
        data: events
      });
    } else {
      // Return all events
      const events = storage.getEvents();
      return NextResponse.json({
        success: true,
        data: events
      });
    }
  } catch (error) {
    console.error('Error fetching tracking events:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}