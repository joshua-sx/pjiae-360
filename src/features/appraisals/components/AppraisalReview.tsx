import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { useAutoSave } from '../hooks/useAutoSave';
import { 
  FileText, 
  Target, 
  Star, 
  Signature, 
  Clock,
  User,
  Building2
} from 'lucide-react';
import { AppraisalData, Employee, Goal, Competency } from '../types';

interface AppraisalReviewProps {
  appraisalData: AppraisalData;
  employee: Employee;
  onUpdateGoal: (goalId: string, rating?: number, feedback?: string) => void;
  onUpdateCompetency: (competencyId: string, rating?: number, feedback?: string) => void;
  onSubmit: () => void;
  onSaveDraft?: (data: AppraisalData) => void;
  isLoading?: boolean;
}

export function AppraisalReview({
  appraisalData,
  employee,
  onUpdateGoal,
  onUpdateCompetency,
  onSubmit,
  onSaveDraft,
  isLoading = false
}: AppraisalReviewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { saveStatus, lastSaved, handleManualSave } = useAutoSave(
    appraisalData,
    true,
    onSaveDraft
  );

  // Calculate completion percentage
  const totalItems = appraisalData.goals.length + appraisalData.competencies.length;
  const completedItems = [
    ...appraisalData.goals.filter(g => g.rating !== undefined),
    ...appraisalData.competencies.filter(c => c.rating !== undefined)
  ].length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const canSubmit = completionPercentage === 100;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Appraisal Review</h2>
            <p className="text-muted-foreground">
              Review and complete the performance evaluation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SaveStatusIndicator 
              status={saveStatus} 
              lastSaved={lastSaved}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Completion Progress</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{employee.name}</p>
                <p className="text-xs text-muted-foreground">Employee</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{employee.department}</p>
                <p className="text-xs text-muted-foreground">Department</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{employee.position}</p>
                <p className="text-xs text-muted-foreground">Position</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{appraisalData.status}</p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">
            Goals ({appraisalData.goals.filter(g => g.rating !== undefined).length}/{appraisalData.goals.length})
          </TabsTrigger>
          <TabsTrigger value="competencies">
            Competencies ({appraisalData.competencies.filter(c => c.rating !== undefined).length}/{appraisalData.competencies.length})
          </TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewSection 
            appraisalData={appraisalData}
            completionPercentage={completionPercentage}
            employee={employee}
          />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <GoalsSection 
            goals={appraisalData.goals}
            onUpdateGoal={onUpdateGoal}
          />
        </TabsContent>

        <TabsContent value="competencies" className="space-y-4">
          <CompetenciesSection 
            competencies={appraisalData.competencies}
            onUpdateCompetency={onUpdateCompetency}
          />
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <SignaturesSection 
            signatures={appraisalData.signatures}
            canSubmit={canSubmit}
            onSubmit={onSubmit}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Overview Section Component
function OverviewSection({ appraisalData, completionPercentage, employee }: {
  appraisalData: AppraisalData;
  completionPercentage: number;
  employee: Employee;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goals Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appraisalData.goals.map(goal => (
              <div key={goal.id} className="flex justify-between items-center">
                <span className="text-sm">{goal.title}</span>
                <div className="flex items-center gap-2">
                  {goal.rating ? (
                    <span className="text-sm font-medium bg-primary/10 px-2 py-1 rounded">
                      {goal.rating}/5
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Competencies Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appraisalData.competencies.map(competency => (
              <div key={competency.id} className="flex justify-between items-center">
                <span className="text-sm">{competency.title}</span>
                <div className="flex items-center gap-2">
                  {competency.rating ? (
                    <span className="text-sm font-medium bg-primary/10 px-2 py-1 rounded">
                      {competency.rating}/5
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Goals Section Component
function GoalsSection({ goals, onUpdateGoal }: {
  goals: Goal[];
  onUpdateGoal: (goalId: string, rating?: number, feedback?: string) => void;
}) {
  return (
    <div className="space-y-4">
      {goals.map(goal => (
        <Card key={goal.id}>
          <CardHeader>
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating (1-5)</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <Button
                      key={rating}
                      variant={goal.rating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => onUpdateGoal(goal.id, rating, goal.feedback)}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
              {goal.feedback && (
                <div>
                  <label className="text-sm font-medium">Feedback</label>
                  <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                    {goal.feedback}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Competencies Section Component
function CompetenciesSection({ competencies, onUpdateCompetency }: {
  competencies: Competency[];
  onUpdateCompetency: (competencyId: string, rating?: number, feedback?: string) => void;
}) {
  return (
    <div className="space-y-4">
      {competencies.map(competency => (
        <Card key={competency.id}>
          <CardHeader>
            <CardTitle className="text-lg">{competency.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{competency.description}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Rating (1-5)</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <Button
                      key={rating}
                      variant={competency.rating === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => onUpdateCompetency(competency.id, rating, competency.feedback)}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
              {competency.feedback && (
                <div>
                  <label className="text-sm font-medium">Feedback</label>
                  <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded">
                    {competency.feedback}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Signatures Section Component
function SignaturesSection({ signatures, canSubmit, onSubmit, isLoading }: {
  signatures: AppraisalData['signatures'];
  canSubmit: boolean;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signature className="h-5 w-5" />
          Digital Signatures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <SignatureStatus 
            label="Appraiser Signature"
            signature={signatures.appraiser}
            role="appraiser"
          />
          <SignatureStatus 
            label="Second Appraiser Signature"
            signature={signatures.secondAppraiser}
            role="second_appraiser"
          />
          <SignatureStatus 
            label="Employee Signature"
            signature={signatures.employee}
            role="employee"
          />
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Submitting..." : "Submit Complete Appraisal"}
          </Button>
          {!canSubmit && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Complete all ratings before submitting
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SignatureStatus({ label, signature, role }: {
  label: string;
  signature?: string;
  role: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {signature ? (
          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            Signed
          </span>
        ) : (
          <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
            Pending
          </span>
        )}
      </div>
    </div>
  );
}