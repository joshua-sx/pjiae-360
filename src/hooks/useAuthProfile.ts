import { useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAuthProfile = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Placeholder for profile claiming logic
    // This would handle automatic profile claiming for invited employees
    if (user) {
      console.log('User authenticated:', user.primaryEmailAddress?.emailAddress);
    }
  }, [user]);

  return {};
};