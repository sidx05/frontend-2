import { NextResponse } from "next/server";

// This would typically come from a database
// You can create an Events model and manage events through an admin panel
const upcomingEvents = [
  {
    id: "event-1",
    title: "Tech Innovation Summit 2025",
    date: "Nov 20, 2025",
    location: "Virtual",
    link: "/events/tech-innovation-summit-2025",
    active: true,
  },
  {
    id: "event-2",
    title: "Global Business Forum",
    date: "Nov 25, 2025",
    location: "New York",
    link: "/events/global-business-forum",
    active: true,
  },
  {
    id: "event-3",
    title: "Digital Marketing Workshop",
    date: "Dec 1, 2025",
    location: "Online",
    link: "/events/digital-marketing-workshop",
    active: true,
  },
  {
    id: "event-4",
    title: "Sustainability Conference",
    date: "Dec 5, 2025",
    location: "San Francisco",
    link: "/events/sustainability-conference",
    active: true,
  },
];

export async function GET() {
  try {
    const activeEvents = upcomingEvents
      .filter(event => event.active)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: activeEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
