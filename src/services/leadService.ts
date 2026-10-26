import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Lead, LeadStatus, LeadSource } from '../types/crm.types';
import { activityService } from './activityService';

// Fallback in-memory dataset matching demo seed migration
let localLeads: Lead[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98111 22334',
    course_interest: 'Data Science & AI',
    source: 'Website',
    status: 'New',
    lost_reason: null,
    assigned_to: null,
    created_by: null,
    notes: 'Inquired via website brochure download. Final year BCA student interested in machine learning tracks.',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    full_name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 98222 33445',
    course_interest: 'Full Stack Web Development',
    source: 'Referral',
    status: 'Contacted',
    lost_reason: null,
    assigned_to: null,
    created_by: null,
    notes: 'Referred by alumnus. Completed initial phone screening; scheduled syllabus walkthrough call.',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    full_name: 'Rohan Patel',
    email: 'rohan.p@example.com',
    phone: '+91 98333 44556',
    course_interest: 'Cloud Architecture (AWS)',
    source: 'Social Media',
    status: 'Qualified',
    lost_reason: null,
    assigned_to: null,
    created_by: null,
    notes: '3 years IT support experience; aiming for AWS Solutions Architect associate certification.',
    created_at: new Date(Date.now() - 144 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    full_name: 'Ananya Sen',
    email: 'ananya.sen@example.com',
    phone: '+91 98444 55667',
    course_interest: 'UI/UX Product Design',
    source: 'Walk-in',
    status: 'Converted',
    lost_reason: null,
    assigned_to: null,
    created_by: null,
    notes: 'Visited campus with parents. Paid registration fee for upcoming weekend batch.',
    created_at: new Date(Date.now() - 240 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    full_name: 'Vikram Mehra',
    email: 'vikram.m@example.com',
    phone: '+91 98555 66778',
    course_interest: 'Cybersecurity Specialist',
    source: 'Phone',
    status: 'Lost',
    lost_reason: 'Budget constraints - postponed to next financial quarter.',
    assigned_to: null,
    created_by: null,
    notes: 'Budget constraints. Decided to postpone admission to next financial quarter.',
    created_at: new Date(Date.now() - 288 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
  },
];

export interface LeadFilterOptions {
  search?: string;
  status?: string;
  source?: string;
}

export const leadService = {
  async getLeads(filters: LeadFilterOptions = {}): Promise<Lead[]> {
    if (!isSupabaseConfigured()) {
      let result = [...localLeads];

      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
          (l) =>
            l.full_name.toLowerCase().includes(q) ||
            l.phone.includes(q) ||
            (l.email && l.email.toLowerCase().includes(q)) ||
            l.course_interest.toLowerCase().includes(q)
        );
      }

      if (filters.status) {
        result = result.filter((l) => l.status === filters.status);
      }

      if (filters.source) {
        result = result.filter((l) => l.source === filters.source);
      }

      return result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!leads_assigned_to_fkey(id, full_name, role),
          creator_profile:profiles!leads_created_by_fkey(id, full_name, role)
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status as LeadStatus);
      }

      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      if (filters.search?.trim()) {
        const q = `%${filters.search.trim()}%`;
        query = query.or(
          `full_name.ilike.${q},phone.ilike.${q},email.ilike.${q},course_interest.ilike.${q}`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching leads:', error.message);
        return [];
      }
      return (data || []) as unknown as Lead[];
    } catch (err) {
      console.error('Failed to get leads:', err);
      return [];
    }
  },

  async getLeadById(id: string): Promise<Lead | null> {
    if (!isSupabaseConfigured()) {
      return localLeads.find((l) => l.id === id) || null;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_profile:profiles!leads_assigned_to_fkey(id, full_name, role),
          creator_profile:profiles!leads_created_by_fkey(id, full_name, role)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching lead by id:', error.message);
        return null;
      }
      return data as unknown as Lead;
    } catch (err) {
      console.error('Failed to fetch lead:', err);
      return null;
    }
  },

  async createLead(leadData: {
    fullName: string;
    phone: string;
    email?: string | null;
    courseInterest: string;
    source: LeadSource | string;
    notes?: string | null;
  }): Promise<{ lead: Lead | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newLead: Lead = {
        id: 'a' + Math.random().toString(36).substring(2, 9),
        full_name: leadData.fullName,
        phone: leadData.phone,
        email: leadData.email || null,
        course_interest: leadData.courseInterest,
        source: leadData.source,
        status: 'New',
        lost_reason: null,
        assigned_to: null,
        created_by: null,
        notes: leadData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localLeads.unshift(newLead);
      await activityService.logActivity(
        newLead.id,
        'lead_created',
        `Lead created for ${newLead.full_name}`,
        { source: newLead.source, course: newLead.course_interest }
      );
      return { lead: newLead, error: null };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('leads')
        .insert({
          full_name: leadData.fullName,
          phone: leadData.phone,
          email: leadData.email || null,
          course_interest: leadData.courseInterest,
          source: leadData.source,
          status: 'New',
          notes: leadData.notes || null,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (error) {
        return { lead: null, error: error.message };
      }

      const createdLead = data as unknown as Lead;
      await activityService.logActivity(
        createdLead.id,
        'lead_created',
        `Enquiry registered for ${createdLead.full_name} (${createdLead.course_interest})`,
        { source: createdLead.source }
      );

      return { lead: createdLead, error: null };
    } catch (err: any) {
      return { lead: null, error: err.message || 'Error creating lead' };
    }
  },

  async updateLeadStatus(
    id: string,
    nextStatus: LeadStatus,
    lostReason?: string | null
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const idx = localLeads.findIndex((l) => l.id === id);
      if (idx !== -1) {
        const prevStatus = localLeads[idx].status;
        localLeads[idx] = {
          ...localLeads[idx],
          status: nextStatus,
          lost_reason: nextStatus === 'Lost' ? lostReason || 'Not specified' : null,
          updated_at: new Date().toISOString(),
        };
        await activityService.logActivity(
          id,
          'status_changed',
          `Stage updated from ${prevStatus} to ${nextStatus}${lostReason ? ` (${lostReason})` : ''}`,
          { previous: prevStatus, next: nextStatus, lostReason }
        );
      }
      return { success: true, error: null };
    }

    try {
      const currentLead = await this.getLeadById(id);
      const prevStatus = currentLead?.status || 'Unknown';

      const updatePayload: Record<string, any> = {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      };
      if (nextStatus === 'Lost') {
        updatePayload.lost_reason = lostReason || 'No reason provided';
      } else {
        updatePayload.lost_reason = null;
      }

      const { error } = await (supabase.from('leads') as any)
        .update(updatePayload)
        .eq('id', id);

      if (error) return { success: false, error: error.message };

      await activityService.logActivity(
        id,
        'status_changed',
        `Lead moved from ${prevStatus} to ${nextStatus}${lostReason ? `: ${lostReason}` : ''}`,
        { previous: prevStatus, next: nextStatus }
      );

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update status' };
    }
  },

  async updateLead(
    id: string,
    updates: Partial<Lead>
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const idx = localLeads.findIndex((l) => l.id === id);
      if (idx !== -1) {
        localLeads[idx] = {
          ...localLeads[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        await activityService.logActivity(id, 'note_added', 'Lead details updated');
      }
      return { success: true, error: null };
    }

    try {
      const { assigned_profile, creator_profile, ...dbFields } = updates;
      const { error } = await (supabase.from('leads') as any)
        .update({
          ...dbFields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) return { success: false, error: error.message };

      await activityService.logActivity(id, 'note_added', 'Lead contact or notes updated');
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update lead' };
    }
  },

  async deleteLead(id: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured()) {
      localLeads = localLeads.filter((l) => l.id !== id);
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete lead' };
    }
  },
};
