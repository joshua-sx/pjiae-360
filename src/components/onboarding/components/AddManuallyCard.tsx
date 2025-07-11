
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
  
  return (
    <Card className={`cursor-pointer transition-all border-2 ${
      isSelected 
        ? 'border-primary bg-primary/5' 
        : hasUsers
        ? 'border-success bg-success/5'
        : 'border-border hover:border-border-hover hover:bg-accent/50'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Add Manually
          </div>
          <AnimatePresence>
            {hasUsers && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Badge variant="secondary" className="bg-success/20 text-success-foreground border-success/30">
                  {manualUsers.length}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {manualUsers.slice(0, 3).map((user) => (
                    <div key={user.id} className="flex items-center gap-2 text-xs bg-background rounded-md p-2 border">
                      <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  ))}
                  {manualUsers.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{manualUsers.length - 3} more
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add More Button */}
              <button
                onClick={onMethodChange}
                className="w-full border-2 border-dashed border-primary/30 rounded-lg p-3 text-center hover:border-primary/50 transition-colors"
              >
                <div className="text-sm font-medium text-primary">Add More Team Members</div>
                <div className="text-xs text-muted-foreground">Click to add additional people</div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors"
              onClick={onMethodChange}
            >
              <div className="space-y-3">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-medium">Add team members manually</p>
                  <p className="text-muted-foreground text-sm">Enter details one by one</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
