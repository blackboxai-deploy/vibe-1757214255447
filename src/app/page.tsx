'use client';

import { useState, useEffect } from 'react';
import { LinkGenerator } from '@/components/LinkGenerator';
import { LinksList } from '@/components/LinksList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrackingLink } from '@/types/tracking';

export default function HomePage() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate');
      const result = await response.json();
      if (result.success) {
        setLinks(result.data);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleLinkGenerated = (newLink: TrackingLink) => {
    setLinks(prev => [newLink, ...prev]);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Advanced Link Tracking & Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Generate trackable links and monitor visitor locations, device information, 
            and detailed analytics in real-time. Perfect for marketing campaigns, 
            security monitoring, and engagement tracking.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Real-time Tracking</Badge>
          <Badge variant="secondary">Geolocation Data</Badge>
          <Badge variant="secondary">Device Analytics</Badge>
          <Badge variant="secondary">Privacy Compliant</Badge>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📍</span>
              </div>
              Location Tracking
            </CardTitle>
            <CardDescription>
              Capture precise visitor locations including country, city, region, and coordinates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• IP-based geolocation</li>
              <li>• Country & city detection</li>
              <li>• Timezone information</li>
              <li>• ISP identification</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📱</span>
              </div>
              Device Analytics
            </CardTitle>
            <CardDescription>
              Detailed information about visitor devices, browsers, and operating systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• Device type detection</li>
              <li>• Browser identification</li>
              <li>• Operating system info</li>
              <li>• Screen resolution data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
              Rich Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive dashboard with charts, trends, and exportable data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>• Interactive charts & graphs</li>
              <li>• Real-time click tracking</li>
              <li>• Export to CSV/JSON</li>
              <li>• Hourly & daily trends</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Main Content Grid */}
      <section className="grid lg:grid-cols-2 gap-8">
        {/* Link Generator */}
        <div>
          <LinkGenerator onLinkGenerated={handleLinkGenerated} />
        </div>

        {/* Links List */}
        <div>
          <LinksList 
            links={links} 
            onRefresh={fetchLinks}
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6 py-12 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Ready to Track Your Links?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get detailed insights into your link performance with advanced location 
            tracking and analytics. Start monitoring your campaigns today.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <a href="/dashboard">
              View Analytics Dashboard
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={fetchLinks} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh Links'}
          </Button>
        </div>
      </section>

      {/* Usage Instructions */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold">Enter URL</h3>
            <p className="text-sm text-muted-foreground">
              Paste the link you want to track and add optional details
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-green-600">2</span>
            </div>
            <h3 className="font-semibold">Generate Link</h3>
            <p className="text-sm text-muted-foreground">
              Get a unique trackable link with custom short code
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="font-semibold">Share & Track</h3>
            <p className="text-sm text-muted-foreground">
              Share your link and monitor clicks in real-time
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-orange-600">4</span>
            </div>
            <h3 className="font-semibold">Analyze Data</h3>
            <p className="text-sm text-muted-foreground">
              View detailed analytics and export your data
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}