import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role?: string;
  department?: string;
  avatar_url?: string;
}

interface AppraiserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Employee | null;
  onSelectPrimary: () => void;
  onSelectSecondary: () => void;
}

export default function AppraiserSelectionModal({
  isOpen,
  onClose,
  user,
  onSelectPrimary,
  onSelectSecondary
}: AppraiserSelectionModalProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-2">
                Assign Appraiser Role
              </h2>
              <p className="text-muted-foreground text-sm">
                Choose the role for this appraiser
              </p>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.role} • {user.department}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onSelectPrimary}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <span>Assign as Primary Appraiser</span>
              </button>
              
              <button
                onClick={onSelectSecondary}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                <span>Assign as Secondary Appraiser</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <span>Cancel</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}