import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  RefreshCw, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InvitationWithSends {
  id: string;
  employee_id: string;
  organization_id: string;
  email: string;
  status: string;
  created_at: string;
  expires_at: string;
  sends: {
    id: string;
    sent_at: string;
    status: string;
    email_type: string;
    error_message?: string;
  }[];
}

const InvitesPage = () => {
  const queryClient = useQueryClient();
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());

  // Fetch pending invitations with their send history
  const { data: invitations, isLoading } = useQuery({
    queryKey: ["admin-invitations"],
    queryFn: async () => {
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('employee_invitations')
        .select(`
          id,
          employee_id,
          organization_id,
          email,
          status,
          created_at,
          expires_at
        `)
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      // Fetch send history for each invitation
      const invitationsWithSends = await Promise.all(
        (invitationsData || []).map(async (invitation) => {
          const { data: sendsData, error: sendsError } = await supabase
            .from('invitation_sends')
            .select('id, sent_at, status, email_type, error_message')
            .eq('invitation_id', invitation.id)
            .order('sent_at', { ascending: false });

          if (sendsError) {
            console.error('Error fetching sends:', sendsError);
            return { ...invitation, sends: [] };
          }

          return { ...invitation, sends: sendsData || [] };
        })
      );

      return invitationsWithSends;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Set up real-time updates for invitation changes
  React.useEffect(() => {
    const channel = supabase
      .channel('admin-invitations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_invitations'
        },
        () => {
          // Invalidate and refetch invitations when changes occur
          queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitation_sends'
        },
        () => {
          // Invalidate and refetch when invitation sends change
          queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Resend invitation mutation
  const resendMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      setProcessingInvitations(prev => new Set(prev).add(invitationId));
      
      const invitation = invitations?.find(inv => inv.id === invitationId);
      if (!invitation) throw new Error("Invitation not found");

      // Get the invitation token
      const { data: tokenData, error: tokenError } = await supabase
        .from('employee_invitations')
        .select('token')
        .eq('id', invitationId)
        .single();

      if (tokenError || !tokenData) {
        throw new Error("Failed to retrieve invitation token");
      }

      // Send via branded email service
      const { error: emailError } = await supabase.functions.invoke('send-branded-email', {
        body: {
          type: 'employee_invite',
          to: invitation.email,
          data: {
            invitation_token: tokenData.token,
            organization_id: invitation.organization_id
          }
        }
      });

      if (emailError) throw emailError;

      return { invitationId, email: invitation.email };
    },
    onSuccess: (data) => {
      toast.success(`Invitation resent to ${data.email}`);
      queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
    },
    onError: (error) => {
      console.error('Resend error:', error);
      toast.error(`Failed to resend invitation: ${error.message}`);
    },
    onSettled: (data, error, invitationId) => {
      setProcessingInvitations(prev => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  });

  // Cancel invitation mutation
  const cancelMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('employee_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      if (error) throw error;
      return invitationId;
    },
    onSuccess: () => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({ queryKey: ["admin-invitations"] });
    },
    onError: (error) => {
      console.error('Cancel error:', error);
      toast.error(`Failed to cancel invitation: ${error.message}`);
    }
  });

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'accepted') {
      return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
    }
    if (status === 'revoked') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (isExpired) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Expired</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const getLastSendInfo = (sends: InvitationWithSends['sends']) => {
    if (!sends || sends.length === 0) return { text: "Never sent", variant: "secondary" as const };
    
    const lastSend = sends[0];
    const timeAgo = formatDistanceToNow(new Date(lastSend.sent_at), { addSuffix: true });
    
    if (lastSend.status === 'failed') {
      return { 
        text: `Failed ${timeAgo}`, 
        variant: "destructive" as const,
        error: lastSend.error_message 
      };
    }
    
    return { 
      text: `Sent ${timeAgo}`, 
      variant: "outline" as const 
    };
  };

  const getSendAttemptsCount = (sends: InvitationWithSends['sends']) => {
    return sends.filter(send => send.status === 'sent').length;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Employee Invitations"
          description="Manage pending employee invitations"
        />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingInvitations = invitations?.filter(inv => 
    inv.status === 'pending' && new Date(inv.expires_at) >= new Date()
  ) || [];
  
  const expiredInvitations = invitations?.filter(inv => 
    inv.status === 'pending' && new Date(inv.expires_at) < new Date()
  ) || [];
  
  const acceptedInvitations = invitations?.filter(inv => inv.status === 'accepted') || [];
  const revokedInvitations = invitations?.filter(inv => inv.status === 'revoked') || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Invitations"
        description="Manage and monitor employee invitation status"
      >
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-invitations"] })}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingInvitations.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold">{acceptedInvitations.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">{expiredInvitations.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{revokedInvitations.length}</p>
              </div>
              <X className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invitations</CardTitle>
          <CardDescription>
            Monitor and manage employee invitation status and resend as needed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!invitations || invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No invitations found</h3>
              <p className="text-muted-foreground">No employee invitations have been sent yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const lastSend = getLastSendInfo(invitation.sends);
                  const attempts = getSendAttemptsCount(invitation.sends);
                  const isExpired = new Date(invitation.expires_at) < new Date();
                  const canResend = invitation.status === 'pending' && !isExpired;
                  const canCancel = invitation.status === 'pending';
                  const isProcessing = processingInvitations.has(invitation.id);

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status, invitation.expires_at)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={lastSend.variant}>{lastSend.text}</Badge>
                          {lastSend.error && (
                            <p className="text-xs text-destructive">{lastSend.error}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{attempts}</TableCell>
                      <TableCell>
                        <span className={isExpired ? "text-destructive" : "text-muted-foreground"}>
                          {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canResend && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendMutation.mutate(invitation.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              Resend
                            </Button>
                          )}
                          {canCancel && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                  <X className="h-4 w-4" />
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel the invitation for {invitation.email}? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cancelMutation.mutate(invitation.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Cancel Invitation
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitesPage;