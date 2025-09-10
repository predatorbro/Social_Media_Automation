"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  ExternalLink,
  Settings,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loading } from "@/components/ui/loading";
import Navigation from "@/components/layout/Navigation";
import { savePlatform, getStoredPlatforms, deletePlatform, PlatformProfile } from "@/utils/storage";
import { getUserPlatforms, saveUserPlatforms } from "@/app/actions/platforms";

const Profiles = () => {
  const { status } = useSession();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<PlatformProfile | null>(null);
  const [newProfile, setNewProfile] = useState({
    platform: "",
    profileUrl: ""
  });
  const [platforms, setPlatforms] = useState<PlatformProfile[]>([]);

  const { data: session } = useSession();

  useEffect(() => {
    loadPlatforms();
  }, [session]);

  const loadPlatforms = async () => {
    if (!session?.user?.email) {
      // Fallback to localStorage only
      setPlatforms(getStoredPlatforms());
      return;
    }

    try {
      const dbPlatforms = await getUserPlatforms(session.user.email);
      console.log('Database platforms:', dbPlatforms);

      if (dbPlatforms && Array.isArray(dbPlatforms) && dbPlatforms.length > 0) {
        // Save to localStorage for immediate access
        localStorage.setItem('platforms', JSON.stringify(dbPlatforms));
        setPlatforms(dbPlatforms as unknown as PlatformProfile[]);
      } else {
        // Try to load from localStorage as fallback
        const stored = getStoredPlatforms();
        if (stored.length > 0) {
          setPlatforms(stored);
          // Sync localStorage to database
          await saveUserPlatforms(session.user.email, stored);
        } else {
          setPlatforms([]);
        }
      }
    } catch (error) {
      console.error('Error loading platforms:', error);
      // Fallback to localStorage
      setPlatforms(getStoredPlatforms());
    }
  };

  const platformOptions = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "instagram" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "twitter" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "linkedin" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "facebook" }
  ];

  const getPlatformIcon = (platform: string) => {
    const platformData = platformOptions.find(p => p.id === platform);
    return platformData?.icon || Settings;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platformOptions.find(p => p.id === platform);
    return platformData?.color || "muted";
  };

  const handleAddProfile = async () => {
    if (newProfile.platform && newProfile.profileUrl) {
      const platform: PlatformProfile = {
        id: Date.now().toString(),
        platform: newProfile.platform,
        profileUrl: newProfile.profileUrl,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      savePlatform(platform);
      const updatedPlatforms = [...platforms, platform];
      setPlatforms(updatedPlatforms);

      // Save to database if user is logged in
      if (session?.user?.email) {
        try {
          await saveUserPlatforms(session.user.email, updatedPlatforms);
        } catch (error) {
          console.error('Error saving platforms to database:', error);
        }
      }

      setIsAddDialogOpen(false);
      setNewProfile({ platform: "", profileUrl: "" });
    }
  };

  const handleEditProfile = (profile: PlatformProfile) => {
    setEditingProfile(profile);
    setNewProfile({
      platform: profile.platform,
      profileUrl: profile.profileUrl
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (newProfile.platform && newProfile.profileUrl) {
      if (editingProfile) {
        // Update existing profile
        const updatedProfile: PlatformProfile = {
          ...editingProfile,
          platform: newProfile.platform,
          profileUrl: newProfile.profileUrl
        };
        savePlatform(updatedProfile);
        const updatedPlatforms = platforms.map(p => p.id === editingProfile.id ? updatedProfile : p);
        setPlatforms(updatedPlatforms);

        // Save to database if user is logged in
        if (session?.user?.email) {
          try {
            await saveUserPlatforms(session.user.email, updatedPlatforms);
          } catch (error) {
            console.error('Error saving platforms to database:', error);
          }
        }
      } else {
        // Add new profile
        const platform: PlatformProfile = {
          id: Date.now().toString(),
          platform: newProfile.platform,
          profileUrl: newProfile.profileUrl,
          createdAt: new Date().toISOString()
        };
        savePlatform(platform);
        const updatedPlatforms = [...platforms, platform];
        setPlatforms(updatedPlatforms);

        // Save to database if user is logged in
        if (session?.user?.email) {
          try {
            await saveUserPlatforms(session.user.email, updatedPlatforms);
          } catch (error) {
            console.error('Error saving platforms to database:', error);
          }
        }
      }
      setIsAddDialogOpen(false);
      setNewProfile({ platform: "", profileUrl: "" });
      setEditingProfile(null);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    // Delete from localStorage
    deletePlatform(id);
    const updatedPlatforms = platforms.filter(p => p.id !== id);
    setPlatforms(updatedPlatforms);

    // Delete from database if user is logged in
    if (session?.user?.email) {
      try {
        await saveUserPlatforms(session.user.email, updatedPlatforms);
      } catch (error) {
        console.error('Error saving platforms to database:', error);
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setNewProfile({ platform: "", profileUrl: "" });
      setEditingProfile(null);
    }
  };

  // Check if all platforms are already added
  const allPlatformsAdded = platformOptions.every(platform =>
    platforms.some(p => p.platform === platform.id)
  );

  // Show loading state while session is being determined
  if (status === "loading") {
    return <Loading message="Loading platforms..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Connected Platforms
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your connected social media accounts
            </p>
          </div>

          {allPlatformsAdded && !editingProfile ? (
            <div className="flex items-center space-x-2 mt-4 md:mt-0 text-muted-foreground">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm">All platforms connected</span>
            </div>
          ) : (
            <HeroButton
              variant="hero"
              className="flex items-center space-x-2 mt-4 md:mt-0"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>{editingProfile ? 'Edit Profile' : 'Add Platforms'}</span>
            </HeroButton>
          )}

          <Dialog open={isAddDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProfile ? 'Edit Social Profile' : 'Add Social Profile'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={newProfile.platform}
                    onValueChange={(value) => setNewProfile({...newProfile, platform: value})}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions
                        .filter(platform => !platforms.some(p => p.platform === platform.id) || editingProfile?.platform === platform.id)
                        .map(platform => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="profileUrl">Profile URL</Label>
                  <Input
                    id="profileUrl"
                    value={newProfile.profileUrl}
                    onChange={(e) => setNewProfile({...newProfile, profileUrl: e.target.value})}
                    placeholder="https://platform.com/yourusername"
                  />
                </div>
                <Button onClick={handleSaveProfile} className="w-full">
                  {editingProfile ? 'Update Profile' : 'Add Profile'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 min-h-80">
          {platforms.length === 0 ? (
            <div className="col-span-full">
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-12 text-center">
                  <div className="max-w-2xl mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Plus className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Connect Your Platforms
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6">
                      Transform your social media management with automated scheduling, content creation, and cross-platform publishing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="text-left">
                        <h4 className="font-semibold text-foreground mb-2">🚀 Boost Your Reach</h4>
                        <p className="text-sm text-muted-foreground">
                          Schedule posts at optimal times across all platforms to maximize engagement and grow your audience.
                        </p>
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-foreground mb-2">⚡ Save Time</h4>
                        <p className="text-sm text-muted-foreground">
                          Automate repetitive tasks and focus on creating amazing content instead of managing multiple accounts.
                        </p>
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-foreground mb-2">📊 Track Performance</h4>
                        <p className="text-sm text-muted-foreground">
                          Monitor engagement, analyze trends, and optimize your strategy with detailed analytics.
                        </p>
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-foreground mb-2">🎨 Create Consistently</h4>
                        <p className="text-sm text-muted-foreground">
                          Maintain a consistent brand voice and posting schedule that keeps your audience engaged.
                        </p>
                      </div>
                    </div>
                    <HeroButton
                      variant="hero"
                      className="inline-flex items-center space-x-2"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Get Started</span>
                    </HeroButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            platforms.map(profile => {
              const Icon = getPlatformIcon(profile.platform);
              const colorClass = getPlatformColor(profile.platform);

              return (
                <Card key={profile.id} className="hover:shadow-lg transition-all duration-300 h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          colorClass === 'instagram' ? 'bg-instagram/10' :
                          colorClass === 'twitter' ? 'bg-twitter/10' :
                          colorClass === 'linkedin' ? 'bg-linkedin/10' :
                          colorClass === 'facebook' ? 'bg-facebook/10' : 'bg-muted'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            colorClass === 'instagram' ? 'text-instagram' :
                            colorClass === 'twitter' ? 'text-twitter' :
                            colorClass === 'linkedin' ? 'text-linkedin' :
                            colorClass === 'facebook' ? 'text-facebook' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {profile.platform}
                          </CardTitle>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(profile.profileUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProfile(profile)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span>Profile Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add and manage your social media profiles to streamline content creation and scheduling across platforms.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Store profile information and URLs</li>
                <li>• Track follower counts and engagement</li>
                <li>• Verify profile connections</li>
                <li>• Organize multiple brand accounts</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-hero-gradient text-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Connect to Supabase</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/90 mb-4">
                Enable full social media integration by connecting to Supabase for authentication and data persistence.
              </p>
              <ul className="text-sm text-white/80 space-y-1 mb-4">
                <li>• Secure profile storage</li>
                <li>• Real-time sync capabilities</li>
                <li>• Advanced analytics tracking</li>
                <li>• Multi-user support</li>
              </ul>
              <Button variant="secondary" size="sm">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profiles;
