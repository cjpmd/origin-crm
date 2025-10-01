-- Create report_templates table
CREATE TABLE public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  frequency TEXT,
  content_template JSONB,
  enabled_formats TEXT[] DEFAULT ARRAY['pdf', 'markdown']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own report templates"
  ON public.report_templates
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create scheduled_reports table
CREATE TABLE public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.report_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  recipient_users UUID[],
  recipient_roles TEXT[],
  format TEXT DEFAULT 'pdf',
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own scheduled reports"
  ON public.scheduled_reports
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create company_profiles table
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own company profile"
  ON public.company_profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view roles"
  ON public.roles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can manage roles"
  ON public.roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.full_name = 'Admin' -- Temporary admin check
    )
  );

-- Insert default roles
INSERT INTO public.roles (name, description, is_system) VALUES
  ('Admin', 'Full system access', true),
  ('Deal Team', 'Access to deals and pipeline', true),
  ('Analyst', 'View and analyze data', true),
  ('Investor Relations', 'Manage investor relationships', true);

-- Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(resource, action)
);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view permissions"
  ON public.permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Insert default permissions
INSERT INTO public.permissions (resource, action, description) VALUES
  ('deals', 'create', 'Create new deals'),
  ('deals', 'read', 'View deals'),
  ('deals', 'update', 'Edit deals'),
  ('deals', 'delete', 'Delete deals'),
  ('companies', 'create', 'Create new companies'),
  ('companies', 'read', 'View companies'),
  ('companies', 'update', 'Edit companies'),
  ('companies', 'delete', 'Delete companies'),
  ('contacts', 'create', 'Create new contacts'),
  ('contacts', 'read', 'View contacts'),
  ('contacts', 'update', 'Edit contacts'),
  ('contacts', 'delete', 'Delete contacts'),
  ('reports', 'create', 'Create reports'),
  ('reports', 'read', 'View reports'),
  ('reports', 'update', 'Edit reports'),
  ('reports', 'delete', 'Delete reports'),
  ('settings', 'manage', 'Manage system settings');

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view role permissions"
  ON public.role_permissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create user_roles junction table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT DEFAULT 'invited',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members"
  ON public.team_members
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can invite team members"
  ON public.team_members
  FOR INSERT
  WITH CHECK (auth.uid() = invited_by);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_report_templates_updated_at
  BEFORE UPDATE ON public.report_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();