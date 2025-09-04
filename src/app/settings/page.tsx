"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Palette,
  Database,
  Key,
  Shield,
  Moon,
  Sun,
  Monitor,
  Save,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/layout/Navigation";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [settings, setSettings] = useState({
    profile: {
      name: "Your Name",
      email: "your.email@example.com",
      company: "Your Company"
    },
    notifications: {
      emailUpdates: true,
      contentReminders: true,
      scheduleAlerts: false,
      weeklyReports: true
    },
    preferences: {
      theme: "system",
      defaultPlatforms: ["instagram", "twitter"],
      autoSave: true,
      contentTemplates: true
    }
  });

  const { toast } = useToast();

  const handleProfileUpdate = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully."
    });
  };

  const handleNotificationToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications]
      }
    }));
  };

  const handlePreferenceToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key as keyof typeof prev.preferences]
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account preferences and application settings
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company">Company/Organization</Label>
                <Input
                  id="company"
                  value={settings.profile.company}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, company: e.target.value }
                  }))}
                />
              </div>
              <Button onClick={handleProfileUpdate} className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Update Profile</span>
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Updates</p>
                  <p className="text-sm text-muted-foreground">Receive updates about new features and improvements</p>
                </div>
                <Switch
                  checked={settings.notifications.emailUpdates}
                  onCheckedChange={() => handleNotificationToggle('emailUpdates')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Content Reminders</p>
                  <p className="text-sm text-muted-foreground">Get reminded to create content when you haven't posted in a while</p>
                </div>
                <Switch
                  checked={settings.notifications.contentReminders}
                  onCheckedChange={() => handleNotificationToggle('contentReminders')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Schedule Alerts</p>
                  <p className="text-sm text-muted-foreground">Notifications when scheduled content is about to be published</p>
                </div>
                <Switch
                  checked={settings.notifications.scheduleAlerts}
                  onCheckedChange={() => handleNotificationToggle('scheduleAlerts')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Weekly summary of your content performance and insights</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={() => handleNotificationToggle('weeklyReports')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance & Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-primary" />
                <span>Appearance & Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select value={settings.preferences.theme} onValueChange={(value) =>
                  setSettings(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, theme: value }
                  }))
                }>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-save Drafts</p>
                  <p className="text-sm text-muted-foreground">Automatically save your work as you type</p>
                </div>
                <Switch
                  checked={settings.preferences.autoSave}
                  onCheckedChange={() => handlePreferenceToggle('autoSave')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Content Templates</p>
                  <p className="text-sm text-muted-foreground">Show content templates and suggestions</p>
                </div>
                <Switch
                  checked={settings.preferences.contentTemplates}
                  onCheckedChange={() => handlePreferenceToggle('contentTemplates')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Data & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
                <Database className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Data Storage</p>
                  <p className="text-sm text-muted-foreground">Your data is stored locally in your browser</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">API Integration</p>
                  <p className="text-sm text-muted-foreground">Connect to Supabase for secure data management</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supabase Integration */}
          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span>Backend Integration Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To unlock the full potential of SocialFlow, including AI content generation, user authentication,
                and data persistence, you'll need to connect to Supabase.
              </p>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What you'll get with Supabase:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI-powered content generation with Gemini API</li>
                  <li>• Secure user authentication and profiles</li>
                  <li>• Cloud data storage and synchronization</li>
                  <li>• Real-time content scheduling</li>
                  <li>• Advanced analytics and insights</li>
                </ul>
              </div>

              <HeroButton variant="hero" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Connect to Supabase</span>
              </HeroButton>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear All Data</p>
                  <p className="text-sm text-muted-foreground">Remove all locally stored content and settings</p>
                </div>
                <Button variant="destructive" size="sm">
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
