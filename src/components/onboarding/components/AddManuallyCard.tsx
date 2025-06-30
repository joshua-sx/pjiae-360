
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface AddManuallyCardProps {
  uploadMethod: 'upload' | 'manual' | null;
  onMethodChange: () => void;
}

export default function AddManuallyCard({ uploadMethod, onMethodChange }: AddManuallyCardProps) {
  const isSelected = uploadMethod === 'manual';
  
  return (
    <Card className={`cursor-pointer transition-all border-2 ${
      isSelected 
        ? 'border-slate-900 bg-slate-50' 
        : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Add Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary/50 transition-colors"
          onClick={onMethodChange}
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-slate-700 font-medium">Add team members manually</p>
              <p className="text-slate-500 text-sm">Enter details one by one</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
