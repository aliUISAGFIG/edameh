import { Link, useNavigate, useParams } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { ApiError } from '@/api/client';
import { useAnzeige, useCategories, useMe, useTechnologies } from '@/api/queries';
import { anzeigeSchema, type AnzeigeForm } from '@/lib/validation';
import { applyFormError } from '@/lib/form-errors';
import { anzeigentypen, kategorieName, projektstaende } from '@/lib/labels';
import { ArbeitsweisenField } from './ArbeitsweisenField';
import {
  Field,
  Input,
  MultiSelect,
  PageHeader,
  Skeleton,
  ErrorState,
} from '@/components/shared/common';
import { Button } from '@/components/ui/button';
import type { Anzeige } from '@/types/api';

export function AnzeigeFormPage() {
  const { id } = useParams();
  const query = useAnzeige(id ? Number(id) : NaN);
  const me = useMe();
  if (id && query.isPending) return <Skeleton />;
  if (query.error) return <ErrorState error={query.error} />;
  if (id && query.data?.eigentuemer.id !== me.data?.id)
    return (
      <ErrorState
        error={
          new ApiError({
            status: 403,
            code: 'FORBIDDEN',
            message: 'Nur der Eigentümer darf diese Anzeige bearbeiten.',
            timestamp: '',
            path: '',
            fieldErrors: {},
          })
        }
      />
    );
  return <AnzeigeEditor key={id ?? 'new'} existing={query.data} />;
}
function AnzeigeEditor({ existing }: { existing?: Anzeige }) {
  const navigate = useNavigate(),
    client = useQueryClient();
  const categories = useCategories(),
    technologies = useTechnologies();
  const form = useForm<AnzeigeForm>({
    resolver: zodResolver(anzeigeSchema),
    defaultValues: existing
      ? {
          titel: existing.titel,
          beschreibung: existing.beschreibung,
          anzeigentyp: existing.anzeigentyp,
          kategorieId: existing.kategorie.id,
          projektstand: existing.projektstand,
          arbeitsweisen: existing.arbeitsweisen,
          standort: existing.standort ?? '',
          projektlink: existing.projektlink ?? '',
          technologieIds: existing.technologien.map((t) => t.id),
        }
      : {
          titel: '',
          beschreibung: '',
          anzeigentyp: 'UNTERSTUETZUNG_GESUCHT',
          kategorieId: 0,
          projektstand: 'IDEE_PLANUNG',
          arbeitsweisen: ['REMOTE'],
          standort: '',
          projektlink: '',
          technologieIds: [],
        },
  });
  const errors = form.formState.errors;
  async function submit(values: AnzeigeForm) {
    const data = {
      ...values,
      standort: values.standort || null,
      projektlink: values.projektlink || null,
    };
    try {
      let id = existing?.id;
      if (id) await api.updateAnzeige(id, data);
      else id = (await api.createAnzeige(data)).id;
      await client.invalidateQueries({ queryKey: ['anzeigen'] });
      await client.invalidateQueries({ queryKey: ['profile'] });
      toast.success(existing ? 'Anzeige wurde aktualisiert.' : 'Anzeige wurde erstellt.');
      await navigate(`/anzeigen/${id}`);
    } catch (e) {
      applyFormError(e, form.setError);
    }
  }
  return (
    <>
      <Link
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"
        to={existing ? `/anzeigen/${existing.id}` : '/anzeigen'}
      >
        <ArrowLeft size={15} />
        Zurück
      </Link>
      <PageHeader
        eyebrow={existing ? 'Deine Anzeige' : 'Aus einer Idee wird ein Anfang'}
        title={existing ? 'Anzeige bearbeiten' : 'Anzeige aufgeben'}
        description="Beschreibe, was du vorhast und wobei du Unterstützung suchst."
      />
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_270px]">
        <form noValidate onSubmit={form.handleSubmit(submit)} className="min-w-0 space-y-5">
          <section className="panel space-y-5 p-6">
            <SectionTitle number="01" title="Dein Gesuch" />
            <fieldset>
              <legend className="label">Was suchst du?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(anzeigentypen).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-primary"
                  >
                    <input
                      className="accent-primary"
                      type="radio"
                      value={value}
                      {...form.register('anzeigentyp')}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field
              id="titel"
              label="Titel"
              hint="5–120 Zeichen. Sag kurz, worum es geht."
              error={errors.titel?.message}
            >
              <Input
                id="titel"
                placeholder="z. B. React-Frontend für eine Lernplattform"
                maxLength={120}
                aria-describedby="titel-error"
                {...form.register('titel')}
              />
            </Field>
            <Field id="kategorieId" label="Kategorie" error={errors.kategorieId?.message}>
              <select
                id="kategorieId"
                className="field"
                aria-describedby="kategorieId-error"
                {...form.register('kategorieId', { valueAsNumber: true })}
              >
                <option value={0}>Kategorie auswählen</option>
                {categories.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {kategorieName(c.name)}
                  </option>
                ))}
              </select>
            </Field>
          </section>
          <section className="panel space-y-5 p-6">
            <SectionTitle number="02" title="Details & Technologien" />
            <Field
              id="beschreibung"
              label="Beschreibung"
              hint="20–5000 Zeichen. Was steht schon? Was möchtet ihr gemeinsam erreichen?"
              error={errors.beschreibung?.message}
            >
              <textarea
                id="beschreibung"
                rows={7}
                className="field resize-y"
                maxLength={5000}
                aria-describedby="beschreibung-error"
                {...form.register('beschreibung')}
              />
            </Field>
            <Field id="projektstand" label="Projektstand" error={errors.projektstand?.message}>
              <select id="projektstand" className="field" {...form.register('projektstand')}>
                {Object.entries(projektstaende).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Controller
              control={form.control}
              name="technologieIds"
              render={({ field }) => (
                <MultiSelect
                  options={technologies.data ?? []}
                  value={field.value}
                  onChange={field.onChange}
                  max={10}
                  error={errors.technologieIds?.message}
                />
              )}
            />
            <Field
              id="projektlink"
              label="Projektlink (optional)"
              error={errors.projektlink?.message}
            >
              <Input
                id="projektlink"
                type="url"
                placeholder="https://…"
                aria-describedby="projektlink-error"
                {...form.register('projektlink')}
              />
            </Field>
          </section>
          <section className="panel space-y-5 p-6">
            <SectionTitle number="03" title="Zusammenarbeit" />
            <Controller
              control={form.control}
              name="arbeitsweisen"
              render={({ field }) => (
                <ArbeitsweisenField
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  error={errors.arbeitsweisen?.message}
                />
              )}
            />
            <Field
              id="standort"
              label="Standort"
              hint="Bei Vor Ort und Hybrid erforderlich. Die Stadt genügt."
              error={errors.standort?.message}
            >
              <Input
                id="standort"
                maxLength={120}
                aria-describedby="standort-error"
                {...form.register('standort')}
              />
            </Field>
          </section>
          {(categories.error || technologies.error) && (
            <ErrorState
              error={categories.error ?? technologies.error}
              retry={() => {
                void categories.refetch();
                void technologies.refetch();
              }}
            />
          )}
          {errors.root && (
            <p role="alert" className="text-sm text-destructive">
              {errors.root.message}
            </p>
          )}
          <div className="form-actions">
            <Button variant="outline" asChild>
              <Link to={existing ? `/anzeigen/${existing.id}` : '/anzeigen'}>Abbrechen</Link>
            </Button>
            <Button
              disabled={form.formState.isSubmitting || !categories.data || !technologies.data}
            >
              {form.formState.isSubmitting
                ? 'Wird gespeichert …'
                : existing
                  ? 'Änderungen speichern'
                  : 'Anzeige veröffentlichen'}
              <ArrowRight />
            </Button>
          </div>
        </form>
        <aside>
          <div className="sticky top-24 rounded-xl border border-primary/15 bg-accent/50 p-6">
            <Lightbulb className="mb-4 text-primary" />
            <h2 className="text-lg font-semibold">
              Klar beschrieben.
              <br />
              Schneller gefunden.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Ein konkreter Titel hilft den richtigen Menschen, dein Projekt zu entdecken.
            </p>
            <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
              <li>1. Erzähl, was bereits vorhanden ist.</li>
              <li>2. Beschreibe, welche Unterstützung du suchst.</li>
              <li>3. Nenne die Technologien, mit denen ihr arbeitet.</li>
            </ol>
            <p className="mt-6 border-t pt-5 text-xs text-muted-foreground">
              Nach dem Veröffentlichen kannst du deine Anzeige unter „Meine Anzeigen“ bearbeiten
              oder schließen.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-semibold">
      <span className="rounded-lg bg-accent px-2.5 py-1.5 text-xs text-primary">{number}</span>
      {title}
    </h2>
  );
}
