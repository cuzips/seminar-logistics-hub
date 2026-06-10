
DROP POLICY IF EXISTS "notif insert auth" ON public.notifications;
CREATE POLICY "notif insert by coord/sales/materials" ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(),'coordinator') OR
  public.has_role(auth.uid(),'sales_manager') OR
  public.has_role(auth.uid(),'materials') OR
  public.has_role(auth.uid(),'consultant')
);

DROP POLICY IF EXISTS "log insert auth" ON public.activity_log;
CREATE POLICY "log insert by any role" ON public.activity_log FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, authenticated, anon;
