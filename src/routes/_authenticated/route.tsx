import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useCloudSync } from "@/hooks/useCloudSync";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const ready = useCloudSync(user.id);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar email={user.email ?? ""} />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-8">
          {ready ? (
            <Outlet />
          ) : (
            <div className="space-y-4">
              <div className="h-8 w-48 rounded-lg bg-muted/40 animate-pulse" />
              <div className="grid gap-4 md:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
