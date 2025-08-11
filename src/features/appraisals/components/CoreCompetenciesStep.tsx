
"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, Info, CheckCircle, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export interface Competency {
  id: string;
  title: string;
  description: string;
  rating?: number;
  feedback?: string;
}

export interface CoreCompetenciesStepProps {
  competencies: Competency[];
  onCompetencyUpdate: (competencyId: string, rating?: number, feedback?: string) => void;
  canProceed: boolean;
}

const ratingLabels = [
  { value: 1, label: "Unsatisfactory", description: "Rarely demonstrates this competency" },
  { value: 2, label: "Below Expectations", description: "Sometimes demonstrates this competency" },
  { value: 3, label: "Meets Expectations", description: "Consistently demonstrates this competency" },
  { value: 4, label: "Exceeds Expectations", description: "Frequently exceeds in this competency" },
  { value: 5, label: "Exceptional", description: "Consistently exceptional in this competency" }
];

export default function CoreCompetenciesStep({
  competencies,
  onCompetencyUpdate,
  canProceed
}: CoreCompetenciesStepProps) {
  const [expandedCompetency, setExpandedCompetency] = useState<string | null>(null);
  
  const completedCompetencies = competencies.filter(competency => competency.rating !== undefined).length;
  const totalCompetencies = competencies.length;

  const handleRatingChange = (competencyId: string, rating: number) => {
    const competency = competencies.find(c => c.id === competencyId);
    onCompetencyUpdate(competencyId, rating, competency?.feedback);
  };

  const handleFeedbackChange = (competencyId: string, feedback: string) => {
    const competency = competencies.find(c => c.id === competencyId);
    onCompetencyUpdate(competencyId, competency?.rating, feedback);
  };

  if (competencies.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Competencies Found</h3>
        <p className="text-muted-foreground">
          No core competencies have been defined for this role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Grade Core Competencies</h2>
          <p className="text-muted-foreground mt-1">
            Evaluate the employee's demonstration of key behavioral competencies.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={canProceed ? "default" : "secondary"} className="flex items-center gap-2">
            {canProceed && <CheckCircle className="h-3 w-3" />}
            {completedCompetencies} of {totalCompetencies} completed
          </Badge>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-sm">
                All competencies must be rated before proceeding. 
                Consider specific examples when providing feedback.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      <div className="hidden md:block">
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-4">
            {competencies.map((competency, index) => (
              <motion.div 
                key={competency.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "h-full transition-all duration-200",
                  competency.rating ? "ring-2 ring-green-500/20 bg-green-50/50" : "hover:shadow-md"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight">
                          {competency.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Competency {index + 1}
                          </Badge>
                          {competency.rating && (
                            <Badge variant="default" className="text-xs">
                              Rated {competency.rating}/5
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {competency.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Rating *</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {ratingLabels.map(rating => (
                          <Tooltip key={rating.value}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={competency.rating === rating.value ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-12 flex flex-col items-center justify-center p-2 transition-all",
                                  competency.rating === rating.value && "ring-2 ring-primary/20"
                                )}
                                onClick={() => handleRatingChange(competency.id, rating.value)}
                                aria-label={`Rate ${rating.value} out of 5: ${rating.label}`}
                              >
                                <Star className={cn(
                                  "h-4 w-4",
                                  competency.rating === rating.value ? "fill-current" : ""
                                )} />
                                <span className="text-xs font-medium">{rating.value}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <div className="text-center">
                                <p className="font-medium">{rating.label}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {rating.description}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Feedback (Optional)</h4>
                      <Textarea
                        placeholder="Provide specific examples of how this competency was demonstrated..."
                        value={competency.feedback || ""}
                        sanitize
                        onChange={(e) => handleFeedbackChange(competency.id, e.target.value)}
                        className="min-h-[80px] resize-none"
                        aria-label={`Feedback for ${competency.title}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="md:hidden">
        <Accordion type="single" collapsible value={expandedCompetency || undefined} onValueChange={setExpandedCompetency}>
          {competencies.map((competency, index) => (
            <AccordionItem key={competency.id} value={competency.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <span className="text-left font-medium">{competency.title}</span>
                  </div>
                  {competency.rating && (
                    <Badge variant="default" className="text-xs ml-2">
                      {competency.rating}/5
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              
              <AccordionContent>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 pt-4"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {competency.description}
                  </p>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Rating *</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {ratingLabels.map(rating => (
                        <Tooltip key={rating.value}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={competency.rating === rating.value ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "h-12 flex flex-col items-center justify-center p-2",
                                competency.rating === rating.value && "ring-2 ring-primary/20"
                              )}
                              onClick={() => handleRatingChange(competency.id, rating.value)}
                            >
                              <Star className={cn(
                                "h-3 w-3",
                                competency.rating === rating.value ? "fill-current" : ""
                              )} />
                              <span className="text-xs">{rating.value}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-medium">{rating.label}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {rating.description}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Feedback (Optional)</h4>
                    <Textarea
                      placeholder="Provide specific examples of how this competency was demonstrated..."
                      value={competency.feedback || ""}
                      sanitize
                      onChange={(e) => handleFeedbackChange(competency.id, e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Progress Summary</h4>
            <p className="text-sm text-muted-foreground">
              {completedCompetencies === totalCompetencies 
                ? "All competencies have been rated. You can proceed to the next step." 
                : `${totalCompetencies - completedCompetencies} competenc${totalCompetencies - completedCompetencies !== 1 ? 'ies' : 'y'} remaining to complete.`
              }
            </p>
          </div>
          {canProceed && <CheckCircle className="h-6 w-6 text-green-500" />}
        </div>
      </div>
    </div>
  );
}
