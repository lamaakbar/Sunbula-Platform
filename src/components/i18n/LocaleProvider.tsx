"use client";

import { useSyncExternalStore } from "react";
import { messages, type Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";

function subscribe() {
  return () => {};
}

function clientLocale(): Locale {
  return document.documentElement.lang === "ar" ? "ar" : "en";
}

function serverLocale(): Locale {
  return "en";
}

export function useMessages(): Messages {
  const locale = useSyncExternalStore(subscribe, clientLocale, serverLocale);
  return messages(locale);
}
