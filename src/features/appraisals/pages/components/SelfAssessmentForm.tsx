import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { PageHeader } from '@/components/ui/page-header';
import { useDemoAppraisalStore, type Appraisal } from '@/stores/demoAppraisalStore';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  goals: z.array(z.object({
    id: z.string(),
    selfRating: z.number().min(1).max(5),
    selfFeedback: z.string().min(1, 'Feedback is required'),
  })),
  competencies: z.array(z.object({
    id: z.string(),
    selfRating: z.number().min(1).max(5),
    selfFeedback: z.string().min(1, 'Feedback is required'),
  })),
  overallSelfRating: z.number().min(1).max(5),
  employeeComments: z.string().min(1, 'Overall comments are required'),
});

type FormData = z.infer<typeof formSchema>;

interface SelfAssessmentFormProps {
  appraisal: Appraisal;
  onBack: () => void;
}

export function SelfAssessmentForm({ appraisal, onBack }: SelfAssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitSelfAssessment } = useDemoAppraisalStore();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: appraisal.goals.map(goal => ({
        id: goal.id,
        selfRating: goal.selfRating || 3,
        selfFeedback: goal.selfFeedback || '',
      })),
      competencies: appraisal.competencies.map(comp => ({
        id: comp.id,
        selfRating: comp.selfRating || 3,
        selfFeedback: comp.selfFeedback || '',
      })),
      overallSelfRating: appraisal.overallSelfRating || 3,
      employeeComments: appraisal.employeeComments || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const updatedGoals = appraisal.goals.map(goal => {
        const formGoal = data.goals.find(g => g.id === goal.id);
        return {
          ...goal,
          selfRating: formGoal?.selfRating,
          selfFeedback: formGoal?.selfFeedback,
        };
      });

      const updatedCompetencies = appraisal.competencies.map(comp => {
        const formComp = data.competencies.find(c => c.id === comp.id);
        return {
          ...comp,
          selfRating: formComp?.selfRating,
          selfFeedback: formComp?.selfFeedback,
        };
      });

      await submitSelfAssessment(appraisal.id, {
        goals: updatedGoals,
        competencies: updatedCompetencies,
        overallSelfRating: data.overallSelfRating,
        employeeComments: data.employeeComments,
      });

      toast({
        title: 'Success',
        description: 'Your self-assessment has been submitted successfully.',
      });

      onBack();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit self-assessment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['', 'Below Expectations', 'Partially Meets', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
    return labels[rating] || '';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Self Assessment"
        description="Evaluate your performance and provide feedback"
      >
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Appraisals
        </Button>
      </PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Goals Section */}
          <Card>
            <CardHeader>
              <CardTitle>Goals Assessment</CardTitle>
              <CardDescription>
                Rate your performance on each goal and provide detailed feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {appraisal.goals.map((goal, index) => (
                <div key={goal.id} className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>

                  <FormField
                    control={form.control}
                    name={`goals.${index}.selfRating`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Self Rating: {getRatingLabel(field.value)}</FormLabel>
                        <FormControl>
                          <div className="px-2">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>1</span>
                              <span>2</span>
                              <span>3</span>
                              <span>4</span>
                              <span>5</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`goals.${index}.selfFeedback`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your achievements, challenges, and lessons learned..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Competencies Section */}
          <Card>
            <CardHeader>
              <CardTitle>Competencies Assessment</CardTitle>
              <CardDescription>
                Evaluate your competency levels and provide examples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {appraisal.competencies.map((competency, index) => (
                <div key={competency.id} className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{competency.name}</h4>
                    <p className="text-sm text-muted-foreground">{competency.description}</p>
                  </div>

                  <FormField
                    control={form.control}
                    name={`competencies.${index}.selfRating`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Self Rating: {getRatingLabel(field.value)}</FormLabel>
                        <FormControl>
                          <div className="px-2">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>1</span>
                              <span>2</span>
                              <span>3</span>
                              <span>4</span>
                              <span>5</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`competencies.${index}.selfFeedback`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide specific examples and areas for development..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Overall Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Self Assessment</CardTitle>
              <CardDescription>
                Provide your overall performance rating and summary comments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="overallSelfRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Self Rating: {getRatingLabel(field.value)}</FormLabel>
                    <FormControl>
                      <div className="px-2">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize your performance, key achievements, and development goals..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Save Draft & Exit
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Self Assessment'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}