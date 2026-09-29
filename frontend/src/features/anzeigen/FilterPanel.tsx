import { useId } from 'react';
import { useCategories, useTechnologies } from '@/api/queries';
import { arbeitsweisen, kategorieName } from '@/lib/labels';
import { Field, Input, MultiSelect } from '@/components/shared/common';
import { Button } from '@/components/ui/button';
export function FilterPanel({
  params,
  update,
  reset,
}: {
  params: URLSearchParams;
  update: (key: string, value: string) => void;
  reset: () => void;
}) {
  const id = useId();
  const categories = useCategories(),
    technologies = useTechnologies();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Suche verfeinern</h2>
        <button className="link text-xs" onClick={reset}>
          Zurücksetzen
        </button>
      </div>
      <Field id={`${id}-kategorie`} label="Kategorie">
        <select
          id={`${id}-kategorie`}
          className="field"
          value={params.get('kategorieId') ?? ''}
          onChange={(e) => update('kategorieId', e.target.value)}
        >
          <option value="">Alle Kategorien</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {kategorieName(c.name)}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${id}-arbeitsweise`} label="Arbeitsweise">
        <select
          id={`${id}-arbeitsweise`}
          className="field"
          value={params.get('arbeitsweise') ?? ''}
          onChange={(e) => update('arbeitsweise', e.target.value)}
        >
          <option value="">Alle Arbeitsweisen</option>
          {Object.entries(arbeitsweisen).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${id}-standort`} label="Standort">
        <Input
          id={`${id}-standort`}
          placeholder="z. B. Berlin"
          maxLength={120}
          value={params.get('standort') ?? ''}
          onChange={(e) => update('standort', e.target.value)}
        />
      </Field>
      <MultiSelect
        options={technologies.data ?? []}
        value={(params.get('technologieIds') ?? '').split(',').filter(Boolean).map(Number)}
        onChange={(ids) => update('technologieIds', ids.join(','))}
      />
      <p className="text-xs text-muted-foreground">
        Anzeigen müssen alle ausgewählten Technologien enthalten.
      </p>
      {(categories.error || technologies.error) && (
        <div role="alert">
          <p className="text-xs text-destructive">Auswahldaten konnten nicht geladen werden.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void categories.refetch();
              void technologies.refetch();
            }}
          >
            Erneut laden
          </Button>
        </div>
      )}
    </div>
  );
}
