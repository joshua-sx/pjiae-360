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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { useDemoAppraisalStore, type Appraisal } from '@/stores/demoAppraisalStore';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  goals: z.array(z.object({
    id: z.string(),
    managerRating: z.number().min(1).max(5),
    managerFeedback: z.string().min(1, 'Manager feedback is required'),
  })),
  competencies: z.array(z.object({
    id: z.string(),
    managerRating: z.number().min(1).max(5),
    managerFeedback: z.string().min(1, 'Manager feedback is required'),
  })),
  overallManagerRating: z.number().min(1).max(5),
  managerComments: z.string().min(1, 'Overall manager comments are required'),
  developmentPlan: z.string().min(1, 'Development plan is required'),
});

type FormData = z.infer<typeof formSchema>;

interface AppraisalReviewFormProps {
  appraisal: Appraisal;
  onBack: () => void;
}

export function AppraisalReviewForm({ appraisal, onBack }: AppraisalReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitManagerReview } = useDemoAppraisalStore();
  const { toast } = useToast();

  const isReadOnly = appraisal.status === 'complete';

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: appraisal.goals.map(goal => ({
        id: goal.id,
        managerRating: goal.managerRating || 3,
        managerFeedback: goal.managerFeedback || '',
      })),
      competencies: appraisal.competencies.map(comp => ({
        id: comp.id,
        managerRating: comp.managerRating || 3,
        managerFeedback: comp.managerFeedback || '',
      })),
      overallManagerRating: appraisal.overallManagerRating || 3,
      managerComments: appraisal.managerComments || '',
      developmentPlan: appraisal.developmentPlan || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isReadOnly) return;

    setIsSubmitting(true);
    try {
      const updatedGoals = appraisal.goals.map(goal => {
        const formGoal = data.goals.find(g => g.id === goal.id);
        return {
          ...goal,
          managerRating: formGoal?.managerRating,
          managerFeedback: formGoal?.managerFeedback,
        };
      });

      const updatedCompetencies = appraisal.competencies.map(comp => {
        const formComp = data.competencies.find(c => c.id === comp.id);
        return {
          ...comp,
          managerRating: formComp?.managerRating,
          managerFeedback: formComp?.managerFeedback,
        };
      });

      await submitManagerReview(appraisal.id, {
        goals: updatedGoals,
        competencies: updatedCompetencies,
        overallManagerRating: data.overallManagerRating,
        managerComments: data.managerComments,
        developmentPlan: data.developmentPlan,
      });

      toast({
        title: 'Success',
        description: 'Manager review has been submitted successfully.',
      });

      onBack();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit manager review.',
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
        title={`Review: ${appraisal.employeeName}`}
        description={isReadOnly ? "View completed appraisal review" : "Provide your assessment and feedback"}
      >
        <div className="flex items-center gap-4">
          {isReadOnly && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Complete
            </Badge>
          )}
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team Reviews
          </Button>
        </div>
      </PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Goals Section */}
          <Card>
            <CardHeader>
              <CardTitle>Goals Review</CardTitle>
              <CardDescription>
                Review employee's self-assessment and provide your evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {appraisal.goals.map((goal, index) => (
                <div key={goal.id} className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>

                  {/* Employee's Self Assessment */}
                  <div className="bg-muted/50 p-3 rounded">
                    <h5 className="font-medium text-sm mb-2">Employee's Self Assessment:</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rating: </span>
                        <span className="font-medium">{goal.selfRating || 'N/A'}/5</span>
                      </div>
                    </div>
                    {goal.selfFeedback && (
                      <p className="text-sm mt-2">{goal.selfFeedback}</p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`goals.${index}.managerRating`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Rating: {getRatingLabel(field.value)}</FormLabel>
                        <FormControl>
                          <div className="px-2">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              disabled={isReadOnly}
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
                    name={`goals.${index}.managerFeedback`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide specific feedback on performance, achievements, and areas for improvement..."
                            className="min-h-[100px]"
                            readOnly={isReadOnly}
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
              <CardTitle>Competencies Review</CardTitle>
              <CardDescription>
                Evaluate employee's competency demonstration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {appraisal.competencies.map((competency, index) => (
                <div key={competency.id} className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{competency.name}</h4>
                    <p className="text-sm text-muted-foreground">{competency.description}</p>
                  </div>

                  {/* Employee's Self Assessment */}
                  <div className="bg-muted/50 p-3 rounded">
                    <h5 className="font-medium text-sm mb-2">Employee's Self Assessment:</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Rating: </span>
                        <span className="font-medium">{competency.selfRating || 'N/A'}/5</span>
                      </div>
                    </div>
                    {competency.selfFeedback && (
                      <p className="text-sm mt-2">{competency.selfFeedback}</p>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`competencies.${index}.managerRating`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Rating: {getRatingLabel(field.value)}</FormLabel>
                        <FormControl>
                          <div className="px-2">
                            <Slider
                              min={1}
                              max={5}
                              step={1}
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              disabled={isReadOnly}
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
                    name={`competencies.${index}.managerFeedback`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide specific examples and development recommendations..."
                            className="min-h-[100px]"
                            readOnly={isReadOnly}
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
              <CardTitle>Overall Manager Assessment</CardTitle>
              <CardDescription>
                Provide overall rating, summary feedback, and development plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employee's Overall Self Rating */}
              <div className="bg-muted/50 p-3 rounded">
                <h5 className="font-medium text-sm mb-2">Employee's Overall Self Rating:</h5>
                <p className="font-medium">{appraisal.overallSelfRating || 'N/A'}/5</p>
                {appraisal.employeeComments && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Employee Comments:</p>
                    <p className="text-sm text-muted-foreground">{appraisal.employeeComments}</p>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="overallManagerRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Overall Rating: {getRatingLabel(field.value)}</FormLabel>
                    <FormControl>
                      <div className="px-2">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          disabled={isReadOnly}
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
                name="managerComments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Manager Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Summarize performance, key achievements, areas for improvement..."
                        className="min-h-[120px]"
                        readOnly={isReadOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="developmentPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Development Plan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Outline specific development goals, training recommendations, and next steps..."
                        className="min-h-[120px]"
                        readOnly={isReadOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {!isReadOnly && (
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Save Draft & Exit
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Manager Review'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}