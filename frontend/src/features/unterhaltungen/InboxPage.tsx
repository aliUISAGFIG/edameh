import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Search, MessageSquare, RefreshCw } from 'lucide-react';
import { useConversations } from '@/api/queries';
import { Avatar, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/shared/common';
import { Button } from '@/components/ui/button';
import { datum } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { Conversation } from './Conversation';
export function InboxPage() {
  const { id } = useParams();
  const conversations = useConversations();
  const [term, setTerm] = useState('');
  if (conversations.isPending) return <Skeleton />;
  if (conversations.error)
    return <ErrorState error={conversations.error} retry={() => void conversations.refetch()} />;
  const selected = conversations.data.find((c) => c.id === Number(id));
  const filtered = conversations.data.filter((c) =>
    `${c.anderePerson.anzeigename} ${c.anzeige.titel}`.toLowerCase().includes(term.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        eyebrow="Ein Gespräch. Neue Möglichkeiten."
        title="Nachrichten"
        description="Hier werden aus ersten Kontakten gemeinsame Projekte."
        action={
          <Button variant="outline" size="sm" onClick={() => void conversations.refetch()}>
            <RefreshCw />
            Aktualisieren
          </Button>
        }
      />
      {conversations.data.length === 0 && !id ? (
        <EmptyState
          title="Dein Postfach wartet auf die erste Begegnung"
          description="Entdecke Projekte und Menschen, mit denen du gemeinsam weiterbauen möchtest."
          action={
            <Button asChild>
              <Link to="/anzeigen">Anzeigen entdecken</Link>
            </Button>
          }
        />
      ) : (
        <div className="panel grid min-h-[620px] overflow-hidden lg:grid-cols-[320px_1fr]">
          <aside className={cn('border-r', id ? 'hidden lg:block' : 'block')}>
            <div className="border-b p-5">
              <label className="relative block">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <input
                  aria-label="Unterhaltungen durchsuchen"
                  className="field pl-9"
                  placeholder="Unterhaltungen durchsuchen …"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
              </label>
            </div>
            <nav aria-label="Unterhaltungen" className="space-y-1 p-2">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to={`/nachrichten/${c.id}`}
                  aria-current={Number(id) === c.id ? 'page' : undefined}
                  className={cn(
                    'flex gap-3 rounded-lg p-4 transition-colors hover:bg-muted',
                    Number(id) === c.id ? 'bg-accent/70' : '',
                  )}
                >
                  <Avatar name={c.anderePerson.anzeigename} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-sm font-semibold">
                        {c.anderePerson.anzeigename}
                      </h2>
                      <time className="shrink-0 text-[10px] text-muted-foreground">
                        {datum(c.letzteNachricht.gesendetAm, 'dd. MMM')}
                      </time>
                    </div>
                    <p className="mt-1 truncate text-xs text-primary">{c.anzeige.titel}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">
                        {c.letzteNachricht.inhalt}
                      </p>
                      {c.ungeleseneNachrichten > 0 && (
                        <span
                          aria-label={`${c.ungeleseneNachrichten} ungelesene Nachrichten`}
                          className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground"
                        >
                          {c.ungeleseneNachrichten}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  Keine Unterhaltung gefunden.
                </p>
              )}
            </nav>
          </aside>
          <section className={cn('min-w-0', !id ? 'hidden lg:flex' : 'flex')} aria-label="Gespräch">
            {id ? (
              <Conversation key={id} id={Number(id)} preview={selected} />
            ) : (
              <div className="m-auto p-10 text-center">
                <MessageSquare className="mx-auto mb-5 size-12 text-primary/50" />
                <h2 className="text-xl font-semibold">Raum für gute Gespräche</h2>
                <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                  Wähle eine Unterhaltung und setze euren Austausch fort.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
