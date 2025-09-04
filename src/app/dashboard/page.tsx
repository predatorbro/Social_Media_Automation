"use client";

import Link from "next/link";
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
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroButton } from "@/components/ui/hero-button";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/layout/Navigation";

const Dashboard = () => {
  const stats = [
    {
      title: "Content Created",
      value: "127",
      change: "+12%",
      icon: BookOpen,
      trend: "up"
    },
    {
      title: "Platforms Connected",
      value: "4",
      change: "All active",
      icon: Users,
      trend: "stable"
    },
    {
      title: "This Month",
      value: "23",
      change: "+8 from last month",
      icon: Calendar,
      trend: "up"
    },
    {
      title: "Avg. Engagement",
      value: "8.4%",
      change: "+2.1%",
      icon: TrendingUp,
      trend: "up"
    }
  ];

  const recentContent = [
    {
      id: 1,
      title: "Marketing Strategy Tips for 2024",
      platforms: ["instagram", "linkedin", "twitter"],
      created: "2 hours ago",
      status: "draft"
    },
    {
      id: 2,
      title: "Behind the Scenes: Product Development",
      platforms: ["instagram", "facebook"],
      created: "1 day ago",
      status: "scheduled"
    },
    {
      id: 3,
      title: "Industry Trends and Insights",
      platforms: ["linkedin", "twitter"],
      created: "3 days ago",
      status: "published"
    }
  ];

  const connectedPlatforms = [
    { name: "Instagram", icon: Instagram, color: "instagram", connected: true, followers: "12.5K" },
    { name: "Twitter/X", icon: Twitter, color: "twitter", connected: true, followers: "8.2K" },
    { name: "LinkedIn", icon: Linkedin, color: "linkedin", connected: true, followers: "3.1K" },
    { name: "Facebook", icon: Facebook, color: "facebook", connected: false, followers: "0" },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome back! 👋
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
                            {content.platforms.map((platform) => {
                              const Icon = getPlatformIcon(platform);
                              return (
                                <Icon key={platform} className="w-3 h-3" />
                              );
                            })}
                            <span>{content.platforms.length} platforms</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                        {content.status}
                      </div>
                    </div>
                  ))}
                </div>
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
                  {connectedPlatforms.map((platform) => {
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
                              {platform.connected ? `${platform.followers} followers` : 'Not connected'}
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
                  <Link href="/profiles">
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
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
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
                  Connect to Supabase to unlock AI-powered content generation, user authentication,
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
