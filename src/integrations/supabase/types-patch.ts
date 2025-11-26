// Temporary patch for Supabase types until regeneration
// This fixes the missing closing brace in the system_logs table definition

import type { Json } from './types';

export type Database = {
  public: {
    Tables: {
      system_logs: {
        Row: {
          id: string;
          component: string;
          status: "info" | "warning" | "error";
          message: string | null;
          details: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          component: string;
          status: "info" | "warning" | "error";
          message?: string | null;
          details?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          component?: string;
          status?: "info" | "warning" | "error";
          message?: string | null;
          details?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          prediction_id: string;
          user_suggestion: string;
          submitted_by: string | null;
          metadata: Json | null;
          resolved: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          prediction_id: string;
          user_suggestion: string;
          submitted_by?: string | null;
          metadata?: Json | null;
          resolved?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          prediction_id?: string;
          user_suggestion?: string;
          submitted_by?: string | null;
          metadata?: Json | null;
          resolved?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_prediction_id_fkey";
            columns: ["prediction_id"];
            isOneToOne: false;
            referencedRelation: "predictions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "user_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
