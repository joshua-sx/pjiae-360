
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, AlertCircle, ArrowRight } from "lucide-react";
import { OnboardingData } from "./OnboardingTypes";

interface ImportSummaryProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onSkipTo?: (stepIndex: number) => void;
}

const ImportSummary = ({ data, onNext, onBack, onSkipTo }: ImportSummaryProps) => {
  const { importStats } = data;

  const handleAssignRoles = () => {
    onNext();
  };

  const handleSkipToStructure = () => {
    if (onSkipTo) {
      onSkipTo(6);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full text-center">
          {/* Success Header */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Import Complete!
            </h1>
            <p className="text-xl text-slate-600">
              Your team members have been successfully imported
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-700">{importStats.successful}</p>
                <p className="text-sm text-green-600">Successfully imported</p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-700">{importStats.total}</p>
                <p className="text-sm text-slate-600">Total processed</p>
              </CardContent>
            </Card>

            {importStats.errors > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-orange-700">{importStats.errors}</p>
                  <p className="text-sm text-orange-600">Skipped (errors)</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Next Steps */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-slate-800">Assign roles to your team members</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-slate-800">Structure your organization</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-slate-800">Set up review cycles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleAssignRoles}
              className="w-full h-14 text-lg font-semibold"
            >
              Assign Roles <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={handleSkipToStructure}
              variant="outline"
              className="w-full h-12"
            >
              Skip Role Assignment for Now
            </Button>
          </div>

          {/* Tip */}
          <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-600">
              💡 <strong>Tip:</strong> You can always add more team members or modify roles later from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button onClick={onBack} variant="outline" className="flex-1">
            ← Back
          </Button>
          <Button onClick={handleAssignRoles} className="flex-1">
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImportSummary;
