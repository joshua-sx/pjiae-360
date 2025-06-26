
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Building2 } from "lucide-react";
import { OnboardingData } from "./OnboardingFlow";

interface WelcomeIdentityProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const WelcomeIdentity = ({ data, updateData, onNext }: WelcomeIdentityProps) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleLogoUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      updateData({ logo: file });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const canProceed = data.organizationName.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Let's start by naming your organization
          </h1>
          <p className="text-slate-600 text-lg">
            Simple. Beautiful. Effortless.
          </p>
        </div>

        <div className="space-y-8">
          {/* Organization Name */}
          <div className="space-y-3">
            <Label htmlFor="orgName" className="text-lg font-medium text-slate-700">
              Organization Name
            </Label>
            <Input
              id="orgName"
              value={data.organizationName}
              onChange={(e) => updateData({ organizationName: e.target.value })}
              placeholder="Enter your organization name"
              className="h-14 text-lg border-2 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <Label className="text-lg font-medium text-slate-700">
              Upload Logo <span className="text-slate-500 font-normal">(optional)</span>
            </Label>
            
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {logoPreview ? (
                <div className="space-y-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-20 h-20 object-contain mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-slate-600">Logo uploaded successfully</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium">Drop your logo here</p>
                    <p className="text-slate-500 text-sm mt-1">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Admin Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-blue-800 text-sm">
              You'll be the admin for this organization. Don't worry, you can invite others later.
            </p>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Setup
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeIdentity;
