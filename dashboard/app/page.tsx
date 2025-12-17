'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, TrendingUp, Users, RefreshCw, Sparkles } from "lucide-react"

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

  useEffect(() => {
    const loadActivities = () => {
      const stored = localStorage.getItem('dashboard_activities')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setActivities(parsed.slice(0, 5))
        } catch {
          setActivities(generateMockActivities())
        }
      } else {
        setActivities(generateMockActivities())
      }
    }

    loadActivities()

    const statsInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        scheduledPosts: prev.scheduledPosts + Math.floor(Math.random() * 2),
        engagementRate: Number((prev.engagementRate + (Math.random() - 0.5) * 0.1).toFixed(1)),
      }))
    }, 30000)

    return () => clearInterval(statsInterval)
  }, [])

  const generateMockActivities = (): Activity[] => {
    const activities: Activity[] = [
      {
        id: '1',
        type: 'campaign',
        message: 'New EQS Electric Campaign created',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
      },
      {
        id: '2',
        type: 'schedule',
        message: 'Instagram post scheduled for AMG GT',
        timestamp: Date.now() - 5 * 60 * 60 * 1000,
      },
      {
        id: '3',
        type: 'content',
        message: 'S-Class luxury content updated',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
      },
      {
        id: '4',
        type: 'engagement',
        message: 'GLE campaign reached 10K impressions',
        timestamp: Date.now() - 1.5 * 24 * 60 * 60 * 1000,
      },
      {
        id: '5',
        type: 'content',
        message: 'Facebook Ad copy generated for C-Class',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
    ]

    localStorage.setItem('dashboard_activities', JSON.stringify(activities))
    return activities
  }

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

  const formatTimestamp = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return `${Math.floor(seconds / 604800)}w ago`
  }

  const getActivityColor = (type: Activity['type']): string => {
    switch (type) {
      case 'campaign':
        return 'bg-amg'
      case 'engagement':
        return 'bg-green-500'
      case 'schedule':
        return 'bg-blue-500'
      default:
        return 'bg-muted-foreground'
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)

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

    addActivity('engagement', 'Dashboard stats refreshed')

    setIsRefreshing(false)
  }

  const statCards = [
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      change: `+${stats.campaignsChange} this week`,
      icon: TrendingUp,
      color: "text-amg",
      onClick: () => router.push('/campaigns'),
    },
    {
      title: "Scheduled Posts",
      value: stats.scheduledPosts.toString(),
      change: "Next 7 days",
      icon: Calendar,
      color: "text-blue-500",
      onClick: () => router.push('/calendar'),
    },
    {
      title: "Content Pieces",
      value: stats.contentPieces.toString(),
      change: `+${stats.contentChange} this month`,
      icon: FileText,
      color: "text-amber-500",
      onClick: () => router.push('/copy-generator'),
    },
    {
      title: "Engagement Rate",
      value: `${stats.engagementRate}%`,
      change: `+${stats.engagementChange}% vs last month`,
      icon: Users,
      color: "text-green-500",
      onClick: () => router.push('/campaigns'),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-semibold tracking-tight text-foreground">
            Marketing Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground font-sans">
            Welcome to your Finiclasse command center.
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Stats</span>
          <span className="sm:hidden">Refresh</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="cursor-pointer group"
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
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground font-sans">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-value text-2xl sm:text-3xl">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 font-sans truncate">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amg" />
              <CardTitle className="font-semibold">Quick Actions</CardTitle>
            </div>
            <CardDescription className="font-sans">
              Jump into your most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start font-sans h-12"
              variant="outline"
              onClick={() => router.push('/copy-generator')}
            >
              <FileText className="mr-3 h-5 w-5 text-amber-500" />
              Generate New Copy
            </Button>
            <Button
              className="w-full justify-start font-sans h-12"
              variant="outline"
              onClick={() => router.push('/calendar')}
            >
              <Calendar className="mr-3 h-5 w-5 text-blue-500" />
              Schedule Content
            </Button>
            <Button
              className="w-full justify-start font-sans h-12 bg-amg hover:bg-amg-600 text-white"
              onClick={() => router.push('/campaigns/new')}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Launch Campaign
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold">Recent Activity</CardTitle>
            <CardDescription className="font-sans">
              Latest updates from your marketing workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`h-2.5 w-2.5 mt-1.5 rounded-full flex-shrink-0 ${getActivityColor(activity.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-sans truncate">{activity.message}</p>
                      <p className="text-xs text-muted-foreground font-sans">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 font-sans">
                No recent activity yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
