import { useState } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: string;
  content: string;
  onSchedule: (scheduleData: ScheduleData) => void;
}

export interface ScheduleData {
  date: Date;
  time: string;
}

const timeSlots = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return { value: time, label: displayTime };
});

export default function ScheduleModal({
  open,
  onOpenChange,
  platform,
  content,
  onSchedule,
}: ScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  const handleSchedule = () => {
    if (!selectedDate) return;

    // Show confirmation dialog for all scheduling actions
    const platformText = platform === 'all' ? 'all platforms' : platform;
    const confirmed = window.confirm(`The schedule cannot be changed once confirmed. Are you sure you want to schedule this post for ${platformText}?`);
    if (!confirmed) return;

    // Create the scheduled date/time using local time format
    const [hours, minutes] = selectedTime.split(':');
    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const scheduleData: ScheduleData = {
      date: scheduledDateTime,
      time: selectedTime,
    };

    onSchedule(scheduleData);
    onOpenChange(false);
  };

  const platformColors = {
    instagram: 'text-instagram',
    twitter: 'text-twitter',
    linkedin: 'text-linkedin',
    facebook: 'text-facebook',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto schedule-modal-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Schedule Post for{" "}
            <span className={cn("capitalize", platformColors[platform as keyof typeof platformColors])}>
              {platform}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Preview */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Content Preview</Label>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {content}
            </p>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label>Select Date</Label>
            <div className="schedule-modal-calendar">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Reset time to start of day

                  // Allow today and future dates, but not past dates
                  if (date < today) return true;

                  // Check if selected date is within 4 weeks from today
                  const fourWeeksFromToday = new Date(today);
                  fourWeeksFromToday.setDate(today.getDate() + 28);

                  // Disable dates more than 4 weeks from today
                  return date > fourWeeksFromToday;
                }}
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You can schedule posts for today or up to 4 weeks in advance.
            </p>
          </div>

          <Separator />

          {/* Time Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select Time
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="calendar-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] custom-scrollbar">
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={!selectedDate}
              className="flex-1"
            >
              Schedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
