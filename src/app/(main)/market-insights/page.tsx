
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Search, TrendingUp, Briefcase, MapPin } from 'lucide-react';
import {
  getSalaryHistogram,
  getTopCompanies,
  getRegionalInsights,
} from '@/ai/flows/market-insights';
import {
  MarketInsightsFormSchema,
  type MarketInsightsFormValues,
  type SalaryHistogram,
  type TopCompany,
  type RegionalInsight,
} from '@/types/ai-market-insights';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

type AllInsights = {
  salaryHistogram: SalaryHistogram;
  topCompanies: TopCompany[];
  regionalInsights: RegionalInsight[];
};

export default function MarketInsightsPage() {
  const [insights, setInsights] = useState<AllInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<MarketInsightsFormValues>({
    resolver: zodResolver(MarketInsightsFormSchema),
    defaultValues: {
      jobRole: '',
      location: '',
    },
  });

  async function onSubmit(values: MarketInsightsFormValues) {
    setIsLoading(true);
    setInsights(null);
    try {
      const [
        salaryHistogram,
        topCompanies,
        regionalInsights,
      ] = await Promise.all([
        getSalaryHistogram(values),
        getTopCompanies(values),
        getRegionalInsights(values),
      ]);

      setInsights({
        salaryHistogram: salaryHistogram.histogram,
        topCompanies: topCompanies.leaderboard,
        regionalInsights: regionalInsights.locations.slice(0, 10), // Limit to top 10
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Fetching Insights',
        description:
          'Could not retrieve market data. Please check your inputs or try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
     if (value >= 1000) {
        return `£${(value / 1000).toFixed(0)}k`;
     }
     return `£${value}`;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Job Market Insights</CardTitle>
          <CardDescription>
            Analyze salary benchmarks, top hiring companies, and regional demand
            for any job role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
            >
              <FormField
                control={form.control}
                name="jobRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Role</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Senior Frontend Developer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., London, UK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:pt-8">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Get Insights
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Salary Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Salary Benchmarks
              </CardTitle>
              <CardDescription>
                Average salary distribution for '{form.getValues('jobRole')}' in '{form.getValues('location')}'.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(insights.salaryHistogram).map(([range, count]) => ({ name: range, count }))} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickFormatter={(value) => `${value}`} tickLine={false} axisLine={false} fontSize={12}/>
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">Salary Range</span>
                                  <span className="font-bold text-muted-foreground">{payload[0].payload.name}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">Job Postings</span>
                                  <span className="font-bold text-foreground">{payload[0].value}</span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                     <LabelList dataKey="count" position="top" offset={5} fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Top Companies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Top Hiring Companies
              </CardTitle>
               <CardDescription>
                Companies with the most open roles for '{form.getValues('jobRole')}'.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {insights.topCompanies.map((company, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <p className="text-sm font-medium">{index + 1}. {company.canonical_name}</p>
                            <div className="text-sm text-muted-foreground">{company.count} openings</div>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>

           {/* Regional Insights */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Regional Job Hotspots
              </CardTitle>
               <CardDescription>
                Top locations with the most job openings for '{form.getValues('jobRole')}'.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={insights.regionalInsights} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="location.display_name" type="category" width={150} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                     cursor={{ fill: 'hsl(var(--muted))' }}
                     content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                               <span className="font-bold text-foreground">{payload[0].value} postings in {payload[0].payload.location.display_name}</span>
                            </div>
                          )
                        }
                        return null
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} layout="vertical" barSize={20}>
                    <LabelList dataKey="count" position="right" offset={8} fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

