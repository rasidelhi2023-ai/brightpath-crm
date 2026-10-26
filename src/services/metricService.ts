import { leadService } from './leadService';
import { followupService } from './followupService';
import { Lead, FollowUp, LeadStatus, LeadSource } from '../types/crm.types';

export interface ComprehensiveMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  lostLeads: number;
  overdueFollowUps: number;
  conversionRate: string; // e.g. "20.0%"
  stageCounts: Record<LeadStatus, number>;
  sourceCounts: Record<string, number>;
  recentLeads: Lead[];
  urgentFollowUps: FollowUp[];
}

export const metricService = {
  async getDashboardMetrics(): Promise<ComprehensiveMetrics> {
    const leads = await leadService.getLeads();
    const allFollowUps = await followupService.getFollowUps('all');

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === 'New').length;
    const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
    const qualifiedLeads = leads.filter((l) => l.status === 'Qualified').length;
    const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
    const lostLeads = leads.filter((l) => l.status === 'Lost').length;

    // Strict Overdue: status === 'pending' AND due_at < now()
    const overdueFollowUps = allFollowUps.filter((f) => followupService.isOverdue(f)).length;

    // Conversion rate guarded against division by zero
    const conversionRate =
      totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

    const stageCounts: Record<LeadStatus, number> = {
      New: newLeads,
      Contacted: contactedLeads,
      Qualified: qualifiedLeads,
      Converted: convertedLeads,
      Lost: lostLeads,
    };

    const sourceCounts: Record<string, number> = {};
    leads.forEach((l) => {
      const src = l.source || 'Other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    // Top 5 recent leads
    const recentLeads = [...leads]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    // Urgent pending follow-ups sorted by earliest due_at
    const urgentFollowUps = allFollowUps
      .filter((f) => f.status === 'pending')
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())
      .slice(0, 5);

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      lostLeads,
      overdueFollowUps,
      conversionRate,
      stageCounts,
      sourceCounts,
      recentLeads,
      urgentFollowUps,
    };
  },
};
