"use client";

import { useActionState } from "react";
import type { Role } from "@prisma/client";
import { continueAsActualRole, loginAction, type LoginState } from "@/app/actions/auth";
import { BotanicalMark } from "@/components/brand/BotanicalMark";
import { messages } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput } from "@/components/forms/Fields";

const initial: LoginState = {};

export function SignInForm({
  role,
  email,
  password,
  locale,
}: {
  role: Role;
  email: string;
  password: string;
  locale: Locale;
}) {
  const copy = messages(locale);
  const [state, action, pending] = useActionState(loginAction, initial);

  if (state.mismatch && state.actualRole) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-28px_rgba(14,45,30,0.35)] ring-1 ring-sand">
        <BotanicalMark className="absolute -end-8 -top-8 h-32 w-32 text-sage/30" />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-leaf">{copy.welcome.check}</p>
        <h2 className="mt-2 text-3xl font-semibold text-forest">{copy.welcome.mismatchTitle}</h2>
        <p className="mt-4 text-muted">
          {copy.welcome.mismatchBody} {copy.roles[state.actualRole]}.
        </p>
        <form action={continueAsActualRole.bind(null, state.actualRole)} className="mt-8">
          <Button type="submit" size="lg" className="w-full">
            {copy.welcome.continueAs} {copy.roles[state.actualRole]}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={action} className="relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_24px_60px_-32px_rgba(14,45,30,0.4)] ring-1 ring-sand">
      <BotanicalMark className="pointer-events-none absolute -end-10 -top-10 h-36 w-36 text-sage/20" />
      <input type="hidden" name="intendedRole" value={role} />
      <p className="relative z-10 mb-6 text-sm font-semibold text-leaf">
        {copy.roles[role]} {copy.welcome.accessSuffix}
      </p>
      <div className="relative z-10 space-y-4">
        <FormField label={copy.welcome.email} htmlFor="identifier">
          <TextInput id="identifier" name="identifier" autoComplete="username" defaultValue={email} required />
        </FormField>
        <FormField label={copy.welcome.password} htmlFor="password">
          <TextInput id="password" name="password" type="password" autoComplete="current-password" defaultValue={password} required />
        </FormField>
      </div>
      {state.error ? <p className="mt-4 text-sm text-critical">{state.error}</p> : null}
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
        {pending ? copy.welcome.signingIn : copy.welcome.signIn}
      </Button>
    </form>
  );
}
