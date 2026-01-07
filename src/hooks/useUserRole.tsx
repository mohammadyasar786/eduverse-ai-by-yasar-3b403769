import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "student" | "faculty" | "research_expert";

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setRole(data?.role as AppRole || null);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const setUserRole = async (newRole: AppRole) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: user.id,
          role: newRole,
        }, { onConflict: "user_id,role" });

      if (error) throw error;
      setRole(newRole);
      return { error: null };
    } catch (error) {
      console.error("Error setting user role:", error);
      return { error };
    }
  };

  return { role, isLoading, setUserRole };
};
