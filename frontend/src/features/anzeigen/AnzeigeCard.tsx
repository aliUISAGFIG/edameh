import { Link } from 'react-router';
import {
  ArrowUpRight,
  MapPin,
  Layers3,
  Code2,
  Database,
  Smartphone,
  Palette,
  Boxes,
} from 'lucide-react';
import { useAnzeige } from '@/api/queries';
import type { AnzeigeListe, Anzeigenstatus } from '@/types/api';
import { anzeigentypen, arbeitsweisen, datum, kategorieName, projektstaende } from '@/lib/labels';
import { Avatar } from '@/components/shared/common';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
export function StatusBadge({ status }: { status: Anzeigenstatus }) {
  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        status === 'ACTIVE'
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'bg-muted text-muted-foreground',
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status === 'ACTIVE' ? 'Aktiv' : 'Geschlossen'}
    </Badge>
  );
}
export function AnzeigeCard({
  anzeige,
  name,
  children,
}: {
  anzeige: AnzeigeListe;
  name?: string;
  children?: React.ReactNode;
}) {
  const detail = useAnzeige(anzeige.id);
  const Icon =
    (
      {
        BACKEND: Database,
        FRONTEND: Code2,
        FULL_STACK: Boxes,
        MOBILE: Smartphone,
        UI_UX: Palette,
      } as Record<string, typeof Code2>
    )[anzeige.kategorie.name] ?? Layers3;
  return (
    <article className="panel group flex h-full flex-col p-5 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md md:p-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
            <Icon size={18} />
          </span>
          {kategorieName(anzeige.kategorie.name)}
        </span>
        {anzeige.status === 'CLOSED' ? (
          <StatusBadge status={anzeige.status} />
        ) : (
          detail.data && (
            <span className="text-[10px] font-medium text-primary">
              {anzeigentypen[detail.data.anzeigentyp]}
            </span>
          )
        )}
      </div>
      <Link to={`/anzeigen/${anzeige.id}`} className="group/title">
        <h2 className="text-lg leading-snug font-semibold group-hover/title:text-primary">
          {anzeige.titel}
        </h2>
      </Link>
      <p className="mt-3 mb-4 line-clamp-2 text-sm text-muted-foreground">
        {anzeige.beschreibungKurz}
      </p>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {anzeige.technologien.map((t) => (
          <span key={t.id} className="badge">
            {t.name}
          </span>
        ))}
      </div>
      <div className="mt-auto space-y-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-1.5" aria-label="Arbeitsweisen">
          {anzeige.arbeitsweisen.map((value) => (
            <span key={value} className="badge">
              {arbeitsweisen[value]}
            </span>
          ))}
        </div>
        {anzeige.standort && (
          <p className="flex items-center gap-2">
            <MapPin size={13} />
            {anzeige.standort}
          </p>
        )}
        <p className="flex items-center gap-2">
          <Layers3 size={13} />
          {projektstaende[anzeige.projektstand]}
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2.5">
          {name && <Avatar name={name} />}
          <div>
            {name && <p className="text-xs font-medium">{name}</p>}
            <p className="text-[11px] text-muted-foreground">{datum(anzeige.erstelltAm)}</p>
          </div>
        </div>
        <Link
          aria-label={`${anzeige.titel} öffnen`}
          to={`/anzeigen/${anzeige.id}`}
          className="rounded-full bg-muted p-2 text-muted-foreground transition-colors group-hover:bg-accent group-hover:text-primary"
        >
          <ArrowUpRight size={17} />
        </Link>
      </div>
      {children}
    </article>
  );
}
