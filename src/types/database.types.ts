export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: 'admin' | 'manager' | 'counsellor';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: 'admin' | 'manager' | 'counsellor';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: 'admin' | 'manager' | 'counsellor';
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string;
          course_interest: string;
          source: string;
          status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
          lost_reason: string | null;
          assigned_to: string | null;
          created_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone: string;
          course_interest: string;
          source?: string;
          status?: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
          lost_reason?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string;
          course_interest?: string;
          source?: string;
          status?: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';
          lost_reason?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      follow_ups: {
        Row: {
          id: string;
          lead_id: string;
          assigned_to: string | null;
          due_at: string;
          note: string;
          status: 'pending' | 'completed' | 'cancelled';
          completed_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          assigned_to?: string | null;
          due_at: string;
          note: string;
          status?: 'pending' | 'completed' | 'cancelled';
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          assigned_to?: string | null;
          due_at?: string;
          note?: string;
          status?: 'pending' | 'completed' | 'cancelled';
          completed_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          lead_id: string;
          actor_id: string | null;
          activity_type: string;
          description: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          actor_id?: string | null;
          activity_type: string;
          description: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          actor_id?: string | null;
          activity_type?: string;
          description?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
    };
  };
}
