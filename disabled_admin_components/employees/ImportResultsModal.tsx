import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ImportError {
  email: string;
  error: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  failed: number;
  errors: ImportError[];
  organizationId?: string;
}

interface ImportResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ImportResult | null;
}

export const ImportResultsModal = ({
  isOpen,
  onClose,
  result
}: ImportResultsModalProps) => {
  if (!result) return null;

  const hasErrors = result.errors.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Import Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-700">
                {result.imported}
              </div>
              <div className="text-sm text-green-600">Successfully Imported</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border">
              <div className="text-2xl font-bold text-red-700">
                {result.failed}
              </div>
              <div className="text-sm text-red-600">Failed Imports</div>
            </div>
          </div>

          {/* Message */}
          <div className="p-4 bg-blue-50 rounded-lg border">
            <div className="text-sm text-blue-800">{result.message}</div>
          </div>

          {/* Errors */}
          {hasErrors && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-800">Import Errors</span>
                <Badge variant="secondary">{result.errors.length}</Badge>
              </div>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                {result.errors.map((error, index) => (
                  <div 
                    key={index}
                    className="p-3 border-b last:border-b-0 bg-red-50"
                  >
                    <div className="font-medium text-red-800">
                      {error.email}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      {error.error}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organization ID for debugging */}
          {result.organizationId && (
            <div className="text-xs text-gray-500 font-mono">
              Organization ID: {result.organizationId}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};