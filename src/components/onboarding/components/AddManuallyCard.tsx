
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
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-muted">
            <UserCheck className="w-5 h-5 text-primary" />
          </div>
          <span className="text-foreground font-medium">
            Add Manually
          </span>
        </div>
        <div className="relative w-full max-w-sm mx-auto">
          <div className="group relative w-full rounded-xl bg-background ring-1 ring-border p-0.5">
            <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="relative w-full rounded-[10px] bg-muted/50 p-1.5">
              <div className="relative mx-auto w-full overflow-hidden rounded-lg border border-border bg-background">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative h-[200px] flex flex-col justify-start p-4"
                >
                  {/* Title row - moved to top */}
                  <div className="flex items-center gap-2 w-full mb-4">
                    <span className="text-sm font-medium text-foreground">
                      Added team members:
                    </span>
                    <AnimatePresence>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-semibold text-primary-foreground"
                        aria-live="polite"
                      >
                        {manualUsers.length}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Member list */}
                  <ScrollArea className="h-32 w-full mb-4">
                    <div className="space-y-1 p-1">
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
                  
                  {/* Add More Button */}
                  <Button
                    onClick={onMethodChange}
                    variant="outline"
                    className="w-full border-dashed gap-2 font-medium py-2.5"
                    aria-label="Add more team members"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Add More
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
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
        <div className="relative w-full max-w-sm mx-auto" aria-disabled="true">
          <div className="group relative w-full rounded-xl bg-background ring-1 ring-border p-0.5 opacity-50 pointer-events-none">
            <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="relative w-full rounded-[10px] bg-muted/50 p-1.5">
              <div className="relative mx-auto w-full overflow-hidden rounded-lg border border-border bg-background">
                <div className="relative h-[240px] flex flex-col items-center justify-center p-6">
                  <div className="mb-4">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center">
                      <Users className="w-7 h-7 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      CSV file uploaded. Manual entry is disabled.
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
        <div className="relative max-w-full mx-auto" role="complementary" aria-label="Manual entry">
          <div className="group relative w-full rounded-xl bg-background ring-1 ring-border p-0.5">
            <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <div className="relative w-full rounded-[10px] bg-muted/50 p-1.5">
              <div className="relative mx-auto w-full overflow-hidden rounded-lg border border-border bg-background">
                <div className="absolute -right-4 -top-4 h-8 w-8 bg-gradient-to-br from-primary/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative h-[240px]" onClick={onMethodChange}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <div className="mb-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg
                            viewBox="0 0 100 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full"
                            aria-hidden="true"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              className="stroke-muted-foreground/30"
                              strokeWidth="2"
                              strokeDasharray="4 4"
                            >
                              <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 50 50"
                                to="360 50 50"
                                dur="60s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" aria-hidden="true" />
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-1.5 mb-4">
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">
                          Add Manually
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Enter people one by one
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={onMethodChange}
                        className="w-4/5 flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-muted/80 group"
                        aria-label="Add a person manually"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        Add Person
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
