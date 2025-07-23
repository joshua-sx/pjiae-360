
import { useState } from "react";
import {
  EventCalendar,
  type CalendarEvent,
} from "@/components/ui/event-calendar";

interface AppraisalPeriod {
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
}

interface AppraisalEventCalendarProps {
  appraisalPeriods: Record<string, AppraisalPeriod>;
  selectedPeriod?: string;
  className?: string;
}

// Color mapping from appraisal period colors to CalendarEvent colors
const colorMap: Record<string, CalendarEvent['color']> = {
  'bg-blue-500/20 border-blue-500/40': 'sky',
  'bg-yellow-500/20 border-yellow-500/40': 'amber',
  'bg-green-500/20 border-green-500/40': 'emerald',
};

export function AppraisalEventCalendar({
  appraisalPeriods,
  selectedPeriod,
  className
}: AppraisalEventCalendarProps) {
  // Convert appraisal periods to calendar events
  const appraisalEvents: CalendarEvent[] = Object.entries(appraisalPeriods).map(
    ([key, period]) => ({
      id: key,
      title: period.name,
      description: `${period.name} period for performance management`,
      start: period.startDate,
      end: period.endDate,
      allDay: true,
      color: colorMap[period.color] || 'sky',
      location: "Organization-wide",
    })
  );

  // Filter events based on selected period if provided
  const filteredEvents = selectedPeriod 
    ? appraisalEvents.filter(event => event.id === selectedPeriod)
    : appraisalEvents;

  const [events, setEvents] = useState<CalendarEvent[]>(filteredEvents);

  // Update events when selectedPeriod changes
  useState(() => {
    const newFilteredEvents = selectedPeriod 
      ? appraisalEvents.filter(event => event.id === selectedPeriod)
      : appraisalEvents;
    setEvents(newFilteredEvents);
  });

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  return (
    <div className={className}>
      <EventCalendar
        events={events}
        onEventAdd={handleEventAdd}
        onEventUpdate={handleEventUpdate}
        onEventDelete={handleEventDelete}
      />
    </div>
  );
}
