import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MOBILE_REGEX = /^01[3-9]\d{8}$/;

export default function StudentLogin() {
  const navigate = useNavigate();
  const { studentLogin, user } = useAuth();
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.type === 'student') {
      navigate('/student/dashboard', { replace: true });
    } else if (user?.type === 'admin' || user?.role) {
      navigate('/admin/overview', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = mobile.trim();
    if (!trimmed) {
      setError('Please enter your mobile number to check your application status.');
      return;
    }
    if (!MOBILE_REGEX.test(trimmed)) {
      setError('That doesn\'t look like a valid 11-digit mobile number (01XXXXXXXXX).');
      return;
    }

    setLoading(true);
    try {
      await studentLogin({ mobile: trimmed });
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'We could not find your application. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased relative overflow-hidden">
      <div className="absolute -top-[15%] -left-[15%] w-[70%] h-[45%] bg-primary/10 rounded-[100%] blur-3xl pointer-events-none" />
      <div className="absolute -bottom-[15%] -right-[15%] w-[70%] h-[45%] bg-secondary/10 rounded-[100%] blur-3xl pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 w-full max-w-md mx-auto z-10">
        <div className="w-full bg-surface border border-outline-variant/60 rounded-3xl shadow-[0_16px_50px_-16px_rgba(0,53,95,0.18)] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

          <div className="p-6 md:p-8 flex flex-col gap-6">
            <header className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
              </div>
              <div>
                <h1 className="text-headline-lg text-on-surface font-bold tracking-tight">Check Your Course Status</h1>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Enter the mobile number you used when you applied to see your application status.
                </p>
              </div>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 animate-fade-in-up">
                  <span className="material-symbols-outlined shrink-0 mt-0.5">error</span>
                  <div className="flex-1">
                    <p className="text-label-md font-semibold">We couldn't sign you in</p>
                    <p className="text-body-sm mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md text-on-surface font-semibold" htmlFor="student-mobile">Mobile Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">phone_iphone</span>
                  <input
                    id="student-mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, ''))}
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-surface text-body-md text-on-surface placeholder:text-outline-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                      error ? 'border-error' : 'border-outline-variant'
                    }`}
                  />
                </div>
                <p className="text-body-sm text-on-surface-variant">No password needed — just your number.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 rounded-xl bg-primary text-on-primary text-label-md font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check My Status
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-outline-variant/40 pt-4 flex flex-col gap-3">
              <Link to="/register/step1" className="w-full h-10 rounded-xl border border-outline-variant text-on-surface text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                New here? Apply for a course
              </Link>
              <Link to="/" className="text-center text-label-md text-primary hover:underline">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant/80">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span className="text-body-sm">Your information is secure</span>
        </p>
      </main>
    </div>
  );
}
