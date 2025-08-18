
import { Badge } from "@/components/ui/badge";
import { Users, User, CheckCircle } from "lucide-react";
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
    <div className={`rounded-xl border-2 transition-all duration-200 ${
      isDisabled
        ? 'border-border/50 bg-muted/30 opacity-50 cursor-not-allowed'
        : hasUsers
        ? 'border-green-200 bg-green-50/50'
        : 'border-border hover:border-border/80'
    }`}>
      {/* Header Row */}
      <div className="flex items-center justify-between p-6 border-b border-border/50">
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
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 font-semibold">
                {manualUsers.length} added
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-6">
        {isDisabled ? (
          <div className="text-center py-6">
            <div className="text-sm text-muted-foreground">
              CSV file uploaded. Manual entry is disabled.
            </div>
          </div>
        ) : hasUsers ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Success State */}
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Team Members Added Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                {manualUsers.length} team member{manualUsers.length > 1 ? 's' : ''} added manually
              </p>
            </div>

            {/* User Preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Added Team Members:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {manualUsers.slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 text-sm bg-white rounded-lg p-3 border border-border/50">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
                  <div className="text-xs text-muted-foreground text-center py-2 font-medium">
                    +{manualUsers.length - 4} more team members
                  </div>
                )}
              </div>
            </div>
            
            {/* Add More Button */}
            <button
              onClick={onMethodChange}
              className="w-full border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-border transition-colors"
            >
              <div className="text-sm font-medium text-foreground">Add More Team Members</div>
              <div className="text-xs text-muted-foreground">Click to add additional people</div>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-border transition-colors cursor-pointer"
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
      </div>
    </div>
  );
}
