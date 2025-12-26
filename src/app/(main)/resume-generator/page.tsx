'use client';

// Tab navigation components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// UI Card component for container styling
import { Card } from '@/components/ui/card';
// Tab content components
import GenerateResumeTab from '@/app/(main)/resume-builder/page';      // Generate new resume from scratch
import TailorResumeTab from '@/app/(main)/resume-tailor/page';         // Tailor existing resume to job
import ResumeHistoryTab from '@/app/(main)/resume-history/page';       // View resume version history

/**
 * Resume Generator Page Component
 * 
 * Main hub for all resume-related functionality in CareerAI.
 * Provides a tabbed interface for three core resume features:
 * 1. Resume History - View and manage previous resume versions
 * 2. Generate from Scratch - Create new resumes using AI
 * 3. Tailor Resume - Optimize existing resumes for specific jobs
 * 
 * The interface uses a tab layout where "History" is prominently displayed
 * above the two action-oriented tabs (Generate and Tailor).
 */
export default function ResumeGeneratorPage() {
  return (
    <div className="container mx-auto py-8">
      {/* Main card container for the entire resume generator */}
      <Card className="p-6">
        {/* 
          Tab navigation system with "history" as default active tab
          Uses a two-tier tab layout for better visual hierarchy
        */}
        <Tabs defaultValue="history" className="w-full">
          
          {/* 
            Tab list container with custom vertical stacking
            - History tab gets its own row for prominence
            - Generate/Tailor tabs share a row below
          */}
          <div className="flex flex-col w-full gap-2">
            
            {/* Top tier: Resume History tab */}
            <TabsList className="w-full">
              <TabsTrigger 
                value="history" 
                className="w-full text-center"
                aria-label="View resume versions and history"
              >
                Versions
              </TabsTrigger>
            </TabsList>

            {/* 
              Bottom tier: Action tabs for resume creation/editing
              Uses grid layout to ensure equal width for both tabs
            */}
            <TabsList className="grid grid-cols-2 gap-2 w-full">
              <TabsTrigger 
                value="generate" 
                className="w-full text-center"
                aria-label="Generate a new resume from scratch using AI"
              >
                Generate from Scratch
              </TabsTrigger>
              <TabsTrigger 
                value="tailor" 
                className="w-full text-center"
                aria-label="Tailor your existing resume for a specific job"
              >
                Tailor Resume
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 
            Tab content sections
            Each tab content is conditionally rendered when its tab is active
          */}

          {/* Resume History Tab Content */}
          <TabsContent value="history" className="mt-6">
            {/* 
              Displays: 
              - List of previously generated resumes
              - Version history with timestamps
              - Ability to restore, download, or delete versions
              - Comparison tools between versions
            */}
            <ResumeHistoryTab />
          </TabsContent>

          {/* Generate Resume Tab Content */}
          <TabsContent value="generate" className="mt-6">
            {/* 
              Provides:
              - Form for inputting career information
              - AI-powered resume generation
              - Template selection
              - Skill and experience suggestions
              - Export options (PDF, Word, etc.)
            */}
            <GenerateResumeTab />
          </TabsContent>

          {/* Tailor Resume Tab Content */}
          <TabsContent value="tailor" className="mt-6">
            {/* 
              Enables:
              - Upload existing resume
              - Input job description for targeting
              - AI-powered optimization suggestions
              - ATS (Applicant Tracking System) compatibility checking
              - Keyword optimization for specific roles
            */}
            <TailorResumeTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
