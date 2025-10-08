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
      activities: {
        Row: {
          activity_date: string
          activity_type: string
          body: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          metadata: Json | null
          subject: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          body?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          subject?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          body?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          subject?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      activity_associations: {
        Row: {
          activity_id: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_associations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_types: {
        Row: {
          color: string | null
          created_at: string | null
          icon_name: string
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon_name: string
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          confidence_score: number | null
          content: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          event_type: string | null
          expires_at: string | null
          id: string
          insight_type: string
          investor_id: string | null
          metadata: Json | null
          source_urls: Json | null
          title: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          event_type?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          investor_id?: string | null
          metadata?: Json | null
          source_urls?: Json | null
          title?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          content?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          event_type?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          investor_id?: string | null
          metadata?: Json | null
          source_urls?: Json | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_conditions: Json
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_conditions?: Json
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      company_profiles: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          currency_preference: string | null
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          currency_preference?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          currency_preference?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
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
      deal_sources: {
        Row: {
          attribution_notes: string | null
          contact_id: string | null
          created_at: string
          deal_id: string
          id: string
          intermediary_id: string | null
          introduction_date: string | null
          source_quality_score: number | null
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attribution_notes?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id: string
          id?: string
          intermediary_id?: string | null
          introduction_date?: string | null
          source_quality_score?: number | null
          source_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attribution_notes?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string
          id?: string
          intermediary_id?: string | null
          introduction_date?: string | null
          source_quality_score?: number | null
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_sources_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_sources_intermediary_id_fkey"
            columns: ["intermediary_id"]
            isOneToOne: false
            referencedRelation: "intermediaries"
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
          logo_url: string | null
          name: string
          notes: string | null
          owner: string | null
          probability: number | null
          promoted_at: string | null
          promoted_to_company_id: string | null
          sector: string | null
          sector_id: string | null
          stage: string
          sub_stage: string | null
          updated_at: string
          user_id: string
          valuation: number | null
          website: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          owner?: string | null
          probability?: number | null
          promoted_at?: string | null
          promoted_to_company_id?: string | null
          sector?: string | null
          sector_id?: string | null
          stage?: string
          sub_stage?: string | null
          updated_at?: string
          user_id: string
          valuation?: number | null
          website?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          expected_close_date?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notes?: string | null
          owner?: string | null
          probability?: number | null
          promoted_at?: string | null
          promoted_to_company_id?: string | null
          sector?: string | null
          sector_id?: string | null
          stage?: string
          sub_stage?: string | null
          updated_at?: string
          user_id?: string
          valuation?: number | null
          website?: string | null
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
      enrichment_data: {
        Row: {
          created_at: string | null
          data: Json
          enriched_at: string | null
          entity_id: string
          entity_type: string
          expires_at: string | null
          id: string
          source: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          enriched_at?: string | null
          entity_id: string
          entity_type: string
          expires_at?: string | null
          id?: string
          source: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          enriched_at?: string | null
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          id?: string
          source?: string
        }
        Relationships: []
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
      intermediaries: {
        Row: {
          created_at: string
          email: string | null
          firm: string | null
          id: string
          last_contact_date: string | null
          linkedin: string | null
          name: string
          notes: string | null
          phone: string | null
          relationship_strength: number | null
          sector_id: string | null
          successful_deals: number | null
          total_deals_sourced: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          relationship_strength?: number | null
          sector_id?: string | null
          successful_deals?: number | null
          total_deals_sourced?: number | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          last_contact_date?: string | null
          linkedin?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          relationship_strength?: number | null
          sector_id?: string | null
          successful_deals?: number | null
          total_deals_sourced?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intermediaries_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      intermediary_coverage: {
        Row: {
          coverage_strength: number | null
          created_at: string
          id: string
          interaction_count: number | null
          intermediary_id: string
          last_interaction_date: string | null
          notes: string | null
          sector_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coverage_strength?: number | null
          created_at?: string
          id?: string
          interaction_count?: number | null
          intermediary_id: string
          last_interaction_date?: string | null
          notes?: string | null
          sector_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coverage_strength?: number | null
          created_at?: string
          id?: string
          interaction_count?: number | null
          intermediary_id?: string
          last_interaction_date?: string | null
          notes?: string | null
          sector_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "intermediary_coverage_intermediary_id_fkey"
            columns: ["intermediary_id"]
            isOneToOne: false
            referencedRelation: "intermediaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intermediary_coverage_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
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
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change_amount: number | null
          change_percent: number | null
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
          change_amount?: number | null
          change_percent?: number | null
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
          change_amount?: number | null
          change_percent?: number | null
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
      network_connections: {
        Row: {
          connection_strength: number | null
          created_at: string | null
          from_contact_id: string
          id: string
          notes: string | null
          source: string | null
          to_contact_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_strength?: number | null
          created_at?: string | null
          from_contact_id: string
          id?: string
          notes?: string | null
          source?: string | null
          to_contact_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_strength?: number | null
          created_at?: string | null
          from_contact_id?: string
          id?: string
          notes?: string | null
          source?: string | null
          to_contact_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "network_connections_from_contact_id_fkey"
            columns: ["from_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_connections_to_contact_id_fkey"
            columns: ["to_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      news_alerts: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          last_triggered_at: string | null
          min_impact_level: string | null
          name: string
          notification_channels: string[] | null
          trigger_event_types: string[] | null
          trigger_keywords: string[] | null
          updated_at: string
          user_id: string
          watch_entity_id: string | null
          watch_entity_type: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          min_impact_level?: string | null
          name: string
          notification_channels?: string[] | null
          trigger_event_types?: string[] | null
          trigger_keywords?: string[] | null
          updated_at?: string
          user_id: string
          watch_entity_id?: string | null
          watch_entity_type?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_triggered_at?: string | null
          min_impact_level?: string | null
          name?: string
          notification_channels?: string[] | null
          trigger_event_types?: string[] | null
          trigger_keywords?: string[] | null
          updated_at?: string
          user_id?: string
          watch_entity_id?: string | null
          watch_entity_type?: string | null
        }
        Relationships: []
      }
      news_entity_matches: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          match_confidence: number | null
          match_reason: string | null
          news_item_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          match_confidence?: number | null
          match_reason?: string | null
          news_item_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          match_confidence?: number | null
          match_reason?: string | null
          news_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_entity_matches_news_item_id_fkey"
            columns: ["news_item_id"]
            isOneToOne: false
            referencedRelation: "news_items"
            referencedColumns: ["id"]
          },
        ]
      }
      news_items: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string
          fetched_at: string
          id: string
          impact_level: string | null
          metadata: Json | null
          published_at: string
          relevance_score: number | null
          sentiment: string | null
          sentiment_confidence: number | null
          source_name: string
          source_url: string
          summary: string | null
          tags: Json | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          fetched_at?: string
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          published_at: string
          relevance_score?: number | null
          sentiment?: string | null
          sentiment_confidence?: number | null
          source_name: string
          source_url: string
          summary?: string | null
          tags?: Json | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          fetched_at?: string
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          published_at?: string
          relevance_score?: number | null
          sentiment?: string | null
          sentiment_confidence?: number | null
          source_name?: string
          source_url?: string
          summary?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      news_sources: {
        Row: {
          api_config: Json | null
          created_at: string
          credibility_rating: number | null
          enabled: boolean
          fetch_frequency_hours: number
          id: string
          last_fetch_at: string | null
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          api_config?: Json | null
          created_at?: string
          credibility_rating?: number | null
          enabled?: boolean
          fetch_frequency_hours?: number
          id?: string
          last_fetch_at?: string | null
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          api_config?: Json | null
          created_at?: string
          credibility_rating?: number | null
          enabled?: boolean
          fetch_frequency_hours?: number
          id?: string
          last_fetch_at?: string | null
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      portfolio_companies: {
        Row: {
          created_at: string
          current_stock_price: number | null
          deal_id: string | null
          description: string | null
          enterprise_value: number | null
          exit_date: string | null
          fund_id: string | null
          id: string
          investment_amount: number | null
          investment_date: string | null
          is_public: boolean | null
          last_price_update: string | null
          location: string | null
          logo_url: string | null
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
          deal_id?: string | null
          description?: string | null
          enterprise_value?: number | null
          exit_date?: string | null
          fund_id?: string | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          is_public?: boolean | null
          last_price_update?: string | null
          location?: string | null
          logo_url?: string | null
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
          deal_id?: string | null
          description?: string | null
          enterprise_value?: number | null
          exit_date?: string | null
          fund_id?: string | null
          id?: string
          investment_amount?: number | null
          investment_date?: string | null
          is_public?: boolean | null
          last_price_update?: string | null
          location?: string | null
          logo_url?: string | null
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
            foreignKeyName: "portfolio_companies_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_companies_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_companies_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_kpis: {
        Row: {
          arr: number | null
          company_id: string
          created_at: string
          customer_count: number | null
          ebitda: number | null
          ebitda_margin: number | null
          headcount: number | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          revenue: number | null
          revenue_growth: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arr?: number | null
          company_id: string
          created_at?: string
          customer_count?: number | null
          ebitda?: number | null
          ebitda_margin?: number | null
          headcount?: number | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          revenue?: number | null
          revenue_growth?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arr?: number | null
          company_id?: string
          created_at?: string
          customer_count?: number | null
          ebitda?: number | null
          ebitda_margin?: number | null
          headcount?: number | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          revenue?: number | null
          revenue_growth?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_kpis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
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
      relationship_scores: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          frequency_score: number | null
          id: string
          interaction_count: number | null
          last_interaction: string | null
          recency_score: number | null
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          frequency_score?: number | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          recency_score?: number | null
          score?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          frequency_score?: number | null
          id?: string
          interaction_count?: number | null
          last_interaction?: string | null
          recency_score?: number | null
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_scores_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "portfolio_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_scores_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          content_template: Json | null
          created_at: string | null
          description: string | null
          enabled_formats: string[] | null
          frequency: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_template?: Json | null
          created_at?: string | null
          description?: string | null
          enabled_formats?: string[] | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_template?: Json | null
          created_at?: string | null
          description?: string | null
          enabled_formats?: string[] | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          cron_expression: string
          format: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          recipient_roles: string[] | null
          recipient_users: string[] | null
          template_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cron_expression: string
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          recipient_roles?: string[] | null
          recipient_users?: string[] | null
          template_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cron_expression?: string
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          recipient_roles?: string[] | null
          recipient_users?: string[] | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
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
          assigned_to: string | null
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
          assigned_to?: string | null
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
          assigned_to?: string | null
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
      team_members: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_company_owner: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_company_owner: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_role_name: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role_by_name: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      same_company: {
        Args: { _user_id: string }
        Returns: boolean
      }
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
