import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { FollowUp, FollowUpStatus } from '../types/crm.types';
import { activityService } from './activityService';

// In-memory demo follow-ups matching 002_demo_seed.sql
let localFollowUps: FollowUp[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    lead_id: 'a0000000-0000-0000-0000-000000000001',
    assigned_to: null,
    due_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago -> OVERDUE
    note: 'Send course curriculum PDF and call regarding upcoming batch schedule.',
    status: 'pending',
    completed_at: null,
    created_by: null,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    lead: {
      id: 'a0000000-0000-0000-0000-000000000001',
      full_name: 'Aarav Sharma',
      phone: '+91 98111 22334',
      course_interest: 'Data Science & AI',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    lead_id: 'a0000000-0000-0000-0000-000000000002',
    assigned_to: null,
    due_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // in 4 hours -> DUE TODAY
    note: 'Follow-up call to review scholarship assessment questions.',
    status: 'pending',
    completed_at: null,
    created_by: null,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    lead: {
      id: 'a0000000-0000-0000-0000-000000000002',
      full_name: 'Priya Nair',
      phone: '+91 98222 33445',
      course_interest: 'Full Stack Web Development',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    lead_id: 'a0000000-0000-0000-0000-000000000003',
    assigned_to: null,
    due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // in 2 days -> UPCOMING
    note: 'Review weekend class vs weekday evening class preference.',
    status: 'pending',
    completed_at: null,
    created_by: null,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    lead: {
      id: 'a0000000-0000-0000-0000-000000000003',
      full_name: 'Rohan Patel',
      phone: '+91 98333 44556',
      course_interest: 'Cloud Architecture (AWS)',
    },
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    lead_id: 'a0000000-0000-0000-0000-000000000004',
    assigned_to: null,
    due_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    note: 'Campus tour and fee structure consultation.',
    status: 'completed',
    completed_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    created_by: null,
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    lead: {
      id: 'a0000000-0000-0000-0000-000000000004',
      full_name: 'Ananya Sen',
      phone: '+91 98444 55667',
      course_interest: 'UI/UX Product Design',
    },
  },
];

export type FollowUpFilterTab = 'all' | 'today' | 'overdue' | 'completed';

export const followupService = {
  // Helper to determine if a follow-up is overdue
  isOverdue(item: FollowUp): boolean {
    return item.status === 'pending' && new Date(item.due_at).getTime() < Date.now();
  },

  // Helper to determine if a follow-up is due today (local date)
  isDueToday(item: FollowUp): boolean {
    if (item.status !== 'pending') return false;
    const dueDate = new Date(item.due_at);
    const today = new Date();
    return (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    );
  },

  async getFollowUps(tab: FollowUpFilterTab = 'all', leadId?: string): Promise<FollowUp[]> {
    let items: FollowUp[] = [];

    if (!isSupabaseConfigured()) {
      items = [...localFollowUps];
    } else {
      try {
        let query = supabase
          .from('follow_ups')
          .select(`
            *,
            lead:leads!follow_ups_lead_id_fkey(id, full_name, phone, course_interest),
            assigned_profile:profiles!follow_ups_assigned_to_fkey(id, full_name, role)
          `)
          .order('due_at', { ascending: true });

        if (leadId) {
          query = query.eq('lead_id', leadId);
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error fetching follow-ups:', error.message);
          return [];
        }
        items = (data || []) as unknown as FollowUp[];
      } catch (err) {
        console.error('Failed to get follow-ups:', err);
        return [];
      }
    }

    if (leadId) {
      items = items.filter((f) => f.lead_id === leadId);
    }

    // Apply tab filters
    switch (tab) {
      case 'today':
        return items.filter((f) => this.isDueToday(f));
      case 'overdue':
        return items.filter((f) => this.isOverdue(f));
      case 'completed':
        return items.filter((f) => f.status === 'completed');
      case 'all':
      default:
        return items.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
    }
  },

  async getOverdueCount(): Promise<number> {
    const all = await this.getFollowUps('all');
    return all.filter((f) => this.isOverdue(f)).length;
  },

  async createFollowUp(payload: {
    leadId: string;
    dueAt: string;
    note: string;
    leadName?: string;
    assignedTo?: string | null;
  }): Promise<{ followUp: FollowUp | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newFollowUp: FollowUp = {
        id: 'b' + Math.random().toString(36).substring(2, 9),
        lead_id: payload.leadId,
        assigned_to: payload.assignedTo || null,
        due_at: payload.dueAt,
        note: payload.note,
        status: 'pending',
        completed_at: null,
        created_by: null,
        created_at: new Date().toISOString(),
        lead: payload.leadName
          ? {
              id: payload.leadId,
              full_name: payload.leadName,
              phone: '',
              course_interest: '',
            }
          : undefined,
      };
      localFollowUps.unshift(newFollowUp);

      await activityService.logActivity(
        payload.leadId,
        'follow_up_scheduled',
        `Follow-up scheduled: "${payload.note}" (Due: ${new Date(payload.dueAt).toLocaleString()})`,
        { due_at: payload.dueAt }
      );

      return { followUp: newFollowUp, error: null };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          followUp: null,
          error: 'Authentication required: You must be signed in to schedule follow-ups. Please visit /auth to sign in.',
        };
      }
      const { data, error } = await (supabase.from('follow_ups') as any)
        .insert({
          lead_id: payload.leadId,
          assigned_to: payload.assignedTo || user.id,
          due_at: payload.dueAt,
          note: payload.note,
          status: 'pending',
          created_by: user.id,
        })
        .select(`
          *,
          lead:leads!follow_ups_lead_id_fkey(id, full_name, phone, course_interest),
          assigned_profile:profiles!follow_ups_assigned_to_fkey(id, full_name, role)
        `)
        .single();

      if (error) return { followUp: null, error: error.message };

      await activityService.logActivity(
        payload.leadId,
        'follow_up_scheduled',
        `Follow-up task scheduled: "${payload.note}"`,
        { due_at: payload.dueAt }
      );

      return { followUp: data as FollowUp, error: null };
    } catch (err: any) {
      return { followUp: null, error: err.message || 'Error creating follow-up' };
    }
  },

  async completeFollowUp(id: string): Promise<{ success: boolean; error: string | null }> {
    const completedTimestamp = new Date().toISOString();

    if (!isSupabaseConfigured()) {
      const item = localFollowUps.find((f) => f.id === id);
      if (item) {
        item.status = 'completed';
        item.completed_at = completedTimestamp;
        await activityService.logActivity(
          item.lead_id,
          'follow_up_completed',
          `Follow-up completed: "${item.note}"`
        );
      }
      return { success: true, error: null };
    }

    try {
      const { data, error } = await (supabase.from('follow_ups') as any)
        .update({
          status: 'completed',
          completed_at: completedTimestamp,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      if (data?.lead_id) {
        await activityService.logActivity(
          data.lead_id,
          'follow_up_completed',
          `Follow-up marked completed: "${data.note}"`
        );
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to complete follow-up' };
    }
  },

  async cancelFollowUp(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const item = localFollowUps.find((f) => f.id === id);
      if (item) {
        item.status = 'cancelled';
      }
      return { success: true, error: null };
    }

    try {
      const { error } = await (supabase.from('follow_ups') as any)
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to cancel follow-up' };
    }
  },
};
