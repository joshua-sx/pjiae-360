"use client"

import { useState } from "react"
import { addDays, setHours, setMinutes, subDays } from "date-fns"
import { type DateRange } from "react-day-picker"

export interface CalendarEvent {
  id: string
  title: string
  description: string
  start: Date
  end: Date
  allDay?: boolean
  color?: 'sky' | 'amber' | 'emerald' | 'orange' | 'violet' | 'rose'
  location?: string
}

interface EventCalendarProps {
  events: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventUpdate?: (event: CalendarEvent) => void
  onEventDelete?: (eventId: string) => void
  highlightRange?: DateRange
}

export function EventCalendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  highlightRange
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Simple calendar grid implementation
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDay = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getEventsForDate = (date: Date | null) => {
    if (!date) return []
    return events.filter(event => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return date >= eventStart && date <= eventEnd
    })
  }

  const isDateInRange = (date: Date | null) => {
    if (!date || !highlightRange?.from) return false
    const from = highlightRange.from
    const to = highlightRange.to || from
    return date >= from && date <= to
  }

  const getColorClasses = (color: CalendarEvent['color']) => {
    switch (color) {
      case 'sky': return 'bg-sky-100 text-sky-900 border-sky-200'
      case 'amber': return 'bg-amber-100 text-amber-900 border-amber-200'
      case 'emerald': return 'bg-emerald-100 text-emerald-900 border-emerald-200'
      case 'orange': return 'bg-orange-100 text-orange-900 border-orange-200'
      case 'violet': return 'bg-violet-100 text-violet-900 border-violet-200'
      case 'rose': return 'bg-rose-100 text-rose-900 border-rose-200'
      default: return 'bg-gray-100 text-gray-900 border-gray-200'
    }
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="px-3 py-1 rounded border hover:bg-gray-50"
        >
          Previous
        </button>
        <h2 className="text-xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="px-3 py-1 rounded border hover:bg-gray-50"
        >
          Next
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date)
          const isInHighlightRange = isDateInRange(date)
          return (
            <div
              key={index}
              className={`min-h-[100px] p-1 border border-gray-200 ${
                date 
                  ? `bg-white hover:bg-gray-50 ${isInHighlightRange ? 'ring-2 ring-primary/20 bg-primary/5' : ''}` 
                  : 'bg-gray-50'
              }`}
            >
              {date && (
                <>
                  <div className="text-sm font-medium mb-1">
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded border ${getColorClasses(event.color)}`}
                        title={`${event.title} - ${event.description}`}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}