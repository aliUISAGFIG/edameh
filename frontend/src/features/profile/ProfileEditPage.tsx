import { Link, useNavigate } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { useMe, useTechnologies } from '@/api/queries';
import { profilSchema, type ProfilForm } from '@/lib/validation';
import { applyFormError } from '@/lib/form-errors';
import { arbeitsweisen } from '@/lib/labels';
import { Button } from '@/components/ui/button';
import {
  ErrorState,
  Field,
  Input,
  MultiSelect,
  PageHeader,
  Skeleton,
} from '@/components/shared/common';
import type { EigenesProfil } from '@/types/api';
export function ProfileEditPage() {
  const me = useMe();
  const profile = useQuery({ queryKey: ['profile', me.data?.id], queryFn: api.profile });
  if (profile.isPending) return <Skeleton />;
  if (profile.error) return <ErrorState error={profile.error} />;
  return <Editor profile={profile.data} />;
}
function Editor({ profile }: { profile: EigenesProfil }) {
  const navigate = useNavigate(),
    client = useQueryClient();
  const technologies = useTechnologies();
  const form = useForm<ProfilForm>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      anzeigename: profile.anzeigename,
      ueberMich: profile.ueberMich ?? '',
      standort: profile.standort ?? '',
      arbeitsweise: profile.arbeitsweise ?? '',
      githubLink: profile.githubLink ?? '',
      linkedinLink: profile.linkedinLink ?? '',
      technologieIds: profile.technologien.map((t) => t.id),
    },
  });
  const errors = form.formState.errors;
  async function submit(data: ProfilForm) {
    try {
      await api.updateProfile({
        ...data,
        ueberMich: data.ueberMich || null,
        standort: data.standort || null,
        arbeitsweise: data.arbeitsweise || null,
        githubLink: data.githubLink || null,
        linkedinLink: data.linkedinLink || null,
      });
      await client.invalidateQueries();
      toast.success('Profil wurde aktualisiert.');
      await navigate('/profil');
    } catch (e) {
      applyFormError(e, form.setError);
    }
  }
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Zeig, was dich ausmacht"
        title="Profil bearbeiten"
        description="Erzähle etwas über dich und die Technologien, mit denen du gerne arbeitest."
      />
      <form noValidate className="panel space-y-6 p-6 md:p-8" onSubmit={form.handleSubmit(submit)}>
        <Field
          label="Anzeigename"
          id="anzeigename"
          hint="3–50 Zeichen. So sehen dich andere."
          error={errors.anzeigename?.message}
        >
          <Input
            id="anzeigename"
            maxLength={50}
            aria-describedby="anzeigename-error"
            {...form.register('anzeigename')}
          />
        </Field>
        <Field
          label="Über mich"
          id="ueberMich"
          hint="Optional · maximal 1000 Zeichen."
          error={errors.ueberMich?.message}
        >
          <textarea
            id="ueberMich"
            className="field"
            rows={5}
            maxLength={1000}
            aria-describedby="ueberMich-error"
            {...form.register('ueberMich')}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Standort" id="standort" error={errors.standort?.message}>
            <Input id="standort" maxLength={120} {...form.register('standort')} />
          </Field>
          <Field label="Bevorzugte Arbeitsweise" id="arbeitsweise">
            <select id="arbeitsweise" className="field" {...form.register('arbeitsweise')}>
              <option value="">Keine Angabe</option>
              {Object.entries(arbeitsweisen).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Controller
          control={form.control}
          name="technologieIds"
          render={({ field }) => (
            <MultiSelect
              options={technologies.data ?? []}
              value={field.value}
              onChange={field.onChange}
              error={errors.technologieIds?.message}
            />
          )}
        />
        {(['githubLink', 'linkedinLink'] as const).map((name) => (
          <Field
            key={name}
            label={name === 'githubLink' ? 'GitHub-Link (optional)' : 'LinkedIn-Link (optional)'}
            id={name}
            error={errors[name]?.message}
          >
            <Input
              id={name}
              type="url"
              placeholder="https://…"
              aria-describedby={`${name}-error`}
              {...form.register(name)}
            />
          </Field>
        ))}
        {technologies.error && (
          <ErrorState error={technologies.error} retry={() => void technologies.refetch()} />
        )}{' '}
        {errors.root && (
          <p role="alert" className="text-sm text-destructive">
            {errors.root.message}
          </p>
        )}
        <div className="form-actions">
          <Button asChild variant="outline">
            <Link to="/profil">Abbrechen</Link>
          </Button>
          <Button disabled={form.formState.isSubmitting || !technologies.data}>
            {form.formState.isSubmitting ? 'Wird gespeichert …' : 'Änderungen speichern'}
          </Button>
        </div>
      </form>
    </div>
  );
}
