'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduledPost {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  platform: 'Instagram' | 'Facebook' | 'LinkedIn';
  contentType: string;
}

const platformColors = {
  Instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  Facebook: 'bg-blue-600',
  LinkedIn: 'bg-blue-700',
};

const platformBadgeColors = {
  Instagram: 'bg-purple-100 text-purple-700 border-purple-300',
  Facebook: 'bg-blue-100 text-blue-700 border-blue-300',
  LinkedIn: 'bg-blue-100 text-blue-800 border-blue-400',
};

export default function CalendarPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const [newPost, setNewPost] = useState<Partial<ScheduledPost>>({
    title: '',
    date: '',
    time: '09:00',
    platform: 'Instagram',
    contentType: '',
  });

  // Load posts from localStorage on mount
  useEffect(() => {
    const savedPosts = localStorage.getItem('scheduledPosts');
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts));
      } catch (error) {
        console.error('Failed to load posts from localStorage', error);
      }
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0 || posts.length === 0) {
      localStorage.setItem('scheduledPosts', JSON.stringify(posts));
    }
  }, [posts]);

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.date || !newPost.platform) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingPost) {
      // Update existing post
      setPosts(posts.map(post =>
        post.id === editingPost.id
          ? { ...post, ...newPost as ScheduledPost }
          : post
      ));
      setEditingPost(null);
    } else {
      // Create new post
      const post: ScheduledPost = {
        id: Date.now().toString(),
        title: newPost.title!,
        date: newPost.date!,
        time: newPost.time || '09:00',
        platform: newPost.platform!,
        contentType: newPost.contentType || 'Standard Post',
      };
      setPosts([...posts, post]);
    }

    setIsNewPostDialogOpen(false);
    setNewPost({
      title: '',
      date: '',
      time: '09:00',
      platform: 'Instagram',
      contentType: '',
    });
  };

  const handleDeletePost = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setNewPost(post);
    setIsNewPostDialogOpen(true);
  };

  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setNewPost({ ...newPost, date });
    setIsNewPostDialogOpen(true);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getWeekDays = (date: Date) => {
    const days = [];
    const currentDay = new Date(date);
    const dayOfWeek = currentDay.getDay();
    const diff = currentDay.getDate() - dayOfWeek;

    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDay);
      day.setDate(diff + i);
      days.push(day);
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getPostsForDate = (date: string) => {
    return posts.filter(post => post.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: string) => {
    const today = new Date();
    return date === formatDate(today);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = getWeekDays(currentDate);

  const upcomingPosts = [...posts]
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .filter(post => {
      const postDate = new Date(`${post.date}T${post.time}`);
      return postDate >= new Date();
    })
    .slice(0, 5);

  const renderMonthView = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayPosts = getPostsForDate(date);
      const today = isToday(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(date)}
          className={`min-h-[120px] border border-gray-200 p-2 cursor-pointer transition-all hover:bg-gray-50 ${
            today ? 'bg-amg-50 border-amg-500 border-2' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-semibold mb-2 ${today ? 'text-amg-600' : 'text-midnight'}`}>
            {day}
            {today && <span className="ml-1 text-xs">(Today)</span>}
          </div>
          <div className="space-y-1">
            {dayPosts.slice(0, 3).map(post => (
              <div
                key={post.id}
                className={`text-xs p-1 rounded text-white truncate ${platformColors[post.platform]}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPost(post);
                }}
              >
                {post.time} - {post.title}
              </div>
            ))}
            {dayPosts.length > 3 && (
              <div className="text-xs text-arrow-600 font-medium">
                +{dayPosts.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    return weekDays.map((day, index) => {
      const date = formatDate(day);
      const dayPosts = getPostsForDate(date);
      const today = isToday(date);
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = day.getDate();

      return (
        <div
          key={index}
          onClick={() => handleDayClick(date)}
          className={`min-h-[400px] border border-gray-200 p-3 cursor-pointer transition-all hover:bg-gray-50 ${
            today ? 'bg-amg-50 border-amg-500 border-2' : 'bg-white'
          }`}
        >
          <div className={`text-center mb-3 ${today ? 'text-amg-600' : 'text-midnight'}`}>
            <div className="text-xs font-medium">{dayName}</div>
            <div className={`text-2xl font-bold ${today ? 'text-amg-600' : ''}`}>
              {dayNumber}
            </div>
            {today && <div className="text-xs font-semibold">Today</div>}
          </div>
          <div className="space-y-2">
            {dayPosts.map(post => (
              <div
                key={post.id}
                className={`text-xs p-2 rounded text-white ${platformColors[post.platform]}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPost(post);
                }}
              >
                <div className="font-semibold">{post.time}</div>
                <div className="mt-1 line-clamp-2">{post.title}</div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-midnight">
            Editorial Calendar
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Plan and schedule your content across all channels
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPost(null);
            setNewPost({
              title: '',
              date: formatDate(new Date()),
              time: '09:00',
              platform: 'Instagram',
              contentType: '',
            });
            setIsNewPostDialogOpen(true);
          }}
          className="bg-amg hover:bg-amg/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week')} className="w-auto">
          <TabsList>
            <TabsTrigger value="month">Month View</TabsTrigger>
            <TabsTrigger value="week">Week View</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold text-midnight min-w-[200px] text-center">
            {viewMode === 'month' ? monthName : `Week of ${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-midnight">
                {viewMode === 'month' ? 'Month Calendar' : 'Week Calendar'}
              </CardTitle>
              <CardDescription>
                Click on any day to schedule a new post
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === 'month' ? (
                <div>
                  <div className="grid grid-cols-7 gap-0 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-midnight py-2 bg-gray-100">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0 border-t border-l">
                    {renderMonthView()}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-7 gap-2">
                    {renderWeekView()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-midnight">Upcoming Posts</CardTitle>
              <CardDescription>
                Next {upcomingPosts.length} scheduled content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPosts.length === 0 ? (
                  <p className="text-sm text-arrow text-center py-8">
                    No upcoming posts scheduled
                  </p>
                ) : (
                  upcomingPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${platformBadgeColors[post.platform]}`}>
                            {post.platform}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-midnight line-clamp-2">
                          {post.title}
                        </p>
                        <p className="text-xs text-arrow-600 mt-1">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })} at {post.time}
                        </p>
                        {post.contentType && (
                          <p className="text-xs text-arrow-500 mt-1">
                            {post.contentType}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amg hover:text-amg hover:bg-amg-50"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 mt-6">
            <CardHeader>
              <CardTitle className="text-midnight text-sm">Platform Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(platformColors).map(([platform, color]) => (
                  <div key={platform} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${color}`}></div>
                    <span className="text-sm text-midnight">{platform}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isNewPostDialogOpen} onOpenChange={(open) => {
        setIsNewPostDialogOpen(open);
        if (!open) {
          setEditingPost(null);
          setNewPost({
            title: '',
            date: '',
            time: '09:00',
            platform: 'Instagram',
            contentType: '',
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-midnight">
              {editingPost ? 'Edit Scheduled Post' : 'Schedule New Post'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-midnight mb-1 block">
                Title *
              </label>
              <Input
                placeholder="Enter post title"
                value={newPost.title || ''}
                onChange={(e) => setNewPost({...newPost, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-midnight mb-1 block">
                Platform *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Instagram', 'Facebook', 'LinkedIn'] as const).map((platform) => (
                  <Button
                    key={platform}
                    type="button"
                    variant={newPost.platform === platform ? 'default' : 'outline'}
                    className={newPost.platform === platform ? platformColors[platform] + ' text-white hover:opacity-90' : ''}
                    onClick={() => setNewPost({...newPost, platform })}
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-midnight mb-1 block">
                  Date *
                </label>
                <Input
                  type="date"
                  value={newPost.date || ''}
                  onChange={(e) => setNewPost({...newPost, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-midnight mb-1 block">
                  Time *
                </label>
                <Input
                  type="time"
                  value={newPost.time || '09:00'}
                  onChange={(e) => setNewPost({...newPost, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-midnight mb-1 block">
                Content Type
              </label>
              <Input
                placeholder="e.g., Product Launch, Event, Promotion"
                value={newPost.contentType || ''}
                onChange={(e) => setNewPost({...newPost, contentType: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsNewPostDialogOpen(false);
                setEditingPost(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              className="bg-amg hover:bg-amg/90 text-white"
            >
              {editingPost ? 'Update Post' : 'Schedule Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
