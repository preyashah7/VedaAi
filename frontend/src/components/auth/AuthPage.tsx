'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { authenticateUser, registerUser } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

export const AuthPage = ({ mode }: AuthPageProps): JSX.Element => {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage(null);

    if (isSignup && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = isSignup
        ? registerUser({ name, schoolName, email, password })
        : authenticateUser({ email, password });

      signIn(user);
      router.push('/assignments');
    } catch (submitError) {
      setErrorMessage(submitError instanceof Error ? submitError.message : 'Unable to continue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,121,80,0.18),transparent_34%),linear-gradient(180deg,#F8F4EE_0%,#F3F1EA_100%)] px-4 py-6 text-veda-dark md:px-6 md:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(48,48,48,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(160deg,#1F1F1F_0%,#303030_48%,#4D261B_100%)] px-6 py-10 text-white md:px-10 md:py-12">
          <div className="absolute -right-16 top-12 h-40 w-40 rounded-full bg-[#FF7950]/20 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-[#C0350A]/20 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#FF7950_0%,#C0350A_100%)] text-xl font-semibold text-white shadow-lg shadow-[#C0350A]/30">
                  V
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-wide">VedaAI</p>
                  <p className="text-sm text-white/70">AI assessment creator</p>
                </div>
              </div>

              <div className="max-w-md space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                  <Sparkles size={14} />
                  Faster classroom workflows
                </span>
                <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Build, generate, and manage papers without leaving the flow.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-white/72 md:text-base">
                  Create assignments, track generation progress, and keep everything in one workspace designed for teachers.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                'Clean paper generation flow',
                'Reusable assignment history',
                'Teacher-friendly dashboard access',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/82 backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#FBFAF8] px-6 py-10 md:px-10">
          <div className="w-full max-w-md rounded-[28px] border border-[#E8E3DD] bg-white p-6 shadow-[0_18px_40px_rgba(48,48,48,0.08)] md:p-8">
            <div className="mb-8 space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-veda-red">
                {isSignup ? 'Create account' : 'Welcome back'}
              </p>
              <h2 className="text-3xl font-semibold text-veda-dark">
                {isSignup ? 'Sign up for VedaAI' : 'Log in to continue'}
              </h2>
              <p className="text-sm leading-6 text-veda-label">
                {isSignup
                  ? 'Set up your teacher workspace and save a local demo session in this browser.'
                  : 'Use your saved account to continue creating and tracking assignments.'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignup ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-veda-dark">
                    <span>Your name</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#E2DDD6] bg-[#FCFBF9] px-4 py-3">
                      <UserRound size={16} className="text-veda-label" />
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full bg-transparent outline-none placeholder:text-veda-label"
                        placeholder="Teacher name"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-veda-dark">
                    <span>School name</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-[#E2DDD6] bg-[#FCFBF9] px-4 py-3">
                      <ShieldCheck size={16} className="text-veda-label" />
                      <input
                        value={schoolName}
                        onChange={(event) => setSchoolName(event.target.value)}
                        className="w-full bg-transparent outline-none placeholder:text-veda-label"
                        placeholder="School or academy"
                        autoComplete="organization"
                        required
                      />
                    </div>
                  </label>
                </div>
              ) : null}

              <label className="space-y-2 text-sm font-medium text-veda-dark">
                <span>Email address</span>
                <div className="flex items-center gap-3 rounded-2xl border border-[#E2DDD6] bg-[#FCFBF9] px-4 py-3">
                  <ShieldCheck size={16} className="text-veda-label" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-veda-label"
                    placeholder="teacher@school.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="space-y-2 text-sm font-medium text-veda-dark">
                <span>Password</span>
                <div className="flex items-center gap-3 rounded-2xl border border-[#E2DDD6] bg-[#FCFBF9] px-4 py-3">
                  <ShieldCheck size={16} className="text-veda-label" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent outline-none placeholder:text-veda-label"
                    placeholder="••••••••"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    required
                  />
                </div>
              </label>

              {isSignup ? (
                <label className="space-y-2 text-sm font-medium text-veda-dark">
                  <span>Confirm password</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-[#E2DDD6] bg-[#FCFBF9] px-4 py-3">
                    <ShieldCheck size={16} className="text-veda-label" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full bg-transparent outline-none placeholder:text-veda-label"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </label>
              ) : null}

              {errorMessage ? <p className="rounded-2xl bg-[#FFF6F3] px-4 py-3 text-sm text-veda-red">{errorMessage}</p> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={16} />
                {isSubmitting ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-veda-label">
              {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
              <Link href={isSignup ? '/login' : '/signup'} className="font-semibold text-veda-dark underline-offset-4 hover:underline">
                {isSignup ? 'Log in' : 'Sign up'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};