-- ==============================================================================
-- BrightPath CRM - Demo Seed Data for Workshop & Local Verification
-- Migration: 002_demo_seed.sql
-- Fictional Student Inquiries and Tasks only. Never use real personal data.
-- ==============================================================================

DO $$
DECLARE
  v_lead_1 UUID := 'a0000000-0000-0000-0000-000000000001';
  v_lead_2 UUID := 'a0000000-0000-0000-0000-000000000002';
  v_lead_3 UUID := 'a0000000-0000-0000-0000-000000000003';
  v_lead_4 UUID := 'a0000000-0000-0000-0000-000000000004';
  v_lead_5 UUID := 'a0000000-0000-0000-0000-000000000005';
BEGIN
  -- Insert Sample Leads
  INSERT INTO public.leads (id, full_name, email, phone, course_interest, source, status, notes, created_at)
  VALUES
    (
      v_lead_1,
      'Aarav Sharma',
      'aarav.sharma@example.com',
      '+91 98111 22334',
      'Data Science & AI',
      'Website',
      'New',
      'Inquired via website brochure download. Final year BCA student interested in machine learning tracks.',
      NOW() - INTERVAL '2 days'
    ),
    (
      v_lead_2,
      'Priya Nair',
      'priya.nair@example.com',
      '+91 98222 33445',
      'Full Stack Web Development',
      'Referral',
      'Contacted',
      'Referred by alumnus. Completed initial phone screening; scheduled syllabus walkthrough call.',
      NOW() - INTERVAL '4 days'
    ),
    (
      v_lead_3,
      'Rohan Patel',
      'rohan.p@example.com',
      '+91 98333 44556',
      'Cloud Architecture (AWS)',
      'Social Media',
      'Qualified',
      '3 years IT support experience; aiming for AWS Solutions Architect associate certification.',
      NOW() - INTERVAL '6 days'
    ),
    (
      v_lead_4,
      'Ananya Sen',
      'ananya.sen@example.com',
      '+91 98444 55667',
      'UI/UX Product Design',
      'Walk-in',
      'Converted',
      'Visited campus with parents. Paid registration fee for upcoming weekend batch.',
      NOW() - INTERVAL '10 days'
    ),
    (
      v_lead_5,
      'Vikram Mehra',
      'vikram.m@example.com',
      '+91 98555 66778',
      'Cybersecurity Specialist',
      'Phone',
      'Lost',
      'Budget constraints. Decided to postpone admission to next financial quarter.',
      NOW() - INTERVAL '12 days'
    )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Sample Follow-ups (incorporating Overdue, Today, Future, and Completed)
  INSERT INTO public.follow_ups (id, lead_id, due_at, note, status, completed_at, created_at)
  VALUES
    (
      'b0000000-0000-0000-0000-000000000001',
      v_lead_1,
      NOW() - INTERVAL '1 day', -- OVERDUE item for dashboard testing
      'Send course curriculum PDF and call regarding upcoming batch schedule.',
      'pending',
      NULL,
      NOW() - INTERVAL '2 days'
    ),
    (
      'b0000000-0000-0000-0000-000000000002',
      v_lead_2,
      NOW() + INTERVAL '4 hours', -- DUE TODAY
      'Follow-up call to review scholarship assessment questions.',
      'pending',
      NULL,
      NOW() - INTERVAL '1 day'
    ),
    (
      'b0000000-0000-0000-0000-000000000003',
      v_lead_3,
      NOW() + INTERVAL '2 days', -- UPCOMING
      'Review weekend class vs weekday evening class preference.',
      'pending',
      NULL,
      NOW() - INTERVAL '1 day'
    ),
    (
      'b0000000-0000-0000-0000-000000000004',
      v_lead_4,
      NOW() - INTERVAL '3 days',
      'Campus tour and fee structure consultation.',
      'completed',
      NOW() - INTERVAL '3 days',
      NOW() - INTERVAL '5 days'
    )
  ON CONFLICT (id) DO NOTHING;

  -- Insert Sample Activity Audit Trail
  INSERT INTO public.activities (lead_id, activity_type, description, metadata, created_at)
  VALUES
    (v_lead_1, 'lead_created', 'Lead created from Website inquiry form', '{"source": "Website"}'::jsonb, NOW() - INTERVAL '2 days'),
    (v_lead_1, 'follow_up_scheduled', 'Scheduled initial curriculum consultation call', '{"due_at": "yesterday"}'::jsonb, NOW() - INTERVAL '2 days'),
    (v_lead_2, 'lead_created', 'Lead created via referral', '{"referred_by": "Alumnus"}'::jsonb, NOW() - INTERVAL '4 days'),
    (v_lead_2, 'status_changed', 'Status changed from New to Contacted', '{"previous": "New", "next": "Contacted"}'::jsonb, NOW() - INTERVAL '3 days'),
    (v_lead_4, 'lead_created', 'Walk-in enquiry registered at front desk', '{"source": "Walk-in"}'::jsonb, NOW() - INTERVAL '10 days'),
    (v_lead_4, 'status_changed', 'Status advanced to Converted (Batch 2026-A)', '{"previous": "Qualified", "next": "Converted"}'::jsonb, NOW() - INTERVAL '3 days')
  ON CONFLICT (id) DO NOTHING;

END $$;
