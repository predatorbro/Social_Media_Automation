// Storage utility functions for content management
import axios from "axios";

export interface SavedContent {
  id: string;
  originalPrompt: string;
  generatedContent: {
    twitter?: {
      content: string;
      hashtags: string[];
      characterCount: number;
    };
    instagram?: {
      content: string;
      hashtags: string[];
      characterCount: number;
    };
    linkedin?: {
      content: string;
      hashtags: string[];
      characterCount: number;
    };
    facebook?: {
      content: string;
      hashtags: string[];
      characterCount: number;
    };
  };
  selectedPlatforms: string[];
  status: 'draft' | 'published' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

export interface ScheduledPost {
  id: string;
  contentId: string;
  platform: string;
  content: string;
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  status: 'scheduled' | 'posted' | 'failed';
  createdAt: string;
}

// Content Library Functions
export const saveContent = (content: SavedContent): void => {
  const existingContent = getStoredContent();
  const updated = [...existingContent.filter(c => c.id !== content.id), content];
  localStorage.setItem('content-library', JSON.stringify(updated));
};

export const getStoredContent = (): SavedContent[] => {
  const stored = localStorage.getItem('content-library');
  return stored ? JSON.parse(stored) : [];
};

export const deleteContent = (contentId: string): void => {
  const existingContent = getStoredContent();
  const filtered = existingContent.filter(c => c.id !== contentId);
  localStorage.setItem('content-library', JSON.stringify(filtered));
};

export const updateContentStatus = (contentId: string, status: 'draft' | 'published' | 'scheduled'): void => {
  const content = getStoredContent();
  const updated = content.map(c =>
    c.id === contentId
      ? { ...c, status, updatedAt: new Date().toISOString() }
      : c
  );
  localStorage.setItem('content-library', JSON.stringify(updated));
};

// Scheduled Posts Functions
export const saveScheduledPost = (post: ScheduledPost): void => {
  const scheduled = getScheduledPosts();
  scheduled.push(post);
  localStorage.setItem('scheduled-posts', JSON.stringify(scheduled));
};

export const getScheduledPosts = (): ScheduledPost[] => {
  const stored = localStorage.getItem('scheduled-posts');
  return stored ? JSON.parse(stored) : [];
};

export const updateScheduledPostStatus = (postId: string, status: 'scheduled' | 'posted' | 'failed'): void => {
  const posts = getScheduledPosts();
  const updated = posts.map(p =>
    p.id === postId ? { ...p, status, updatedAt: new Date().toISOString() } : p
  );
  localStorage.setItem('scheduled-posts', JSON.stringify(updated));
};

export const deleteScheduledPost = (postId: string): void => {
  const posts = getScheduledPosts();
  const filtered = posts.filter(p => p.id !== postId);
  localStorage.setItem('scheduled-posts', JSON.stringify(filtered));
};

// Calendar Events Functions (for existing calendar functionality)
export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  content: string;
  platform: string[];
  type: 'post' | 'story' | 'reel';
  time?: string; // HH:MM format
  scheduledPostId?: string; // Link to scheduled post
  // Additional scheduling properties
  timezone?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  status?: 'scheduled' | 'posted' | 'failed';
  createdAt?: string;
}

export const saveCalendarEvent = (event: CalendarEvent): void => {
  const events = getCalendarEvents();
  const updated = [...events.filter(e => e.id !== event.id), event];
  localStorage.setItem('calendar-events', JSON.stringify(updated));
};

export const getCalendarEvents = (): CalendarEvent[] => {
  const stored = localStorage.getItem('calendar-events');
  return stored ? JSON.parse(stored) : [];
};

export const deleteCalendarEvent = (eventId: string): void => {
  const events = getCalendarEvents().filter(e => e.id !== eventId);
  localStorage.setItem('calendar-events', JSON.stringify(events));
};

// Data cleanup utilities
export const cleanupOldData = (): void => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Clean up old completed/failed scheduled posts
  const scheduledPosts = getScheduledPosts();
  const activeScheduledPosts = scheduledPosts.filter(post => {
    if (post.status === 'scheduled') return true;
    const postDate = new Date(post.createdAt);
    return postDate > thirtyDaysAgo;
  });

  localStorage.setItem('scheduled-posts', JSON.stringify(activeScheduledPosts));
};

// Storage monitoring
export const getStorageUsage = () => {
  let totalSize = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  return {
    used: Math.round(totalSize / 1024), // KB
    limit: 5120, // 5MB typical limit
    percentage: Math.round((totalSize / (5 * 1024 * 1024)) * 100)
  };
};

// Platform Profiles
export interface PlatformProfile {
  id: string;
  platform: string;
  profileUrl: string;
  createdAt: string;
}

export const savePlatform = (platform: PlatformProfile): void => {
  const existing = getStoredPlatforms();
  const updated = [...existing.filter(p => p.id !== platform.id), platform];
  localStorage.setItem('platforms', JSON.stringify(updated));
};

export const getStoredPlatforms = (): PlatformProfile[] => {
  const stored = localStorage.getItem('platforms');
  return stored ? JSON.parse(stored) : [];
};

export const deletePlatform = (platformId: string): void => {
  const existing = getStoredPlatforms();
  const filtered = existing.filter(p => p.id !== platformId);
  localStorage.setItem('platforms', JSON.stringify(filtered));
};

// User Profile Settings
export interface UserProfile {
  name: string;
  email: string;
  page: string;
}

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem('user-profile', JSON.stringify(profile));
};

export const getUserProfile = (): UserProfile => {
  const stored = localStorage.getItem('user-profile');
  return stored ? JSON.parse(stored) : {
    name: "Your Name",
    email: "your.email@example.com",
    page: "Your Company"
  };
};

// Notification Settings
export interface NotificationSettings {
  emailUpdates: boolean;
  contentReminders: boolean;
  scheduleAlerts: boolean;
  weeklyReports: boolean;
}

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem('notification-settings', JSON.stringify(settings));
};

export const getNotificationSettings = (): NotificationSettings => {
  const stored = localStorage.getItem('notification-settings');
  return stored ? JSON.parse(stored) : {
    emailUpdates: true,
    contentReminders: true,
    scheduleAlerts: false,
    weeklyReports: true
  };
};

// Preferences Settings
export interface PreferencesSettings {
  theme: 'light' | 'dark' | 'system';
  defaultPlatforms: string[];
  autoSave: boolean;
  contentTemplates: boolean;
}

export const savePreferencesSettings = (settings: PreferencesSettings): void => {
  localStorage.setItem('preferences-settings', JSON.stringify(settings));
};

export const getPreferencesSettings = (): PreferencesSettings => {
  const stored = localStorage.getItem('preferences-settings');
  return stored ? JSON.parse(stored) : {
    theme: 'system',
    defaultPlatforms: ['instagram', 'twitter'],
    autoSave: true,
    contentTemplates: true
  };
};

// Settings Alert Management
export const isSettingsAlertDismissed = (): boolean => {
  const dismissed = localStorage.getItem('settings-alert-dismissed');
  return dismissed === 'true';
};

export const resetSettingsAlert = (): void => {
  localStorage.removeItem('settings-alert-dismissed');
};

export const shouldShowSettingsAlert = (): boolean => {
  const profile = getUserProfile();
  const hasIncompleteSettings = !profile.name || !profile.email || !profile.page ||
    profile.name === "Your Name" || profile.email === "your.email@example.com" || profile.page === "Your Company";

  return hasIncompleteSettings && !isSettingsAlertDismissed();
};

// Create Page State Management
export interface CreatePageState {
  originalContent: string;
  selectedPlatforms: string[];
  wordCount: number;
  isStrictMode: boolean;
  generatedContent: Record<string, { content: string; hashtags: string[]; characterCount: number }>;
  currentViewingPlatform: string;
  currentContentId: string;
  cloudinaryUrls: string[];
}

export const saveCreatePageState = (state: CreatePageState): void => {
  localStorage.setItem('create-page-state', JSON.stringify(state));
};

export const getCreatePageState = (): Partial<CreatePageState> => {
  const stored = localStorage.getItem('create-page-state');
  return stored ? JSON.parse(stored) : {};
};

export const clearCreatePageState = async () => {
  // First, synchronously clear the main state
  localStorage.removeItem('create-page-state');

  // Handle image cleanup asynchronously
  const sharedUploadedImages = JSON.parse(localStorage.getItem('shared-uploaded-images') || "[]");
  if (sharedUploadedImages && sharedUploadedImages.length > 0) {
    try {
      const publicIds = sharedUploadedImages.map((img: SharedImageData) => img.public_id);
      await axios.post('/api/delete-images', { publicIds });
    } catch (error) {
      console.error('Error deleting images:', error);
    } finally {
      // Always clear the images from localStorage, even if API call fails
      localStorage.removeItem('shared-uploaded-images');
    }
  }
};

// Shared Images Storage (for both Instagram and Facebook)
export interface SharedImageData {
  url: string;
  public_id: string;
}

export const saveSharedImages = (images: SharedImageData[]): void => {
  localStorage.setItem('shared-uploaded-images', JSON.stringify(images));
};

export const getSharedImages = (): SharedImageData[] => {
  const stored = localStorage.getItem('shared-uploaded-images');
  return stored ? JSON.parse(stored) : [];
};

export const clearSharedImages = (): void => {
  localStorage.removeItem('shared-uploaded-images');
};

// Legacy functions for backward compatibility (redirect to shared)
export interface InstagramImageData extends SharedImageData { }
export interface FacebookImageData extends SharedImageData { }

export const saveInstagramImages = saveSharedImages;
export const getInstagramImages = getSharedImages;
export const clearInstagramImages = clearSharedImages;

export const saveFacebookImages = saveSharedImages;
export const getFacebookImages = getSharedImages;
export const clearFacebookImages = clearSharedImages;

// Data export
export const exportData = () => {
  const data = {
    content: getStoredContent(),
    scheduledPosts: getScheduledPosts(),
    calendarEvents: getCalendarEvents(),
    platforms: getStoredPlatforms(),
    userProfile: getUserProfile(),
    instagramImages: getInstagramImages(),
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
