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
  Edit,
  Trash2,
  Clock
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    time: '09:00',
    type: 'post' as 'post' | 'story' | 'reel',
    platforms: [] as string[]
  });

  useEffect(() => {
    const storedEvents = localStorage.getItem('calendar-events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendar-events', JSON.stringify(newEvents));
  };

  // Mock scheduled content for sidebar display
  const scheduledContent = events.slice(0, 3);

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
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setIsCreateDialogOpen(true);
  };

  const handleCreateEvent = () => {
    if (!formData.title || !selectedDate) {
      toast.error('Please fill in all required fields');
      return;
    }

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

    setFormData({
      title: '',
      content: '',
      time: '09:00',
      type: 'post',
      platforms: []
    });
    setIsCreateDialogOpen(false);
    toast.success('Event created successfully!');
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      content: event.content,
      time: event.time,
      type: event.type,
      platforms: event.platform
    });
    setIsCreateDialogOpen(true);
  };

  const handleUpdateEvent = () => {
    if (!editingEvent || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedEvent: CalendarEvent = {
      ...editingEvent,
      title: formData.title,
      content: formData.content,
      time: formData.time,
      type: formData.type,
      platform: formData.platforms
    };

    const newEvents = events.map(event =>
      event.id === editingEvent.id ? updatedEvent : event
    );
    saveEvents(newEvents);

    setFormData({
      title: '',
      content: '',
      time: '09:00',
      type: 'post',
      platforms: []
    });
    setEditingEvent(null);
    setIsCreateDialogOpen(false);
    toast.success('Event updated successfully!');
  };

  const handleDeleteEvent = (eventId: string) => {
    const newEvents = events.filter(event => event.id !== eventId);
    saveEvents(newEvents);
    toast.success('Event deleted successfully!');
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
                        className={`min-h-[100px] p-2 border rounded-lg ${
                          day
                            ? "bg-card hover:bg-muted/30 cursor-pointer transition-colors"
                            : "bg-muted/20"
                        }`}
                        onClick={() => day && handleDateClick(day)}
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium mb-2">{day}</div>
                            <div className="space-y-1">
                              {content.map(item => (
                                <div
                                  key={item.id}
                                  className="group relative text-xs p-2 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1 flex-1 min-w-0">
                                      <div className="flex">
                                        {item.platform.map(platform => {
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
                                        variant="ghost"
                                        className="h-5 w-5 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditEvent(item);
                                        }}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteEvent(item.id);
                                        }}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center text-xs opacity-75 mt-1">
                                    <Clock className="w-2 h-2 mr-1" />
                                    {item.time} • {item.type}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
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
                  {scheduledContent.map(item => (
                    <div key={item.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditEvent(item)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteEvent(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.date} at {item.time}</span>
                        <div className="flex">
                          {item.platform.map(platform => {
                            const Icon = getPlatformIcon(platform);
                            return (
                              <Icon key={platform} className="w-3 h-3 ml-1" />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {scheduledContent.length === 0 && (
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
                    <span className="text-sm text-muted-foreground">Total Events</span>
                    <span className="font-medium">{events.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">This Month</span>
                    <span className="font-medium">
                      {events.filter(event => {
                        const eventMonth = new Date(event.date).getMonth();
                        return eventMonth === currentDate.getMonth();
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Posts</span>
                    <span className="font-medium">
                      {events.filter(event => event.type === 'post').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Events are saved locally in your browser.
                  Connect to Supabase for cloud sync and actual post scheduling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create/Edit Event Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </DialogTitle>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                    setEditingEvent(null);
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
                  onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                  className="flex-1"
                >
                  {editingEvent ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
