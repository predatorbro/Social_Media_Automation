import { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Facebook,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import Navigation from "@/components/layout/Navigation";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock scheduled content
  const scheduledContent = [
    {
      id: 1,
      title: "Morning motivation post",
      date: "2024-01-15",
      time: "09:00",
      platforms: ["instagram", "facebook"],
      status: "scheduled"
    },
    {
      id: 2,
      title: "Industry insights thread",
      date: "2024-01-16",
      time: "14:30",
      platforms: ["twitter", "linkedin"],
      status: "scheduled"
    },
    {
      id: 3,
      title: "Behind the scenes story",
      date: "2024-01-18",
      time: "16:00",
      platforms: ["instagram"],
      status: "draft"
    }
  ];

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
    const dateStr = `2024-01-${day.toString().padStart(2, '0')}`;
    return scheduledContent.filter(content => content.date === dateStr);
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
          <HeroButton variant="hero" className="flex items-center space-x-2 mt-4 md:mt-0">
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
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium mb-2">{day}</div>
                            <div className="space-y-1">
                              {content.map(item => (
                                <div
                                  key={item.id}
                                  className={`text-xs p-1 rounded truncate ${
                                    item.status === 'scheduled' 
                                      ? 'bg-primary/10 text-primary' 
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  <div className="flex items-center space-x-1">
                                    <div className="flex">
                                      {item.platforms.map(platform => {
                                        const Icon = getPlatformIcon(platform);
                                        return (
                                          <Icon key={platform} className="w-3 h-3" />
                                        );
                                      })}
                                    </div>
                                    <span className="truncate">{item.title}</span>
                                  </div>
                                  <div className="text-xs opacity-75">{item.time}</div>
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
                  {scheduledContent.slice(0, 3).map(item => (
                    <div key={item.id} className="p-3 border rounded-lg">
                      <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.date} at {item.time}</span>
                        <div className="flex">
                          {item.platforms.map(platform => {
                            const Icon = getPlatformIcon(platform);
                            return (
                              <Icon key={platform} className="w-3 h-3 ml-1" />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <span className="text-sm text-muted-foreground">Scheduled</span>
                    <span className="font-medium">12 posts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Drafts</span>
                    <span className="font-medium">5 posts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Published</span>
                    <span className="font-medium">23 posts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a visual planning interface. 
                  Connect to Supabase to enable actual post scheduling and publishing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;