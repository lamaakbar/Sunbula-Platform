import { supervisorContext } from "@/lib/data/supervisor";
import { PageHeader } from "@/components/ui/Feedback";
import { RoleBadge } from "@/components/data/HealthBadge";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/actions/auth";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function SupervisorProfilePage() {
  const { user, nurseryName } = await supervisorContext();
  const copy = messages(await getLocale());
  return (
    <div className="max-w-xl">
      <PageHeader title={copy.supervisor.profile} />
      <article className="rounded-3xl border border-sand bg-white p-6">
        <RoleBadge role={user.role} />
        <h2 className="mt-4 text-2xl font-semibold text-forest">{user.fullName}</h2>
        <p className="mt-2 text-muted">{nurseryName}</p>
        <form action={logoutAction} className="mt-6">
          <Button type="submit" variant="secondary">{copy.chrome.signOut}</Button>
        </form>
      </article>
    </div>
  );
}
