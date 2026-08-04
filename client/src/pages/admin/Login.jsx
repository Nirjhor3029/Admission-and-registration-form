import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data.email, data.password);
      if (user?.role === 'super_admin' || user?.role === 'admission_officer' || user?.role === 'accountant') {
        navigate('/admin/overview', { replace: true });
      } else {
        setServerError('Access denied. Admin credentials required.');
      }
    } catch {
      setServerError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-10 bg-background antialiased relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl absolute -top-[20%] -left-[10%]" />
        <div className="w-[600px] h-[600px] bg-surface-variant/20 rounded-full blur-3xl absolute -bottom-[10%] -right-[10%]" />
      </div>

      <main className="w-full max-w-md z-10">
        <div className="bg-surface border border-outline-variant/50 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,53,95,0.05)] p-8 flex flex-col gap-8">
          <header className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-2 border border-outline-variant/30">
              <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <h1 className="text-headline-xl text-primary tracking-tight font-bold">SARS</h1>
            <p className="text-body-md text-on-surface-variant">Administrator Portal</p>
          </header>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm">
                {serverError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface font-semibold" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">mail</span>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@institution.edu"
                  className={`w-full h-12 pl-12 pr-4 rounded-lg border ${errors.email ? 'border-error' : 'border-outline-variant'} bg-surface text-on-surface text-body-md placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
                  {...register('email')}
                />
              </div>
              {errors.email && <span className="text-body-sm text-error">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-md text-on-surface font-semibold" htmlFor="password">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-12 pr-12 rounded-lg border ${errors.password ? 'border-error' : 'border-outline-variant'} bg-surface text-on-surface text-body-md placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`}
                  {...register('password')}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                </button>
              </div>
              {errors.password && <span className="text-body-sm text-error">{errors.password.message}</span>}
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-4 h-4 border border-outline-variant rounded bg-surface checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                  />
                  <span className="material-symbols-outlined absolute text-[12px] text-on-primary opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>check</span>
                </div>
                <span className="text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
              </label>
              <a className="text-label-sm text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-4 bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to Console'}
              {!isSubmitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant/80">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span className="text-body-sm">Secure 256-bit Encrypted Connection</span>
        </div>
      </main>
    </div>
  );
}
