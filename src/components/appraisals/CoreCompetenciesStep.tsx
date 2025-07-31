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

const ratingLabels = [{
  value: 1,
  label: "Unsatisfactory",
  description: "Rarely demonstrates this competency"
}, {
  value: 2,
  label: "Below Expectations",
  description: "Sometimes demonstrates this competency"
}, {
  value: 3,
  label: "Meets Expectations",
  description: "Consistently demonstrates this competency"
}, {
  value: 4,
  label: "Exceeds Expectations",
  description: "Frequently exceeds in this competency"
}, {
  value: 5,
  label: "Exceptional",
  description: "Consistently exceptional in this competency"
}] as any[];

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
      <div className="flex flex-col items-center justify-center text-center py-12 bg-muted/50 rounded-lg">
        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h3 className="text-xl font-semibold mb-2">No Competencies Found</h3>
        <p className="text-muted-foreground max-w-md">
          No core competencies have been defined for this role. Please contact
          HR to set up the required competencies for this appraisal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Grade Core Competencies
          </h2>
          <p className="text-muted-foreground mt-1">
            Evaluate the employee's demonstration of key behavioral
            competencies.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Badge variant={canProceed ? "default" : "secondary"} className="flex items-center gap-2 text-sm py-1 px-3">
            {canProceed && <CheckCircle className="h-4 w-4" />}
            {completedCompetencies} of {totalCompetencies} completed
          </Badge>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Info className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <p className="text-sm">
                All competencies must be rated before proceeding. Consider
                specific examples when providing feedback.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator />

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <ScrollArea className="h-[500px] -mr-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pr-4">
            {competencies.map((competency, index) => (
              <motion.div 
                key={competency.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "h-full transition-all duration-300 ease-in-out",
                  competency.rating 
                    ? "border-green-500/50 bg-green-50/30" 
                    : "hover:border-primary/30"
                )}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold leading-tight">
                          {competency.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs font-medium">
                            Competency {index + 1}
                          </Badge>
                          {competency.rating && (
                            <Badge variant="default" className="text-xs font-semibold">
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

                    {/* Rating Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Rating <span className="text-destructive">*</span>
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        {ratingLabels.map(rating => (
                          <Tooltip key={rating.value}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={competency.rating === rating.value ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-14 flex flex-col items-center justify-center p-2 transition-all transform hover:scale-105",
                                  competency.rating === rating.value && "ring-2 ring-primary"
                                )}
                                onClick={() => handleRatingChange(competency.id, rating.value)}
                                aria-label={`Rate ${rating.value} out of 5: ${rating.label}`}
                              >
                                <Star className={cn(
                                  "h-5 w-5 mb-1",
                                  competency.rating === rating.value 
                                    ? "fill-current text-primary-foreground" 
                                    : "text-muted-foreground"
                                )} />
                                <span className="text-xs font-bold">
                                  {rating.value}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <div className="text-center">
                                <p className="font-semibold">{rating.label}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {rating.description}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Section */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Feedback (Optional)
                      </h4>
                      <Textarea
                        placeholder="Provide specific examples of how this competency was demonstrated..."
                        value={competency.feedback || ""}
                        onChange={e => handleFeedbackChange(competency.id, e.target.value)}
                        className="min-h-[100px] resize-y"
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

      {/* Mobile Layout */}
      <div className="md:hidden">
        <Accordion type="single" collapsible value={expandedCompetency || undefined} onValueChange={setExpandedCompetency} className="space-y-4">
          {competencies.map((competency, index) => (
            <AccordionItem key={competency.id} value={competency.id} className="border rounded-lg">
              <AccordionTrigger className="hover:no-underline p-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant="outline" className="text-sm px-2">
                      {index + 1}
                    </Badge>
                    <span className="font-semibold">{competency.title}</span>
                  </div>
                  {competency.rating && (
                    <Badge variant="default" className="text-xs font-semibold ml-2">
                      {competency.rating}/5
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-4 pt-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 pt-4 border-t"
                >
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {competency.description}
                  </p>

                  {/* Rating Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      Rating <span className="text-destructive">*</span>
                    </h4>
                    <div className="grid grid-cols-5 gap-2">
                      {ratingLabels.map(rating => (
                        <Tooltip key={rating.value}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={competency.rating === rating.value ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "h-14 flex flex-col items-center justify-center p-2",
                                competency.rating === rating.value && "ring-2 ring-primary"
                              )}
                              onClick={() => handleRatingChange(competency.id, rating.value)}
                            >
                              <Star className={cn(
                                "h-4 w-4 mb-1",
                                competency.rating === rating.value ? "fill-current" : ""
                              )} />
                              <span className="text-xs font-bold">
                                {rating.value}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-center">
                              <p className="font-semibold">{rating.label}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">
                      Feedback (Optional)
                    </h4>
                    <Textarea
                      placeholder="Provide specific examples..."
                      value={competency.feedback || ""}
                      onChange={e => handleFeedbackChange(competency.id, e.target.value)}
                      className="min-h-[100px] resize-y"
                    />
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Progress Summary */}
      <div className="mt-8 p-6 bg-slate-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Progress Summary</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCompetencies === totalCompetencies 
                ? "All competencies have been rated. You can proceed." 
                : `${totalCompetencies - completedCompetencies} competenc${totalCompetencies - completedCompetencies !== 1 ? "ies" : "y"} remaining to complete.`
              }
            </p>
          </div>
          {canProceed && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <CheckCircle className="h-8 w-8 text-green-500" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}