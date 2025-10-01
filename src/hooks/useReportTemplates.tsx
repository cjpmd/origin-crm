import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReportTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: string;
  frequency?: string;
  content_template?: any;
  enabled_formats?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useReportTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["report-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReportTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<Partial<ReportTemplate>, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { name: string; type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("report_templates")
        .insert([{ ...template, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      toast({
        title: "Success",
        description: "Report template created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReportTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("report_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      toast({
        title: "Success",
        description: "Report template updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("report_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-templates"] });
      toast({
        title: "Success",
        description: "Report template deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    templates,
    isLoading,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
  };
};
