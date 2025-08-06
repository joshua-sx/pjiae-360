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
      if (!user?.id) return;

      const token = (user.user_metadata as any)?.invitation_token;
      if (!token) return;

      try {
        const result = await claimProfile(token, user.id);

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

    if (user) {
      handleProfileClaim();
    }
  }, [user, claimProfile, toast]);

  return {};
};