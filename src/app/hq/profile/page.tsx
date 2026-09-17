import { requireRole } from "@/lib/auth/current-user";
import { PageHeader } from "@/components/ui/Feedback";
import { RoleBadge } from "@/components/data/HealthBadge";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/actions/auth";

export default async function HqProfilePage() {
  const user = await requireRole("HQ");
  return (
    <div className="max-w-xl">
      <PageHeader title="Profile" />
      <article className="rounded-3xl border border-sand bg-white p-6">
        <RoleBadge role={user.role} />
        <h2 className="mt-4 text-2xl font-semibold text-forest">{user.fullName}</h2>
        <p className="mt-2 text-muted">All nurseries</p>
        <form action={logoutAction} className="mt-6">
          <Button type="submit" variant="secondary">Sign out</Button>
        </form>
      </article>
    </div>
  );
}
