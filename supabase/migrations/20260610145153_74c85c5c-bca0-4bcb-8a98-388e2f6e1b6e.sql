
DROP POLICY IF EXISTS "seminars manage coordinator" ON public.seminars;
CREATE POLICY "seminars manage coordinator or sales"
ON public.seminars
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(),'coordinator') OR public.has_role(auth.uid(),'sales_manager'))
WITH CHECK (public.has_role(auth.uid(),'coordinator') OR public.has_role(auth.uid(),'sales_manager'));
