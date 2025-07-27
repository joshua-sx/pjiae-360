import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useEmployeeInvitation } from './useEmployeeInvitation';
import { useToast } from './use-toast';

export const useAuthProfile = () => {
  const { user } = useAuth();
  const { claimProfile } = useEmployeeInvitation();
  const { toast } = useToast();

  useEffect(() => {
    const handleProfileClaim = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        const result = await claimProfile(user.primaryEmailAddress.emailAddress, user.id);
        
        if (result.success) {
          toast({
            title: "Profile Linked",
            description: "Your employee profile has been successfully linked to your account.",
          });
        }
      } catch (error) {
        console.error('Failed to claim profile:', error);
        // Don't show error toast for this - it's expected that most users won't have invited profiles
      }
    };

    // Only try to claim profile on first login/signup
    if (user) {
      handleProfileClaim();
    }
  }, [user?.id, user?.primaryEmailAddress?.emailAddress, claimProfile, toast]);

  return {};
};