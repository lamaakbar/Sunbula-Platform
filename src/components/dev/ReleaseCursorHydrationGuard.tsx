"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __releaseCursorHydrationGuard?: () => void;
  }
}

export function ReleaseCursorHydrationGuard() {
  useEffect(() => {
    window.__releaseCursorHydrationGuard?.();
  }, []);
  return null;
}
