import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowUpRight, ArrowRight, Search, SlidersHorizontal, X, Plus } from 'lucide-react';
import { api } from '@/api/endpoints';
import { useCategories, useMe, useTechnologies } from '@/api/queries';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Skeleton,
} from '@/components/shared/common';
import { arbeitsweisen, kategorieName } from '@/lib/labels';
import { AnzeigeCard } from './AnzeigeCard';
import { FilterPanel } from './FilterPanel';

export function DiscoverPage() {
  const isHome = useLocation().pathname === '/';
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const me = useMe();
  const cats = useCategories(),
    techs = useTechnologies();
  const query = new URLSearchParams(params);
  query.set('size', '6');
  const page = Math.max(0, Number(params.get('page')) || 0);
  query.set('page', String(page));
  const ads = useQuery({
    queryKey: ['anzeigen', 'list', me.data?.id ?? null, query.toString()],
    queryFn: () => api.anzeigen(query.toString()),
    placeholderData: keepPreviousData,
  });
  function update(key: string, value: string) {
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: true },
    );
  }
  const reset = () => setParams({});
  const filterKeys = ['suchbegriff', 'kategorieId', 'technologieIds', 'standort', 'arbeitsweise'];
  const active = filterKeys.filter((k) => params.get(k));
  function chip(key: string) {
    const value = params.get(key)!;
    if (key === 'kategorieId')
      return kategorieName(cats.data?.find((c) => c.id === Number(value))?.name ?? 'Kategorie');
    if (key === 'technologieIds')
      return value
        .split(',')
        .map((id) => techs.data?.find((t) => t.id === Number(id))?.name ?? 'Technologie')
        .join(' + ');
    if (key === 'arbeitsweise') return arbeitsweisen[value as keyof typeof arbeitsweisen] ?? value;
    return value;
  }
  return (
    <>
      {isHome ? (
        <section className="mb-9 border-b pb-8 md:pb-10">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Gemeinsam Software entwickeln
            </p>
            <h1 className="text-[2rem] leading-[1.15] font-semibold tracking-[-.045em] sm:text-5xl">
              Gute Ideen verdienen
              <br />
              <span className="text-primary">ein gutes Team.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
              Edameh verbindet Menschen für Softwareprojekte. Finde ein Projekt zum Mitmachen oder
              Unterstützung für deine eigene Idee.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href="#entdecken">
                  Anzeigen entdecken
                  <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/anzeigen/neu">
                  Anzeige aufgeben
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <PageHeader
          eyebrow="Projekte & Menschen"
          title="Anzeigen entdecken"
          description="Finde ein Softwareprojekt, das zu deinen Interessen und Technologien passt."
          action={
            <Button asChild>
              <Link to="/anzeigen/neu">
                <Plus />
                Anzeige aufgeben
              </Link>
            </Button>
          }
        />
      )}
      <section
        id="entdecken"
        className="scroll-mt-40 sm:scroll-mt-24"
        aria-label="Anzeigen suchen und filtern"
      >
        {isHome && (
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">Entdecken & mitgestalten</p>
              <h2 className="text-2xl font-semibold">Hier beginnt dein nächstes Projekt.</h2>
            </div>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Offene Ideen. Neue Perspektiven.
            </span>
          </div>
        )}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-4 top-3.5 size-5 text-muted-foreground" />
            <input
              aria-label="Anzeigen suchen"
              className="field h-12 pl-12"
              maxLength={100}
              placeholder="Titel oder Beschreibung durchsuchen …"
              value={params.get('suchbegriff') ?? ''}
              onChange={(e) => update('suchbegriff', e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal />
            Filter{active.length > 0 && ` (${active.length})`}
          </Button>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[248px_minmax(0,1fr)]">
          <aside className="hidden border-r pr-6 lg:block" aria-label="Anzeigen filtern">
            <FilterPanel params={params} update={update} reset={reset} />
          </aside>
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {ads.data
                  ? `${ads.data.totalElements} passende Anzeigen`
                  : 'Anzeigen werden geladen …'}
                {ads.isFetching && !ads.isPending && ' · Aktualisierung …'}
              </p>
              <select
                aria-label="Sortierung"
                className="field w-auto border-none bg-transparent py-1.5"
                value={params.get('sort') ?? 'erstelltAm,desc'}
                onChange={(e) => update('sort', e.target.value)}
              >
                <option value="erstelltAm,desc">Neueste zuerst</option>
                <option value="erstelltAm,asc">Älteste zuerst</option>
              </select>
            </div>
            {active.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {active.map((k) => (
                  <button
                    key={k}
                    onClick={() => update(k, '')}
                    className="badge min-h-11 max-w-full border-primary/20 bg-accent text-primary"
                    aria-label={`Filter ${chip(k)} entfernen`}
                  >
                    <span className="break-all text-left">{chip(k)}</span>
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}
            {ads.isPending ? (
              <Skeleton />
            ) : ads.error ? (
              <ErrorState error={ads.error} retry={() => void ads.refetch()} />
            ) : ads.data.content.length === 0 ? (
              <EmptyState
                title="Keine passenden Anzeigen gefunden"
                description="Versuche einen anderen Suchbegriff oder entferne einzelne Filter."
                action={
                  <Button variant="outline" onClick={reset}>
                    Filter zurücksetzen
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {ads.data.content.map((a) => (
                  <AnzeigeCard key={a.id} anzeige={a} name={a.anzeigename} />
                ))}
              </div>
            )}
            {ads.data && (
              <Pagination
                page={page}
                totalPages={ads.data.totalPages}
                onChange={(p) => update('page', String(p))}
              />
            )}
          </div>
        </div>
      </section>
      <Dialog sheet open={filtersOpen} onOpenChange={setFiltersOpen} title="Anzeigen filtern">
        <FilterPanel params={params} update={update} reset={reset} />
        <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
          Ergebnisse anzeigen
        </Button>
      </Dialog>
    </>
  );
}
