
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, AlertCircle, ArrowRight } from "lucide-react";
import { OnboardingData } from "./OnboardingFlow";

interface ImportSummaryProps {
  data: OnboardingData;
  onNext: () => void;
  onSkipTo?: (stepIndex: number) => void;
}

const ImportSummary = ({ data, onNext, onSkipTo }: ImportSummaryProps) => {
  const { importStats } = data;

  const handleAssignRoles = () => {
    onNext(); // Goes to assign roles step
  };

  const handleSkipToStructure = () => {
    if (onSkipTo) {
      onSkipTo(6); // Skip to structure step (index 6)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
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
          
          <Card>
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

        {/* Success Message */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">1</span>
                </div>
                <p className="text-blue-800">Assign roles to your team members</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">2</span>
                </div>
                <p className="text-blue-800">Structure your organization</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-700">3</span>
                </div>
                <p className="text-blue-800">Set up review cycles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleAssignRoles}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
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

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-slate-50 rounded-xl">
          <p className="text-sm text-slate-600">
            💡 <strong>Tip:</strong> You can always add more team members or modify roles later from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportSummary;
