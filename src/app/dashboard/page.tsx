'use client';

import { useState, useEffect } from 'react';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { LinksList } from '@/components/LinksList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrackingLink, TrackingEvent, AnalyticsData } from '@/types/tracking';
import { formatClickCount, exportToCSV } from '@/lib/tracking';

export default function DashboardPage() {
  const [links, setLinks] = useState<TrackingLink[]>([]);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedLink, setSelectedLink] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch links
      const linksResponse = await fetch('/api/generate');
      const linksResult = await linksResponse.json();
      if (linksResult.success) {
        setLinks(linksResult.data);
      }

      // Fetch events
      const eventsResponse = await fetch(`/api/track${selectedLink !== 'all' ? `?linkId=${selectedLink}` : ''}`);
      const eventsResult = await eventsResponse.json();
      if (eventsResult.success) {
        setEvents(eventsResult.data);
      }

      // Fetch analytics
      const analyticsResponse = await fetch(`/api/analytics${selectedLink !== 'all' ? `?linkId=${selectedLink}` : ''}`);
      const analyticsResult = await analyticsResponse.json();
      if (analyticsResult.success) {
        setAnalyticsData(analyticsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLink]);

  const handleExportData = () => {
    if (events.length > 0) {
      const filename = selectedLink !== 'all' 
        ? `tracking-data-${selectedLink}.csv`
        : 'tracking-data-all.csv';
      exportToCSV(events, filename);
    }
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.timestamp);
    const now = new Date();
    
    switch (timeRange) {
      case '1h':
        return eventDate > new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return eventDate > new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return eventDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return eventDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  const selectedLinkData = selectedLink !== 'all' 
    ? links.find(link => link.id === selectedLink)
    : null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your link performance and visitor analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedLink} onValueChange={setSelectedLink}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select link" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Links</SelectItem>
              {links.map((link) => (
                <SelectItem key={link.id} value={link.id}>
                  {link.title || `Link ${link.shortCode}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchData} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Selected Link Info */}
      {selectedLinkData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedLinkData.title || 'Selected Link'}</span>
              <Badge variant={selectedLinkData.isActive ? 'default' : 'secondary'}>
                {selectedLinkData.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
            <CardDescription>
              {selectedLinkData.originalUrl}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Short Code:</span>
                <p className="font-mono">{selectedLinkData.shortCode}</p>
              </div>
              <div>
                <span className="font-medium">Total Clicks:</span>
                <p>{formatClickCount(selectedLinkData.clickCount)}</p>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <p>{new Date(selectedLinkData.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="font-medium">Tracking URL:</span>
                <p className="font-mono text-xs truncate">
                  /track/{selectedLinkData.shortCode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-blue-500 rounded"></div>
              <span className="text-sm font-medium">Total Links</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {analyticsData?.totalLinks || links.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {links.filter(l => l.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium">Total Clicks</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {formatClickCount(analyticsData?.totalClicks || filteredEvents.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-purple-500 rounded"></div>
              <span className="text-sm font-medium">Countries</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {new Set(filteredEvents.map(e => e.country).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-orange-500 rounded"></div>
              <span className="text-sm font-medium">Devices</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {new Set(filteredEvents.map(e => e.deviceType).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Device types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <AnalyticsChart events={filteredEvents} />

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={handleExportData} 
          disabled={filteredEvents.length === 0}
          variant="outline"
        >
          Export Data ({filteredEvents.length} records)
        </Button>
        <Button onClick={fetchData} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Links Management */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Manage Links</h2>
        <LinksList links={links} onRefresh={fetchData} />
      </div>
    </div>
  );
}