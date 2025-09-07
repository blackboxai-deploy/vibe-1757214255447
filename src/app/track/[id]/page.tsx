'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TrackPage() {
  const params = useParams();
  const shortCode = params.id as string;
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const trackAndRedirect = async () => {
      try {
        // Get additional location data from browser if available
        const additionalData: any = {
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          userAgent: navigator.userAgent
        };

        // Try to get precise location if user allows
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                enableHighAccuracy: true
              });
            });
            
            additionalData.latitude = position.coords.latitude;
            additionalData.longitude = position.coords.longitude;
          } catch (geoError) {
            // Geolocation not available or denied - that's okay
            console.log('Geolocation not available:', geoError);
          }
        }

        // First, get the link info to find the linkId
        const linkResponse = await fetch('/api/generate');
        const linkResult = await linkResponse.json();
        
        if (!linkResult.success) {
          throw new Error('Failed to fetch links');
        }

        const targetLink = linkResult.data.find((link: any) => link.shortCode === shortCode);
        
        if (!targetLink) {
          throw new Error('Link not found');
        }

        setLinkInfo(targetLink);

        // Track the click
        const trackResponse = await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            linkId: targetLink.id,
            additionalData
          }),
        });

        const trackResult = await trackResponse.json();

        if (trackResult.success) {
          // Start countdown for redirect
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                // Redirect to the original URL
                window.location.href = targetLink.originalUrl;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          setIsRedirecting(true);
        } else {
          throw new Error(trackResult.error || 'Failed to track click');
        }

      } catch (err: any) {
        console.error('Tracking error:', err);
        setError(err.message || 'An error occurred while processing the link');
        setIsRedirecting(false);
      }
    };

    if (shortCode) {
      trackAndRedirect();
    }
  }, [shortCode]);

  const handleManualRedirect = () => {
    if (linkInfo?.originalUrl) {
      window.location.href = linkInfo.originalUrl;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Link Error</CardTitle>
              <CardDescription className="text-center">
                There was a problem with this tracking link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  This could happen if:
                </p>
                <ul className="text-xs text-left space-y-1">
                  <li>• The link has expired or been deactivated</li>
                  <li>• The short code is invalid</li>
                  <li>• There's a temporary server issue</li>
                </ul>
                
                <Button 
                  onClick={() => window.location.href = '/'} 
                  className="w-full"
                >
                  Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              Processing Link
            </CardTitle>
            <CardDescription className="text-center">
              {isRedirecting ? 'Redirecting you safely...' : 'Preparing redirect...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {linkInfo && (
              <div className="space-y-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">
                    Verified Link
                  </Badge>
                  <p className="text-sm font-medium">
                    {linkInfo.title || 'Tracking Link'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    Destination: {linkInfo.originalUrl}
                  </p>
                </div>
                
                {isRedirecting && (
                  <div className="text-center space-y-3">
                    <div className="text-3xl font-bold text-blue-600">
                      {countdown}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}
                    </p>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(6 - countdown) * 20}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleManualRedirect}
                    className="w-full"
                    size="sm"
                  >
                    Continue Now →
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'} 
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Cancel & Go Home
                  </Button>
                </div>
              </div>
            )}

            {!linkInfo && !error && (
              <div className="text-center space-y-4">
                <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-muted-foreground">
                  Verifying link and preparing redirect...
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                🔒 This is a secure tracking link.<br/>
                Your privacy is protected.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}