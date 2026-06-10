import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { ROLE_LABEL } from "@/lib/seminar-utils";
import { pickPrimaryRole, ROLE_HOME, type Role } from "@/lib/rbac";


export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("coordinator");
  const [loading, setLoading] = useState(false);

  const redirectToHome = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const role = pickPrimaryRole(data?.map((r) => r.role as string));
    navigate({ to: ROLE_HOME[role], replace: true });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) redirectToHome(data.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Đăng nhập thành công");
    if (data.user) await redirectToHome(data.user.id);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${ROLE_HOME[(role as Role) ?? "coordinator"]}`,
        data: { full_name: fullName, role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Đăng ký thành công. Bạn đã được đăng nhập.");
    if (data.user) await redirectToHome(data.user.id);
  };

  const DEMO_PASSWORD = "Demo@1234";
  const DEMO_ACCOUNTS = [
    { email: "coordinator@trainingsinc.vn", label: "Điều phối viên", name: "Nguyễn Điều Phối" },
    { email: "sales@trainingsinc.vn", label: "Trưởng phòng Kinh doanh", name: "Trần Kinh Doanh" },
    { email: "consultant@trainingsinc.vn", label: "Giảng viên", name: "Lê Giảng Viên" },
    { email: "materials@trainingsinc.vn", label: "Nhân viên Vật tư", name: "Phạm Vật Tư" },
  ];

  const quickLogin = async (demoEmail: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: DEMO_PASSWORD });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Đăng nhập thành công");
    if (data.user) await redirectToHome(data.user.id);
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary px-4 py-10">
      <div className="w-full max-w-2xl">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary" />
          <span className="font-display text-lg font-bold">Training Inc. Logistics</span>
        </Link>

        <div className="mb-6 rounded-xl border bg-card p-6 shadow-lg">
          <h2 className="font-display text-lg font-semibold">Đăng nhập nhanh — Tài khoản demo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhấn vào một vai trò để đăng nhập ngay. Mật khẩu chung: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{DEMO_PASSWORD}</code>
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {DEMO_ACCOUNTS.map((a) => (
              <Button
                key={a.email}
                variant="outline"
                className="h-auto flex-col items-start gap-1 py-3 text-left"
                disabled={loading}
                onClick={() => quickLogin(a.email)}
              >
                <span className="font-semibold">{a.label}</span>
                <span className="text-xs font-normal text-muted-foreground">{a.email}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-lg">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Đăng nhập thủ công</TabsTrigger>
              <TabsTrigger value="signup">Đăng ký</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label>Mật khẩu</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div>
                  <Label>Họ và tên</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label>Mật khẩu</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div>
                  <Label>Vai trò</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABEL).map(([v, l]) => (
                        <SelectItem key={v} value={v}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Đang xử lý..." : "Đăng ký"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:underline">← Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
