/* eslint-disable jsx-a11y/role-supports-aria-props */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  SquarePen,
  Target,
  ClipboardList,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useI18n } from "@/lib/i18n/client";
import type { TranslationKey } from "@/lib/i18n/types";
import { useSidebar } from "./SidebarProvider";

type NavItem = {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
};

const NAV: NavItem[] = [
  { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/board", labelKey: "nav.tasks", icon: ClipboardList },
  { href: "/calendar", labelKey: "nav.calendar", icon: CalendarDays },
  { href: "/notes", labelKey: "nav.notes", icon: SquarePen },
  { href: "/objectius", labelKey: "nav.objectives", icon: Target },
];

function SidebarSeparator() {
  return (
    <div
      className="mx-3 border-t border-border/50"
      role="separator"
      aria-hidden
    />
  );
}

function SidebarToggle({
  expanded,
  showLabels,
  isMobile,
  onCollapse,
  onExpand,
  onCloseMobile,
}: {
  expanded: boolean;
  showLabels: boolean;
  isMobile: boolean;
  onCollapse: () => void;
  onExpand: () => void;
  onCloseMobile: () => void;
}) {
  const { t } = useI18n();
  const collapseLabel = isMobile
    ? t("nav.closeMenu")
    : t("nav.collapseSidebar");
  const expandLabel = t("nav.expandSidebar");

  function handleClick() {
    if (isMobile) {
      if (expanded) onCloseMobile();
      else onExpand();
      return;
    }
    if (expanded) onCollapse();
    else onExpand();
  }

  const Icon = expanded
    ? isMobile
      ? X
      : PanelLeftClose
    : PanelLeft;
  const label = expanded ? collapseLabel : expandLabel;

  return (
    <button
      type="button"
      onClick={handleClick}
      title={showLabels ? undefined : label}
      aria-label={label}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        showLabels ? "justify-start" : "justify-center",
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {showLabels ? <span className="truncate">{label}</span> : null}
    </button>
  );
}

function NavLinks({
  pathname,
  showLabels,
  onNavigate,
}: {
  pathname: string;
  showLabels: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      {NAV.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const label = t(item.labelKey);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            title={showLabels ? undefined : label}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              showLabels ? "justify-start" : "justify-center",
              isActive
                ? "bg-accent-soft text-accent"
                : "text-text-muted hover:bg-surface hover:text-text",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                isActive ? "text-accent" : "text-current",
              )}
              aria-hidden
            />
            {showLabels ? (
              <span className="truncate">{label}</span>
            ) : null}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const {
    collapsed,
    mobileOpen,
    isMobile,
    toggleCollapsed,
    openMobile,
    closeMobile,
  } = useSidebar();

  const expanded = isMobile ? mobileOpen : !collapsed;
  const showLabels = expanded;

  return (
    <>
      {isMobile && mobileOpen ? (
        <button
          type="button"
          aria-label={t("nav.closeMenu")}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        aria-label={t("nav.mainNav")}
        aria-expanded={expanded}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out",
          expanded ? "w-64" : "w-16",
          isMobile && mobileOpen && "shadow-pop",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center px-3",
            showLabels ? "gap-2" : "justify-center px-2",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-2",
              !showLabels && "justify-center",
            )}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <Sparkles className="h-5 w-5" aria-hidden />
            </span>
            {showLabels ? (
              <span className="truncate text-base font-semibold tracking-tight">
                {t("nav.brand")}
              </span>
            ) : null}
          </div>
        </div>

        <SidebarSeparator />

        <div className="shrink-0 p-2">
          <SidebarToggle
            expanded={expanded}
            showLabels={showLabels}
            isMobile={isMobile}
            onCollapse={toggleCollapsed}
            onExpand={isMobile ? openMobile : toggleCollapsed}
            onCloseMobile={closeMobile}
          />
        </div>

        <SidebarSeparator />

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          <NavLinks
            pathname={pathname}
            showLabels={showLabels}
            onNavigate={isMobile ? closeMobile : undefined}
          />
        </nav>

        <SidebarSeparator />

        <div className={cn("shrink-0 p-2", showLabels && "p-3")}>
          <div
            className={cn(
              "flex flex-col gap-2",
              showLabels ? "items-stretch" : "items-center",
            )}
          >
            {showLabels ? (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 text-xs text-text-subtle">
                  <p className="truncate font-medium text-text-muted">
                    {t("nav.brand")}
                  </p>
                  <p className="truncate">{t("common.brandSubtitle")}</p>
                </div>
                <ThemeToggle />
              </div>
            ) : (
              <ThemeToggle />
            )}
            <LanguageSelector compact={!showLabels} />
          </div>
        </div>
      </aside>
    </>
  );
}
