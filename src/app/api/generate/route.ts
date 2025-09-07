import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { generateId, generateShortCode, isValidUrl } from '@/lib/tracking';
import { TrackingLink, GenerateLinkRequest } from '@/types/tracking';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateLinkRequest = await request.json();
    const { url, title, description, customCode } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate or use custom short code
    let shortCode = customCode || generateShortCode();
    
    // Ensure short code is unique
    if (storage.getLinkByShortCode(shortCode)) {
      if (customCode) {
        return NextResponse.json(
          { success: false, error: 'Custom code already exists' },
          { status: 400 }
        );
      }
      // Generate a new one if auto-generated conflicts
      shortCode = generateShortCode();
    }

    // Create new tracking link
    const trackingLink: TrackingLink = {
      id: generateId(),
      originalUrl: url,
      shortCode,
      title: title || undefined,
      description: description || undefined,
      createdAt: new Date(),
      clickCount: 0,
      isActive: true
    };

    // Store the link
    storage.createLink(trackingLink);

    return NextResponse.json({
      success: true,
      data: trackingLink
    });

  } catch (error) {
    console.error('Error generating link:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const links = storage.getAllLinks();
    return NextResponse.json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}