import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvestorDocument {
  id: string;
  investor_id: string;
  user_id: string;
  document_name: string;
  document_type: string;
  document_url?: string;
  sent_date?: string;
  viewed?: boolean;
  view_count?: number;
  last_viewed_at?: string;
  version?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export function useInvestorDocuments(investorId?: string) {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["investor-documents", investorId],
    queryFn: async () => {
      if (!investorId) return [];
      
      const { data, error } = await supabase
        .from("investor_documents")
        .select("*")
        .eq("investor_id", investorId)
        .order("sent_date", { ascending: false });

      if (error) throw error;
      return data as InvestorDocument[];
    },
    enabled: !!investorId,
  });

  const createDocument = useMutation({
    mutationFn: async (doc: Omit<Partial<InvestorDocument>, 'user_id' | 'id' | 'created_at' | 'updated_at'> & { investor_id: string; document_name: string; document_type: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("investor_documents")
        .insert([{ ...doc, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-documents"] });
      toast.success("Document added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add document");
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InvestorDocument> & { id: string }) => {
      const { data, error } = await supabase
        .from("investor_documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-documents"] });
      toast.success("Document updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update document");
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("investor_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investor-documents"] });
      toast.success("Document deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete document");
    },
  });

  return {
    documents,
    isLoading,
    createDocument: createDocument.mutate,
    updateDocument: updateDocument.mutate,
    deleteDocument: deleteDocument.mutate,
  };
}
