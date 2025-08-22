
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Storage } from "lucide-react";
import { verifyStorageBuckets, StorageVerificationResult } from "@/lib/storage-utils";
import { toast } from "sonner";

export function StorageVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<StorageVerificationResult | null>(null);

  const handleVerifyStorage = async () => {
    setIsVerifying(true);
    try {
      const result = await verifyStorageBuckets();
      setVerificationResult(result);
      
      if (result.bucketsExist && result.policiesConfigured && result.errors.length === 0) {
        toast.success('Storage verification completed successfully');
      } else {
        toast.warning('Storage verification completed with issues');
      }
    } catch (error) {
      toast.error(`Storage verification failed: ${error}`);
      console.error('Storage verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Storage className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Storage Verification</CardTitle>
            <CardDescription>
              Verify storage buckets and policies are properly configured
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleVerifyStorage}
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify Storage Configuration"}
        </Button>

        {verificationResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Buckets Exist</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(verificationResult.bucketsExist)}
                  <Badge variant={verificationResult.bucketsExist ? "default" : "destructive"}>
                    {verificationResult.bucketsExist ? "OK" : "Failed"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Org Assets Public</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(verificationResult.orgAssetsPublic)}
                  <Badge variant={verificationResult.orgAssetsPublic ? "default" : "destructive"}>
                    {verificationResult.orgAssetsPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Employee Imports Private</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(verificationResult.employeeImportsPrivate)}
                  <Badge variant={verificationResult.employeeImportsPrivate ? "default" : "destructive"}>
                    {verificationResult.employeeImportsPrivate ? "Private" : "Public"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">Policies Configured</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(verificationResult.policiesConfigured)}
                  <Badge variant={verificationResult.policiesConfigured ? "default" : "destructive"}>
                    {verificationResult.policiesConfigured ? "OK" : "Failed"}
                  </Badge>
                </div>
              </div>
            </div>

            {verificationResult.errors.length > 0 && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Issues Found:</span>
                </div>
                <ul className="text-sm text-red-600 space-y-1">
                  {verificationResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
