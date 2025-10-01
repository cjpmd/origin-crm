export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      capital_calls: {
        Row: {
          call_amount: number
          call_date: string
          call_number: number
          commitment_id: string
          created_at: string | null
          due_date: string
          fund_id: string
          id: string
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          call_amount: number
          call_date: string
          call_number: number
          commitment_id: string
          created_at?: string | null
          due_date: string
          fund_id: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          call_amount?: number
          call_date?: string
          call_number?: number
          commitment_id?: string
          created_at?: string | null
          due_date?: string
          fund_id?: string
          id?: string
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capital_calls_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "fund_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capital_calls_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_date: string | null
          linkedin: string | null
          name: string
          notes: string | null
          phone: string | null
          relationship_strength: number | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          relationship_strength?: number | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          relationship_strength?: number | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          company_id: string | null
          created_at: string
          expected_close_date: string | null
          id: string
          name: string
          notes: string | null
          owner: string | null
          probability: number | null
          promoted_at: string | null
          promoted_to_company_id: string | null
          sector: string | null
          sector_id: string | null
          stage: string
          updated_at: string
          user_id: string
          valuation: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          name: string
          notes?: string | null
          owner?: string | null
          probability?: number | null
          promoted_at?: string | null
          promoted_to_company_id?: string | null
          sector?: string | null
          sector_id?: string | null
          stage?: string
          updated_at?: string
          user_id: string
          valuation?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner?: string | null
          probability?: number | null
          promoted_at?: string | null
          promoted_to_company_id?: string | null
          sector?: string | null
          sector_id?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
          valuation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_promoted_to_company_id_fkey"
            columns: ["promoted_to_company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      distributions: {
        Row: {
          commitment_id: string
          created_at: string | null
          distribution_amount: number
          distribution_date: string
          distribution_number: number
          distribution_type: string | null
          fund_id: string
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          commitment_id: string
          created_at?: string | null
          distribution_amount: number
          distribution_date: string
          distribution_number: number
          distribution_type?: string | null
          fund_id: string
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          commitment_id?: string
          created_at?: string | null
          distribution_amount?: number
          distribution_date?: string
          distribution_number?: number
          distribution_type?: string | null
          fund_id?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distributions_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "fund_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributions_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      esg_ratings: {
        Row: {
          company_id: string
          created_at: string
          environmental_score: number | null
          governance_score: number | null
          id: string
          notes: string | null
          overall_score: number | null
          rating_date: string
          social_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          environmental_score?: number | null
          governance_score?: number | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          rating_date: string
          social_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          environmental_score?: number | null
          governance_score?: number | null
          id?: string
          notes?: string | null
          overall_score?: number | null
          rating_date?: string
          social_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "esg_ratings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          author: string | null
          company_id: string | null
          correlation_group: string | null
          created_at: string | null
          fetch_time: string | null
          id: string
          independence_score: number | null
          metadata: Json | null
          outlet: string | null
          recency_score: number | null
          research_job_id: string | null
          signal_quality: number | null
          snippet: string | null
          source_url: string | null
          title: string | null
          type: string | null
          verifiability_score: number | null
        }
        Insert: {
          author?: string | null
          company_id?: string | null
          correlation_group?: string | null
          created_at?: string | null
          fetch_time?: string | null
          id?: string
          independence_score?: number | null
          metadata?: Json | null
          outlet?: string | null
          recency_score?: number | null
          research_job_id?: string | null
          signal_quality?: number | null
          snippet?: string | null
          source_url?: string | null
          title?: string | null
          type?: string | null
          verifiability_score?: number | null
        }
        Update: {
          author?: string | null
          company_id?: string | null
          correlation_group?: string | null
          created_at?: string | null
          fetch_time?: string | null
          id?: string
          independence_score?: number | null
          metadata?: Json | null
          outlet?: string | null
          recency_score?: number | null
          research_job_id?: string | null
          signal_quality?: number | null
          snippet?: string | null
          source_url?: string | null
          title?: string | null
          type?: string | null
          verifiability_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_items_research_job_id_fkey"
            columns: ["research_job_id"]
            isOneToOne: false
            referencedRelation: "research_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_commitments: {
        Row: {
          called_amount: number | null
          commitment_amount: number
          committed_date: string | null
          created_at: string | null
          distributed_amount: number | null
          fund_id: string
          id: string
          investor_id: string
          notes: string | null
          remaining_commitment: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          called_amount?: number | null
          commitment_amount: number
          committed_date?: string | null
          created_at?: string | null
          distributed_amount?: number | null
          fund_id: string
          id?: string
          investor_id: string
          notes?: string | null
          remaining_commitment?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          called_amount?: number | null
          commitment_amount?: number
          committed_date?: string | null
          created_at?: string | null
          distributed_amount?: number | null
          fund_id?: string
          id?: string
          investor_id?: string
          notes?: string | null
          remaining_commitment?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fund_commitments_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_commitments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          carried_interest_rate: number | null
          close_date: string | null
          created_at: string | null
          final_close_date: string | null
          fund_size: number | null
          id: string
          management_fee_rate: number | null
          name: string
          notes: string | null
          status: string | null
          strategy: string | null
          target_irr: number | null
          target_moic: number | null
          updated_at: string | null
          user_id: string
          vintage_year: number | null
        }
        Insert: {
          carried_interest_rate?: number | null
          close_date?: string | null
          created_at?: string | null
          final_close_date?: string | null
          fund_size?: number | null
          id?: string
          management_fee_rate?: number | null
          name: string
          notes?: string | null
          status?: string | null
          strategy?: string | null
          target_irr?: number | null
          target_moic?: number | null
          updated_at?: string | null
          user_id: string
          vintage_year?: number | null
        }
        Update: {
          carried_interest_rate?: number | null
          close_date?: string | null
          created_at?: string | null
          final_close_date?: string | null
          fund_size?: number | null
          id?: string
          management_fee_rate?: number | null
          name?: string
          notes?: string | null
          status?: string | null
          strategy?: string | null
          target_irr?: number | null
          target_moic?: number | null
          updated_at?: string | null
          user_id?: string
          vintage_year?: number | null
        }
        Relationships: []
      }
      investor_contacts: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          investor_id: string
          is_primary: boolean | null
          role: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          investor_id: string
          is_primary?: boolean | null
          role?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          investor_id?: string
          is_primary?: boolean | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investor_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investor_contacts_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          check_size: string | null
          created_at: string
          focus_sectors: string[] | null
          id: string
          location: string | null
          name: string
          notes: string | null
          status: string | null
          type: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          check_size?: string | null
          created_at?: string
          focus_sectors?: string[] | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          check_size?: string | null
          created_at?: string
          focus_sectors?: string[] | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          close_price: number | null
          company_id: string
          created_at: string
          date: string
          high_price: number | null
          id: string
          low_price: number | null
          open_price: number | null
          volume: number | null
        }
        Insert: {
          close_price?: number | null
          company_id: string
          created_at?: string
          date: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          volume?: number | null
        }
        Update: {
          close_price?: number | null
          company_id?: string
          created_at?: string
          date?: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_companies: {
        Row: {
          created_at: string
          current_stock_price: number | null
          description: string | null
          enterprise_value: number | null
          id: string
          investment_amount: number | null
          investment_date: string | null
          is_public: boolean | null
          location: string | null
          market_cap: number | null
          name: string
          ownership_percentage: number | null
          sector_id: string | null
          stage: string | null
          status: string | null
          stock_ticker: string | null
          updated_at: string
          user_id: string
          valuation: number | null
          website: string | null
        }
        Insert: {
          created_at?: string
          current_stock_price?: number | null
          description?: string | null
          enterprise_value?: number | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          is_public?: boolean | null
          location?: string | null
          market_cap?: number | null
          name: string
          ownership_percentage?: number | null
          sector_id?: string | null
          stage?: string | null
          status?: string | null
          stock_ticker?: string | null
          updated_at?: string
          user_id: string
          valuation?: number | null
          website?: string | null
        }
        Update: {
          created_at?: string
          current_stock_price?: number | null
          description?: string | null
          enterprise_value?: number | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          is_public?: boolean | null
          location?: string | null
          market_cap?: number | null
          name?: string
          ownership_percentage?: number | null
          sector_id?: string | null
          stage?: string | null
          status?: string | null
          stock_ticker?: string | null
          updated_at?: string
          user_id?: string
          valuation?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_companies_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      public_comparables: {
        Row: {
          created_at: string
          ebitda: number | null
          ev_ebitda: number | null
          ev_revenue: number | null
          id: string
          market_cap: number | null
          name: string
          pe_ratio: number | null
          revenue: number | null
          sector_id: string | null
          ticker: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ebitda?: number | null
          ev_ebitda?: number | null
          ev_revenue?: number | null
          id?: string
          market_cap?: number | null
          name: string
          pe_ratio?: number | null
          revenue?: number | null
          sector_id?: string | null
          ticker?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ebitda?: number | null
          ev_ebitda?: number | null
          ev_revenue?: number | null
          id?: string
          market_cap?: number | null
          name?: string
          pe_ratio?: number | null
          revenue?: number | null
          sector_id?: string | null
          ticker?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_comparables_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      research_alerts: {
        Row: {
          company_id: string | null
          condition: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          metric: string | null
          profile_id: string | null
        }
        Insert: {
          company_id?: string | null
          condition?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          metric?: string | null
          profile_id?: string | null
        }
        Update: {
          company_id?: string | null
          condition?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          metric?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_alerts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_alerts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      research_jobs: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string | null
          depth: string | null
          id: string
          initiated_by: string | null
          params: Json | null
          priority: number | null
          sector_id: string | null
          source_url: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          depth?: string | null
          id?: string
          initiated_by?: string | null
          params?: Json | null
          priority?: number | null
          sector_id?: string | null
          source_url?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          depth?: string | null
          id?: string
          initiated_by?: string | null
          params?: Json | null
          priority?: number | null
          sector_id?: string | null
          source_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_jobs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_jobs_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      research_reports: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          key_drivers: Json | null
          pdf_url: string | null
          posterior_probability: number | null
          prior_probability: number | null
          research_job_id: string | null
          structured_findings: Json | null
          summary: string | null
          title: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          key_drivers?: Json | null
          pdf_url?: string | null
          posterior_probability?: number | null
          prior_probability?: number | null
          research_job_id?: string | null
          structured_findings?: Json | null
          summary?: string | null
          title?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          key_drivers?: Json | null
          pdf_url?: string | null
          posterior_probability?: number | null
          prior_probability?: number | null
          research_job_id?: string | null
          structured_findings?: Json | null
          summary?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_reports_research_job_id_fkey"
            columns: ["research_job_id"]
            isOneToOne: false
            referencedRelation: "research_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
