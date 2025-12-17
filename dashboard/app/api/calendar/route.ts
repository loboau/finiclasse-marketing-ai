import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

const CALENDAR_FILE = 'calendar.json';

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  platform: string;
  content: string;
  status: string;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    date: "Dec 18, 2025",
    time: "10:00 AM",
    platform: "Instagram",
    content: "EQS Launch Announcement",
    status: "Scheduled",
  },
  {
    id: '2',
    date: "Dec 19, 2025",
    time: "3:00 PM",
    platform: "Facebook",
    content: "AMG Performance Event",
    status: "Scheduled",
  },
  {
    id: '3',
    date: "Dec 20, 2025",
    time: "11:00 AM",
    platform: "LinkedIn",
    content: "C-Class Technology Features",
    status: "Draft",
  },
  {
    id: '4',
    date: "Dec 21, 2025",
    time: "2:00 PM",
    platform: "Instagram",
    content: "Customer Testimonial - S-Class",
    status: "Scheduled",
  },
];

// GET - Retrieve all calendar events
export async function GET() {
  try {
    const events = await readJSON<CalendarEvent[]>(CALENDAR_FILE, DEFAULT_EVENTS);
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error reading calendar events:', error);
    return NextResponse.json({ error: 'Failed to read calendar events' }, { status: 500 });
  }
}

// POST - Create new calendar event
export async function POST(request: Request) {
  try {
    const newEvent = await request.json();

    // Validation
    if (!newEvent.date || !newEvent.time || !newEvent.platform || !newEvent.content) {
      return NextResponse.json(
        { error: 'Missing required fields: date, time, platform, content' },
        { status: 400 }
      );
    }

    const events = await readJSON<CalendarEvent[]>(CALENDAR_FILE, DEFAULT_EVENTS);

    // Generate ID if not provided
    const eventWithId = {
      ...newEvent,
      id: newEvent.id || Date.now().toString(),
      status: newEvent.status || 'Draft',
    };

    events.push(eventWithId);
    await writeJSON(CALENDAR_FILE, events);

    return NextResponse.json({ success: true, event: eventWithId }, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}

// PUT - Update existing calendar event
export async function PUT(request: Request) {
  try {
    const updatedEvent = await request.json();

    if (!updatedEvent.id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const events = await readJSON<CalendarEvent[]>(CALENDAR_FILE, DEFAULT_EVENTS);
    const eventIndex = events.findIndex(e => e.id === updatedEvent.id);

    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    events[eventIndex] = { ...events[eventIndex], ...updatedEvent };
    await writeJSON(CALENDAR_FILE, events);

    return NextResponse.json({ success: true, event: events[eventIndex] });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 });
  }
}

// DELETE - Remove calendar event
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const events = await readJSON<CalendarEvent[]>(CALENDAR_FILE, DEFAULT_EVENTS);
    const filteredEvents = events.filter(e => e.id !== id);

    if (filteredEvents.length === events.length) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await writeJSON(CALENDAR_FILE, filteredEvents);

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 });
  }
}
