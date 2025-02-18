'use client'

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, Users, Building, Crown, IndianRupee } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Analytics {
  totalUsers: number;
  premiumUsers: number;
  totalUniversities: number;
  activePremiumPercentage: number;
  totalRevenue: number;
  monthlyGrowth: Array<{
    month: string;
    users: number;
    premiumUsers: number;
  }>;
  userActivity: Array<{
    date: string;
    searches: number;
    exports: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics data"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!analytics) return null;

  const statCards = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      description: "Total registered users",
      trend: "+12% from last month"
    },
    {
      title: "Premium Users",
      value: analytics.premiumUsers,
      icon: Crown,
      description: "Active premium subscriptions",
      trend: `${analytics.activePremiumPercentage}% conversion rate`
    },
    {
      title: "Total Revenue",
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      description: "Total revenue from subscriptions",
      trend: "Monthly recurring revenue"
    },
    {
      title: "Universities",
      value: analytics.totalUniversities,
      icon: Building,
      description: "Total universities tracked",
      trend: "+5 this week"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track key metrics and growth indicators
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  {stat.trend}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Growth Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Total Users"
                    stroke="#8884d8" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="premiumUsers" 
                    name="Premium Users"
                    stroke="#82ca9d" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="searches" name="Searches" fill="#8884d8" />
                  <Bar dataKey="exports" name="Exports" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}