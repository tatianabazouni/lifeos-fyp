import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { PageHeader, SectionContainer } from '@/components/LayoutComponents';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PrimaryButton, SecondaryButton } from '@/components/AppButtons';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

type Values = z.infer<typeof schema>;

export default function Auth() {
  const { login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === '/register';
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);

  const { register: formRegister, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError('');
    try {
      if (isRegister) {
        await register(values.name || 'User', values.email, values.password);
        navigate('/onboarding');
      } else {
        await login(values.email, values.password);
        navigate('/dashboard');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Unable to continue.');
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4">
      <div className="grid w-full gap-8 md:grid-cols-2">
        <div className="hidden md:block">
          <PageHeader title="LifeOS" subtitle="Your AI-assisted digital life companion for reflection, growth, and meaningful momentum." />
        </div>
        <SectionContainer title={forgot ? 'Forgot Password' : isRegister ? 'Create account' : 'Welcome back'}>
          {forgot ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter your email and we will send a reset link.</p>
              <Input placeholder="you@example.com" />
              <PrimaryButton className="w-full">Send reset link</PrimaryButton>
              <SecondaryButton className="w-full" onClick={() => setForgot(false)}>Back to login</SecondaryButton>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {isRegister && <div><Label>Name</Label><Input {...formRegister('name')} /></div>}
              <div><Label>Email</Label><Input {...formRegister('email')} /></div>
              <div><Label>Password</Label><Input type="password" {...formRegister('password')} /></div>
              {(errors.email || errors.password || errors.name) && <p className="text-xs text-destructive">Please check your form inputs.</p>}
              {error && <p className="text-xs text-destructive">{error}</p>}
              <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}</PrimaryButton>
              {!isRegister && <button type="button" onClick={() => setForgot(true)} className="text-xs text-muted-foreground underline">Forgot password?</button>}
              <p className="text-xs text-muted-foreground">{isRegister ? 'Already have an account?' : "Don't have an account?"} <Link className="text-primary" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Login' : 'Sign up'}</Link></p>
            </form>
          )}
        </SectionContainer>
      </div>
    </div>
  );
}
