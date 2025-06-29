
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Eye } from "lucide-react";
import { OnboardingData } from "./OnboardingFlow";

interface ReviewCyclesProps {
  data: OnboardingData;
  onDataChange: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ReviewCycles = ({ data, onDataChange, onNext, onBack }: ReviewCyclesProps) => {
  const [reviewCycle, setReviewCycle] = useState(data.reviewCycle);

  const frequencyOptions = [
    { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' },
    { value: 'biannual', label: 'Bi-annual', description: 'Every 6 months' },
    { value: 'annual', label: 'Annual', description: 'Once a year' }
  ] as const;

  const handleFrequencyChange = (frequency: 'quarterly' | 'biannual' | 'annual') => {
    const updated = { ...reviewCycle, frequency };
    setReviewCycle(updated);
    onDataChange({ reviewCycle: updated });
  };

  const handleDateChange = (startDate: string) => {
    const updated = { ...reviewCycle, startDate };
    setReviewCycle(updated);
    onDataChange({ reviewCycle: updated });
  };

  const handleVisibilityChange = (visibility: boolean) => {
    const updated = { ...reviewCycle, visibility };
    setReviewCycle(updated);
    onDataChange({ reviewCycle: updated });
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Set Up Review Cycles
          </h1>
          <p className="text-slate-600">
            Configure when and how often performance reviews occur
          </p>
        </div>

        <div className="space-y-6">
          {/* Frequency Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Review Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {frequencyOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      reviewCycle.frequency === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleFrequencyChange(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{option.label}</p>
                        <p className="text-sm text-slate-600">{option.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          reviewCycle.frequency === option.value
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start Date */}
          <Card>
            <CardHeader>
              <CardTitle>Review Cycle Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="startDate">When should the first review cycle begin?</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reviewCycle.startDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-slate-600">
                  This will be the start date for your {reviewCycle.frequency} review cycle.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Review Visibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Make reviews visible to employees</p>
                  <p className="text-sm text-slate-600">
                    Employees can see their review status and feedback
                  </p>
                </div>
                <Switch
                  checked={reviewCycle.visibility}
                  onCheckedChange={handleVisibilityChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Review Cycle Summary</h3>
              <div className="space-y-2 text-sm">
                <p className="text-blue-800">
                  <strong>Frequency:</strong> {reviewCycle.frequency.charAt(0).toUpperCase() + reviewCycle.frequency.slice(1)} reviews
                </p>
                <p className="text-blue-800">
                  <strong>Start Date:</strong> {new Date(reviewCycle.startDate).toLocaleDateString()}
                </p>
                <p className="text-blue-800">
                  <strong>Visibility:</strong> {reviewCycle.visibility ? 'Visible to employees' : 'Admin only'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mt-8">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Complete Setup →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCycles;
