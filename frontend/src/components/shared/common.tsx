import { useId, useState, type ReactNode, type ComponentProps } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowLeft, ArrowRight, Search, CircleAlert, Inbox } from 'lucide-react';
import { ApiError } from '@/api/client';
import type { Katalogeintrag } from '@/types/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Avatar({ name, large = false }: { name: string; large?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-primary',
        large ? 'size-24 text-3xl' : 'size-9 text-xs',
      )}
    >
      {name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0])
        .join('')
        .toUpperCase()}
    </span>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      {' '}
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel py-16 px-6 text-center">
      <Inbox className="mx-auto mb-4 size-10 text-primary" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 mb-5 max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
export function ErrorState({ error, retry }: { error: unknown; retry?: () => void }) {
  const location = useLocation();
  const status = error instanceof ApiError ? error.status : 0;
  const title =
    status === 401
      ? 'Bitte melde dich an'
      : status === 403
        ? 'Dieser Bereich ist geschützt'
        : status === 404
          ? 'Nicht gefunden'
          : status === 409
            ? 'Diese Aktion ist gerade nicht möglich'
            : 'Das hat leider nicht geklappt';
  return (
    <div role="alert" className="panel p-10 text-center">
      <CircleAlert className="mx-auto mb-4 text-destructive" />
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 mb-6 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : 'Bitte versuche es noch einmal.'}
      </p>
      <div className="flex justify-center gap-3">
        {status === 401 ? (
          <Button asChild>
            <Link
              to={`/anmelden?weiter=${encodeURIComponent(location.pathname + location.search)}`}
            >
              Anmelden
            </Link>
          </Button>
        ) : (
          retry && <Button onClick={retry}>Erneut versuchen</Button>
        )}
        <Button variant="outline" asChild>
          <Link to="/anzeigen">Zu den Anzeigen</Link>
        </Button>
      </div>
    </div>
  );
}
export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Wird geladen" className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="panel space-y-4 p-6 motion-safe:animate-pulse">
          <div className="h-4 w-1/4 rounded bg-muted" />
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages < 2) return null;
  return (
    <nav aria-label="Seitennavigation" className="mt-7 flex items-center justify-between gap-3">
      <Button variant="outline" disabled={page === 0} onClick={() => onChange(page - 1)}>
        <ArrowLeft />
        Zurück
      </Button>
      <span className="text-xs text-muted-foreground">
        Seite {page + 1} von {totalPages}
      </span>
      <Button
        variant="outline"
        disabled={page + 1 >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Weiter
        <ArrowRight />
      </Button>
    </nav>
  );
}
export function Field({
  label,
  error,
  hint,
  children,
  id,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
export function Input(props: ComponentProps<'input'>) {
  return <input {...props} className={cn('field', props.className)} />;
}
export function MultiSelect({
  options,
  value,
  onChange,
  max = 20,
  error,
}: {
  options: Katalogeintrag[];
  value: number[];
  onChange: (value: number[]) => void;
  max?: number;
  error?: string;
}) {
  const [term, setTerm] = useState('');
  const id = useId();
  return (
    <fieldset className="min-w-0">
      <legend className="label">Technologien</legend>
      <div className="rounded-lg border bg-card p-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Technologien suchen"
            placeholder="Technologie suchen …"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
          {options
            .filter((t) => t.name.toLowerCase().includes(term.toLowerCase()))
            .map((t) => (
              <label
                key={t.id}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs',
                  value.includes(t.id)
                    ? 'border-primary/40 bg-accent text-primary'
                    : 'hover:bg-muted',
                )}
              >
                <input
                  type="checkbox"
                  checked={value.includes(t.id)}
                  disabled={!value.includes(t.id) && value.length >= max}
                  onChange={() =>
                    onChange(
                      value.includes(t.id) ? value.filter((v) => v !== t.id) : [...value, t.id],
                    )
                  }
                  aria-describedby={error ? id : undefined}
                  className="accent-primary"
                />
                {t.name}
              </label>
            ))}
        </div>
        {options.filter((t) => t.name.toLowerCase().includes(term.toLowerCase())).length === 0 && (
          <p className="py-3 text-xs text-muted-foreground">Keine Technologie gefunden.</p>
        )}
      </div>
      <p
        id={id}
        className={cn('mt-1.5 text-xs', error ? 'text-destructive' : 'text-muted-foreground')}
      >
        {error ?? `${value.length} von ${max} ausgewählt`}
      </p>
    </fieldset>
  );
}
