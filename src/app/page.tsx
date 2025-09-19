'use client';

import heroImage from "@/assets/hero-career.jpg";
import { Badge } from "@/components/ui/badge";
import { useAuth } from './(main)/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { 
  Briefcase, 
  Search, 
  FileText, 
  MessageSquare, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
} from "lucide-react";


const features = [
    {
      title: "Job Tracker",
      description: "Organize your job search with a powerful, interactive Kanban board.",
      icon: Briefcase,
      path: "/job-tracker",
      color: "bg-gradient-primary",
      badge: "Organize"
    },
    {
      title: "AI Job Finder",
      description: "Discover relevant job postings tailored to your skills and preferences.",
      icon: Search,
      path: "/job-finder",
      color: "bg-gradient-hero",
      badge: "AI-Powered"
    },
    {
      title: "Resume Tailor",
      description: "Generate and customize resumes specifically for each job application.",
      icon: FileText,
      path: "/resume-tailor",
      color: "bg-gradient-success",
      badge: "Customize"
    },
    {
      title: "Interview Prep",
      description: "Practice with an AI coach and get feedback on your answers and delivery.",
      icon: MessageSquare,
      path: "/interview-prep",
      color: "bg-gradient-primary",
      badge: "Practice"
    },
    {
      title: "Skill Analyzer",
      description: "Analyze job requirements and get a roadmap for your career growth.",
      icon: TrendingUp,
      path: "/skill-analyzer",
      color: "bg-gradient-hero",
      badge: "Growth"
    }
  ];

export default function Home() {
    const { isAuthenticated } = useAuth();
    
  return (
   <div className="min-h-screen bg-background">
  {/* Hero Section */}
  <section className="relative overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white">
    <div
      className="absolute inset-0 bg-black/70 bg-cover bg-center opacity-30"
      style={{ backgroundImage: `url(${heroImage.src})` }}
    />

    <div className="relative container mx-auto px-6 py-24 lg:py-32">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Badge className="bg-black/60 border border-gray-700 text-gray-300 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 mr-1 text-gray-400" />
            AI-Powered Career Platform
          </Badge>
        </div>

        <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight text-white">
          Launch Your Dream Career with
          <span className="block text-primary drop-shadow-[2px_2px_6px_rgba(0,0,0,0.7)]">
            Smart Tools
          </span>
        </h1>

        <p className="text-xl lg:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
          From job tracking to AI-powered resume tailoring, everything you need
          to land your next role faster and smarter.
        </p>

        <div className="flex justify-center">
          <Link href="/login">
            <Button
              size="lg"
              className="h-12 px-8 text-base font-semibold transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Target className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>

      {/* Features Grid */}
      <section className="py-24 bg-blue-500/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need for Career Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five powerful tools working together to accelerate your career growth and help you land the perfect job.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature) => {
              const IconComponent = feature.icon;

    return (
      <Card
        key={feature.path}
        className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-gray-100 border border-primary/10"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            {/* Icon bubble */}
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft"
            style={{ 
             background: 'linear-gradient(135deg, #D6C6F5, #a47cc3ff)' 
               }}>
              <IconComponent className="w-6 h-6" />
            </div>
            {/* Badge */}
            <Badge
              variant="secondary"
              className="text-xs font-medium bg-primary text-white 
             hover:text-white/90 hover:bg-primary/50 transition-colors duration-300"
            >
              {feature.badge}
            </Badge>
          </div>
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {feature.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <CardDescription className="text-sm leading-relaxed mb-6 text-foreground/80">
            {feature.description}
          </CardDescription>

          <Link href={isAuthenticated ? feature.path : '/login'}>
          <Button
            variant="outline"
            className="w-full bg-white group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
          >
            Explore Tool
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          </Link>
        </CardContent>
      </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
