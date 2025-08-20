import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Monitor,
  Eye,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SignatureVerification {
  id: string;
  role: string;
  signatureData: string;
  ipAddress?: string;
  userAgent?: string;
  verificationStatus: 'pending' | 'verified' | 'failed';
  createdAt: string;
  signerName: string;
  signerEmail: string;
}

interface SignatureVerificationViewProps {
  appraisalId: string;
}

export function SignatureVerificationView({ appraisalId }: SignatureVerificationViewProps) {
  const [signatures, setSignatures] = useState<SignatureVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSignature, setSelectedSignature] = useState<SignatureVerification | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSignatures();
  }, [appraisalId]);

  const loadSignatures = async () => {
    try {
      const { data, error } = await supabase
        .from('signatures')
        .select('*')
        .eq('appraisal_id', appraisalId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSignatures: SignatureVerification[] = (data || []).map(sig => ({
        id: sig.id,
        role: sig.role,
        signatureData: sig.signature_data,
        ipAddress: typeof sig.ip_address === 'string' ? sig.ip_address : undefined,
        userAgent: sig.user_agent || '',
        verificationStatus: (sig.verification_status || 'pending') as 'pending' | 'verified' | 'failed',
        createdAt: sig.created_at,
        signerName: `User ${sig.user_id}`,
        signerEmail: 'user@example.com'
      }));

      setSignatures(formattedSignatures);
    } catch (error) {
      console.error('Error loading signatures:', error);
      toast({
        title: "Error",
        description: "Failed to load signature verification data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: SignatureVerification['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return { 
          label: 'Verified', 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle2,
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'failed':
        return { 
          label: 'Failed', 
          color: 'bg-red-100 text-red-800', 
          icon: AlertTriangle,
          bgColor: 'bg-red-50 border-red-200'
        };
      case 'pending':
      default:
        return { 
          label: 'Pending', 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: Clock,
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'appraiser':
        return 'Primary Appraiser';
      case 'second_appraiser':
        return 'Second Appraiser';
      case 'employee':
        return 'Employee';
      default:
        return role;
    }
  };

  const downloadSignature = (signature: SignatureVerification) => {
    try {
      const link = document.createElement('a');
      link.href = signature.signatureData;
      link.download = `signature-${signature.role}-${signature.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Signature image download has started.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download signature.",
        variant: "destructive",
      });
    }
  };

  const extractDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown device';
    
    const isWindows = userAgent.includes('Windows');
    const isMac = userAgent.includes('Mac');
    const isLinux = userAgent.includes('Linux');
    const isAndroid = userAgent.includes('Android');
    const isiOS = userAgent.includes('iPhone') || userAgent.includes('iPad');
    
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    const isEdge = userAgent.includes('Edge');
    
    let device = 'Unknown';
    if (isWindows) device = 'Windows';
    else if (isMac) device = 'macOS';
    else if (isLinux) device = 'Linux';
    else if (isAndroid) device = 'Android';
    else if (isiOS) device = 'iOS';
    
    let browser = 'Unknown';
    if (isChrome) browser = 'Chrome';
    else if (isFirefox) browser = 'Firefox';
    else if (isSafari) browser = 'Safari';
    else if (isEdge) browser = 'Edge';
    
    return `${device} • ${browser}`;
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
          <Shield className="h-5 w-5" />
          Signature Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {signatures.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No signatures found for this appraisal</p>
          </div>
        ) : (
          <div className="space-y-4">
            {signatures.map((signature) => {
              const statusInfo = getStatusInfo(signature.verificationStatus);
              const StatusIcon = statusInfo.icon;
              
              return (
                <motion.div
                  key={signature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border rounded-lg p-4 ${statusInfo.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{getRoleDisplayName(signature.role)}</h4>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><strong>Signer:</strong> {signature.signerName} ({signature.signerEmail})</p>
                        <p><strong>Signed:</strong> {new Date(signature.createdAt).toLocaleString()}</p>
                        
                        {signature.ipAddress && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>IP: {signature.ipAddress}</span>
                          </div>
                        )}
                        
                        {signature.userAgent && (
                          <div className="flex items-center gap-1">
                            <Monitor className="h-3 w-3" />
                            <span>{extractDeviceInfo(signature.userAgent)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSignature(signature)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Signature Details</DialogTitle>
                            <DialogDescription>
                              {getRoleDisplayName(signature.role)} signature verification
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="border rounded-lg p-4 bg-background">
                              <img 
                                src={signature.signatureData} 
                                alt={`${signature.role} signature`}
                                className="w-full h-32 object-contain border rounded"
                              />
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <Badge className={statusInfo.color}>
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Signer:</span>
                                <span>{signature.signerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Date:</span>
                                <span>{new Date(signature.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Time:</span>
                                <span>{new Date(signature.createdAt).toLocaleTimeString()}</span>
                              </div>
                              {signature.ipAddress && (
                                <div className="flex justify-between">
                                  <span className="font-medium">IP Address:</span>
                                  <span>{signature.ipAddress}</span>
                                </div>
                              )}
                              {signature.userAgent && (
                                <div className="flex justify-between">
                                  <span className="font-medium">Device:</span>
                                  <span className="text-right text-xs leading-tight">
                                    {extractDeviceInfo(signature.userAgent)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadSignature(signature)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}