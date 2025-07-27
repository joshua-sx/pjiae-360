import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { setSupabaseAuth } from "@/integrations/supabase/client";

export const useSupabaseToken = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    const applyToken = async () => {
      const token = await getToken();
      if (token) setSupabaseAuth(token);
    };
    applyToken();
  }, [getToken]);
};
