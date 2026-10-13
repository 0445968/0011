'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import { ThemeToggle } from '@/components/layout/ThemeToggle';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* =========================================================
   TYPED NAVIGATION
   ========================================================= */

type SectionId = 'overview' | 'work';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavSection = {
  id: SectionId;
  title: string;
  links: NavItem[];
};

const sections: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    links: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    id: 'work',
    title: 'Work',
    links: [
      { label: 'Inquiries', href: '/admin/inquiries', icon: Inbox },
      { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
    ],
  },
];

const navItems: NavItem[] = sections.flatMap(
  (section: NavSection) => section.links
);

const STORAGE_KEY = 'bivi-staff-sidebar-collapsed';

function normalizePath(pathname: string): string {
  if (pathname === '/') return '/admin';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return pathname;
  }
  return `/admin${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function isActive(pathname: string, href: string): boolean {
  const path = normalizePath(pathname);

  if (href === '/admin') return path === '/admin';

  if (href === '/admin/inquiries') {
    return (
      path === href ||
      path.startsWith(`${href}/`) ||
      path.startsWith('/admin/leads/')
    );
  }

  return path === href || path.startsWith(`${href}/`);
}

function SidebarLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`flex shrink-0 items-center rounded-xl text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
collapsed
  ? 'h-10 w-10 justify-center'
  : 'h-11 min-h-[44px] w-full gap-3 px-4 py-2.5'
      } ${
        active
          ? 'bg-muted font-semibold text-foreground'
          : 'font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground'
      }`}
    >
      <Icon
        size={collapsed ? 19 : 17}
        strokeWidth={active ? 2.1 : 1.8}
        aria-hidden="true"
        className="shrink-0"
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

/* =========================================================
   STAFF WORKSPACE SHELL
   ========================================================= */

export function StaffWorkspaceShell({
  children,
  staffEmail = '',
}: {
  children: ReactNode;
  staffEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<
    Record<SectionId, boolean>
  >({ overview: true, work: true });
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true');
    } catch {
      // Expanded layout is the fallback.
    }
  }, []);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Collapse still works without persistence.
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        setSearchOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const matches = useMemo<NavItem[]>(() => {
    const term = search.trim().toLowerCase();
    if (!term) return navItems;
    return navItems.filter((item: NavItem) =>
      item.label.toLowerCase().includes(term)
    );
  }, [search]);

  const currentPage =
    navItems.find((item: NavItem) => isActive(pathname, item.href))?.label ??
    'Staff';

  const initial = staffEmail.trim().charAt(0).toUpperCase() || 'B';

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError('');

    try {
      const response = await fetch('/api/admin/session', {
        method: 'DELETE',
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) throw new Error('Sign out failed');
      router.replace('/admin/login');
      router.refresh();
    } catch {
      setLogoutError('Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="bivi-staff-theme flex h-[100dvh] min-h-0 w-full overflow-hidden bg-background text-foreground">
      {/* SIDEBAR */}
      <aside
        id="staff-sidebar"
        aria-label="Staff sidebar"
        className={`hidden h-full shrink-0 flex-col border-r border-border/50 bg-card transition-[width] duration-200 ease-out md:flex ${
          collapsed ? 'w-[64px]' : 'w-[236px]'
        }`}
      >
        {/* LOGO: always navigates to the dashboard */}
        <div
          className={`flex h-[68px] shrink-0 items-center ${
            collapsed ? 'justify-center px-2' : 'px-5'
          }`}
        >
          <Link
            href="/admin"
            title="Bivi dashboard"
            aria-label="Bivi dashboard"
            className="flex min-w-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {collapsed ? (
              <Image
                src="/images/bivi-icon.svg"
                alt=""
                width={34}
                height={34}
                priority
                className="h-8 w-8 object-contain dark:invert"
              />
            ) : (
              <>
                <Image
                  src="/images/logo.svg"
                  alt="Bivi"
                  width={186}
                  height={65}
                  priority
                  className="h-auto w-[79px] object-contain dark:invert"
                />
                <span className="mx-3 h-5 w-px bg-border/60" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Staff
                </span>
              </>
            )}
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav
          aria-label="Staff navigation"
          className={`min-h-0 flex-1 overflow-y-auto scrollbar-transparent ${
            collapsed
              ? 'flex flex-col items-center gap-1.5 px-2 py-3'
              : 'space-y-5 px-3 py-4'
          }`}
        >
          {collapsed
            ? navItems.map((item: NavItem) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed
                />
              ))
            : sections.map((section: NavSection) => (
                <div key={section.id}>
                  <button
                    type="button"
                    aria-expanded={openSections[section.id]}
                    onClick={() =>
                      setOpenSections((current) => ({
                        ...current,
                        [section.id]: !current[section.id],
                      }))
                    }
                    className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground hover:bg-muted/50"
                  >
                    {section.title}
                    <ChevronDown
                      size={13}
                      aria-hidden="true"
                      className={`transition-transform ${
                        openSections[section.id] ? '' : '-rotate-90'
                      }`}
                    />
                  </button>

                  {openSections[section.id] && (
                    <div className="space-y-1">
                      {section.links.map((item: NavItem) => (
                        <SidebarLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          collapsed={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
        </nav>

        {/* FOOTER: collapse control replaces the old logout button */}
        <div className="shrink-0 border-t border-border/40 px-3 py-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-controls="staff-sidebar"
            aria-expanded={!collapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`flex h-10 items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              collapsed
                ? 'mx-auto w-10 justify-center'
                : 'w-full gap-3 px-3'
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen size={19} strokeWidth={1.8} />
            ) : (
              <PanelLeftClose size={18} strokeWidth={1.8} />
            )}
            {!collapsed && <span className="text-xs font-medium">Collapse sidebar</span>}
          </button>
        </div>
      </aside>

      {/* MAIN COLUMN */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-card px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin"
              aria-label="Bivi dashboard"
              className="flex items-center gap-2 md:hidden"
            >
              <Image
                src="/images/logo.svg"
                alt="Bivi"
                width={186}
                height={65}
                className="h-auto w-[74px] dark:invert"
              />
              <span className="h-5 w-px bg-border" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider">
                Staff
              </span>
            </Link>
            <span className="hidden truncate text-sm font-semibold md:block">
              {currentPage}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Search workspace pages"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-muted/70 px-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-[210px] sm:px-3 lg:w-[260px]"
            >
              <Search size={16} />
              <span className="hidden flex-1 text-left text-xs sm:block">
                Search pages
              </span>
              <kbd className="hidden rounded bg-card px-1.5 py-0.5 font-mono text-[10px] lg:block">
                ⌘ K
              </kbd>
            </button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open account menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground hover:bg-accent"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="bivi-staff-surface w-56 rounded-xl border-border/50 bg-popover p-2 text-popover-foreground shadow-lg"
              >
                <DropdownMenuLabel className="space-y-1 px-2 py-2">
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <UserRound size={14} />
                    Staff account
                  </span>
                  {staffEmail && (
                    <span
                      title={staffEmail}
                      className="block truncate text-[11px] font-normal text-muted-foreground"
                    >
                      {staffEmail}
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={signingOut}
                  onSelect={() => void signOut()}
                  className="cursor-pointer gap-2 rounded-lg px-3 py-2.5 text-xs"
                >
                  <LogOut size={15} />
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}
        <nav
          aria-label="Mobile staff navigation"
          className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-border/40 bg-card px-3 py-2 scrollbar-hide md:hidden"
        >
          {navItems.map((item: NavItem) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main
          id="staff-workspace-content"
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-background scrollbar-transparent"
        >
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>

      {/* PAGE SEARCH */}
      <Dialog
        open={searchOpen}
        onOpenChange={(open) => {
          setSearchOpen(open);
          if (!open) setSearch('');
        }}
      >
        <DialogContent className="bivi-staff-surface w-[calc(100%-2rem)] max-w-lg rounded-2xl border-border/50 bg-popover p-5 text-popover-foreground shadow-xl">
          <DialogTitle className="text-base font-semibold">
            Search workspace
          </DialogTitle>
          <DialogDescription className="text-xs">
            Find a staff workspace page.
          </DialogDescription>
          <div className="flex items-center gap-2 rounded-xl bg-muted/70 px-3">
            <Search size={16} className="shrink-0 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              aria-label="Search pages"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pages..."
              className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-1">
            {matches.map((item: NavItem) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearch('');
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-muted"
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
            {!matches.length && (
              <p className="py-5 text-center text-xs text-muted-foreground">
                No matching pages.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {logoutError && (
        <div
          role="alert"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-foreground px-4 py-3 text-xs font-medium text-background shadow-lg"
        >
          {logoutError}
        </div>
      )}
    </div>
  );
}
