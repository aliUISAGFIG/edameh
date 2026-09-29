import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, MessageSquare, MapPin, Layers3 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { useMockApi } from '@/app/config/env';
import { useAnzeige, useMe, useConversations } from '@/api/queries';
import { Avatar, ErrorState, Skeleton } from '@/components/shared/common';
import { Button } from '@/components/ui/button';
import {
  anzeigentypen,
  arbeitsweisen,
  datum,
  kategorieName,
  projektstaende,
  safeLink,
} from '@/lib/labels';
import { OwnActions } from './OwnActions';
import { StatusBadge } from './AnzeigeCard';
export function DetailPage() {
  const { id } = useParams();
  const result = useAnzeige(Number(id));
  const me = useMe();
  const conversations = useConversations(!!me.data);
  const navigate = useNavigate(),
    client = useQueryClient();
  const start = useMutation({
    mutationFn: () => api.startConversation(Number(id)),
    onSuccess: async (data) => {
      await client.invalidateQueries({ queryKey: ['unterhaltungen'] });
      await navigate(`/nachrichten/${data.id}`);
    },
    onError: (e) => toast.error(e.message),
  });
  if (result.isPending) return <Skeleton />;
  if (result.error) return <ErrorState error={result.error} retry={() => void result.refetch()} />;
  if (!result.data) return null;
  const a = result.data;
  const own = me.data?.id === a.eigentuemer.id;
  const existing = conversations.data?.find((c) => c.anzeige.id === a.id);
  return (
    <>
      <Link
        to="/anzeigen"
        className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={16} />
        Zurück zu den Anzeigen
      </Link>
      <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="panel p-6 md:p-9">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="badge bg-accent text-primary">{anzeigentypen[a.anzeigentyp]}</span>
              <StatusBadge status={a.status} />
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
              {a.titel}
            </h1>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Layers3 size={16} />
                {kategorieName(a.kategorie.name)}
              </span>
              {a.arbeitsweisen.map((value) => (
                <span key={value} className="badge">
                  {arbeitsweisen[value]}
                </span>
              ))}
              {a.standort && (
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {a.standort}
                </span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {a.technologien.map((t) => (
                <span className="badge" key={t.id}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
          <section className="panel mt-5 p-6 md:p-9">
            <h2 className="mb-5 text-xl font-semibold">Über das Projekt</h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {a.beschreibung}
            </p>
          </section>
          <section className="panel mt-5 p-6 md:p-9">
            <h2 className="mb-5 text-xl font-semibold">Auf einen Blick</h2>
            <dl className="grid grid-cols-2 gap-5 text-sm">
              {[
                ['Projektstand', projektstaende[a.projektstand]],
                ['Arbeitsweisen', a.arbeitsweisen.map((value) => arbeitsweisen[value]).join(', ')],
                ['Standort', a.standort ?? 'Nicht angegeben'],
                ['Veröffentlicht', datum(a.erstelltAm)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="mb-1 text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {safeLink(a.projektlink) && (
              <a
                className="link mt-6 inline-flex items-center gap-2 text-sm"
                href={safeLink(a.projektlink)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Projekt ansehen
                <ArrowUpRight size={15} />
              </a>
            )}
          </section>
        </article>
        <aside className="space-y-5">
          <div className="panel p-6">
            <p className="eyebrow mb-5">Erstellt von</p>
            <div className="flex items-center gap-3">
              <Avatar name={a.eigentuemer.anzeigename} />
              <div>
                <p className="font-semibold">{a.eigentuemer.anzeigename}</p>
                <Link className="link text-xs" to={`/profile/${a.eigentuemer.id}`}>
                  Profil ansehen
                </Link>
              </div>
            </div>
            <div className="mt-6 border-t pt-6">
              {own ? (
                <>
                  <h2 className="mb-3 font-semibold">Deine Anzeige</h2>
                  <OwnActions id={a.id} status={a.status} redirect />
                </>
              ) : a.status === 'CLOSED' ? (
                <>
                  <h2 className="font-semibold">Diese Anzeige ist geschlossen</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Neue Anfragen sind nicht mehr möglich.
                  </p>
                  {existing && (
                    <Button asChild className="mt-4 w-full">
                      <Link to={`/nachrichten/${existing.id}`}>Unterhaltung öffnen</Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h2 className="font-semibold">Zusammen weiterbauen?</h2>
                  <p className="mt-2 mb-4 text-sm text-muted-foreground">
                    Erzähl kurz, was dich interessiert und wie du mithelfen möchtest.
                  </p>
                  {useMockApi && me.data && !existing && (
                    <p className="mb-3 text-xs text-muted-foreground">
                      Neue Unterhaltungen sind in dieser Vorschau noch nicht verfügbar. Bestehende
                      Gespräche findest du unter Nachrichten.
                    </p>
                  )}
                  {me.data ? (
                    <Button
                      className="w-full"
                      disabled={start.isPending || (useMockApi && !existing)}
                      onClick={() => start.mutate()}
                    >
                      <MessageSquare />
                      {start.isPending ? 'Wird geöffnet …' : 'Nachricht senden'}
                    </Button>
                  ) : (
                    <>
                      <Button asChild className="w-full">
                        <Link to={`/anmelden?weiter=${encodeURIComponent(`/anzeigen/${a.id}`)}`}>
                          Jetzt anmelden
                          <ArrowUpRight />
                        </Link>
                      </Button>
                      <Link
                        className="link mt-3 block text-center text-sm"
                        to={`/registrieren?weiter=${encodeURIComponent(`/anzeigen/${a.id}`)}`}
                      >
                        Registrieren
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-primary/15 bg-accent/60 p-6">
            <h3 className="font-semibold text-primary">Ein gutes Gespräch ist ein Anfang.</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Bleib konkret und offen. Gemeinsam entscheidet ihr, wie eure Zusammenarbeit aussehen
              soll.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
