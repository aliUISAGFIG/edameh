import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowUpRight, Check, CheckCheck, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { useMe } from '@/api/queries';
import { nachrichtSchema } from '@/lib/validation';
import { applyFormError } from '@/lib/form-errors';
import { datum } from '@/lib/labels';
import { cn } from '@/lib/utils';
import { Avatar, ErrorState, Skeleton } from '@/components/shared/common';
import { Button } from '@/components/ui/button';
import type { UnterhaltungVorschau } from '@/types/api';
export function Conversation({ id, preview }: { id: number; preview?: UnterhaltungVorschau }) {
  const me = useMe(),
    client = useQueryClient();
  const access = useQuery({
    queryKey: ['unterhaltungen', 'access', id],
    queryFn: async () => {
      await api.conversationAccess(id);
      return true;
    },
    retry: false,
  });
  const messages = useQuery({
    queryKey: ['nachrichten', id],
    queryFn: () => api.messages(id, 0),
    enabled: access.isSuccess,
  });
  const [readError, setReadError] = useState(false);
  const markRead = useMutation({
    mutationFn: () => api.readMessages(id),
    onSuccess: async () => {
      setReadError(false);
      await client.invalidateQueries({ queryKey: ['unterhaltungen'] });
    },
    onError: () => setReadError(true),
  });
  const { mutate: mark } = markRead;
  const hasUnread =
    messages.data?.content.some((m) => !m.gelesen && m.absender.id !== me.data?.id) ?? false;
  useEffect(() => {
    if (hasUnread) mark();
  }, [hasUnread, mark]);
  const form = useForm<{ inhalt: string }>({
    resolver: zodResolver(nachrichtSchema),
    defaultValues: { inhalt: '' },
  });
  async function submit(data: { inhalt: string }) {
    try {
      await api.sendMessage(id, data.inhalt);
      form.reset();
      await client.invalidateQueries({ queryKey: ['nachrichten', id] });
      await client.invalidateQueries({ queryKey: ['unterhaltungen'] });
      toast.success('Nachricht wurde gesendet.');
    } catch (e) {
      applyFormError(e, form.setError);
    }
  }
  if (access.error || messages.error)
    return (
      <div className="w-full p-5">
        <ErrorState
          error={access.error ?? messages.error}
          retry={() => {
            void access.refetch();
            void messages.refetch();
          }}
        />
      </div>
    );
  if (access.isPending || messages.isPending)
    return (
      <div className="w-full p-5">
        <Skeleton />
      </div>
    );
  return (
    <div className="flex w-full flex-col">
      <header className="flex items-center gap-3 border-b p-5">
        <Link
          to="/nachrichten"
          className="rounded-md p-1 lg:hidden"
          aria-label="Zurück zum Postfach"
        >
          <ArrowLeft size={20} />
        </Link>
        {preview && (
          <>
            <Avatar name={preview.anderePerson.anzeigename} />
            <div className="min-w-0">
              <Link
                className="text-sm font-semibold hover:text-primary"
                to={`/profile/${preview.anderePerson.id}`}
              >
                {preview.anderePerson.anzeigename}
              </Link>
              <p className="mt-1 truncate text-xs text-muted-foreground">{preview.anzeige.titel}</p>
            </div>
            <Link
              to={`/anzeigen/${preview.anzeige.id}`}
              aria-label="Anzeige ansehen"
              className="ml-auto rounded-lg border p-2 text-primary"
            >
              <ArrowUpRight size={17} />
            </Link>
          </>
        )}
      </header>
      <div
        className="flex max-h-[58dvh] min-h-80 flex-1 flex-col gap-5 overflow-y-auto bg-background/50 p-5 md:p-7"
        aria-label="Nachrichtenverlauf"
      >
        {messages.data?.content.map((m) => {
          const own = m.absender.id === me.data?.id;
          return (
            <motion.article
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id}
              className={cn('max-w-[88%] sm:max-w-[78%]', own ? 'ml-auto' : 'mr-auto')}
            >
              <p className={cn('mb-1.5 text-[11px] text-muted-foreground', own && 'text-right')}>
                {own ? 'Du' : m.absender.anzeigename}
              </p>
              <p
                className={cn(
                  'whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm',
                  own
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm border bg-card',
                )}
              >
                {m.inhalt}
              </p>
              <div
                className={cn(
                  'mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground',
                  own && 'justify-end',
                )}
              >
                <time dateTime={m.gesendetAm}>{datum(m.gesendetAm, 'dd. MMM · HH:mm')}</time>
                {own &&
                  (m.gelesen ? (
                    <>
                      <CheckCheck size={13} />
                      Gelesen
                    </>
                  ) : (
                    <>
                      <Check size={13} />
                      Gesendet
                    </>
                  ))}
              </div>
            </motion.article>
          );
        })}
      </div>
      {messages.data && messages.data.totalPages > 1 && (
        <p className="border-t p-3 text-xs text-muted-foreground">
          Weitere Nachrichtenseiten sind in dieser Vorschau noch nicht verfügbar.
        </p>
      )}
      {readError && (
        <button className="p-3 text-xs text-destructive" onClick={() => mark()}>
          Lesestatus konnte nicht aktualisiert werden. Erneut versuchen.
        </button>
      )}
      <form noValidate onSubmit={form.handleSubmit(submit)} className="border-t p-4">
        <label htmlFor="inhalt" className="sr-only">
          Nachricht
        </label>
        <div className="flex items-end gap-3">
          <textarea
            id="inhalt"
            rows={2}
            maxLength={2000}
            placeholder="Schreib eine Nachricht …"
            className="field min-h-16 flex-1 resize-y"
            aria-describedby="inhalt-error"
            {...form.register('inhalt')}
          />
          <Button
            aria-label={form.formState.isSubmitting ? 'Wird gesendet …' : 'Senden'}
            disabled={form.formState.isSubmitting}
            className="mb-0.5"
          >
            <Send />
            <span className="hidden sm:inline">
              {form.formState.isSubmitting ? 'Wird gesendet …' : 'Senden'}
            </span>
            <span className="sr-only sm:hidden">Senden</span>
          </Button>
        </div>
        {(form.formState.errors.inhalt || form.formState.errors.root) && (
          <p id="inhalt-error" role="alert" className="mt-2 text-xs text-destructive">
            {form.formState.errors.inhalt?.message ?? form.formState.errors.root?.message}
          </p>
        )}
        <p className="mt-2 text-[10px] text-muted-foreground">Nur Text · maximal 2000 Zeichen</p>
      </form>
    </div>
  );
}
