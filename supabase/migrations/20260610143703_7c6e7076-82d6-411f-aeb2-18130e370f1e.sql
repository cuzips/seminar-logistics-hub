
-- Roles
CREATE TYPE public.app_role AS ENUM ('coordinator','sales_manager','consultant','materials');
CREATE TYPE public.seminar_status AS ENUM ('booked','site_selecting','contract_negotiating','contract_approved','travel_booked','materials_requested','materials_shipped','ready','completed');
CREATE TYPE public.contract_status AS ENUM ('draft','pending_coordinator','pending_sales','approved');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read all auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles insert self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles read all auth" ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email);
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'coordinator'));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.seminar_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  default_rooms INT NOT NULL DEFAULT 1,
  default_seating TEXT NOT NULL DEFAULT 'theater',
  default_av JSONB NOT NULL DEFAULT '[]'::jsonb,
  materials_template JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seminar_types TO authenticated;
GRANT ALL ON public.seminar_types TO service_role;
ALTER TABLE public.seminar_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seminar_types read auth" ON public.seminar_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "seminar_types manage coordinator" ON public.seminar_types FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));

CREATE TABLE public.consultants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  home_airport TEXT,
  travel_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultants TO authenticated;
GRANT ALL ON public.consultants TO service_role;
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consultants read auth" ON public.consultants FOR SELECT TO authenticated USING (true);
CREATE POLICY "consultants manage coordinator" ON public.consultants FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));
CREATE POLICY "consultants update self" ON public.consultants FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE TABLE public.meeting_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  sales_manager_id UUID REFERENCES auth.users ON DELETE SET NULL,
  sales_manager_name TEXT,
  cost_per_day NUMERIC NOT NULL DEFAULT 0,
  max_capacity INT NOT NULL DEFAULT 50,
  space_info TEXT,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meeting_sites TO authenticated;
GRANT ALL ON public.meeting_sites TO service_role;
ALTER TABLE public.meeting_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sites read auth" ON public.meeting_sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "sites manage coordinator" ON public.meeting_sites FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));
CREATE POLICY "sites update sales mgr own" ON public.meeting_sites FOR UPDATE TO authenticated
USING (sales_manager_id = auth.uid());

CREATE TABLE public.seminars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id UUID REFERENCES public.seminar_types ON DELETE SET NULL,
  city TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  consultant_id UUID REFERENCES public.consultants ON DELETE SET NULL,
  status public.seminar_status NOT NULL DEFAULT 'booked',
  registrant_count INT NOT NULL DEFAULT 0,
  selected_site_id UUID REFERENCES public.meeting_sites ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seminars TO authenticated;
GRANT ALL ON public.seminars TO service_role;
ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seminars read auth" ON public.seminars FOR SELECT TO authenticated USING (true);
CREATE POLICY "seminars manage coordinator" ON public.seminars FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));

CREATE TABLE public.site_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seminar_id UUID NOT NULL REFERENCES public.seminars ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.meeting_sites ON DELETE CASCADE,
  available BOOLEAN NOT NULL DEFAULT true,
  estimated_cost NUMERIC,
  notes TEXT,
  selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seminar_id, site_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_options TO authenticated;
GRANT ALL ON public.site_options TO service_role;
ALTER TABLE public.site_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_options read auth" ON public.site_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "site_options manage coordinator" ON public.site_options FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seminar_id UUID NOT NULL REFERENCES public.seminars ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.meeting_sites ON DELETE CASCADE,
  current_version INT NOT NULL DEFAULT 1,
  status public.contract_status NOT NULL DEFAULT 'pending_coordinator',
  total_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts read auth" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "contracts coord manage" ON public.contracts FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));
CREATE POLICY "contracts sales update" ON public.contracts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'sales_manager'));
CREATE POLICY "contracts sales insert" ON public.contracts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'sales_manager'));

CREATE TABLE public.contract_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts ON DELETE CASCADE,
  version INT NOT NULL,
  terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  action TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_versions TO authenticated;
GRANT ALL ON public.contract_versions TO service_role;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cv read auth" ON public.contract_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "cv insert auth" ON public.contract_versions FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'coordinator') OR public.has_role(auth.uid(),'sales_manager'));

CREATE TABLE public.travel_arrangements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seminar_id UUID NOT NULL REFERENCES public.seminars ON DELETE CASCADE UNIQUE,
  consultant_id UUID REFERENCES public.consultants ON DELETE SET NULL,
  outbound_flight TEXT,
  return_flight TEXT,
  departure_date DATE,
  return_date DATE,
  airline TEXT,
  travel_agency TEXT DEFAULT 'Global Travel Co.',
  hotel TEXT,
  confirmation_number TEXT,
  status TEXT NOT NULL DEFAULT 'researching',
  itinerary_sent_at TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_arrangements TO authenticated;
GRANT ALL ON public.travel_arrangements TO service_role;
ALTER TABLE public.travel_arrangements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "travel read auth" ON public.travel_arrangements FOR SELECT TO authenticated USING (true);
CREATE POLICY "travel coord manage" ON public.travel_arrangements FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));
CREATE POLICY "travel consultant update" ON public.travel_arrangements FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'consultant'));

CREATE TABLE public.materials_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seminar_id UUID NOT NULL REFERENCES public.seminars ON DELETE CASCADE UNIQUE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ship_to_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  requested_by UUID REFERENCES auth.users ON DELETE SET NULL,
  handled_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.materials_requests TO authenticated;
GRANT ALL ON public.materials_requests TO service_role;
ALTER TABLE public.materials_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mr read auth" ON public.materials_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "mr coord manage" ON public.materials_requests FOR ALL TO authenticated
USING (public.has_role(auth.uid(),'coordinator')) WITH CHECK (public.has_role(auth.uid(),'coordinator'));
CREATE POLICY "mr materials update" ON public.materials_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'materials'));

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  target_role public.app_role,
  seminar_id UUID REFERENCES public.seminars ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read mine or role" ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR (target_role IS NOT NULL AND public.has_role(auth.uid(), target_role)));
CREATE POLICY "notif insert by coord/sales/materials" ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(),'coordinator') OR
  public.has_role(auth.uid(),'sales_manager') OR
  public.has_role(auth.uid(),'materials') OR
  public.has_role(auth.uid(),'consultant')
);
CREATE POLICY "notif update mine" ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR (target_role IS NOT NULL AND public.has_role(auth.uid(), target_role)));

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seminar_id UUID REFERENCES public.seminars ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users ON DELETE SET NULL,
  action TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "log read auth" ON public.activity_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "log insert by any role" ON public.activity_log FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_seminars_upd BEFORE UPDATE ON public.seminars FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_contracts_upd BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_mr_upd BEFORE UPDATE ON public.materials_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_travel_upd BEFORE UPDATE ON public.travel_arrangements FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, authenticated, anon;
