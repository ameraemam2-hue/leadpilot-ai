// Hand-written types matching the Supabase schema (Phase 1).
// You can later replace this with `supabase gen types typescript`.

export type Role =
  | "super_admin"
  | "company_admin"
  | "marketing_manager"
  | "media_buyer"
  | "sales_manager"
  | "viewer";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  brand_colors: { primary: string; secondary: string; accent: string } | null;
  meta_ad_account_id: string | null;
  subscription_plan: "free" | "starter" | "pro" | "enterprise";
  subscription_expires_at: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
}

export interface AppUser {
  id: string;
  company_id: string | null;
  full_name: string | null;
  email: string;
  role: Role;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  developer_name: string | null;
  location: string | null;
  property_type:
    | "apartment"
    | "villa"
    | "townhouse"
    | "commercial"
    | "chalet"
    | "duplex"
    | "penthouse"
    | null;
  starting_price: number | null;
  down_payment_pct: number | null;
  installment_years: number | null;
  delivery_date: string | null;
  available_units: number | null;
  usps: string[];
  target_audience: Record<string, unknown> | null;
  media_urls: string[];
  landing_page_url: string | null;
  whatsapp_number: string | null;
  crm_source_code: string | null;
  is_active: boolean;
  created_at: string;
}

export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type CampaignObjective =
  | "LEAD_GENERATION"
  | "MESSAGES"
  | "TRAFFIC"
  | "CONVERSIONS"
  | "BRAND_AWARENESS"
  | "REACH";

export interface Campaign {
  id: string;
  company_id: string;
  project_id: string;
  created_by: string | null;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  budget_daily: number | null;
  start_date: string | null;
  end_date: string | null;
  meta_campaign_id: string | null;
  builder_data: Record<string, unknown>;
  ai_generated_copy: AIGeneratedCopy | Record<string, never>;
  performance: Record<string, unknown>;
  created_at: string;
}

export interface AIGeneratedCopy {
  headlines: string[];
  primary_texts: string[];
  whatsapp_script: string;
  language?: string;
  model?: string;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit"
  | "reservation"
  | "deal"
  | "lost";

export interface Lead {
  id: string;
  company_id: string;
  campaign_id: string | null;
  project_id: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  status: LeadStatus;
  crm_lead_id: string | null;
  form_answers: Record<string, unknown>;
  meta_lead_id: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
}
