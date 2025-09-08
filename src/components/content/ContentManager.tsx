import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Share2,
  FileText,
  Calendar,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const ContentManager = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

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

  const saveContent = (content: ContentItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setContentItems(content);
  };

  const updateContentStatus = (contentId: string, status: 'draft' | 'published') => {
    const updated = contentItems.map(item =>
      item.id === contentId
        ? { ...item, status, updatedAt: new Date().toISOString() }
        : item
    );
    saveContent(updated);
    toast.success(`Content ${status === 'published' ? 'published' : 'moved to drafts'}!`);
  };

  const deleteContent = (contentId: string) => {
    const filtered = contentItems.filter(item => item.id !== contentId);
    saveContent(filtered);
    toast.success('Content deleted successfully');
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

  const filteredContent = contentItems
    .filter(item => {
      const matchesSearch =
        (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.content?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => (tag?.toLowerCase() || '').includes(searchQuery.toLowerCase()));

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'drafts' && item.status === 'draft') ||
        (activeTab === 'published' && item.status === 'published');

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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

  return (
    <div className="space-y-6">
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
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Contents</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContent.length === 0 ? (
            <Card className="w-full">
              <CardContent className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-muted-foreground mb-2">
                  {searchQuery ? 'No matching content found' : 'No content yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Try adjusting your search terms or clear the search'
                    : 'Create your first piece of content to get started'
                  }
                </p>
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <Card key={item.id} className="w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {item.content}
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
                                title={platform}
                              />
                            ))}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(item.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(item)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Content
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Content
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => updateContentStatus(
                              item.id, 
                              item.status === 'draft' ? 'published' : 'draft'
                            )}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            {item.status === 'draft' ? 'Publish' : 'Move to Draft'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setItemToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(item.generatedContent).map(([platform, data]) => (
                        <div key={platform} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="capitalize">
                              {platform}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {data.characterCount} chars
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
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
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
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
              onClick={() => itemToDelete && deleteContent(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContentManager;
