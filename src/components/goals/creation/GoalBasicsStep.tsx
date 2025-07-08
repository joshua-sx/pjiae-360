import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target } from 'lucide-react';

interface GoalBasicsStepProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export const GoalBasicsStep: React.FC<GoalBasicsStepProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">What's your goal?</CardTitle>
        <p className="text-muted-foreground">Let's start with the basics</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Goal Title</label>
          <Input
            placeholder="e.g., Increase sales by 25%"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-base"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea
            placeholder="Describe what needs to be achieved and why it matters..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};