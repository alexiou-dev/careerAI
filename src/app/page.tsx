'use client';

/**
 * Main landing page for CareerAI platform.
 * 
 * Features:
 * - Background image section with compelling value proposition
 * - Interactive feature cards with tool navigation
 * - Authentication-aware routing
 */

import heroImage from "@/assets/hero-career.jpg";
import { Badge } from "@/components/ui/badge";
import { useAuth } from './(main)/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Icon imports 
import { 
  Briefcase, 
  Search, 
  FileText, 
  MessageSquare, 
  Lightbulb,
  Bot,
  ArrowRight,
  Sparkles,
  Target,
  Building2
} from "lucide-react";

/**
 * Feature configuration array defining platform tools.
 * Each tool has:
 * - Descriptive metadata for UI display
 * - Navigation path
 * - Visual styling (icon, color, badge)
 */
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
    title: "AI Writer",
    description: "Generate personalized cover letters, thank-you emails, and more.",
    icon: Sparkles,
    path: "/documents",
    color: "bg-gradient-hero",
    badge: "AI-Powered"
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
    icon: Lightbulb,
    path: "/skill-analyzer",
    color: "bg-gradient-hero",
    badge: "Growth"
  },
  {
    title: "Company Fit Analyzer",
    description: "Get an AI-powered analysis of a company's culture and how it matches your preferences.",
    icon: Building2,
    path: "/company-fit",
    color: "bg-gradient-hero",
    badge: "Growth"
  },
];

/**
 * Home component - Main landing page
 */
export default function Home() {
  // Authentication state for conditional routing
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* 
        ============================================
        Backgroung Image SECTION
        ============================================
        Full-screen, brand identity and primary call-to-action
      */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-b from-black to-gray-900 text-white">
        
        {/* Authentication buttons - top right corner */}
        <div className="absolute top-6 right-6 flex gap-4 z-20">
          <Link href="/login">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-white border-2 border-white bg-transparent rounded-full hover:bg-white/10 px-6 py-2"
              aria-label="Login to CareerAI"
            >
              Login
            </Button>
          </Link>
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-primary text-white rounded-full hover:bg-primary/90 px-6 py-2"
              aria-label="Get started with CareerAI"
            >
              Get Started
            </Button>
          </Link>
        </div>
        
        {/* Hero background image with dark overlay for text readability */}
        <div
          className="absolute inset-0 bg-black/70 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage.src})` }}
          aria-hidden="true"
        />
        
        {/* Brand logo and name - clickable for page refresh */}
        <div 
          className="absolute top-6 left-6 flex items-center space-x-2 z-20 cursor-pointer" 
          onClick={() => window.location.reload()}
          role="button"
          tabIndex={0}
          aria-label="Refresh page and go to CareerAI homepage"
          onKeyDown={(e) => e.key === 'Enter' && window.location.reload()}
        >
          <Bot className="h-12 w-12 text-primary" aria-hidden="true" />
          <span className="text-2xl font-bold text-white">CareerAI</span>
        </div>
        
        {/* Image content container */}
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Promotional badge */}
            <div className="flex justify-center mb-6">
              <Badge 
                className="bg-black/60 border border-gray-700 text-gray-300 backdrop-blur-sm"
                aria-label="Platform feature: AI-Powered Career Platform"
              >
                <Sparkles className="w-4 h-4 mr-1 text-gray-400" aria-hidden="true" />
                AI-Powered Career Platform
              </Badge>
            </div>

            {/* Main headline*/}
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight text-white">
              Launch Your Dream Career with
              <span 
                className="block text-primary drop-shadow-[2px_2px_6px_rgba(0,0,0,0.7)]"
                aria-label="Smart Tools"
              >
                Smart Tools
              </span>
            </h1>

            {/* Value proposition */}
            <p className="text-xl lg:text-xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              From job tracking to AI-powered resume tailoring, everything you need
              to land your next role faster and smarter.
            </p>

            {/* Primary call-to-action button */}
            <div className="flex justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-12 px-8 text-base font-semibold transition-transform duration-300 rounded-full hover:scale-105 hover:shadow-lg"
                  aria-label="Get started for free with CareerAI"
                >
                  <Target className="w-5 h-5 mr-2" aria-hidden="true" />
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ============================================
        FEATURES GRID SECTION
        ============================================
        Interactive cards showcasing platform tools with
        authentication-aware navigation
      */}
      <section 
        className="py-24 bg-blue-500/10"
        aria-labelledby="features-heading"
      >
        <div className="container mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 
              id="features-heading"
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Everything You Need for Career Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five powerful tools working together to accelerate your career growth and help you land the perfect job.
            </p>
          </div>

          {/* Features grid - responsive 1, 2, or 3 columns */}
          <div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            role="list"
            aria-label="CareerAI platform features"
          >
            {features.map((feature) => {
              const IconComponent = feature.icon;

              return (
                <Card
                  key={feature.path}
                  className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-gray-100 border border-primary/10"
                  role="listitem"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      {/* Icon with gradient background */}
                      <div 
                        className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-soft"
                        style={{ 
                          background: 'linear-gradient(135deg, #D6C6F5, #a47cc3ff)' 
                        }}
                        aria-hidden="true"
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      
                      {/* Feature badge */}
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium bg-primary text-white hover:text-white/90 hover:bg-primary/50 transition-colors duration-300"
                        aria-label={`Feature type: ${feature.badge}`}
                      >
                        {feature.badge}
                      </Badge>
                    </div>
                    
                    {/* Feature title */}
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Feature description */}
                    <CardDescription className="text-sm leading-relaxed mb-6 text-foreground/80">
                      {feature.description}
                    </CardDescription>

                    {/* 
                      Navigation button - routes to feature if authenticated,
                      otherwise redirects to login for conversion
                    */}
                    <Link 
                      href={isAuthenticated ? feature.path : '/login'}
                      aria-label={`Explore ${feature.title} tool`}
                    >
                      <Button
                        variant="outline"
                        className="w-full bg-white group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                      >
                        Explore Tool
                        <ArrowRight 
                          className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" 
                          aria-hidden="true"
                        />
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
