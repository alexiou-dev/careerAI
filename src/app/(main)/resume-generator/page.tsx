'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import GenerateResumeTab from '@/app/(main)/resume-builder/page'; 
import TailorResumeTab from '@/app/(main)/resume-tailor/page'; 
import ResumeHistoryTab from '@/app/(main)/resume-history/page';

export default function ResumeGeneratorPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <Tabs defaultValue="history" className="w-full">
          {/* Use flex-col to stack the main History tab above the two smaller ones */}
          <div className="flex flex-col w-full gap-2">
            <TabsList className="w-full">
              <TabsTrigger value="history" className="w-full text-center">
                Versions
              </TabsTrigger>
            </TabsList>

            <TabsList className="grid grid-cols-2 gap-2 w-full">
              <TabsTrigger value="generate" className="w-full text-center">
                Generate from Scratch
              </TabsTrigger>
              <TabsTrigger value="tailor" className="w-full text-center">
                Tailor Resume
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="history" className="mt-6">
            <ResumeHistoryTab />
          </TabsContent>

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
