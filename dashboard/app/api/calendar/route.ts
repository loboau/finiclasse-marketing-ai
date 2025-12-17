import { NextResponse } from 'next/server';

let upcomingPosts = [
    {
      date: "Dec 18, 2025",
      time: "10:00 AM",
      platform: "Instagram",
      content: "EQS Launch Announcement",
      status: "Scheduled",
    },
    {
      date: "Dec 19, 2025",
      time: "3:00 PM",
      platform: "Facebook",
      content: "AMG Performance Event",
      status: "Scheduled",
    },
    {
      date: "Dec 20, 2025",
      time: "11:00 AM",
      platform: "LinkedIn",
      content: "C-Class Technology Features",
      status: "Draft",
    },
    {
      date: "Dec 21, 2025",
      time: "2:00 PM",
      platform: "Instagram",
      content: "Customer Testimonial - S-Class",
      status: "Scheduled",
    },
  ];

export async function GET() {
  return NextResponse.json({ events: upcomingPosts });
}

export async function POST(request: Request) {
    const newPost = await request.json();
    upcomingPosts.push(newPost);
    return NextResponse.json({ success: true, post: newPost });
}