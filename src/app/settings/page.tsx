"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  AlertTriangle,
  Trash2,
  Phone,
  Mail,
  Facebook,
  Linkedin,
  Github,
  Globe,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loading } from "@/components/ui/loading";
import Navigation from "@/components/layout/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import {
  saveUserProfile,
  getUserProfile,
  saveNotificationSettings,
  getNotificationSettings,
  savePreferencesSettings,
  getPreferencesSettings,
  NotificationSettings,
  PreferencesSettings
} from "@/utils/storage";

const Settings = () => {
  const { status } = useSession();
  const { theme: currentTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<{
    profile: { name: string; email: string; page: string };
    notifications: NotificationSettings;
    preferences: PreferencesSettings;
  }>({
    profile: {
      name: "",
      email: "",
      page: ""
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
  const [profileButtonState, setProfileButtonState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Load all settings data on component mount
  useEffect(() => {
    const profile = getUserProfile();
    const notifications = getNotificationSettings();
    const preferences = getPreferencesSettings();

    setSettings({
      profile,
      notifications,
      preferences: {
        ...preferences,
        theme: currentTheme // Sync with theme provider
      }
    });
  }, [currentTheme]);

  const handleProfileUpdate = () => {
    // Set loading state
    setProfileButtonState('loading');

    // Simulate saving delay (1 second)
    setTimeout(() => {
      // Save to localStorage
      saveUserProfile(settings.profile);

      // Set success state
      setProfileButtonState('success');

      // Show toast
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully."
      });

      // Reset to idle state after 3 seconds
      setTimeout(() => {
        setProfileButtonState('idle');
      }, 3000);
    }, 1000);
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings.notifications,
      [key]: !settings.notifications[key]
    };
    setSettings(prev => ({
      ...prev,
      notifications: newSettings
    }));
    saveNotificationSettings(newSettings);
  };

  const handlePreferenceToggle = (key: keyof Omit<PreferencesSettings, 'theme' | 'defaultPlatforms'>) => {
    const newSettings = {
      ...settings.preferences,
      [key]: !settings.preferences[key]
    };
    setSettings(prev => ({
      ...prev,
      preferences: newSettings
    }));
    savePreferencesSettings(newSettings);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    // Update theme provider immediately
    setTheme(theme);

    const newSettings = {
      ...settings.preferences,
      theme
    };
    setSettings(prev => ({
      ...prev,
      preferences: newSettings
    }));
    savePreferencesSettings(newSettings);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      // Clear all localStorage data
      localStorage.clear();

      // Reset settings to defaults
      const defaultProfile = { name: "Your Name", email: "your.email@example.com", page: "Your Company" };
      const defaultNotifications = { emailUpdates: true, contentReminders: true, scheduleAlerts: false, weeklyReports: true };
      const defaultPreferences = { theme: 'system' as const, defaultPlatforms: ['instagram', 'twitter'], autoSave: true, contentTemplates: true };

      setSettings({
        profile: defaultProfile,
        notifications: defaultNotifications,
        preferences: defaultPreferences
      });

      toast({
        title: "Data Cleared",
        description: "All data has been removed from local storage.",
        variant: "destructive"
      });
    }
  };

  // Show loading state while session is being determined
  if (status === "loading") {
    return <Loading message="Loading settings..." />;
  }

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
                <Label htmlFor="page">Page</Label>
                <Input
                  id="page"
                  value={settings.profile.page}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, page: e.target.value }
                  }))}
                />
              </div>
              <Button
                onClick={handleProfileUpdate}
                disabled={profileButtonState === 'loading'}
                className="flex items-center space-x-2"
              >
                {profileButtonState === 'loading' && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {profileButtonState === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {profileButtonState === 'idle' && (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {profileButtonState === 'loading' && 'Saving...'}
                  {profileButtonState === 'success' && 'Saved'}
                  {profileButtonState === 'idle' && 'Update Profile'}
                </span>
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
                <Select value={settings.preferences.theme} onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}>
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

          {/* Developer Contact */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>Contact Developer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Need help or have questions? Get in touch with the developer.
                </p>

                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                      onClick={() => window.open('tel:+9779822301799', '_self')}
                    >
                      <Phone className="w-4 h-4" />
                      <span>+977 9822301799</span>
                    </Button>
                  </div>

                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                      onClick={() => window.open('mailto:johnsah698@gmail.com', '_self')}
                    >
                      <Mail className="w-4 h-4" />
                      <span>johnsah698@gmail.com</span>
                    </Button>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => window.open('https://prasadbhai.com/', '_blank')}
                    title="Visit Website"
                  >
                    <Globe className="w-5 h-5 text-green-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => window.open('https://facebook.com/johnsah698', '_blank')}
                    title="Facebook"
                  >
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => window.open('https://linkedin.com/in/johnsah698', '_blank')}
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => window.open('https://github.com/johnsah698', '_blank')}
                    title="GitHub"
                  >
                    <Github className="w-5 h-5 text-gray-700" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Built with ❤️ by Prasad Bhai
                </p>
              </div>
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
                <Button variant="destructive" size="sm" onClick={handleClearAllData}>
                  <Trash2 className="w-4 h-4 mr-2" />
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
