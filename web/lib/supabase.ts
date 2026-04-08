import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ApplicationStatus = "evaluated" | "applied" | "responded" | "interview" | "offer" | "rejected" | "discarded" | "skip";
export type PipelineStatus = "pending" | "processing" | "done" | "error" | "skipped";
export type ScanStatus = "added" | "skipped_title" | "skipped_dup";

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string; seq_num: number; applied_at: string; company: string; role: string;
          score: number | null; status: ApplicationStatus; pdf_url: string | null;
          report_id: string | null; source_url: string | null; archetype: string | null;
          notes: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; seq_num: number; applied_at: string; company: string; role: string;
          score?: number | null; status?: ApplicationStatus; pdf_url?: string | null;
          report_id?: string | null; source_url?: string | null; archetype?: string | null;
          notes?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; seq_num?: number; applied_at?: string; company?: string; role?: string;
          score?: number | null; status?: ApplicationStatus; pdf_url?: string | null;
          report_id?: string | null; source_url?: string | null; archetype?: string | null;
          notes?: string | null; updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string; seq_num: number; application_id: string | null; company: string;
          role: string; report_date: string; slug: string; raw_markdown: string;
          blocks: Json | null; score: number | null; archetype: string | null;
          source_url: string | null; pdf_url: string | null; created_at: string;
        };
        Insert: {
          id?: string; seq_num: number; application_id?: string | null; company: string;
          role: string; report_date: string; slug: string; raw_markdown: string;
          blocks?: Json | null; score?: number | null; archetype?: string | null;
          source_url?: string | null; pdf_url?: string | null; created_at?: string;
        };
        Update: {
          id?: string; seq_num?: number; application_id?: string | null; company?: string;
          role?: string; report_date?: string; slug?: string; raw_markdown?: string;
          blocks?: Json | null; score?: number | null; archetype?: string | null;
          source_url?: string | null; pdf_url?: string | null;
        };
        Relationships: [];
      };
      pipeline_items: {
        Row: {
          id: string; url: string; company: string | null; role: string | null;
          status: PipelineStatus; error_msg: string | null; application_id: string | null;
          added_at: string; processed_at: string | null;
        };
        Insert: {
          id?: string; url: string; company?: string | null; role?: string | null;
          status?: PipelineStatus; error_msg?: string | null; application_id?: string | null;
          added_at?: string; processed_at?: string | null;
        };
        Update: {
          id?: string; url?: string; company?: string | null; role?: string | null;
          status?: PipelineStatus; error_msg?: string | null; application_id?: string | null;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      scan_history: {
        Row: {
          id: string; url: string; title: string | null; company: string | null;
          portal: string | null; scan_status: ScanStatus; first_seen_at: string;
        };
        Insert: {
          id?: string; url: string; title?: string | null; company?: string | null;
          portal?: string | null; scan_status: ScanStatus; first_seen_at?: string;
        };
        Update: {
          id?: string; url?: string; title?: string | null; company?: string | null;
          portal?: string | null; scan_status?: ScanStatus;
        };
        Relationships: [];
      };
      stories: {
        Row: {
          id: string; title: string; theme: string | null; source_report_id: string | null;
          situation: string | null; task: string | null; action: string | null;
          result: string | null; reflection: string | null; best_for: string[] | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; title: string; theme?: string | null; source_report_id?: string | null;
          situation?: string | null; task?: string | null; action?: string | null;
          result?: string | null; reflection?: string | null; best_for?: string[] | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; title?: string; theme?: string | null; source_report_id?: string | null;
          situation?: string | null; task?: string | null; action?: string | null;
          result?: string | null; reflection?: string | null; best_for?: string[] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      portals: {
        Row: {
          id: string; slug: string; name: string; careers_url: string | null;
          platform: string | null; api_url: string | null; enabled: boolean;
          custom: boolean; last_scanned: string | null; updated_at: string;
        };
        Insert: {
          id?: string; slug: string; name: string; careers_url?: string | null;
          platform?: string | null; api_url?: string | null; enabled?: boolean;
          custom?: boolean; last_scanned?: string | null; updated_at?: string;
        };
        Update: {
          id?: string; slug?: string; name?: string; careers_url?: string | null;
          platform?: string | null; api_url?: string | null; enabled?: boolean;
          custom?: boolean; last_scanned?: string | null; updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value: Json; updated_at?: string };
        Update: { key?: string; value?: Json; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, { Row: Record<string, unknown>; Relationships: [] }>;
    Functions: Record<string, { Args: Record<string, unknown>; Returns: unknown }>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("Browser Supabase client can only be created on the client.");
  }

  if (!browserClient) {
    browserClient = createClient<Database>(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
  }

  return browserClient;
}

export function createSupabaseServerClient() {
  return createClient<Database>(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export function createSupabaseAdminClient() {
  return createClient<Database>(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export type SupabaseJson = Json;
