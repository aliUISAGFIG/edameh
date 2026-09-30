import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Moon,
  Sun,
  Menu,
  Plus,
  ArrowUpRight,
  ChevronDown,
  LogOut,
  UserRound,
  Layers3,
} from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { useMe } from '@/api/queries';
import { useMockApi } from '@/app/config/env';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Avatar, Skeleton } from '@/components/shared/common';
import { cn } from '@/lib/utils';
const DevToolbar = import.meta.env.DEV ? lazy(() => import('@/mocks/DevToolbar')) : null;
export function Logo() {
  return (
    <Link
      to="/"
      aria-label="Edameh – Startseite"
      className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Layers3 size={20} />
      </span>
      edameh<span className="text-primary">.</span>
    </Link>
  );
}
export function Layout() {
  const me = useMe();
  const client = useQueryClient(),
    navigate = useNavigate(),
    location = useLocation();
  const [mobile, setMobile] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [dark, setDark] = useState(() => {
    try {
      return (
        localStorage.getItem('edameh-theme') === 'dark' ||
        (!localStorage.getItem('edameh-theme') &&
          matchMedia('(prefers-color-scheme: dark)').matches)
      );
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem('edameh-theme', dark ? 'dark' : 'light');
    } catch {
      /* Storage can be unavailable. */
    }
  }, [dark]);
  useEffect(() => {
    document.title = 'Edameh · Gemeinsam weiterbauen';
    window.scrollTo({ top: 0 });
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);
  async function logout() {
    setLogoutPending(true);
    try {
      await api.logout();
      client.clear();
      client.setQueryData(['session'], null);
      setMobile(false);
      await navigate('/');
      toast.success('Du bist abgemeldet.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Abmelden fehlgeschlagen.');
    } finally {
      setLogoutPending(false);
    }
  }
  const links = [
    ['/', 'Start'],
    ['/anzeigen', 'Anzeigen entdecken'],
    ...(me.data
      ? [
          ['/nachrichten', 'Nachrichten'],
          ['/meine-anzeigen', 'Meine Anzeigen'],
        ]
      : []),
  ];
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:bg-card focus:p-4"
      >
        Zum Inhalt springen
      </a>
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="container-app flex h-[72px] items-center gap-3 lg:gap-6">
          <Logo />
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-5 lg:flex">
            {links.map(([href, label]) => (
              <NavLink
                key={href}
                to={href!}
                end={href === '/'}
                className={({ isActive }) =>
                  cn(
                    'border-b-2 py-6 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={dark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
              title={dark ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
            {me.data ? (
              <>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link to="/anzeigen/neu">
                    <Plus />
                    Anzeige aufgeben
                  </Link>
                </Button>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className="hidden min-h-11 items-center gap-2 rounded-lg p-1.5 lg:flex"
                      aria-label="Benutzermenü"
                      title="Mein Profil und Abmelden"
                    >
                      <Avatar name={me.data.anzeigename} />
                      <ChevronDown size={14} />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      sideOffset={8}
                      className="menu-content z-50 min-w-48 rounded-xl border bg-card p-2 shadow-lg"
                    >
                      <DropdownMenu.Label className="px-2 py-2 text-xs text-muted-foreground">
                        {me.data.anzeigename}
                      </DropdownMenu.Label>
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/profil"
                          className="flex items-center gap-2 rounded-md p-2 text-sm outline-none focus:bg-muted"
                        >
                          <UserRound size={15} />
                          Mein Profil
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        disabled={logoutPending}
                        onSelect={() => void logout()}
                        className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm outline-none focus:bg-muted"
                      >
                        <LogOut size={15} />
                        Abmelden
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            ) : (
              !me.isPending && (
                <div className="hidden items-center gap-2 sm:flex">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/anmelden">Anmelden</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/registrieren">
                      Registrieren
                      <ArrowUpRight />
                    </Link>
                  </Button>
                </div>
              )
            )}
            <Button
              className="lg:hidden"
              variant="ghost"
              size="sm"
              aria-label="Menü öffnen"
              aria-expanded={mobile}
              onClick={() => setMobile(true)}
            >
              <Menu />
              Menü
            </Button>
          </div>
        </div>
        <div className="container-app flex items-center justify-between gap-3 border-t py-2 sm:hidden">
          <Link
            to="/anzeigen"
            className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Anzeigen
          </Link>
          <Button size="sm" asChild>
            <Link to={me.data ? '/anzeigen/neu' : '/anmelden'}>
              {me.data ? <Plus /> : <UserRound />}
              {me.data ? 'Anzeige aufgeben' : 'Anmelden'}
            </Link>
          </Button>
        </div>
      </header>
      <Dialog sheet open={mobile} onOpenChange={setMobile} title="Navigation">
        <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
          {[
            ...links,
            ...(me.data
              ? [
                  ['/anzeigen/neu', 'Anzeige aufgeben'],
                  ['/profil', 'Mein Profil'],
                ]
              : [
                  ['/anmelden', 'Anmelden'],
                  ['/registrieren', 'Registrieren'],
                ]),
          ].map(([to, label]) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'rounded-lg p-3 text-sm transition-colors hover:bg-muted',
                  isActive && 'bg-accent font-semibold text-primary',
                )
              }
              key={to}
              to={to!}
              end
              onClick={() => setMobile(false)}
            >
              {label}
            </NavLink>
          ))}
          {me.data && (
            <Button variant="outline" disabled={logoutPending} onClick={() => void logout()}>
              Abmelden
            </Button>
          )}
        </nav>
      </Dialog>
      <main
        id="main-content"
        tabIndex={-1}
        className="container-app min-w-0 flex-1 py-6 outline-none md:py-10"
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Suspense fallback={<Skeleton />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </main>
      <footer className="mt-12 border-t bg-card">
        <div className="container-app flex flex-wrap items-center justify-between gap-4 py-7">
          <Logo />
          <p className="text-xs text-muted-foreground">Aus Ideen wird mehr. Gemeinsam.</p>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} Edameh</span>
        </div>
      </footer>
      {DevToolbar && useMockApi && (
        <Suspense>
          <DevToolbar />
        </Suspense>
      )}
    </div>
  );
}
