import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Star, 
  Trophy, 
  Smile,
  Calendar,
  Plus,
  Heart,
  ThumbsUp,
  X,
  Check,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Form schema
const winFormSchema = z.object({
  content: z.string().min(3, {
    message: "Please describe your win (at least 3 characters)"
  }).max(300, {
    message: "Keep your win under 300 characters"
  }),
  category: z.string({
    required_error: "Please select a category"
  })
});

type WinFormValues = z.infer<typeof winFormSchema>;

interface SmallWin {
  id: string;
  content: string;
  date: Date;
  category: string;
  liked: boolean;
}

export default function SmallWins() {
  const { user } = useAuth();
  const [wins, setWins] = React.useState<SmallWin[]>([
    {
      id: '1',
      content: 'Went for a 10-minute walk outside today, first time since starting treatment!',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      category: 'movement',
      liked: true
    },
    {
      id: '2',
      content: 'Made my own breakfast today without feeling too tired afterwards.',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      category: 'energy',
      liked: false
    },
    {
      id: '3',
      content: 'Completed the chair exercise session and felt stronger than last week.',
      date: new Date(),
      category: 'strength',
      liked: true
    },
    {
      id: '4',
      content: 'Slept through the night without waking up - first time in weeks!',
      date: new Date(),
      category: 'wellness',
      liked: false
    }
  ]);

  const [formVisible, setFormVisible] = React.useState(false);
  
  // Initialize form
  const form = useForm<WinFormValues>({
    resolver: zodResolver(winFormSchema),
    defaultValues: {
      content: '',
      category: ''
    }
  });

  // Handle form submission
  function onSubmit(values: WinFormValues) {
    const newWin: SmallWin = {
      id: Date.now().toString(),
      content: values.content,
      date: new Date(),
      category: values.category,
      liked: false
    };

    setWins(prev => [newWin, ...prev]);
    form.reset();
    setFormVisible(false);
  }

  // Toggle like on a win
  const toggleLike = (id: string) => {
    setWins(prevWins => 
      prevWins.map(win => 
        win.id === id ? { ...win, liked: !win.liked } : win
      )
    );
  };

  // Delete a win
  const deleteWin = (id: string) => {
    setWins(prevWins => prevWins.filter(win => win.id !== id));
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get color for category
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'movement': return 'bg-blue-100 text-blue-700';
      case 'energy': return 'bg-amber-100 text-amber-700';
      case 'strength': return 'bg-emerald-100 text-emerald-700';
      case 'wellness': return 'bg-purple-100 text-purple-700';
      case 'nutrition': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'movement': return <Calendar className="h-3.5 w-3.5 mr-1" />;
      case 'energy': return <Star className="h-3.5 w-3.5 mr-1" />;
      case 'strength': return <Trophy className="h-3.5 w-3.5 mr-1" />;
      case 'wellness': return <Heart className="h-3.5 w-3.5 mr-1" />;
      case 'nutrition': return <Smile className="h-3.5 w-3.5 mr-1" />;
      default: return <Star className="h-3.5 w-3.5 mr-1" />;
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Welcome Club Banner */}
      <div className="bg-orange-50 text-orange-800 text-sm px-4 py-3 rounded-lg border border-orange-100 flex items-center mb-4">
        <span className="bg-orange-100 p-1 rounded-full mr-2">
          <Sparkles className="h-4 w-4 text-orange-500" />
        </span>
        <span className="font-medium">Nowercise Club — exclusive member space for guided recovery</span>
      </div>
      
      {/* Navigation Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-primary">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <Link href="/club">
            <ArrowLeft size={16} className="mr-1" /> Back to Club
          </Link>
        </Button>
      </div>
        
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <CheckCircle className="mr-2 h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-orange-600">Small Wins</h1>
        </div>
        <p className="text-sm italic text-slate-500 mb-2">
          Included with your Nowercise membership – celebrate and track your progress, no matter how small.
        </p>
        <p className="text-slate-600 mb-2">
          Every step forward matters, no matter how small. Record your daily wins to celebrate your progress and build momentum.
        </p>
      </div>

      {/* Add New Win Button */}
      {!formVisible && (
        <Button 
          onClick={() => setFormVisible(true)} 
          className="mb-6 w-full bg-primary hover:bg-primary-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record a New Win
        </Button>
      )}

      {/* New Win Form */}
      {formVisible && (
        <Card className="mb-8 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Share Your Win</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What did you accomplish today?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="I managed to..." 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="movement">Movement & Activity</SelectItem>
                          <SelectItem value="energy">Energy & Stamina</SelectItem>
                          <SelectItem value="strength">Strength & Fitness</SelectItem>
                          <SelectItem value="wellness">Sleep & Wellbeing</SelectItem>
                          <SelectItem value="nutrition">Nutrition & Hydration</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary-dark">
                    Save Win
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormVisible(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Win Counter Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <h3 className="text-sm text-gray-500">Today's Wins</h3>
            <p className="text-2xl font-bold text-primary">
              {wins.filter(win => win.date.toDateString() === new Date().toDateString()).length}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500">This Week</h3>
            <p className="text-2xl font-bold text-primary">
              {wins.filter(win => {
                const today = new Date();
                const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return win.date >= oneWeekAgo;
              }).length}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500">Total</h3>
            <p className="text-2xl font-bold text-primary">{wins.length}</p>
          </div>
        </div>
      </div>

      {/* Wins List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Recent Wins</h2>
        
        {wins.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-100">
            <Smile className="h-10 w-10 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600 mb-2">You haven't recorded any wins yet.</p>
            <Button 
              onClick={() => setFormVisible(true)} 
              variant="outline"
            >
              Add Your First Win
            </Button>
          </div>
        ) : (
          <>
            {wins.map((win) => (
              <Card key={win.id} className="shadow-sm relative overflow-hidden">
                {win.liked && (
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 transform rotate-45 bg-rose-500 text-white text-xs text-center py-1 w-24 translate-x-5 translate-y-2">
                      Favorite
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center ${getCategoryColor(win.category)}`}>
                        {getCategoryIcon(win.category)}
                        {win.category === 'movement' && 'Movement & Activity'}
                        {win.category === 'energy' && 'Energy & Stamina'}
                        {win.category === 'strength' && 'Strength & Fitness'}
                        {win.category === 'wellness' && 'Sleep & Wellbeing'}
                        {win.category === 'nutrition' && 'Nutrition & Hydration'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(win.date)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-slate-700">{win.content}</p>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleLike(win.id)}
                    className={win.liked ? 'text-rose-500' : ''}
                  >
                    {win.liked ? (
                      <>
                        <Heart className="mr-1 h-4 w-4 fill-rose-500" />
                        Favorited
                      </>
                    ) : (
                      <>
                        <Heart className="mr-1 h-4 w-4" />
                        Add to Favorites
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteWin(win.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {wins.length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm mb-2">
                  Looking back helps you see how far you've come.
                </p>
                <Button variant="outline" size="sm">
                  View All Wins
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Motivational Quote */}
      <div className="mt-8 bg-primary-light/10 border border-primary-light/30 rounded-lg p-4 text-center">
        <blockquote className="text-primary font-medium mb-1">
          "Small wins are the stepping stones of great achievements."
        </blockquote>
        <p className="text-sm text-slate-600">Remember to celebrate every step forward!</p>
      </div>
    </div>
  );
}