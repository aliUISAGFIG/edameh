import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  Code2,
  Braces,
} from 'lucide-react';
import { api } from '@/api/endpoints';
import { useCategories, useMe, useTechnologies } from '@/api/queries';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, ErrorState, Pagination, Skeleton } from '@/components/shared/common';
import { arbeitsweisen, kategorieName } from '@/lib/labels';
import { AnzeigeCard } from './AnzeigeCard';
import { FilterPanel } from './FilterPanel';

export function DiscoverPage() {
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
      <section className="relative mb-9 overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-accent via-card to-card px-6 py-9 md:px-10 md:py-12">
        <div className="relative z-10 max-w-2xl">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Für Menschen, die gerne bauen
          </p>
          <h1 className="text-[2.5rem] leading-[1.12] font-semibold tracking-[-.055em] md:text-[3.65rem]">
            Gute Ideen verdienen
            <br />
            <span className="text-primary">ein gutes Team.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm text-muted-foreground md:text-base">
            Finde dein nächstes Softwareprojekt. Teile dein Wissen, lerne Neues und baue gemeinsam
            weiter.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
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
        <div
          aria-hidden
          className="absolute right-12 top-12 hidden h-60 w-64 rotate-[-8deg] xl:block"
        >
          <div className="absolute inset-5 rounded-full border border-primary/20" />
          <div className="absolute right-0 top-3 flex size-24 items-center justify-center rounded-2xl border border-primary/10 bg-card/90 text-primary shadow-lg">
            <Code2 size={44} />
          </div>
          <div className="absolute bottom-3 left-0 flex size-24 items-center justify-center rounded-2xl border border-primary/10 bg-card/90 text-primary shadow-lg">
            <Braces size={40} />
          </div>
          <span className="absolute left-5 top-3 font-mono text-xs text-primary/50">
            &lt;zusammen /&gt;
          </span>
          <div className="absolute bottom-9 right-0 rounded-full bg-primary/15 px-4 py-2 text-xs text-primary">
            Idee → Projekt
          </div>
        </div>
      </section>
      <section id="entdecken" className="scroll-mt-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Entdecken & mitgestalten</p>
            <h2 className="text-2xl font-semibold">Hier beginnt dein nächstes Projekt.</h2>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Offene Ideen. Neue Perspektiven.
          </span>
        </div>
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
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
        <div className="grid items-start gap-7 lg:grid-cols-[230px_1fr]">
          <aside className="panel hidden p-5 lg:block">
            <FilterPanel params={params} update={update} reset={reset} />
          </aside>
          <div>
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
                    className="badge border-primary/20 bg-accent text-primary"
                    aria-label={`Filter ${chip(k)} entfernen`}
                  >
                    {chip(k)}
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
              <div className="grid gap-4 md:grid-cols-2">
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
