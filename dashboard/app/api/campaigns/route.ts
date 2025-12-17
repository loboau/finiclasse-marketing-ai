import { NextResponse } from 'next/server';

let campaigns = [
    {
      title: "EQS Electric Luxury Launch",
      status: "Active",
      reach: "45.2K",
      engagement: "8.4%",
      platforms: ["Instagram", "Facebook", "LinkedIn"],
    },
    {
      title: "AMG Performance Series",
      status: "Active",
      reach: "32.8K",
      engagement: "12.1%",
      platforms: ["Instagram", "YouTube"],
    },
    {
      title: "C-Class Spring Collection",
      status: "Completed",
      reach: "28.5K",
      engagement: "6.8%",
      platforms: ["Instagram", "Facebook"],
    },
    {
      title: "S-Class Luxury Experience",
      status: "Draft",
      reach: "—",
      engagement: "—",
      platforms: ["Instagram", "LinkedIn"],
    },
  ];

export async function GET() {
  return NextResponse.json({ campaigns });
}

export async function POST(request: Request) {
    const newCampaign = await request.json();
    campaigns.push(newCampaign);
    return NextResponse.json({ success: true, campaign: newCampaign });
}