import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, Mail } from 'lucide-react';
import { EmployeePreviewTable } from '../EmployeePreviewTable';
import { EmployeeData } from './types';

interface ReviewSectionProps {
  employees: EmployeeData[];
  columnMapping: Record<string, string>;
  onBack: () => void;
  onNext: () => void;
}

export function ReviewSection({ employees, columnMapping, onBack, onNext }: ReviewSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Preview & Import
          </CardTitle>
          <CardDescription>
            Review the employee data before importing. Auth users will be created and invitation emails sent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Each employee will receive an invitation email with instructions to access their account.
              </AlertDescription>
            </Alert>

            <EmployeePreviewTable employees={employees} columnMapping={columnMapping} />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={onNext} disabled={employees.length === 0}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Assign Roles
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

