"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Navigation from "@/components/layout/Navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getUserCalendar, saveUserCalendar } from "@/app/actions/calendar";

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  content: string;
  platform: string[];
  type: 'post' | 'story' | 'reel';
  time: string;
}

const Calendar = () => {
  const { data: session } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    time: '09:00',
    type: 'post' as 'post' | 'story' | 'reel',
    platforms: [] as string[]
  });

  useEffect(() => {
    loadCalendarEvents();
  }, [session]);

  const loadCalendarEvents = async () => {
    // Always load from localStorage first to preserve create page data
    const storedEvents = localStorage.getItem('calendar-events');
    let localEvents: CalendarEvent[] = [];
    if (storedEvents) {
      try {
        localEvents = JSON.parse(storedEvents);
        setEvents(localEvents);
        console.log('Calendar events loaded from localStorage');
      } catch (parseError) {
        console.error('Error parsing localStorage events:', parseError);
        localEvents = [];
      }
    }

    // If user is not logged in, just use localStorage
    if (!session?.user?.email) {
      setEvents(localEvents);
      return;
    }

    try {
      const dbEvents = await getUserCalendar(session.user.email); 

      if (dbEvents && Array.isArray(dbEvents) && dbEvents.length > 0) {
        // Merge database events with local events (database takes precedence for conflicts)
        const dbEventIds = new Set(dbEvents.map(event => event.id));
        const mergedEvents = [
          ...dbEvents,
          ...localEvents.filter(event => !dbEventIds.has(event.id))
        ];

        // Save merged events to localStorage
        localStorage.setItem('calendar-events', JSON.stringify(mergedEvents));
        setEvents(mergedEvents as unknown as CalendarEvent[]);
        console.log('Calendar events merged from database and localStorage');

        // If there were new events from localStorage, sync them to database
        if (mergedEvents.length > dbEvents.length) {
          try {
            await saveUserCalendar(session.user.email, mergedEvents);
            console.log('Merged events synced to database');
          } catch (syncError) {
            console.error('Error syncing merged events to database:', syncError);
          }
        }
      } else {
        // No database events, but we have local events - sync local to database
        if (localEvents.length > 0) {
          try {
            await saveUserCalendar(session.user.email, localEvents);
            console.log('LocalStorage events synced to database');
          } catch (syncError) {
            console.error('Error syncing localStorage to database:', syncError);
          }
        }
        // Keep local events as they are
        setEvents(localEvents);
      }
    } catch (error: any) {
      console.error('Error loading calendar events from database:', error);

      // Check if it's a prepared statement error
      if (error?.message?.includes('prepared statement') || error?.code === 'P2028') {
        console.log('Database connection issue, using local data');
        toast.error('Database connection issue, using local data');
      } else {
        toast.error('Failed to load calendar from database, using local data');
      }

      // Keep local events as they are (don't overwrite with empty array)
      setEvents(localEvents);
    }
  };

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendar-events', JSON.stringify(newEvents));
  };

  // Helper function to check if event is in the past
  const isEventInPast = (event: CalendarEvent) => {
    const eventDateTime = new Date(`${event.date}T${event.time}:00`);
    const now = new Date();
    return eventDateTime < now;
  };

  // Filter upcoming events (future events only)
  const upcomingEvents = events.filter(event => !isEventInPast(event)).slice(0, 3);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getContentForDate = (day: number) => {
    if (!day) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const selectedDateTime = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    // Allow today and future dates, but not past dates
    if (selectedDateTime < today) {
      toast.error('Cannot schedule posts for past dates');
      return;
    }

    // Check if selected date is within 4 weeks from today
    const fourWeeksFromToday = new Date(today);
    fourWeeksFromToday.setDate(today.getDate() + 28);

    if (selectedDateTime > fourWeeksFromToday) {
      toast.error('Cannot schedule posts more than 4 weeks in advance');
      return;
    }

    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsCreateDialogOpen(true);
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !selectedDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if platforms are selected
    const hasPlatforms = formData.platforms.length > 0;

    if (hasPlatforms) {
      // Show confirmation dialog for scheduled posts
      const confirmed = window.confirm('The schedule cannot be changed once confirmed. Are you sure you want to schedule this post?');
      if (!confirmed) return;
    }

    try {
      let apiCallSuccessful = true;

      if (hasPlatforms) {
        // Create the scheduled date/time in local format
        const [hours, minutes] = formData.time.split(':');
        const scheduledDateTime = new Date(selectedDate);
        scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Use ISO string format for API
        const scheduledTime = scheduledDateTime.toISOString();

        // Prepare post data for API call
        const postData = {
          platform: formData.platforms[0], // Use first platform
          content: formData.content,
          hashtags: [], // Will be extracted from content if needed
          scheduledTime: scheduledTime,
          pageId: process.env.FACEBOOK_PAGE_ID || '',
          images: []
        };

        // Call the API to schedule the post
        const response = await fetch('/api/schedule-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        if (!response.ok) {
          apiCallSuccessful = false;
          throw new Error('Failed to schedule post');
        }
      }

      if (!hasPlatforms || apiCallSuccessful) {
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          date: selectedDate,
          title: formData.title,
          content: formData.content,
          platform: formData.platforms,
          type: formData.type,
          time: formData.time
        };

        const newEvents = [...events, newEvent];
        saveEvents(newEvents);

        // Save to database if user is logged in
        if (session?.user?.email) {
          try {
            await saveUserCalendar(session.user.email, newEvents);
            console.log('Calendar saved to database successfully');
          } catch (error) {
            console.error('Error saving calendar to database:', error);
            toast.error('Failed to save calendar to database');
          }
        }

        setFormData({
          title: '',
          content: '',
          time: '09:00',
          type: 'post',
          platforms: []
        });
        setIsCreateDialogOpen(false);

        if (hasPlatforms) {
          toast.success('Post scheduled successfully!');
        } else {
          toast.success('Note saved successfully!');
        }
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      if (hasPlatforms) {
        toast.error('Failed to schedule post. Please try again.');
      } else {
        toast.error('Failed to save note. Please try again.');
      }
    }
  };

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  const handleDeleteEvent = async (eventToDelete: CalendarEvent) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      const newEvents = events.filter(event => event.id !== eventToDelete.id);
      saveEvents(newEvents);

      // Save to database if user is logged in
      if (session?.user?.email) {
        try {
          await saveUserCalendar(session.user.email, newEvents);
          console.log('Calendar saved to database successfully after deletion');
        } catch (error) {
          console.error('Error saving calendar to database after deletion:', error);
          toast.error('Failed to save calendar to database');
        }
      }

      setIsEventDetailsOpen(false);
      setSelectedEvent(null);
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return Instagram;
      case "twitter": return Twitter;
      case "linkedin": return Linkedin;
      case "facebook": return Facebook;
      default: return CalendarIcon;
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
              Content Calendar
            </h1>
            <p className="text-lg text-muted-foreground">
              Plan and schedule your social media content
            </p>
          </div>
          <HeroButton
            variant="hero"
            className="flex items-center space-x-2 mt-4 md:mt-0"
            onClick={() => {
              const today = new Date();
              const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
              setSelectedDate(dateStr);
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Content</span>
          </HeroButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid with Fixed Width and Horizontal Scroll */}
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {dayNames.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {getDaysInMonth(currentDate).map((day, index) => {
                        const content = day ? getContentForDate(day) : [];

                        return (
                          <div
                            key={index}
                            className={`min-h-[100px] p-2 border rounded-lg ${day
                              ? "bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                              : "bg-muted/20"
                              }`}
                            onClick={() => day && handleDateClick(day)}
                          >
                            {day && (
                              <>
                                <div className="text-sm font-medium mb-2">{day}</div>
                                <div className="space-y-1">
                                  {content.map((item: CalendarEvent) => {
                                    const isPastEvent = isEventInPast(item);
                                    return (
                                      <div
                                        key={item.id}
                                        className={`group relative text-xs p-2 rounded border transition-colors ${isPastEvent
                                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 hover:from-green-200 hover:to-emerald-200'
                                          : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                          }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-1 flex-1 min-w-0">
                                            <div className="flex">
                                              {item.platform.map((platform: string) => {
                                                const Icon = getPlatformIcon(platform);
                                                return (
                                                  <Icon key={platform} className="w-3 h-3" />
                                                );
                                              })}
                                            </div>
                                            <span className="truncate font-medium">{item.title}</span>
                                          </div>
                                          <div className="hidden group-hover:flex space-x-1">
                                            <Button
                                              size="sm"
                                              variant={"ghost"}
                                              className="h-5 w-5 p-0 bg-transparent hover:bg-transparent hover:text-primary"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewEvent(item);
                                              }}
                                            >
                                              <Eye className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                        <div className="flex items-center text-xs opacity-75 mt-1">
                                          <Clock className="w-2 h-2 mr-1" />
                                          {item.time} • {item.type}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((item: CalendarEvent) => (
                    <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleViewEvent(item)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.date} at {item.time}</span>
                        <div className="flex">
                          {item.platform.map((platform: string) => {
                            const Icon = getPlatformIcon(platform);
                            return (
                              <Icon key={platform} className="w-3 h-3 ml-1" />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming events
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-medium">
                      {events.filter(event => event.platform.length > 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Notes</span>
                    <span className="font-medium">
                      {events.filter(event => event.platform.length === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Events</span>
                    <span className="font-medium">{events.length}</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Events are synced with your account and saved to the database.
                  Your calendar data persists across devices when you're logged in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Event Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Event description or content"
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'post' | 'story' | 'reel') =>
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="calendar-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="custom-scrollbar">
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Platforms</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['instagram', 'twitter', 'linkedin', 'facebook'].map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={formData.platforms.includes(platform)}
                        onCheckedChange={(checked) =>
                          handlePlatformChange(platform, checked as boolean)
                        }
                      />
                      <Label htmlFor={platform} className="text-sm capitalize">
                        {platform === 'twitter' ? 'Twitter/X' : platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({
                      title: '',
                      content: '',
                      time: '09:00',
                      type: 'post',
                      platforms: []
                    });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Details Dialog */}
        <Dialog open={isEventDetailsOpen} onOpenChange={setIsEventDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Event Details</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.title}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvent.date} at {selectedEvent.time}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{selectedEvent.type}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Platforms</Label>
                  <div className="flex mt-1">
                    {selectedEvent.platform.map(platform => {
                      const Icon = getPlatformIcon(platform);
                      return (
                        <div key={platform} className="flex items-center mr-3">
                          <Icon className="w-4 h-4 mr-1" />
                          <span className="text-sm text-muted-foreground capitalize">
                            {platform === 'twitter' ? 'Twitter/X' : platform}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedEvent.content && (
                  <div>
                    <Label className="text-sm font-medium">Content</Label>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {selectedEvent.content}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => selectedEvent && handleDeleteEvent(selectedEvent)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEventDetailsOpen(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
