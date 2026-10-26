export type UserRole = 'admin' | 'manager' | 'counsellor';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type LeadSource =
  | 'Website'
  | 'Walk-in'
  | 'Referral'
  | 'Phone'
  | 'Social Media'
  | 'Partner'
  | 'Other';

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled';

export type ActivityType =
  | 'lead_created'
  | 'status_changed'
  | 'note_added'
  | 'follow_up_scheduled'
  | 'follow_up_completed'
  | 'lead_assigned';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  course_interest: string;
  source: LeadSource | string;
  status: LeadStatus;
  lost_reason?: string | null;
  assigned_to: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation fields
  assigned_profile?: Profile | null;
  creator_profile?: Profile | null;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string | null;
  due_at: string;
  note: string;
  status: FollowUpStatus;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  // Joined relation fields
  lead?: {
    id: string;
    full_name: string;
    phone: string;
    course_interest: string;
  };
  assigned_profile?: Profile | null;
}

export interface Activity {
  id: string;
  lead_id: string;
  actor_id: string | null;
  activity_type: ActivityType | string;
  description: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  actor_profile?: Profile | null;
}

export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  overdueFollowUps: number;
  conversionRate: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsBySource: Record<string, number>;
}
