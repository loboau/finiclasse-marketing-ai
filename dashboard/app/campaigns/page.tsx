'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Trash2, Eye, FileText, Filter } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Draft' | 'Completed';
  startDate: string;
  endDate: string;
  platforms: string[];
  campaignType: string;
  targetModel?: string;
  contentCount: number;
  createdAt: string;
}

const SAMPLE_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Summer EQS Launch Campaign',
    description: 'Launch campaign for the all-electric EQS model targeting luxury electric vehicle enthusiasts.',
    status: 'Active',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    campaignType: 'Product Launch',
    targetModel: 'EQS',
    contentCount: 12,
    createdAt: '2024-05-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Winter Service Reminder',
    description: 'Seasonal campaign promoting winter service packages and tire changes.',
    status: 'Draft',
    startDate: '2024-11-01',
    endDate: '2024-12-31',
    platforms: ['Facebook', 'Instagram'],
    campaignType: 'Seasonal',
    contentCount: 8,
    createdAt: '2024-10-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'AMG Experience Event',
    description: 'Exclusive AMG test drive event promotion for high-performance enthusiasts.',
    status: 'Completed',
    startDate: '2024-03-15',
    endDate: '2024-04-15',
    platforms: ['Instagram', 'LinkedIn'],
    campaignType: 'Event',
    targetModel: 'AMG GT',
    contentCount: 15,
    createdAt: '2024-02-28T09:00:00Z',
  },
  {
    id: '4',
    name: 'C-Class Brand Awareness',
    description: 'Multi-channel brand awareness campaign highlighting C-Class features and luxury.',
    status: 'Active',
    startDate: '2024-05-01',
    endDate: '2024-07-31',
    platforms: ['Instagram', 'Facebook', 'LinkedIn'],
    campaignType: 'Brand Awareness',
    targetModel: 'C-Class',
    contentCount: 20,
    createdAt: '2024-04-15T11:00:00Z',
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load campaigns from localStorage or use sample data
    const storedCampaigns = localStorage.getItem('campaigns');
    if (storedCampaigns) {
      try {
        const parsed = JSON.parse(storedCampaigns);
        setCampaigns(parsed);
      } catch (error) {
        console.error('Failed to parse campaigns from localStorage', error);
        setCampaigns(SAMPLE_CAMPAIGNS);
        localStorage.setItem('campaigns', JSON.stringify(SAMPLE_CAMPAIGNS));
      }
    } else {
      setCampaigns(SAMPLE_CAMPAIGNS);
      localStorage.setItem('campaigns', JSON.stringify(SAMPLE_CAMPAIGNS));
    }
  }, []);

  useEffect(() => {
    // Filter campaigns based on search and status
    let filtered = campaigns;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.campaignType.toLowerCase().includes(query) ||
        (c.targetModel && c.targetModel.toLowerCase().includes(query))
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, searchQuery, statusFilter]);

  const handleDeleteCampaign = (id: string) => {
    setCampaignToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (campaignToDelete) {
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignToDelete);
      setCampaigns(updatedCampaigns);
      localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Draft':
        return 'bg-arrow-100 text-arrow-700 border-arrow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Facebook':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LinkedIn':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-midnight">
            Campaign Library
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage and track your marketing campaigns
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-amg hover:bg-amg/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns by name, type, or model..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2 flex-wrap">
                {['All', 'Active', 'Draft', 'Completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 'bg-midnight text-white' : ''}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCampaigns.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first campaign'}
              </p>
              {!searchQuery && statusFilter === 'All' && (
                <Link href="/campaigns/new">
                  <Button className="bg-amg hover:bg-amg/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="border-2 hover:border-amg/50 transition-all duration-200 cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-midnight group-hover:text-amg transition-colors">
                        {campaign.name}
                      </CardTitle>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                    <CardDescription className="text-sm mb-3">
                      {campaign.description}
                    </CardDescription>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-midnight text-white">
                        {campaign.campaignType}
                      </span>
                      {campaign.targetModel && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-steel-100 text-steel-700 border border-steel-200">
                          {campaign.targetModel}
                        </span>
                      )}
                      {campaign.platforms.map((platform) => (
                        <span
                          key={platform}
                          className={`text-xs px-2.5 py-1 rounded-full border ${getPlatformColor(
                            platform
                          )}`}
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCampaign(campaign.id);
                    }}
                    className="text-muted-foreground hover:text-amg hover:bg-amg/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-midnight/10">
                      <Calendar className="h-5 w-5 text-midnight" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date Range</p>
                      <p className="text-sm font-semibold">
                        {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amg/10">
                      <FileText className="h-5 w-5 text-amg" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Content Items</p>
                      <p className="text-sm font-semibold">{campaign.contentCount} pieces</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-sm font-semibold">{formatDate(campaign.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-amg hover:bg-amg/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
