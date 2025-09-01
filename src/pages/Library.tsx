import { useState } from "react";
import { 
  Search, 
  Filter, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  BookOpen,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/layout/Navigation";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock content library
  const contentLibrary = [
    {
      id: 1,
      title: "10 Marketing Tips That Actually Work",
      content: "Here are the marketing strategies that have transformed my business this year...",
      platforms: ["instagram", "linkedin", "twitter"],
      hashtags: ["marketing", "business", "entrepreneur"],
      created: "2024-01-15",
      status: "published",
      engagement: { likes: 234, comments: 18, shares: 12 }
    },
    {
      id: 2,
      title: "Behind the Scenes: Product Development",
      content: "Take a look at how we're building the next generation of our product...",
      platforms: ["instagram", "facebook"],
      hashtags: ["behindthescenes", "product", "startup"],
      created: "2024-01-14",
      status: "scheduled",
      engagement: { likes: 89, comments: 7, shares: 3 }
    },
    {
      id: 3,
      title: "Industry Trends for 2024",
      content: "The landscape is changing rapidly. Here's what to watch for in the coming year...",
      platforms: ["linkedin", "twitter"],
      hashtags: ["trends", "industry", "2024"],
      created: "2024-01-13",
      status: "draft",
      engagement: { likes: 0, comments: 0, shares: 0 }
    },
    {
      id: 4,
      title: "Customer Success Story",
      content: "Amazing to see how Sarah grew her business by 300% using our platform...",
      platforms: ["linkedin", "facebook", "twitter"],
      hashtags: ["success", "customer", "testimonial"],
      created: "2024-01-12",
      status: "published",
      engagement: { likes: 156, comments: 23, shares: 8 }
    }
  ];

  const filters = [
    { id: "all", label: "All Content", count: contentLibrary.length },
    { id: "published", label: "Published", count: contentLibrary.filter(c => c.status === "published").length },
    { id: "scheduled", label: "Scheduled", count: contentLibrary.filter(c => c.status === "scheduled").length },
    { id: "draft", label: "Drafts", count: contentLibrary.filter(c => c.status === "draft").length }
  ];

  const filteredContent = contentLibrary.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === "all" || content.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return Instagram;
      case "twitter": return Twitter;
      case "linkedin": return Linkedin;
      case "facebook": return Facebook;
      default: return BookOpen;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-success/10 text-success";
      case "scheduled": return "bg-warning/10 text-warning";
      case "draft": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Content Library
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage and organize all your social media content
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search content, hashtags, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {filters.map(filter => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
                className="whitespace-nowrap"
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map(content => (
            <Card key={content.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {content.title}
                    </CardTitle>
                    <Badge className={`text-xs ${getStatusColor(content.status)}`}>
                      {content.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Content Preview */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {content.content}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1">
                  {content.hashtags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {content.hashtags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{content.hashtags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Platforms */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Posted on:</span>
                  <div className="flex space-x-1">
                    {content.platforms.map(platform => {
                      const Icon = getPlatformIcon(platform);
                      return (
                        <div
                          key={platform}
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            platform === 'instagram' ? 'bg-instagram/10' :
                            platform === 'twitter' ? 'bg-twitter/10' :
                            platform === 'linkedin' ? 'bg-linkedin/10' :
                            'bg-facebook/10'
                          }`}
                        >
                          <Icon className={`w-3 h-3 ${
                            platform === 'instagram' ? 'text-instagram' :
                            platform === 'twitter' ? 'text-twitter' :
                            platform === 'linkedin' ? 'text-linkedin' :
                            'text-facebook'
                          }`} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Engagement Stats */}
                {content.status === "published" && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-3 h-3" />
                        <span>{content.engagement.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{content.engagement.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share className="w-3 h-3" />
                        <span>{content.engagement.shares}</span>
                      </div>
                    </div>
                    <span>{content.created}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No content found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 
                "Try adjusting your search query or filters." :
                "Create your first piece of content to get started."
              }
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              setSelectedFilter("all");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;