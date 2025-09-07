'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import GenerateResumeTab from '@/app/(main)/resume-builder/page'; 
import TailorResumeTab from '@/app/(main)/resume-tailor/page'; 

export default function ResumeGeneratorPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate from Scratch</TabsTrigger>
            <TabsTrigger value="tailor">Tailor Resume</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="mt-6">
            <GenerateResumeTab />
          </TabsContent>

          <TabsContent value="tailor" className="mt-6">
            <TailorResumeTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
