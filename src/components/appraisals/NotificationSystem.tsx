
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationSystemProps {
  notification?: NotificationProps | null;
}

export default function NotificationSystem({ notification }: NotificationSystemProps) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<NotificationProps[]>([]);

  React.useEffect(() => {
    if (notification) {
      setMessages(prev => [...prev, notification]);
    }
  }, [notification]);

  React.useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-user-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        payload => {
          const data: any = payload.new;
          setMessages(prev => [
            ...prev,
            { type: data.type || 'info', message: data.payload?.message || data.message || '' }
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  React.useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => {
      setMessages(prev => prev.slice(1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <AnimatePresence>
      {messages.map((n, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed right-4 z-toast"
          style={{ top: 16 + index * 80 }}
        >
          <Alert
            className={cn(
              'w-96 shadow-lg',
              n.type === 'success' && 'border-green-500 bg-green-50',
              n.type === 'error' && 'border-red-500 bg-red-50',
              n.type === 'info' && 'border-blue-500 bg-blue-50'
            )}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{n.message}</AlertDescription>
          </Alert>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
