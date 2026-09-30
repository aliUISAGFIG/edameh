import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Pencil, MapPin, ArrowUpRight, Code2, MessageSquare, CalendarDays } from 'lucide-react';
import { api } from '@/api/endpoints';
import { useMe } from '@/api/queries';
import { arbeitsweisen, datum, safeLink } from '@/lib/labels';
import { Avatar, PageHeader, ErrorState, Skeleton } from '@/components/shared/common';
import { Button } from '@/components/ui/button';
import type { Profil, EigenesProfil } from '@/types/api';
export function ProfilePage() {
  const { id } = useParams();
  const me = useMe();
  const own = !id;
  const query = useQuery<Profil | EigenesProfil>({
    queryKey: ['profile', id ?? me.data?.id],
    queryFn: () => (own ? api.profile() : api.publicProfile(Number(id))),
  });
  if (query.isPending) return <Skeleton />;
  if (query.error) return <ErrorState error={query.error} retry={() => void query.refetch()} />;
  const p = query.data;
  return (
    <>
      <PageHeader
        eyebrow="Menschen hinter den Projekten"
        title={own ? 'Mein Profil' : 'Entwicklerprofil'}
        action={
          own ? (
            <Button asChild>
              <Link to="/profil/bearbeiten">
                <Pencil />
                Profil bearbeiten
              </Link>
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="panel min-w-0 overflow-hidden">
          <div className="h-20 border-b bg-accent" />
          <div className="px-6 pb-8 md:px-9">
            <div className="-mt-12 mb-5 inline-flex rounded-full border-4 border-card">
              <Avatar name={p.anzeigename} large />
            </div>
            <h2 className="text-3xl font-semibold">{p.anzeigename}</h2>
            {p.standort && (
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                {p.standort}
              </p>
            )}
            <h3 className="mt-8 mb-3 font-semibold">Über mich</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {p.ueberMich || 'Hier gibt es noch keine Beschreibung.'}
            </p>
            {'statistik' in p && (
              <div className="mt-8 grid gap-3 border-t pt-6 sm:grid-cols-3">
                {[
                  [Code2, String(p.statistik.aktiveAnzeigen), 'Aktive Anzeigen'],
                  [MessageSquare, String(p.statistik.unterhaltungen), 'Unterhaltungen'],
                  [CalendarDays, datum(p.statistik.mitgliedSeit, 'MMM yyyy'), 'Mitglied seit'],
                ].map(([Icon, value, label], i) => {
                  const Mark = Icon as typeof Code2;
                  return (
                    <div key={i} className="py-2">
                      <Mark size={18} className="mb-3 text-primary" />
                      <p className="text-lg font-semibold">{value as string}</p>
                      <p className="text-xs text-muted-foreground">{label as string}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </article>
        <aside className="space-y-5">
          <section className="panel p-6">
            <h2 className="mb-4 font-semibold">Technologien & Stärken</h2>
            <div className="flex flex-wrap gap-2">
              {p.technologien.length ? (
                p.technologien.map((t) => (
                  <span className="badge" key={t.id}>
                    {t.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Technologien angegeben.</p>
              )}
            </div>
          </section>
          <section className="panel p-6">
            <h2 className="mb-3 font-semibold">Zusammenarbeit</h2>
            <p className="text-sm text-muted-foreground">
              {p.arbeitsweise
                ? arbeitsweisen[p.arbeitsweise]
                : 'Noch keine Arbeitsweise angegeben.'}
            </p>
          </section>
          {(safeLink(p.githubLink) || safeLink(p.linkedinLink)) && (
            <section className="panel p-6">
              <h2 className="mb-4 font-semibold">Links</h2>
              {[
                [p.githubLink, 'GitHub'],
                [p.linkedinLink, 'LinkedIn'],
              ].map(
                ([url, label]) =>
                  safeLink(url ?? null) && (
                    <a
                      key={label}
                      href={safeLink(url ?? null)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link mt-3 flex items-center justify-between text-sm"
                    >
                      {label}
                      <ArrowUpRight size={16} />
                    </a>
                  ),
              )}
            </section>
          )}
          {own && (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/meine-anzeigen">
                Meine Anzeigen ansehen
                <ArrowUpRight />
              </Link>
            </Button>
          )}
        </aside>
      </div>
    </>
  );
}
