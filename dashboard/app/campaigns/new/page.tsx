'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Save, Send, Loader2, CheckCircle2 } from "lucide-react";

interface CampaignFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  campaignType: string;
  targetModel: string;
}

const PLATFORM_OPTIONS = ['Instagram', 'Facebook', 'LinkedIn'];
const CAMPAIGN_TYPES = ['Product Launch', 'Seasonal', 'Event', 'Brand Awareness'];
const MERCEDES_MODELS = [
  'A-Class', 'C-Class', 'E-Class', 'S-Class',
  'GLA', 'GLB', 'GLC', 'GLE', 'GLS',
  'AMG GT', 'AMG A', 'AMG C', 'AMG E', 'AMG S',
  'EQA', 'EQB', 'EQC', 'EQE', 'EQS',
  'G-Class', 'CLA', 'CLS', 'Maybach'
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    platforms: [],
    campaignType: '',
    targetModel: '',
  });

  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
    if (errors.platforms) {
      setErrors(prev => ({ ...prev, platforms: '' }));
    }
  };

  const handleGetSuggestions = async () => {
    if (!formData.name || !formData.campaignType) {
      return;
    }

    setSuggestionsLoading(true);
    setSuggestions(null);

    const userInput = {
      campaignName: formData.name,
      campaignType: formData.campaignType,
      targetModel: formData.targetModel,
      platforms: formData.platforms,
      description: formData.description,
    };

    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'campaign_content',
          userInput
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions('Unable to generate suggestions at this time. Please try again later.');
      }
    } catch (error) {
      console.error('Error getting suggestions', error);
      setSuggestions('Error connecting to AI service. Please check your connection and try again.');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const validateForm = (isDraft: boolean = false): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!isDraft) {
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (formData.platforms.length === 0) {
        newErrors.platforms = 'Select at least one platform';
      }
      if (!formData.campaignType) {
        newErrors.campaignType = 'Campaign type is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCampaign = (status: 'Draft' | 'Active') => {
    const isDraft = status === 'Draft';

    if (!validateForm(isDraft)) {
      return;
    }

    setSaving(true);

    // Get existing campaigns from localStorage
    const storedCampaigns = localStorage.getItem('campaigns');
    const campaigns = storedCampaigns ? JSON.parse(storedCampaigns) : [];

    // Create new campaign object
    const newCampaign = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description || 'No description provided',
      status,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      platforms: formData.platforms.length > 0 ? formData.platforms : ['Instagram'],
      campaignType: formData.campaignType || 'Brand Awareness',
      targetModel: formData.targetModel || undefined,
      contentCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Add new campaign to the beginning of the array
    campaigns.unshift(newCampaign);

    // Save back to localStorage
    localStorage.setItem('campaigns', JSON.stringify(campaigns));

    // Simulate a short delay for better UX
    setTimeout(() => {
      setSaving(false);
      router.push('/campaigns');
    }, 500);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return '📷';
      case 'Facebook':
        return '👥';
      case 'LinkedIn':
        return '💼';
      default:
        return '📱';
    }
  };

  return (
    <div className="space-y-8">
      <Link href="/campaigns">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-midnight">
            Create New Campaign
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Build a comprehensive marketing campaign for your Mercedes-Benz dealership
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>Basic information about your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Campaign Name <span className="text-amg">*</span>
                </label>
                <Input
                  placeholder="e.g., Summer EQS Launch 2024"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-amg' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-amg mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-amg">*</span>
                </label>
                <textarea
                  className={`w-full min-h-[100px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-midnight ${
                    errors.description ? 'border-amg' : ''
                  }`}
                  placeholder="Describe the campaign objective and key messages..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
                {errors.description && (
                  <p className="text-xs text-amg mt-1">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date <span className="text-amg">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-amg' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-amg mt-1">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date <span className="text-amg">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={errors.endDate ? 'border-amg' : ''}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-amg mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Campaign Configuration</CardTitle>
              <CardDescription>Define campaign type and targeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Platforms <span className="text-amg">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PLATFORM_OPTIONS.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform)}
                      className={`p-4 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.platforms.includes(platform)
                          ? 'border-midnight bg-midnight text-white'
                          : 'border-gray-200 hover:border-midnight/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{getPlatformIcon(platform)}</div>
                      {platform}
                    </button>
                  ))}
                </div>
                {errors.platforms && (
                  <p className="text-xs text-amg mt-1">{errors.platforms}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Campaign Type <span className="text-amg">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CAMPAIGN_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleInputChange('campaignType', type)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.campaignType === type
                          ? 'border-amg bg-amg/5 text-amg'
                          : 'border-gray-200 hover:border-amg/50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.campaignType && (
                  <p className="text-xs text-amg mt-1">{errors.campaignType}</p>
                )}
              </div>

              <div>
                <label htmlFor="target-model" className="block text-sm font-medium mb-2">
                  Target Mercedes Model (Optional)
                </label>
                <select
                  id="target-model"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-midnight"
                  value={formData.targetModel}
                  onChange={(e) => handleInputChange('targetModel', e.target.value)}
                  aria-label="Target Mercedes Model"
                >
                  <option value="">Select a model (optional)</option>
                  {MERCEDES_MODELS.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`border-2 ${suggestions ? 'border-amg/30 bg-amg/5' : 'border-dashed'}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amg" />
                <CardTitle>AI Content Suggestions</CardTitle>
              </div>
              <CardDescription>
                Get AI-powered content ideas for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full border-amg text-amg hover:bg-amg hover:text-white"
                onClick={handleGetSuggestions}
                disabled={suggestionsLoading || !formData.name || !formData.campaignType}
              >
                {suggestionsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content Ideas
                  </>
                )}
              </Button>

              {!formData.name && !formData.campaignType && (
                <p className="text-xs text-muted-foreground text-center">
                  Fill in campaign name and type to generate suggestions
                </p>
              )}

              {suggestions && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-semibold text-midnight">Suggestions Ready</p>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm text-gray-700">
                      {suggestions}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-midnight/10 bg-midnight/5">
            <CardHeader>
              <CardTitle className="text-sm">Campaign Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${formData.name ? 'text-green-600' : 'text-gray-300'}`} />
                  Campaign name
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${formData.description ? 'text-green-600' : 'text-gray-300'}`} />
                  Description
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${formData.startDate && formData.endDate ? 'text-green-600' : 'text-gray-300'}`} />
                  Date range
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${formData.platforms.length > 0 ? 'text-green-600' : 'text-gray-300'}`} />
                  Platforms selected
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className={`h-4 w-4 ${formData.campaignType ? 'text-green-600' : 'text-gray-300'}`} />
                  Campaign type
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-2 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => saveCampaign('Draft')}
              disabled={saving || !formData.name.trim()}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save as Draft
            </Button>
            <Button
              className="bg-amg hover:bg-amg/90 text-white"
              onClick={() => saveCampaign('Active')}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish Campaign
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
