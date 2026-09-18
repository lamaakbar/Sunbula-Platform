"use client";

import { useActionState, useState } from "react";
import { ArrowLeft, Building2, HardHat, Trees } from "lucide-react";
import type { Role } from "@prisma/client";
import { continueAsActualRole, loginAction, type LoginState } from "@/app/actions/auth";
import { BrandMark } from "@/components/brand/BrandMark";
import { BotanicalMark } from "@/components/brand/BotanicalMark";
import { Button } from "@/components/ui/Button";
import { FormField, TextInput } from "@/components/forms/Fields";
import { DEMO_ACCOUNTS, ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/cn";

const roles: Array<{
  role: Role;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Trees;
}> = [
  {
    role: "EMPLOYEE",
    title: "Employee",
    subtitle: "Field Operations",
    description: "Manage my assigned zone, plants and daily tasks.",
    icon: HardHat,
  },
  {
    role: "SUPERVISOR",
    title: "Supervisor",
    subtitle: "Nursery Management",
    description: "Monitor my nursery, zones and team.",
    icon: Trees,
  },
  {
    role: "HQ",
    title: "HQ",
    subtitle: "Central Management",
    description: "Monitor nurseries, requests and production.",
    icon: Building2,
  },
];

const initial: LoginState = {};

export default function WelcomeExperience() {
  const [selected, setSelected] = useState<Role | null>(null);
  const [state, action, pending] = useActionState(loginAction, initial);

  if (state.mismatch && state.actualRole) {
    return (
      <Shell>
        <div className="relative mx-auto max-w-xl overflow-hidden rounded-[2rem] bg-white p-8 shadow-[0_20px_50px_-28px_rgba(14,45,30,0.35)] ring-1 ring-sand">
          <BotanicalMark className="absolute -right-8 -top-8 h-32 w-32 text-sage/30" />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-leaf">Access check</p>
          <h2 className="mt-2 text-3xl font-semibold text-forest">This account belongs to a different workspace.</h2>
          <p className="mt-4 text-muted">
            This account is registered as an {ROLE_LABEL[state.actualRole]}.
            Please continue through {ROLE_LABEL[state.actualRole]} access.
          </p>
          <form action={continueAsActualRole.bind(null, state.actualRole)} className="mt-8">
            <Button type="submit" size="lg" className="w-full">
              Continue as {ROLE_LABEL[state.actualRole]}
            </Button>
          </form>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {!selected ? (
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl">
            <BrandMark size="hero" />
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted">
              From every seedling to every nursery — one connected view.
            </p>
            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.18em] text-leaf">
              How are you accessing SUNBULA?
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {roles.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelected(item.role)}
                  className="card-lift group relative min-h-[280px] overflow-hidden rounded-[2rem] bg-white p-7 text-left ring-1 ring-sand"
                >
                  <BotanicalMark
                    className="pointer-events-none absolute -bottom-8 -right-6 h-32 w-32 text-sage/25 transition group-hover:text-leaf/30"
                    variant={item.role === "HQ" ? "canopy" : item.role === "SUPERVISOR" ? "sprout" : "seed"}
                  />
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-light-sage text-forest transition group-hover:bg-forest group-hover:text-cream">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-leaf">{item.subtitle}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-forest">{item.title}</h2>
                  <p className="mt-3 max-w-[16rem] text-sm leading-6 text-muted">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <button type="button" onClick={() => setSelected(null)} className="inline-flex items-center gap-2 text-sm font-medium text-leaf">
              <ArrowLeft className="h-4 w-4" />
              Choose a different access
            </button>
            <div className="mt-6">
              <BrandMark size="sm" />
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-forest">Welcome back.</h2>
            <p className="mt-3 max-w-md text-base leading-7 text-muted">
              Sign in to access your assigned {selected === "HQ" ? "network" : "nursery"} workspace.
            </p>
            <div className="mt-8 rounded-[1.75rem] bg-white/70 p-5 text-sm text-muted ring-1 ring-sand backdrop-blur">
              <p className="font-semibold text-forest">Demo access</p>
              <p className="mt-2 leading-6">
                {DEMO_ACCOUNTS[selected].email}
                <br />
                {DEMO_ACCOUNTS[selected].password}
              </p>
              {selected === "SUPERVISOR" ? (
                <p className="mt-3">Eastern Region supervisor: khalid@sanbala.sa / Sanbala.Supervisor1</p>
              ) : null}
            </div>
          </div>
          <form action={action} className="relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_24px_60px_-32px_rgba(14,45,30,0.4)] ring-1 ring-sand">
            <BotanicalMark className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 text-sage/20" />
            <input type="hidden" name="intendedRole" value={selected} />
            <p className={cn("relative z-10 mb-6 text-sm font-semibold text-leaf")}>{ROLE_LABEL[selected]} access</p>
            <div className="relative z-10 space-y-4">
              <FormField label="User ID / Email" htmlFor="identifier">
                <TextInput
                  id="identifier"
                  name="identifier"
                  autoComplete="username"
                  defaultValue={DEMO_ACCOUNTS[selected].email}
                  required
                />
              </FormField>
              <FormField label="Password" htmlFor="password">
                <TextInput
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  defaultValue={DEMO_ACCOUNTS[selected].password}
                  required
                />
              </FormField>
            </div>
            {state.error ? <p className="mt-4 text-sm text-critical">{state.error}</p> : null}
            <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="welcome-canvas relative min-h-screen overflow-hidden px-4 py-8 sm:px-10 sm:py-14">
      <BotanicalMark className="pointer-events-none absolute -left-16 top-24 hidden h-72 w-72 text-sage/25 lg:block" variant="canopy" />
      <BotanicalMark className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 text-leaf/15" />
      <div className="relative">{children}</div>
    </div>
  );
}
