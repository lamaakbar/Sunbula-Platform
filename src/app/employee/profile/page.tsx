import { employeeContext } from "@/lib/data/employee";
import { PageHeader } from "@/components/ui/Feedback";
import { RoleBadge } from "@/components/data/HealthBadge";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/actions/auth";

export default async function ProfilePage() {
  const { user, zone, nurseryName } = await employeeContext();
  return (
    <div className="max-w-xl">
      <PageHeader title="Profile" />
      <article className="rounded-3xl border border-sand bg-white p-6">
        <RoleBadge role={user.role} />
        <h2 className="mt-4 text-2xl font-semibold text-forest">{user.fullName}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Nursery</dt>
            <dd>{nurseryName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Assigned zone</dt>
            <dd>{zone.name}</dd>
          </div>
        </dl>
        <form action={logoutAction} className="mt-6">
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </article>
    </div>
  );
}
