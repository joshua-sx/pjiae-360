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

export function GoalBasicsStep({
  title,
  description,
  onTitleChange,
  onDescriptionChange
}: GoalBasicsStepProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">Goal Details</CardTitle>
            <p className="text-muted-foreground text-sm">Define what needs to be achieved</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Goal Title</label>
          <Input
            placeholder="e.g., Increase sales by 25%"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
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
}