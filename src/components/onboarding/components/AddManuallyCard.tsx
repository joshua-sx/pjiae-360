
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ManualUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AddManuallyCardProps {
  uploadMethod: 'upload' | 'manual' | null;
  onMethodChange: () => void;
  manualUsers: ManualUser[];
}

export default function AddManuallyCard({ uploadMethod, onMethodChange, manualUsers }: AddManuallyCardProps) {
  const isSelected = uploadMethod === 'manual';
  const hasUsers = manualUsers.length > 0;
  const isDisabled = uploadMethod === 'upload'; // Disabled when CSV is uploaded
  
  return (
    <Card className={`cursor-pointer transition-all border-2 ${
      isDisabled
        ? 'border-border/50 bg-muted/30 opacity-75 cursor-not-allowed'
        : isSelected 
        ? 'border-primary bg-primary/5' 
        : hasUsers
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-primary/50 hover:bg-accent/50'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDisabled ? 'bg-muted' : 'bg-primary/10'}`}>
              <Users className={`w-5 h-5 ${isDisabled ? 'text-muted-foreground' : 'text-primary'}`} />
            </div>
            <span className={`text-lg font-semibold ${isDisabled ? 'text-muted-foreground' : 'text-foreground'}`}>
              Add Manually
            </span>
          </div>
          <AnimatePresence>
            {hasUsers && !isDisabled && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Badge variant="secondary" className="bg-gray-100 text-black border-gray-300 font-semibold">
                  {manualUsers.length} added
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
              CSV file uploaded. Manual entry is disabled.
            </div>
          </div>
        )}
        
        {!isDisabled && (
          <AnimatePresence mode="wait">
            {hasUsers ? (
              <motion.div
                key="populated"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* User Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Added Team Members:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {manualUsers.slice(0, 4).map((user) => (
                      <div key={user.id} className="flex items-center gap-2 text-xs bg-background rounded-md p-2 border">
                        <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground block truncate">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-muted-foreground text-xs truncate block">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    ))}
                    {manualUsers.length > 4 && (
                      <div className="text-xs text-muted-foreground text-center py-1 font-medium">
                        +{manualUsers.length - 4} more team members
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Add More Button */}
                <button
                  onClick={onMethodChange}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-500 transition-colors"
                >
                  <div className="text-sm font-medium text-black">Add More Team Members</div>
                  <div className="text-xs text-gray-700">Click to add additional people</div>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors"
                onClick={onMethodChange}
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">Add team members manually</p>
                    <p className="text-muted-foreground text-sm">Enter details one by one</p>
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
