
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, User, Plus, UserPlus, UserCheck } from "lucide-react";
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
  
  if (hasUsers) {
    return (
      <div className="space-y-6 p-6 border rounded-xl bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-foreground font-medium">
              Add Manually
            </span>
          </div>
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                {manualUsers.length} added
              </Badge>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          key="added"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Member List */}
          <div className="bg-background rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-foreground">
                Added team members:
              </span>
            </div>
            <ScrollArea className="h-32 w-full">
              <div className="space-y-1">
                <AnimatePresence>
                  {manualUsers.map((user) => (
                    <motion.div 
                      key={user.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-xs bg-muted/50 rounded-md p-2 border border-border/50"
                    >
                      <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs truncate">
                          {user.email}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
          
          {/* Action Button */}
          <Button
            onClick={onMethodChange}
            variant="outline"
            className="w-full font-medium py-2.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add More
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isDisabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-muted">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground font-medium">
            Add Manually
          </span>
        </div>
        <div className="text-center py-6 border rounded-xl bg-muted/30 opacity-75">
          <div className="text-sm text-muted-foreground">
            CSV file uploaded. Manual entry is disabled.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-muted">
          <Users className="w-5 h-5 text-muted-foreground" />
        </div>
        <span className="text-foreground font-medium">
          Add Manually
        </span>
      </div>
      <div
        onClick={onMethodChange}
        className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        <div className="space-y-4">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Add people manually</p>
            <p className="text-muted-foreground text-sm">Enter details one by one</p>
          </div>
        </div>
      </div>
    </div>
  );
}
