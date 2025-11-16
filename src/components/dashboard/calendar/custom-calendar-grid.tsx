"use client";

import React from "react";
import { Timestamp } from "firebase/firestore";
import { isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  type: string;
  date: Date | Timestamp;
  assigneeIds?: string[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface EventConfig {
  icon: React.ReactNode;
  bgColor: string;
  color: string;
}

interface CustomCalendarGridProps {
  currentMonth: Date;
  filteredEvents: any[];
  teamMembers: any[];
  eventConfig: Record<string, EventConfig>;
  today: Date | null;
  onDayClick: (date: Date) => void;
  onEventClick: (event: any) => void;
}

export function CustomCalendarGrid({
  currentMonth,
  filteredEvents,
  teamMembers,
  eventConfig,
  today,
  onDayClick,
  onEventClick,
}: CustomCalendarGridProps) {
  // Generar las 42 celdas del calendario (6 semanas * 7 días)
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: Date[] = [];

    // Días del mes anterior
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Días del mes siguiente para completar 42 días
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(new Date(year, month + 1, day));
    }

    return days;
  };

  const days = generateCalendarDays();
  const month = currentMonth.getMonth();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header de días */}
      <div className="grid grid-cols-7 gap-2 mb-3 flex-shrink-0">
        {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-1.5"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid del calendario - 6 filas fijas con alturas iguales */}
      <div
        className="grid gap-2 flex-1 min-h-0 overflow-hidden"
        style={{
          gridTemplateRows: "repeat(6, minmax(0, 1fr))",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        }}
      >
        {days.map((dayDate, index) => {
          const dayEvents = filteredEvents.filter((event) => {
            const eventDate =
              event.date instanceof Timestamp
                ? event.date.toDate()
                : event.date;
            return isSameDay(eventDate, dayDate);
          });

          const isCurrentMonth = dayDate.getMonth() === month;
          const isToday = today && isSameDay(dayDate, today);

          return (
            <div
              key={index}
              onClick={() => onDayClick(dayDate)}
              className={cn(
                "border rounded-lg bg-card p-3 cursor-pointer hover:bg-accent/50 transition-colors flex flex-col overflow-hidden min-h-0",
                !isCurrentMonth && "opacity-30"
              )}
            >
              <time
                dateTime={dayDate.toISOString()}
                className={cn(
                  "text-sm font-medium mb-2 flex-shrink-0",
                  isToday && "font-bold text-primary"
                )}
              >
                {dayDate.getDate()}
              </time>
              <div
                className="flex-1 overflow-y-auto space-y-1 scrollbar-thin min-h-0"
                onClick={(e) => e.stopPropagation()}
              >
                {dayEvents.map((event) => {
                  const config = eventConfig[event.type];
                  const assignedMembers = teamMembers.filter((m) =>
                    event.assigneeIds?.includes(m.id)
                  );
                  return (
                    <div
                      key={event.id}
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className={cn(
                        "w-full text-left text-xs p-1.5 rounded-sm flex items-start gap-1 cursor-pointer",
                        config.bgColor,
                        config.color
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                      <span className="truncate flex-1">{event.title}</span>
                      {assignedMembers.length > 0 && (
                        <div className="flex -space-x-1 flex-shrink-0">
                          {assignedMembers.slice(0, 2).map((member) => (
                            <div
                              key={member.id}
                              className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center border border-background"
                              title={member.name}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
