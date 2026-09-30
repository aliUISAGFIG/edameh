import { Link, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { api } from '@/api/endpoints';
import { useMe } from '@/api/queries';
import { Button } from '@/components/ui/button';
import {
  PageHeader,
  EmptyState,
  ErrorState,
  Skeleton,
  Pagination,
} from '@/components/shared/common';
import { cn } from '@/lib/utils';
import { AnzeigeCard } from './AnzeigeCard';
import { OwnActions } from './OwnActions';
export function MyAdsPage() {
  const [params, setParams] = useSearchParams();
  const me = useMe();
  const query = new URLSearchParams(params);
  query.set('size', '6');
  const page = Math.max(0, Number(params.get('page')) || 0);
  const result = useQuery({
    queryKey: ['anzeigen', 'meine', me.data?.id, query.toString()],
    queryFn: () => api.meine(query.toString()),
  });
  return (
    <>
      <PageHeader
        eyebrow="Dein Raum für Ideen"
        title="Meine Anzeigen"
        description="Behalte deine Projekte im Blick. Hier kannst du sie bearbeiten, schließen oder löschen."
        action={
          <Button asChild>
            <Link to="/anzeigen/neu">
              <Plus />
              Anzeige aufgeben
            </Link>
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap justify-between gap-3">
        <div className="inline-flex rounded-lg border bg-card p-1">
          {[
            ['', 'Alle'],
            ['ACTIVE', 'Aktiv'],
            ['CLOSED', 'Geschlossen'],
          ].map(([v, l]) => (
            <button
              key={v}
              aria-pressed={(params.get('status') ?? '') === v}
              className={cn(
                'min-h-11 rounded-md px-4 py-2 text-sm transition-colors',
                (params.get('status') ?? '') === v
                  ? 'bg-accent font-medium text-primary'
                  : 'text-muted-foreground',
              )}
              onClick={() => setParams(v ? { status: v } : {})}
            >
              {l}
            </button>
          ))}
        </div>
        <select
          aria-label="Sortierung"
          className="field w-auto"
          value={params.get('sort') ?? 'erstelltAm,desc'}
          onChange={(e) =>
            setParams((p) => {
              const n = new URLSearchParams(p);
              n.set('sort', e.target.value);
              n.delete('page');
              return n;
            })
          }
        >
          <option value="erstelltAm,desc">Neueste zuerst</option>
          <option value="erstelltAm,asc">Älteste zuerst</option>
        </select>
      </div>
      {result.isPending ? (
        <Skeleton />
      ) : result.error ? (
        <ErrorState error={result.error} retry={() => void result.refetch()} />
      ) : result.data.content.length === 0 ? (
        <EmptyState
          title={
            params.get('status')
              ? 'Keine Anzeigen in dieser Auswahl'
              : 'Hier ist Platz für deine nächste Idee'
          }
          description={
            params.get('status')
              ? 'Wähle „Alle“, um deine anderen Anzeigen zu sehen.'
              : 'Du hast noch keine Anzeigen. Starte mit einer Idee und finde Menschen zum Mitmachen.'
          }
          action={
            params.get('status') ? (
              <Button variant="outline" onClick={() => setParams({})}>
                Alle Anzeigen anzeigen
              </Button>
            ) : (
              <Button asChild>
                <Link to="/anzeigen/neu">Erste Anzeige aufgeben</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {result.data.content.map((a) => (
            <AnzeigeCard key={a.id} anzeige={a}>
              <div className="mt-4 border-t pt-4">
                <OwnActions id={a.id} status={a.status} />
              </div>
            </AnzeigeCard>
          ))}
        </div>
      )}
      {result.data && (
        <Pagination
          page={page}
          totalPages={result.data.totalPages}
          onChange={(p) =>
            setParams((old) => {
              const next = new URLSearchParams(old);
              next.set('page', String(p));
              return next;
            })
          }
        />
      )}
    </>
  );
}
