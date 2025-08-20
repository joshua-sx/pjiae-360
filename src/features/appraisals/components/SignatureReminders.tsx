import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  X,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SignatureReminder {
  id: string;
  appraisalId: string;
  userId: string;
  reminderType: 'initial' | 'followup' | 'urgent';
  sentAt: string;
  acknowledged: boolean;
  employeeName: string;
  appraisalStatus: string;
}

interface SignatureRemindersProps {
  userId?: string;
  isManager?: boolean;
}

export function SignatureReminders({ userId, isManager = false }: SignatureRemindersProps) {
  const [reminders, setReminders] = useState<SignatureReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();

    // Set up real-time subscription for reminders
    const channel = supabase
      .channel('signature-reminders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'signature_reminders',
          filter: userId ? `user_id=eq.${userId}` : undefined
        },
        () => {
          loadReminders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadReminders = async () => {
    try {
      let query = supabase
        .from('signature_reminders')
        .select('*')
        .eq('acknowledged', false)
        .order('sent_at', { ascending: false });

      if (userId && !isManager) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedReminders: SignatureReminder[] = (data || []).map(reminder => ({
        id: reminder.id,
        appraisalId: reminder.appraisal_id,
        userId: reminder.user_id,
        reminderType: reminder.reminder_type as 'initial' | 'followup' | 'urgent',
        sentAt: reminder.sent_at,
        acknowledged: reminder.acknowledged,
        employeeName: `User ${reminder.user_id}`,
        appraisalStatus: 'pending'
      }));

      setReminders(formattedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
      toast({
        title: "Error",
        description: "Failed to load signature reminders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('signature_reminders')
        .update({ acknowledged: true })
        .eq('id', reminderId);

      if (error) throw error;

      setReminders(prev => prev.filter(r => r.id !== reminderId));
      
      toast({
        title: "Reminder Acknowledged",
        description: "The reminder has been marked as acknowledged.",
      });
    } catch (error) {
      console.error('Error acknowledging reminder:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge reminder.",
        variant: "destructive",
      });
    }
  };

  const sendReminder = async (appraisalId: string, reminderType: 'initial' | 'followup' | 'urgent') => {
    setIsSendingReminder(true);
    
    try {
      // Get appraisal details and pending signers
      const { data: appraisal, error: appraisalError } = await supabase
        .from('appraisals')
        .select(`
          *,
          employee_info!inner(
            user_id,
            profiles!inner(email, first_name, last_name)
          ),
          appraisal_appraisers!inner(
            appraiser_id,
            role,
            employee_info!inner(
              user_id,
              profiles!inner(email, first_name, last_name)
            )
          )
        `)
        .eq('id', appraisalId)
        .single();

      if (appraisalError) throw appraisalError;

      // Determine who needs to sign (simplified logic)
      const pendingSigners = [
        appraisal.employee_info.user_id,
        ...appraisal.appraisal_appraisers.map(a => a.employee_info.user_id)
      ];

      // Send reminders to all pending signers
      const reminderPromises = pendingSigners.map(async (signerUserId) => {
        await supabase
          .from('signature_reminders')
          .insert({
            appraisal_id: appraisalId,
            user_id: signerUserId,
            reminder_type: reminderType
          });
      });

      await Promise.all(reminderPromises);

      toast({
        title: "Reminders Sent",
        description: `${reminderType} reminders have been sent to all pending signers.`,
      });

      loadReminders();
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send reminders.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReminder(false);
    }
  };

  const getReminderTypeInfo = (type: SignatureReminder['reminderType']) => {
    switch (type) {
      case 'initial':
        return { label: 'Initial', color: 'bg-blue-100 text-blue-800', icon: Bell };
      case 'followup':
        return { label: 'Follow-up', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'urgent':
        return { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: AlertCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: Bell };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Signature Reminders
          {reminders.length > 0 && (
            <Badge variant="secondary">{reminders.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {reminders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">No pending signature reminders</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => {
                const typeInfo = getReminderTypeInfo(reminder.reminderType);
                const Icon = typeInfo.icon;
                
                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{reminder.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          Appraisal signature pending • {reminder.appraisalStatus}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sent: {new Date(reminder.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={typeInfo.color}>
                        {typeInfo.label}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeReminder(reminder.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {isManager && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendReminder('sample-id', 'followup')}
                disabled={isSendingReminder}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Follow-up
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendReminder('sample-id', 'urgent')}
                disabled={isSendingReminder}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Send Urgent
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}