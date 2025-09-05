import { useState } from "react";
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
import Navigation from "@/components/layout/Navigation";

const Profiles = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    platform: "",
    username: "",
    profileUrl: ""
  });

  // Mock social profiles
  const socialProfiles = [
    {
      id: 1,
      platform: "instagram",
      username: "@yourbrand",
      profileUrl: "https://instagram.com/yourbrand",
      followers: "12.5K",
      verified: true,
      connected: true,
      lastSync: "2 hours ago"
    },
    {
      id: 2,
      platform: "twitter",
      username: "@yourbrand",
      profileUrl: "https://twitter.com/yourbrand",
      followers: "8.2K",
      verified: false,
      connected: true,
      lastSync: "1 hour ago"
    },
    {
      id: 3,
      platform: "linkedin",
      username: "Your Brand",
      profileUrl: "https://linkedin.com/company/yourbrand",
      followers: "3.1K",
      verified: true,
      connected: true,
      lastSync: "3 hours ago"
    },
    {
      id: 4,
      platform: "facebook",
      username: "Your Brand Page",
      profileUrl: "https://facebook.com/yourbrand",
      followers: "0",
      verified: false,
      connected: false,
      lastSync: "Never"
    }
  ];

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, color: "instagram" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, color: "twitter" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "linkedin" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "facebook" }
  ];

  const getPlatformIcon = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    return platformData?.icon || Settings;
  };

  const getPlatformColor = (platform: string) => {
    const platformData = platforms.find(p => p.id === platform);
    return platformData?.color || "muted";
  };

  const handleAddProfile = () => {
    // In a real app, this would save to the database via Supabase
    console.log("Adding profile:", newProfile);
    setIsAddDialogOpen(false);
    setNewProfile({ platform: "", username: "", profileUrl: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Social Profiles
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your connected social media accounts
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <HeroButton variant="hero" className="flex items-center space-x-2 mt-4 md:mt-0">
                <Plus className="w-4 h-4" />
                <span>Add Profile</span>
              </HeroButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Social Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <select
                    id="platform"
                    value={newProfile.platform}
                    onChange={(e) => setNewProfile({...newProfile, platform: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Select platform</option>
                    {platforms.map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="username">Username/Handle</Label>
                  <Input
                    id="username"
                    value={newProfile.username}
                    onChange={(e) => setNewProfile({...newProfile, username: e.target.value})}
                    placeholder="@yourusername"
                  />
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
                <Button onClick={handleAddProfile} className="w-full">
                  Add Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {socialProfiles.map(profile => {
            const Icon = getPlatformIcon(profile.platform);
            const colorClass = getPlatformColor(profile.platform);
            
            return (
              <Card key={profile.id} className="group hover:shadow-lg transition-all duration-300">
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
                        <p className="text-sm text-muted-foreground">
                          {profile.username}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {profile.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                      <div className={`w-3 h-3 rounded-full ${
                        profile.connected ? 'bg-success' : 'bg-destructive'
                      }`} />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Profile Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Followers</p>
                      <p className="font-semibold">{profile.followers || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={profile.connected ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}>
                        {profile.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>

                  {/* Last Sync */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Last sync:</span>
                    <span>{profile.lastSync}</span>
                  </div>

                  {/* Profile URL */}
                  <div className="flex items-center justify-between">
                    <a
                      href={profile.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Profile</span>
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    {profile.connected ? (
                      <Button variant="ghost" size="sm" className="text-warning">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-success">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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