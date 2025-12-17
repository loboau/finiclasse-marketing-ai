import { NextResponse } from 'next/server';
import { readJSON, writeJSON } from '@/lib/db';

const CAMPAIGNS_FILE = 'campaigns.json';

interface Campaign {
  id: string;
  title: string;
  status: string;
  reach: string;
  engagement: string;
  platforms: string[];
}

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    title: "EQS Electric Luxury Launch",
    status: "Active",
    reach: "45.2K",
    engagement: "8.4%",
    platforms: ["Instagram", "Facebook", "LinkedIn"],
  },
  {
    id: '2',
    title: "AMG Performance Series",
    status: "Active",
    reach: "32.8K",
    engagement: "12.1%",
    platforms: ["Instagram", "YouTube"],
  },
  {
    id: '3',
    title: "C-Class Spring Collection",
    status: "Completed",
    reach: "28.5K",
    engagement: "6.8%",
    platforms: ["Instagram", "Facebook"],
  },
  {
    id: '4',
    title: "S-Class Luxury Experience",
    status: "Draft",
    reach: "—",
    engagement: "—",
    platforms: ["Instagram", "LinkedIn"],
  },
];

// GET - Retrieve all campaigns
export async function GET() {
  try {
    const campaigns = await readJSON<Campaign[]>(CAMPAIGNS_FILE, DEFAULT_CAMPAIGNS);
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error reading campaigns:', error);
    return NextResponse.json({ error: 'Failed to read campaigns' }, { status: 500 });
  }
}

// POST - Create new campaign
export async function POST(request: Request) {
  try {
    const newCampaign = await request.json();

    // Validation
    if (!newCampaign.title || !newCampaign.platforms || !Array.isArray(newCampaign.platforms)) {
      return NextResponse.json(
        { error: 'Missing required fields: title and platforms (array)' },
        { status: 400 }
      );
    }

    const campaigns = await readJSON<Campaign[]>(CAMPAIGNS_FILE, DEFAULT_CAMPAIGNS);

    // Generate ID and set defaults
    const campaignWithId: Campaign = {
      ...newCampaign,
      id: newCampaign.id || Date.now().toString(),
      status: newCampaign.status || 'Draft',
      reach: newCampaign.reach || '—',
      engagement: newCampaign.engagement || '—',
      platforms: newCampaign.platforms,
    };

    campaigns.push(campaignWithId);
    await writeJSON(CAMPAIGNS_FILE, campaigns);

    return NextResponse.json({ success: true, campaign: campaignWithId }, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

// PUT - Update existing campaign
export async function PUT(request: Request) {
  try {
    const updatedCampaign = await request.json();

    if (!updatedCampaign.id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const campaigns = await readJSON<Campaign[]>(CAMPAIGNS_FILE, DEFAULT_CAMPAIGNS);
    const campaignIndex = campaigns.findIndex(c => c.id === updatedCampaign.id);

    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Validate platforms if being updated
    if (updatedCampaign.platforms && !Array.isArray(updatedCampaign.platforms)) {
      return NextResponse.json(
        { error: 'Platforms must be an array' },
        { status: 400 }
      );
    }

    campaigns[campaignIndex] = { ...campaigns[campaignIndex], ...updatedCampaign };
    await writeJSON(CAMPAIGNS_FILE, campaigns);

    return NextResponse.json({ success: true, campaign: campaigns[campaignIndex] });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

// DELETE - Remove campaign
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }

    const campaigns = await readJSON<Campaign[]>(CAMPAIGNS_FILE, DEFAULT_CAMPAIGNS);
    const filteredCampaigns = campaigns.filter(c => c.id !== id);

    if (filteredCampaigns.length === campaigns.length) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    await writeJSON(CAMPAIGNS_FILE, filteredCampaigns);

    return NextResponse.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
