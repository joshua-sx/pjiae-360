import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DigitalSignatureModal from './DigitalSignatureModal';
import { CheckCircle, FileText, Signature } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppraisalData, Employee } from '../types';

interface AcknowledgmentFlowProps {
  appraisalData: AppraisalData;
  employee: Employee;
  onComplete: () => void;
}

export function AcknowledgmentFlow({ appraisalData, employee, onComplete }: AcknowledgmentFlowProps) {
  const [showSigningModal, setShowSigningModal] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAcknowledgment = async (signatureDataUrl: string) => {
    setIsSubmitting(true);
    
    try {
      // Record acknowledgment in database
      const { error } = await supabase
        .from('appraisal_acknowledgments')
        .insert({
          appraisal_id: appraisalData.employeeId, // This should be the actual appraisal ID
          employee_id: employee.id,
          acknowledgment_signature: signatureDataUrl,
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      toast({
        title: "Acknowledgment Complete",
        description: "You have successfully acknowledged your appraisal.",
      });

      setShowSigningModal(false);
      onComplete();
    } catch (error) {
      console.error('Error submitting acknowledgment:', error);
      toast({
        title: "Error",
        description: "Failed to submit acknowledgment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Appraisal Acknowledgment</h2>
        <p className="text-muted-foreground">
          Please review your completed appraisal and acknowledge receipt
        </p>
      </div>

      {/* Appraisal Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Appraisal Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Employee</p>
              <p className="text-sm text-muted-foreground">{employee.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-muted-foreground">{employee.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Position</p>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Overall Rating</p>
              <p className="text-sm text-muted-foreground">
                {appraisalData.overallRating ? `${appraisalData.overallRating}/5` : 'Not rated'}
              </p>
            </div>
          </div>

          {/* Goals Summary */}
          <div>
            <h4 className="font-medium mb-2">Goals Evaluated</h4>
            <div className="space-y-2">
              {appraisalData.goals.map((goal, index) => (
                <div key={goal.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{goal.title}</span>
                  <span className="text-sm font-medium">
                    {goal.rating ? `${goal.rating}/5` : 'Not rated'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Competencies Summary */}
          <div>
            <h4 className="font-medium mb-2">Competencies Evaluated</h4>
            <div className="space-y-2">
              {appraisalData.competencies.map((competency, index) => (
                <div key={competency.id} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="text-sm">{competency.title}</span>
                  <span className="text-sm font-medium">
                    {competency.rating ? `${competency.rating}/5` : 'Not rated'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acknowledgment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Acknowledgment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="acknowledge" 
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <label 
              htmlFor="acknowledge" 
              className="text-sm leading-relaxed cursor-pointer"
            >
              I acknowledge that I have received and reviewed my performance appraisal. 
              I understand that this acknowledgment does not necessarily indicate agreement 
              with the content, but confirms that I have been provided with a copy of my 
              appraisal and have had the opportunity to discuss it with my supervisor.
            </label>
          </div>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: acknowledged ? 1 : 0, 
              height: acknowledged ? 'auto' : 0 
            }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={() => setShowSigningModal(true)}
              disabled={!acknowledged || isSubmitting}
              className="w-full"
            >
              <Signature className="h-4 w-4 mr-2" />
              Sign Acknowledgment
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Signing Modal */}
      <DigitalSignatureModal
        open={showSigningModal}
        onClose={() => setShowSigningModal(false)}
        onSuccess={handleAcknowledgment}
        appraisalId={appraisalData.employeeId}
      />
    </div>
  );
}