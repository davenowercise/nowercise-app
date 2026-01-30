import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Mock data for progress charts
const generateMockWeeklyData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'EEE'),
      rpe: Math.floor(Math.random() * 3) + 4, // RPE between 4-7
      pain: Math.max(0, Math.floor(Math.random() * 4) - 1), // Pain between 0-3
      duration: Math.floor(Math.random() * 25) + 15, // Duration between 15-40 min
    });
  }
  return data;
};

const generateMockMonthlyData = () => {
  const data = [];
  for (let i = 0; i < 4; i++) {
    const weekNumber = i + 1;
    data.push({
      week: `Week ${weekNumber}`,
      strength: Math.floor(Math.random() * 3) + 1, // 1-4 strength workouts
      cardio: Math.floor(Math.random() * 2) + 1, // 1-3 cardio workouts
      rest: Math.floor(Math.random() * 2) + 1, // 1-3 rest days
    });
  }
  return data;
};

const weeklyData = generateMockWeeklyData();
const monthlyData = generateMockMonthlyData();

// Progress metrics
const progressMetrics = [
  { label: 'Workouts Completed', value: 14, change: '+3', trend: 'up' },
  { label: 'Avg RPE', value: 5.2, change: '-0.8', trend: 'down' },
  { label: 'Avg Pain Level', value: 1.3, change: '-0.5', trend: 'down' },
  { label: 'Avg Duration', value: '28m', change: '+5m', trend: 'up' },
];

const ProgressDashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Progress Dashboard</h2>
      
      {/* Key metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {progressMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <div className="flex items-end justify-between mt-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className={`text-xs ${metric.trend === 'up' ? 'text-action-blue' : 'text-red-500'}`}>
                  {metric.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Progress charts */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly">
            <TabsList className="mb-4">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            
            <TabsContent value="weekly" className="min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={weeklyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="rpe" 
                    name="RPE" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="pain" 
                    name="Pain Level" 
                    stroke="#ff7300" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="monthly" className="min-h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="strength" 
                    name="Strength Workouts" 
                    fill="#4ade80" 
                    stackId="a" 
                  />
                  <Bar 
                    dataKey="cardio" 
                    name="Cardio Workouts" 
                    fill="#60a5fa" 
                    stackId="a" 
                  />
                  <Bar 
                    dataKey="rest" 
                    name="Rest Days" 
                    fill="#d1d5db" 
                    stackId="a" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Progress insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-info-panel rounded-md">
              <h3 className="text-sm font-medium text-action-blue">Improvement Trend</h3>
              <p className="mt-1 text-sm text-accent-blue">
                Your average pain level has decreased by 0.5 points over the past two weeks. 
                Keep up the consistent workout schedule!
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-800">Workout Consistency</h3>
              <p className="mt-1 text-sm text-blue-700">
                You've maintained a consistent workout schedule with 3-4 workouts per week. 
                This consistency is key to your progress.
              </p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800">Recommendation</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Consider adding one more day of light cardio to your weekly routine 
                as your energy levels have been improving.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressDashboard;