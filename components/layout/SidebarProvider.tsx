"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "sidebar-collapsed:v1";
const MOBILE_QUERY = "(max-width: 767px)";

type SidebarContextValue = {
  collapsed: boolean;
  mobileOpen: boolean;
  isMobile: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function readStoredCollapsed(): boolean | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    /* private browsing */
  }
  return null;
}

function persistCollapsed(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);

    function applyViewport() {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile) {
        setMobileOpen(false);
        return;
      }
      const stored = readStoredCollapsed();
      if (stored !== null) setCollapsed(stored);
    }

    applyViewport();
    mq.addEventListener("change", applyViewport);
    return () => mq.removeEventListener("change", applyViewport);
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      persistCollapsed(next);
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({
      collapsed: isMobile ? true : collapsed,
      mobileOpen,
      isMobile,
      toggleCollapsed,
      openMobile,
      closeMobile,
    }),
    [collapsed, mobileOpen, isMobile, toggleCollapsed, openMobile, closeMobile],
  );

  return <SidebarContext value={value}>{children}</SidebarContext>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
