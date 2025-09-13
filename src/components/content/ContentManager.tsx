import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Trash2,
  Copy,
  FileText,
  Calendar,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { getUserContent, deleteContentItem, updateContent } from '@/app/actions/content';
import { Loading } from '@/components/ui/Loader';
import { getUserProfile } from '@/utils/storage';
import { saveUserCalendar } from '@/app/actions/calendar';
import ScheduleModal, { ScheduleData } from '@/components/content/ScheduleModal';
import axios from 'axios';

interface ContentItem {
  id: string;
  title: string;
  originalPrompt?: string;
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

const ContentManager = () => {
  const { data: session } = useSession();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedPlatformForSchedule, setSelectedPlatformForSchedule] = useState("");
  const [selectedContentForSchedule, setSelectedContentForSchedule] = useState("");
  const [currentContentId, setCurrentContentId] = useState<string>(""); 

  useEffect(() => {
    
    if (session?.user?.email) {
      loadContent();
    } else {
      setLoading(false);
    }
  }, [session]);

  const loadContent = async () => {
    if (!session?.user?.email) return;

    try {
      const content = await getUserContent(session.user.email); 

      if (content) {
        // Ensure content is an array for localStorage compatibility
        let contentArray: ContentItem[] = [];

        if (Array.isArray(content)) {
          contentArray = content as unknown as ContentItem[];
        } else if (typeof content === 'object' && content !== null) {
          // If it's a single object, wrap it in an array
          contentArray = [content as unknown as ContentItem];
        }

        // Store as array in localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contentArray));
        setContentItems(contentArray);
      } else {
        // Try to load from localStorage as fallback
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedContent = JSON.parse(stored);
          // Ensure parsed content is an array
          const contentArray = Array.isArray(parsedContent) ? parsedContent : [];
          setContentItems(contentArray);
        } else {
          setContentItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsedContent = JSON.parse(stored);
          // Ensure parsed content is an array
          const contentArray = Array.isArray(parsedContent) ? parsedContent : [];
          setContentItems(contentArray);
        } catch (parseError) {
          console.error('Error parsing stored content:', parseError);
          setContentItems([]);
        }
      } else {
        setContentItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveContent = (content: ContentItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setContentItems(content);
  };



  const deleteContentItemHandler = async (contentId: string) => {
    if (!session?.user?.email) {
      // Fallback to localStorage only
      const filtered = contentItems?.filter(item => item.id !== contentId);
      saveContent(filtered);
      toast.success('Content deleted successfully');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      return;
    }

    try {
      // Delete from database
      await deleteContentItem(session.user.email, contentId);

      // Update localStorage
      const filtered = contentItems?.filter(item => item.id !== contentId);
      saveContent(filtered);

      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      // Fallback to localStorage only
      const filtered = contentItems?.filter(item => item.id !== contentId);
      saveContent(filtered);
      toast.success('Content deleted from local library');
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const copyToClipboard = (content: ContentItem) => {
    const fullContent = Object.entries(content.generatedContent)
      .map(([platform, data]) => `${platform.toUpperCase()}:\n${data.content}\n${data.hashtags.map(h => `#${h}`).join(' ')}\n`)
      .join('\n');

    navigator.clipboard.writeText(fullContent);
    toast.success('Content copied to clipboard!');
  };

  const copyPlatformContent = (platform: string, content: string, hashtags: string[]) => {
    const fullContent = `${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
    navigator.clipboard.writeText(fullContent);
    toast.success(`${platform} content copied to clipboard!`);
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredContent = contentItems
    .filter(item => {
      // Always apply tab filtering
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'drafts' && item.status === 'draft') ||
        (activeTab === 'published' && item.status === 'published');

      // If no search query, only apply tab filtering
      if (!searchQuery || !searchQuery.trim()) {
        return matchesTab;
      }

      // If there's a search query, apply both search and tab filtering
      const query = searchQuery.toLowerCase().trim();

      // Check each field with proper null checks
      const titleMatch = item.title && item.title.toLowerCase().includes(query);
      const tagMatch = item.tags && item.tags.some(tag => tag && tag.toLowerCase().includes(query));
      const platformMatch = item.platforms && item.platforms.some(platform => platform && platform.toLowerCase().includes(query));
      const categoryMatch = item.category && item.category.toLowerCase().includes(query);

      const matchesSearch = titleMatch || tagMatch || platformMatch || categoryMatch;

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10); // Only show newest 10 records

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
      twitter: 'bg-blue-500',
      linkedin: 'bg-blue-600',
      facebook: 'bg-blue-700'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePublishFromLibrary = (platformId: string, contentId: string) => {
    // Check if Twitter automation is disabled
    if (platformId === 'twitter') {
      toast.error('Twitter automation feature is still in development phase. Coming soon!!!.');
      return;
    }

    // Find the content item
    const contentItem = contentItems.find(item => item.id === contentId);
    if (!contentItem) {
      toast.error('Could not find the content to publish.');
      return;
    }

    // Get the platform content
    const platformData = contentItem.generatedContent[platformId];
    if (!platformData) {
      toast.error(`No content found for ${platformId}.`);
      return;
    }

    setSelectedPlatformForSchedule(platformId);
    setSelectedContentForSchedule(platformData.content + '\n\n' + platformData.hashtags.map((h: string) => `#${h}`).join(' '));
    setCurrentContentId(contentId);
    setScheduleModalOpen(true);
  };

  const handleScheduleConfirm = async (scheduleData: ScheduleData) => {
    if (!currentContentId) return;

    try {
      // Use the scheduled date/time in ISO format for API
      const scheduledTime = scheduleData.date.toISOString();

      // Get the content item
      const contentItem = contentItems.find(item => item.id === currentContentId);
      if (!contentItem) return;

      // Get the platform content
      const platformData = contentItem.generatedContent[selectedPlatformForSchedule];
      if (!platformData) return;

      // Prepare post data for API call
      const postData = {
        platform: selectedPlatformForSchedule,
        content: platformData.content,
        hashtags: platformData.hashtags || [],
        scheduledTime: scheduledTime,
        pageId: getUserProfile().page || process.env.FACEBOOK_PAGE_ID,
        images: [] // Library content doesn't have images for now
      };

      // Call the API to schedule the post
      const response = await axios.post('/api/schedule-post', postData);

      if (response.data.success) {
        // Update content status to published
        if (session?.user?.email) {
          try {
            const updatedContent = {
              id: currentContentId,
              status: 'published',
              updatedAt: new Date().toISOString()
            };
            await updateContent(session.user.email, updatedContent);
          } catch (error) {
            console.error('Error updating content status:', error);
          }
        }

        // Create unified calendar event for local storage
        const localDate = new Date(scheduleData.date.getTime() - (scheduleData.date.getTimezoneOffset() * 60000));
        const calendarEvent = {
          id: `${Date.now()}-${selectedPlatformForSchedule}-${Math.random().toString(36).substr(2, 9)}`,
          date: localDate.toISOString().split('T')[0],
          title: `${selectedPlatformForSchedule.charAt(0).toUpperCase() + selectedPlatformForSchedule.slice(1)} Post`,
          content: platformData.content,
          platform: [selectedPlatformForSchedule],
          type: 'post',
          time: scheduleData.time,
          scheduledPostId: currentContentId,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const existingEvents = JSON.parse(localStorage.getItem('calendar-events') || '[]');
        const updatedEvents = [...existingEvents, calendarEvent];
        localStorage.setItem('calendar-events', JSON.stringify(updatedEvents));

        // Save to database if user is logged in
        if (session?.user?.email) {
          try {
            await saveUserCalendar(session.user.email, updatedEvents);
            console.log('Calendar events saved to database');
          } catch (error) {
            console.error('Error saving calendar to database:', error);
          }
        }

        toast.success(`${selectedPlatformForSchedule.charAt(0).toUpperCase() + selectedPlatformForSchedule.slice(1)} post scheduled for ${scheduleData.date.toLocaleDateString()} at ${scheduleData.time}`);
      } else {
        throw new Error(response.data.error || 'Failed to schedule post');
      }
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      toast.error(error.response?.data?.error || error.message || "Failed to schedule post. Please try again.");
    }

    setScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Full Page Loader */}
      {loading && <Loading />}

      {/* Search and Filter */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Content Library</span>
            </CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search content, platforms, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 w-full sm:w-64 ${searchQuery ? 'pr-10' : ''}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Contents ({contentItems.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({contentItems.filter(item => item.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="published">Published ({contentItems.filter(item => item.status === 'published').length})</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {filteredContent.length === 0 ? (
            <Card className="w-full bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {searchQuery ? 'No matching content found' : 'No content to show'}
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? 'Try adjusting your search terms or clear the search to see all content'
                    : 'Your content library is empty. Start creating amazing social media content!'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      className="flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Search</span>
                    </Button>
                  ) : (
                    <Link href="/create">
                      <Button className="flex items-center space-x-2 bg-primary-gradient">
                        <Plus className="w-4 h-4" />
                        <span>Create Content</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <Card key={item.id} className="w-full">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                          <p className="text-muted-foreground text-sm mb-3">
                            {item.originalPrompt && item.originalPrompt.length > 150
                              ? `${item.originalPrompt.substring(0, 150)}...`
                              : item.originalPrompt || 'No content available'
                            }
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {(item.platforms || []).map((platform) => (
                                <div
                                  key={platform}
                                  className={`w-3 h-3 rounded-full ${getPlatformColor(platform)}`}
                                  title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                />
                              ))}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(item.updatedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpanded(item.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setItemToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(item.generatedContent).map(([platform, data]) => (
                            <div key={platform} className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="capitalize">
                                  {platform}
                                </Badge>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {data.characterCount} chars
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyPlatformContent(platform, data.content, data.hashtags)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePublishFromLibrary(platform, item.id)}
                                    className="text-primary hover:text-primary/80"
                                  >
                                    <Send className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {data.content}
                              </p>
                              {data.hashtags.length > 0 && (
                                <p className="text-xs text-primary">
                                  {data.hashtags.map(tag => `#${tag}`).join(' ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteContentItemHandler(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        onSchedule={handleScheduleConfirm}
        platform={selectedPlatformForSchedule}
        content={selectedContentForSchedule}
      />
    </div>
  );
};

export default ContentManager;
