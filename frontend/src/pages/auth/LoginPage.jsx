import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';
import { homeFor, useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui/primitives';
import { Field } from '@/components/forms/Field';
import { FormAlert } from '@/components/forms/FormAlert';
import { PasswordInput } from '@/components/forms/PasswordInput';
import { emailField } from '@/utils/validation';

const schema = z.object({ email: emailField, password: z.string().min(1, 'Password is required').max(128) });

/** Only same-site relative redirects (prevents open redirects via ?next=). */
const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : null);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState(null);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      const me = await login(v.email, v.password);
      navigate(safeNext(params.get('next')) ?? homeFor(me), { replace: true });
    } catch (e) {
      setError(e);
    }
  });

  return (
    <>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">Valuers Ecosystem</p>
      <h1 className="font-display mt-2 text-3xl tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Use the account your valuation firm created for you.</p>
      {params.get('expired') && (
        <FormAlert tone="warning" className="mt-4">
          Your session has expired. Please sign in again.
        </FormAlert>
      )}
      <FormAlert error={error} className="mt-4" />
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="username" autoFocus aria-invalid={!!errors.email} {...form.register('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput id="password" autoComplete="current-password" aria-invalid={!!errors.password} {...form.register('password')} />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        <Link to="/status" className="hover:text-foreground">
          System status
        </Link>
      </p>
    </>
  );
}
