import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Activity, ActivityType } from '../types/crm.types';

// In-memory fallback storage for activities during local preview
let localActivities: Activity[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    lead_id: 'a0000000-0000-0000-0000-000000000001',
    actor_id: null,
    activity_type: 'lead_created',
    description: 'Lead inquiry registered from Website form',
    metadata: { source: 'Website' },
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    lead_id: 'a0000000-0000-0000-0000-000000000002',
    actor_id: null,
    activity_type: 'status_changed',
    description: 'Status changed from New to Contacted',
    metadata: { previous: 'New', next: 'Contacted' },
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

export const activityService = {
  async getActivitiesForLead(leadId: string): Promise<Activity[]> {
    if (!isSupabaseConfigured()) {
      return localActivities
        .filter((a) => a.lead_id === leadId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error.message);
        return [];
      }
      return (data || []) as Activity[];
    } catch (err) {
      console.error('Failed to get activities:', err);
      return [];
    }
  },

  async logActivity(
    leadId: string,
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<Activity | null> {
    if (!isSupabaseConfigured()) {
      const newAct: Activity = {
        id: 'c' + Math.random().toString(36).substring(2, 9),
        lead_id: leadId,
        actor_id: null,
        activity_type: activityType,
        description,
        metadata: metadata || null,
        created_at: new Date().toISOString(),
      };
      localActivities.unshift(newAct);
      return newAct;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('activities')
        .insert({
          lead_id: leadId,
          actor_id: user?.id || null,
          activity_type: activityType,
          description,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging activity:', error.message);
        return null;
      }
      return data as Activity;
    } catch (err) {
      console.error('Failed to log activity:', err);
      return null;
    }
  },
};
