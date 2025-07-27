
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationSystemProps {
  notification: NotificationProps | null;
}

export default function NotificationSystem({ notification }: NotificationSystemProps) {
  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-toast"
        >
          <Alert className={cn(
            "w-96 shadow-lg",
            notification.type === 'success' && "border-green-500 bg-green-50",
            notification.type === 'error' && "border-red-500 bg-red-50",
            notification.type === 'info' && "border-blue-500 bg-blue-50"
          )}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
