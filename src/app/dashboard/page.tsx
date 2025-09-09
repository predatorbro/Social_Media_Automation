"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  PlusCircle,
  Calendar,
  Users,
  TrendingUp,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  BookOpen,
  Clock,
  Target,
  Image
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroButton } from "@/components/ui/hero-button";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import Navigation from "@/components/layout/Navigation";
import SettingsAlert from "@/components/ui/settings-alert";
import { getStoredPlatforms, PlatformProfile } from "@/utils/storage";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  generatedContent: {
    [platform: string]: {
      content: string;
      hashtags: string[];
      characterCount: number;
    };
  };
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  category?: string;
}

const STORAGE_KEY = 'content-library';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [platforms, setPlatforms] = useState<PlatformProfile[]>([]);

  useEffect(() => {
    loadContent();
    loadPlatforms();
  }, []);

  const loadPlatforms = () => {
    setPlatforms(getStoredPlatforms());
  };

  const loadContent = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedContent = JSON.parse(stored);
        setContentItems(parsedContent);
      } catch (error) {
        console.error('Error loading content:', error);
        setContentItems([]);
      }
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Create combined platform list with connected status
  const allPlatforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "instagram" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "twitter" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "linkedin" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "facebook" }
  ];

  // Get recent content (last 5 items, sorted by updatedAt)
  const recentContent = contentItems
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      title: item.title || 'Untitled',
      platforms: item.platforms || [],
      created: formatRelativeTime(item.updatedAt),
      status: item.status
    }));

  const stats = [
    {
      title: "Content Created",
      value: contentItems.length.toString(),
      change: contentItems.length > 0 ? "Active" : "No content yet",
      icon: BookOpen,
      trend: "stable"
    },
    {
      title: "Platforms Connected",
      value: platforms.length.toString(),
      change: platforms.length === allPlatforms.length ? "All connected" : `${platforms.length} of ${allPlatforms.length} connected`,
      icon: Users,
      trend: "stable"
    },
    {
      title: "This Month",
      value: contentItems.filter(item => {
        const itemDate = new Date(item.createdAt);
        const now = new Date();
        return itemDate.getMonth() === now.getMonth() &&
               itemDate.getFullYear() === now.getFullYear();
      }).length.toString(),
      change: "This month",
      icon: Calendar,
      trend: "stable"
    },
    {
      title: "Published Content",
      value: contentItems.filter(item => item.status === 'published').length.toString(),
      change: "Published",
      icon: TrendingUp,
      trend: "stable"
    }
  ];

  const connectedPlatformIds = platforms.map(p => p.platform);
  const displayPlatforms = allPlatforms
    .map(platform => ({
      ...platform,
      connected: connectedPlatformIds.includes(platform.id)
    }))
    .sort((a, b) => {
      // Sort connected platforms first
      if (a.connected && !b.connected) return -1;
      if (!a.connected && b.connected) return 1;
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "text-success bg-success/10";
      case "scheduled": return "text-warning bg-warning/10";
      case "draft": return "text-muted-foreground bg-muted";
      default: return "text-muted-foreground bg-muted";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return Instagram;
      case "twitter": return Twitter;
      case "linkedin": return Linkedin;
      case "facebook": return Facebook;
      default: return BookOpen;
    }
  };

  // Show loading state while session is being determined
  if (status === "loading") {
    return <Loading message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Here's what's happening with your social media content
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link href="/create">
              <HeroButton variant="hero" className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4" />
                <span>Create Content</span>
              </HeroButton>
            </Link>
            <Link href="/calendar">
              <Button variant="outline" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>View Calendar</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Settings Alert */}
        <SettingsAlert />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-gradient hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <p className={`text-xs ${stat.trend === 'up' ? 'text-success' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Content</span>
                  <Link href="/library">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentContent.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No content yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first piece of content to get started
                    </p>
                    <Link href="/create">
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Content
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentContent.map((content) => (
                      <div key={content.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground mb-1">
                            {content.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{content.created}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {(content.platforms || []).map((platform) => {
                                const Icon = getPlatformIcon(platform);
                                return (
                                  <Icon key={platform} className="w-3 h-3" />
                                );
                              })}
                              <span>{(content.platforms || []).length} platforms</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                          {content.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Connected Platforms */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div key={platform.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            platform.connected ? 'bg-success/10' : 'bg-muted'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              platform.color === 'instagram' ? 'text-instagram' :
                              platform.color === 'twitter' ? 'text-twitter' :
                              platform.color === 'linkedin' ? 'text-linkedin' :
                              platform.color === 'facebook' ? 'text-facebook' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{platform.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {platform.connected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          platform.connected ? 'bg-success' : 'bg-muted-foreground'
                        }`} />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/platforms">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Profiles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/create" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Content
                  </Button>
                </Link>
                <Link href="/studio" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Image className="w-4 h-4 mr-2" />
                    Generate Image
                  </Button>
                </Link>
                <Link href="/calendar" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Posts
                  </Button>
                </Link>
                <Link href="/library" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Library
                  </Button>
                </Link>
                
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pro tip */}
        <Card className="mt-8 bg-hero-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Pro Tip</h3>
<p className="text-white/90 mb-4">
  Connect to Supabase to unlock AI'powered content generation, user's authentication,
  and data persistence for the full SocialFlow experience.
</p>
                <Button variant="secondary" size="sm">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
