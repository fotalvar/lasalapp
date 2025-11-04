"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, FileText, Search } from 'lucide-react';
import { summarizeMeetingMinutes } from '@/ai/flows/summarize-meeting-minutes';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

const pastMeetings = [
    {
        id: 'meeting1',
        title: 'Q3 Planning Session',
        date: new Date('2024-06-15'),
        summary: 'Decided on the main production for the fall season ("Eco") and allocated initial budget. Marketing to start campaign in August.',
        minutes: 'Full minutes text for Q3 Planning...'
    },
    {
        id: 'meeting2',
        title: 'Technical Team Sync',
        date: new Date('2024-07-01'),
        summary: 'Bernat confirmed new lighting rig installation by end of July. Sound system check is complete. No major issues reported.',
        minutes: 'Full minutes text for Technical Team Sync...'
    }
]

export default function MeetingsClient() {
  const [minutes, setMinutes] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!minutes) {
      toast({
        title: 'Error',
        description: 'Please enter some meeting minutes to summarize.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeMeetingMinutes({ minutes });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Summarization Failed',
        description: 'Could not generate a summary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Generate Meeting Summary</CardTitle>
          <CardDescription>
            Paste your meeting minutes below and let AI extract the key points.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="minutes">Meeting Minutes</Label>
            <Textarea
              id="minutes"
              rows={10}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="Paste your raw meeting notes here..."
            />
          </div>
          <Button onClick={handleSummarize} disabled={isLoading} className="w-full">
            <Bot className="mr-2 h-4 w-4" />
            {isLoading ? 'Summarizing...' : 'Generate Summary'}
          </Button>
          {isLoading && <Skeleton className="h-24 w-full" />}
          {summary && (
            <div className="p-4 bg-secondary/50 rounded-lg border space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" /> AI-Generated Summary
              </h4>
              <p className="text-sm whitespace-pre-wrap">{summary}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Past Meetings</CardTitle>
          <CardDescription>
            Browse and search through previous meeting records.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search meetings..." className="pl-8" />
            </div>
            <Accordion type="single" collapsible className="w-full">
                {pastMeetings.map(meeting => (
                    <AccordionItem value={meeting.id} key={meeting.id}>
                        <AccordionTrigger>
                            <div>
                                <p>{meeting.title}</p>
                                <p className="text-xs text-muted-foreground font-normal">{meeting.date.toLocaleDateString()}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm">{meeting.summary}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
