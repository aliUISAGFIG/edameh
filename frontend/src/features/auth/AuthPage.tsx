import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Code2, Layers3, Users } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/endpoints';
import { loginSchema, registrationSchema } from '@/lib/validation';
import { applyFormError } from '@/lib/form-errors';
import { safeReturn } from '@/lib/labels';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/shared/common';
import type { Anmeldung, Registrierung } from '@/types/api';

export function AuthPage({ register = false }: { register?: boolean }) {
  return (
    <div className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#24203e] p-12 text-white lg:flex">
        <div>
          <p className="text-xs uppercase tracking-[.25em] text-violet-300">
            Ideen brauchen Menschen.
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight">
            Dein nächstes
            <br />
            Projekt beginnt
            <br />
            <span className="text-violet-300">mit einem Hallo.</span>
          </h1>
          <p className="mt-6 max-w-sm text-sm text-slate-300">
            Finde Menschen, die deine Neugier teilen. Lerne voneinander und baue etwas, das bleibt.
          </p>
        </div>
        <div className="mt-16 space-y-4">
          {[
            [Code2, 'Echte Projekte. Gemeinsame Fortschritte.'],
            [Users, 'Menschen mit unterschiedlichen Stärken.'],
            [Layers3, 'Von der ersten Idee zum Prototyp.'],
          ].map(([Icon, label], i) => {
            const Mark = Icon as typeof Code2;
            return (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-200">
                <Mark size={18} className="text-violet-300" />
                {label as string}
              </div>
            );
          })}
        </div>
        <div
          aria-hidden
          className="absolute -right-32 -top-32 size-80 rounded-full border-[50px] border-white/5"
        />
      </aside>
      <section className="px-6 py-12 sm:px-12 lg:py-16">
        <p className="eyebrow mb-3">
          {register ? 'Dein erster Schritt' : 'Schön, dass du da bist'}
        </p>
        <h2 className="text-3xl font-semibold">
          {register ? 'Gemeinsam mehr schaffen' : 'Willkommen zurück'}
        </h2>
        <p className="mt-3 mb-8 text-sm text-muted-foreground">
          {register
            ? 'Erstelle dein Konto und finde dein nächstes Projekt.'
            : 'Melde dich an. Dein nächstes Projekt wartet.'}
        </p>
        {register ? <RegisterForm /> : <LoginForm />}
      </section>
    </div>
  );
}
export function LoginForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const client = useQueryClient();
  const form = useForm<Anmeldung>({ resolver: zodResolver(loginSchema) });
  async function submit(data: Anmeldung) {
    try {
      const user = await api.login(data);
      client.clear();
      client.setQueryData(['session'], user);
      toast.success('Du bist angemeldet.');
      await navigate(safeReturn(params.get('weiter')));
    } catch (e) {
      applyFormError(e, form.setError);
    }
  }
  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="space-y-5">
      <Field label="E-Mail" id="eMail" error={form.formState.errors.eMail?.message}>
        <Input
          id="eMail"
          type="email"
          autoComplete="email"
          aria-invalid={!!form.formState.errors.eMail}
          aria-describedby="eMail-error"
          {...form.register('eMail')}
        />
      </Field>
      <Field label="Passwort" id="passwort" error={form.formState.errors.passwort?.message}>
        <Input
          id="passwort"
          type="password"
          autoComplete="current-password"
          aria-describedby="passwort-error"
          {...form.register('passwort')}
        />
      </Field>
      {form.formState.errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Wird angemeldet …' : 'Anmelden'}
        <ArrowRight />
      </Button>
      <p className="pt-3 text-center text-sm text-muted-foreground">
        Noch kein Konto?{' '}
        <Link className="link" to={`/registrieren${params.size ? `?${params}` : ''}`}>
          Registrieren
        </Link>
      </p>
    </form>
  );
}
export function RegisterForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const client = useQueryClient();
  const form = useForm<Registrierung>({ resolver: zodResolver(registrationSchema) });
  async function submit(data: Registrierung) {
    try {
      const user = await api.register(data);
      client.clear();
      client.setQueryData(['session'], user);
      toast.success('Willkommen bei Edameh!');
      await navigate(safeReturn(params.get('weiter')));
    } catch (e) {
      applyFormError(e, form.setError);
    }
  }
  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="space-y-4">
      {(
        [
          { name: 'anzeigename', label: 'Anzeigename', type: 'text', auto: 'nickname' },
          { name: 'eMail', label: 'E-Mail', type: 'email', auto: 'email' },
          { name: 'passwort', label: 'Passwort', type: 'password', auto: 'new-password' },
          {
            name: 'passwortBestaetigung',
            label: 'Passwort bestätigen',
            type: 'password',
            auto: 'new-password',
          },
        ] as const
      ).map((f) => (
        <Field
          key={f.name}
          id={f.name}
          label={f.label}
          error={form.formState.errors[f.name]?.message}
        >
          <Input
            id={f.name}
            type={f.type}
            autoComplete={f.auto}
            aria-invalid={!!form.formState.errors[f.name]}
            aria-describedby={`${f.name}-error`}
            {...form.register(f.name)}
          />
        </Field>
      ))}
      {form.formState.errors.root && (
        <p role="alert" className="text-sm text-destructive">
          {form.formState.errors.root.message}
        </p>
      )}
      <Button className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Konto wird erstellt …' : 'Registrieren'}
        <ArrowRight />
      </Button>
      <p className="pt-3 text-center text-sm text-muted-foreground">
        Schon registriert?{' '}
        <Link className="link" to={`/anmelden${params.size ? `?${params}` : ''}`}>
          Anmelden
        </Link>
      </p>
    </form>
  );
}
