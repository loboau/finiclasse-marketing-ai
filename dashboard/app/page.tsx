'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, TrendingUp, Users, RefreshCw } from "lucide-react"

interface Activity {
  id: string
  type: 'campaign' | 'schedule' | 'content' | 'engagement'
  message: string
  timestamp: number
}

interface Stats {
  activeCampaigns: number
  scheduledPosts: number
  contentPieces: number
  engagementRate: number
  campaignsChange: number
  contentChange: number
  engagementChange: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats>({
    activeCampaigns: 12,
    scheduledPosts: 28,
    contentPieces: 156,
    engagementRate: 8.4,
    campaignsChange: 2,
    contentChange: 18,
    engagementChange: 1.2,
  })
  const [activities, setActivities] = useState<Activity[]>([])

  // Initialize activities from localStorage or create mock data
  useEffect(() => {
    const loadActivities = () => {
      const stored = localStorage.getItem('dashboard_activities')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setActivities(parsed.slice(0, 5)) // Show only latest 5
        } catch (e) {
          setActivities(generateMockActivities())
        }
      } else {
        setActivities(generateMockActivities())
      }
    }

    loadActivities()

    // Update stats periodically (simulate real-time changes)
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        scheduledPosts: prev.scheduledPosts + Math.floor(Math.random() * 2),
        engagementRate: Number((prev.engagementRate + (Math.random() - 0.5) * 0.1).toFixed(1)),
      }))
    }, 30000) // Every 30 seconds

    return () => clearInterval(statsInterval)
  }, [])

  // Generate mock activities
  const generateMockActivities = (): Activity[] => {
    const activities: Activity[] = [
      {
        id: '1',
        type: 'campaign',
        message: 'New EQS Electric Campaign created',
        timestamp: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
      },
      {
        id: '2',
        type: 'schedule',
        message: 'Instagram post scheduled for AMG GT',
        timestamp: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
      },
      {
        id: '3',
        type: 'content',
        message: 'S-Class luxury content updated',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      },
      {
        id: '4',
        type: 'engagement',
        message: 'GLE campaign reached 10K impressions',
        timestamp: Date.now() - 1.5 * 24 * 60 * 60 * 1000, // 1.5 days ago
      },
      {
        id: '5',
        type: 'content',
        message: 'Facebook Ad copy generated for C-Class',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      },
    ]

    localStorage.setItem('dashboard_activities', JSON.stringify(activities))
    return activities
  }

  // Add new activity programmatically
  const addActivity = (type: Activity['type'], message: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now(),
    }

    const updated = [newActivity, ...activities].slice(0, 10)
    setActivities(updated.slice(0, 5))
    localStorage.setItem('dashboard_activities', JSON.stringify(updated))
  }

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
  }

  // Get activity color based on type
  const getActivityColor = (type: Activity['type']): string => {
    switch (type) {
      case 'campaign':
        return 'bg-primary'
      case 'engagement':
        return 'bg-green-500'
      default:
        return 'bg-muted-foreground'
    }
  }

  // Refresh stats
  const handleRefresh = async () => {
    setIsRefreshing(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    setStats(prev => ({
      activeCampaigns: prev.activeCampaigns + Math.floor(Math.random() * 3),
      scheduledPosts: 28 + Math.floor(Math.random() * 10),
      contentPieces: prev.contentPieces + Math.floor(Math.random() * 5),
      engagementRate: Number((8 + Math.random() * 2).toFixed(1)),
      campaignsChange: Math.floor(Math.random() * 5),
      contentChange: Math.floor(Math.random() * 25),
      engagementChange: Number((Math.random() * 2).toFixed(1)),
    }))

    // Add refresh activity
    addActivity('engagement', 'Dashboard stats refreshed')

    setIsRefreshing(false)
  }

  const statCards = [
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      change: `+${stats.campaignsChange} this week`,
      icon: TrendingUp,
      onClick: () => router.push('/campaigns'),
    },
    {
      title: "Scheduled Posts",
      value: stats.scheduledPosts.toString(),
      change: "Next 7 days",
      icon: Calendar,
      onClick: () => router.push('/calendar'),
    },
    {
      title: "Content Pieces",
      value: stats.contentPieces.toString(),
      change: `+${stats.contentChange} this month`,
      icon: FileText,
      onClick: () => router.push('/copy-generator'),
    },
    {
      title: "Engagement Rate",
      value: `${stats.engagementRate}%`,
      change: `+${stats.engagementChange}% vs last month`,
      icon: Users,
      onClick: () => router.push('/analytics'),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Marketing Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome to your Finiclasse command center.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={stat.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  stat.onClick()
                }
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump into your most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/copy-generator')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate New Copy
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push('/calendar')}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Content
            </Button>
            <Button
              className="w-full justify-start"
              variant="default"
              onClick={() => router.push('/campaigns/new')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Launch Campaign
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your marketing workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`h-2 w-2 mt-1.5 rounded-full ${getActivityColor(activity.type)}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
