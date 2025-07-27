import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  division: string;
}

interface AddManuallyCardProps {
  uploadMethod: 'upload' | 'paste' | 'manual' | null;
  onMethodChange: () => void;
  manualEmployees: EmployeeData[];
}

export function AddManuallyCard({ uploadMethod, onMethodChange, manualEmployees }: AddManuallyCardProps) {
  const isSelected = uploadMethod === 'manual';
  const hasEmployees = manualEmployees.length > 0;
  const isDisabled = uploadMethod === 'upload' || uploadMethod === 'paste';
  
  return (
    <Card className={`cursor-pointer transition-all border-2 ${
      isDisabled
        ? 'border-border/50 bg-muted/30 opacity-75 cursor-not-allowed'
        : isSelected 
        ? 'border-primary bg-primary/5' 
        : hasEmployees
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-border/50 hover:bg-accent/50'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className={`w-5 h-5 ${isDisabled ? 'text-muted-foreground' : 'text-primary'}`} />
            <span className={isDisabled ? 'text-muted-foreground' : ''}>
              Add Manually
            </span>
          </div>
          <AnimatePresence>
            {hasEmployees && !isDisabled && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                  {manualEmployees.length} added
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isDisabled && (
          <div className="text-center py-6">
            <div className="text-sm text-muted-foreground">
              Data imported. Manual entry is disabled.
            </div>
          </div>
        )}
        
        {!isDisabled && (
          <AnimatePresence mode="wait">
            {hasEmployees ? (
              <motion.div
                key="populated"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Employee Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Added Employees:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {manualEmployees.slice(0, 4).map((employee, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-card rounded-md p-2 border">
                        <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block truncate">
                            {employee.firstName} {employee.lastName}
                          </span>
                          <span className="text-muted-foreground text-xs truncate block">
                            {employee.email} • {employee.jobTitle}
                          </span>
                        </div>
                      </div>
                    ))}
                    {manualEmployees.length > 4 && (
                      <div className="text-xs text-muted-foreground text-center py-1 font-medium">
                        +{manualEmployees.length - 4} more employees
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Add More Button */}
                <button
                  onClick={onMethodChange}
                  className="w-full border-2 border-dashed border-primary/30 rounded-lg p-3 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                >
                  <div className="text-sm font-medium text-primary">Add More Employees</div>
                  <div className="text-xs text-primary/70">Click to add additional people</div>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border-2 border-dashed border-border rounded-xl h-64 p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 relative group flex items-center justify-center"
                onClick={onMethodChange}
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-foreground font-semibold text-lg mb-1">
                      Add employees manually
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Enter details one by one
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}