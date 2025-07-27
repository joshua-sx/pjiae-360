
import { Eye } from "lucide-react";

export default function PreviewHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Eye className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Preview & Confirm
      </h1>
      <p className="text-lg text-slate-600">
        Review your data before importing
      </p>
    </div>
  );
}
