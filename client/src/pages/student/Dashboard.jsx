import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api, { downloadFile } from '../../services/api';

const STATUS_META = {
  draft: { label: 'Draft', color: 'bg-surface-variant text-on-surface border-outline-variant', icon: 'edit_note', dot: 'bg-on-surface-variant' },
  pending: { label: 'Pending', color: 'bg-secondary-container/50 text-on-secondary-container border-secondary-container/50', icon: 'pending_actions', dot: 'bg-secondary' },
  payment_under_review: { label: 'Under Review', color: 'bg-secondary-container/50 text-on-secondary-container border-secondary-container/50', icon: 'manage_search', dot: 'bg-secondary' },
  payment_verified: { label: 'Payment Verified', color: 'bg-tertiary-container/30 text-tertiary border-tertiary-container', icon: 'verified', dot: 'bg-tertiary' },
  admitted: { label: 'Admitted', color: 'bg-tertiary-container/40 text-tertiary border-tertiary-container', icon: 'how_to_reg', dot: 'bg-tertiary' },
  rejected: { label: 'Rejected', color: 'bg-error-container/30 text-error border-error-container', icon: 'cancel', dot: 'bg-error' },
  cancelled: { label: 'Cancelled', color: 'bg-surface-variant text-on-surface-variant border-outline-variant', icon: 'block', dot: 'bg-outline' },
};

const STATUS_HELP = {
  draft: 'You saved a draft. Finish submitting your payment to send your application.',
  pending: 'Your application is registered. Submit your payment to move forward.',
  payment_under_review: 'We received your payment. Our team verifies it within a few working hours.',
  payment_verified: 'Your payment is verified. Admission confirmation is coming soon.',
  admitted: 'Congratulations! You are officially admitted. Download your admission letter below.',
  rejected: 'Your payment could not be approved. Please contact our support team.',
  cancelled: 'This application was cancelled.',
};

const methodLabel = (m) => {
  if (m === 'bkash') return 'bKash';
  if (m === 'nagad') return 'Nagad';
  return m || '—';
};

const methodBadge = (m) => {
  if (m === 'bkash') return 'bg-[#E2136E]/10 text-[#E2136E]';
  if (m === 'nagad') return 'bg-[#F6921E]/10 text-[#F6921E]';
  return 'bg-surface-variant text-on-surface-variant';
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatMoney = (n) => (n === null || n === undefined ? '—' : `৳${Number(n).toLocaleString()}`);

function CopyButton({ text, copied, onCopy }) {
  return (
    <button
      type="button"
      onClick={() => onCopy()}
      disabled={!text}
      title="Copy"
      className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center transition-colors disabled:opacity-40 ${
        copied ? 'text-tertiary' : 'text-on-surface-variant hover:bg-surface-variant hover:text-primary'
      }`}
    >
      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
        {copied ? 'check' : 'content_copy'}
      </span>
    </button>
  );
}

function StatusStepper({ status }) {
  const steps = [
    { key: 'applied', label: 'Applied', done: true },
    { key: 'payment', label: 'Payment', done: ['pending', 'payment_under_review', 'payment_verified', 'admitted'].includes(status) },
    { key: 'review', label: 'Review', done: ['payment_verified', 'admitted'].includes(status), active: status === 'payment_under_review' },
    { key: 'admitted', label: 'Admitted', done: status === 'admitted' },
  ];

  return (
    <div className="flex items-center gap-1 mt-4">
      {steps.map((step, i) => (
        <div key={step.key} className="flex-1 flex items-center">
          <div className="flex flex-col items-center gap-1 w-full">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] transition-all ${
                step.done
                  ? 'bg-tertiary text-on-tertiary'
                  : step.active
                    ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary/30'
                    : 'bg-surface-variant text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {step.done ? 'check' : step.active ? 'hourglass_top' : 'more_horiz'}
              </span>
            </div>
            <span className={`text-[10px] tracking-wide ${step.done ? 'text-tertiary font-semibold' : step.active ? 'text-secondary font-semibold' : 'text-on-surface-variant'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 -mt-4 mb-4 ${steps[i + 1].done ? 'bg-tertiary' : 'bg-outline-variant/60'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ApplicationCard({ app }) {
  const meta = STATUS_META[app.status] || STATUS_META.pending;
  const course = app.course_id || {};
  const level = app.level_id || {};
  const batch = app.batch_id || {};
  const payment = app.payment;
  const [copiedKey, setCopiedKey] = useState('');
  const [downloading, setDownloading] = useState('');
  const isRejected = app.status === 'rejected' || payment?.status === 'rejected';

  const copyText = async (text, label, key) => {
    if (!text) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (ok) {
      toast.success(`${label} copied`);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1600);
    } else {
      toast.error('Could not copy. Please copy manually.');
    }
  };

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      const params = { application_id: app._id };
      if (type === 'invoice') {
        await downloadFile('/student/invoice', params, `invoice-${app._id}.pdf`);
      } else {
        await downloadFile('/student/admission-letter', params, `admission-letter-${app._id}.pdf`);
      }
      toast.success(type === 'invoice' ? 'Invoice downloaded' : 'Admission letter downloaded');
    } catch (err) {
      toast.error(err.message || 'Download failed. Please try again.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant shadow-[0_8px_30px_-12px_rgba(0,53,95,0.14)] overflow-hidden animate-fade-in-up">
      {isRejected && (
        <div className="px-5 pt-4 pb-4 bg-error-container/40 border-b border-error/15">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-error font-bold uppercase tracking-wide">Application Not Approved</p>
              <p className="text-body-md text-on-surface mt-1 font-medium">Your payment was rejected.</p>
              {payment?.rejection_reason ? (
                <div className="mt-2.5 bg-surface rounded-xl border border-error/20 p-3.5">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Rejection Reason</p>
                  <p className="text-body-md text-on-surface font-semibold">“{payment.rejection_reason}”</p>
                </div>
              ) : (
                <p className="text-body-sm text-on-surface-variant mt-1.5">Please contact our admission office for details.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <h3 className="text-headline-md text-on-surface font-bold truncate">{course.name || 'Course'}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-body-sm text-on-surface-variant">
            {course.code && <span className="font-mono">{course.code}</span>}
            {course.code && level.name && <span className="text-outline">·</span>}
            {level.name && <span>{level.name}</span>}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm border shrink-0 ${meta.color}`}>
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
          {meta.label}
        </span>
      </div>

      <StatusStepper status={app.status} />

      <div className="px-5 py-4 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-surface-container-low rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Applied On</p>
            <p className="text-body-md text-on-surface font-medium mt-0.5">{formatDate(app.createdAt)}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Course Fee</p>
            <p className="text-body-md text-on-surface font-medium mt-0.5">{formatMoney(level.fee ?? course.fee)}</p>
          </div>
          {batch.name && (
            <div className="bg-surface-container-low rounded-xl p-3 col-span-2">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Preferred Batch</p>
              <p className="text-body-md text-on-surface font-medium mt-0.5">
                {batch.name}
                {batch.class_schedule ? <span className="text-body-sm text-on-surface-variant"> — {batch.class_schedule}</span> : null}
              </p>
            </div>
          )}
        </div>

        {app.application_code && (
          <div className="flex items-center justify-between gap-2 bg-primary/5 border border-primary/15 rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">pin</span>
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Application Ref</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-body-md text-primary font-bold tracking-widest">{app.application_code}</span>
              <CopyButton
                text={app.application_code}
                copied={copiedKey === 'ref'}
                onCopy={() => copyText(app.application_code, 'Application Ref', 'ref')}
              />
            </div>
          </div>
        )}

        {payment && (
          <div className="flex items-center justify-between gap-2 border border-outline-variant rounded-xl px-3.5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm shrink-0 ${methodBadge(payment.method)}`}>
                {methodLabel(payment.method)}
              </span>
              <span className="font-mono text-body-sm text-on-surface-variant truncate">{payment.trxid || '—'}</span>
              {payment.trxid && (
                <CopyButton
                  text={payment.trxid}
                  copied={copiedKey === 'trx'}
                  onCopy={() => copyText(payment.trxid, 'Transaction ID', 'trx')}
                />
              )}
            </div>
            <span className="text-body-md font-bold text-primary shrink-0">{formatMoney(payment.amount)}</span>
          </div>
        )}

        <p className="text-body-sm text-on-surface-variant leading-relaxed">{STATUS_HELP[app.status] || ''}</p>
      </div>

      {(app.hasInvoice || app.hasAdmissionLetter) && (
        <div className="flex gap-2.5 px-5 pb-5">
          {app.hasInvoice && (
            <button
              type="button"
              onClick={() => handleDownload('invoice')}
              disabled={downloading !== ''}
              className="flex-1 h-10 rounded-xl bg-surface-container-lowest border border-outline-variant text-on-surface text-label-md flex items-center justify-center gap-1.5 hover:bg-surface-container-low transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">{downloading === 'invoice' ? 'downloading' : 'receipt_long'}</span>
              {downloading === 'invoice' ? 'Downloading...' : 'Invoice'}
            </button>
          )}
          {app.hasAdmissionLetter && (
            <button
              type="button"
              onClick={() => handleDownload('admission-letter')}
              disabled={downloading !== ''}
              className="flex-1 h-10 rounded-xl bg-tertiary-container/40 text-tertiary border border-tertiary-container text-label-md flex items-center justify-center gap-1.5 hover:bg-tertiary-container/60 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">{downloading === 'admission-letter' ? 'downloading' : 'description'}</span>
              {downloading === 'admission-letter' ? 'Downloading...' : 'Admission Letter'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry, logout }) {
  return (
    <div className="px-4 flex flex-col items-center text-center py-16">
      <div className="w-16 h-16 rounded-full bg-error-container/40 text-error flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px]">cloud_off</span>
      </div>
      <h3 className="text-headline-md text-on-surface mb-1">Couldn't load your status</h3>
      <p className="text-body-sm text-on-surface-variant max-w-xs">{message}</p>
      <div className="flex gap-3 mt-6">
        <button onClick={onRetry} className="h-10 px-5 rounded-xl bg-primary text-on-primary text-label-md flex items-center gap-2 hover:bg-primary-container transition-colors">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Try Again
        </button>
        <button onClick={logout} className="h-10 px-5 rounded-xl border border-outline-variant text-on-surface text-label-md hover:bg-surface-container-low transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data, refetch, isFetching, isError, error } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/student/dashboard').then(r => r.data.data || r.data),
    refetchInterval: 30000,
    retry: 1,
  });

  const student = data?.student || user || {};
  const applications = data?.applications || [];
  const pending = applications.filter((a) => ['pending', 'payment_under_review'].includes(a.status)).length;
  const admitted = applications.filter((a) => a.status === 'admitted').length;
  const name = student.name || student.student_name || '';
  const photo = student.photo || student.student_photo_url || '';

  return (
    <div className="bg-background text-on-background antialiased min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <h1 className="text-headline-md font-bold text-primary tracking-tight">SARS</h1>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !data && (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-primary-container text-on-primary-container flex items-center justify-center">
            {photo ? (
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-label-sm font-bold">{(name || 'S')[0]}</span>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-28 px-4 flex flex-col gap-5 max-w-[600px] mx-auto w-full">
        <section className="flex flex-col gap-1 animate-fade-in-up">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Welcome back 👋</p>
          <h2 className="text-headline-xl text-on-surface font-extrabold tracking-tight">{name || 'Student'}</h2>
          <p className="text-body-md text-on-surface-variant">{student.mobile || ''}</p>
        </section>

        {applications.length > 0 && (
          <section className="grid grid-cols-2 gap-3 animate-fade-in-up delay-100">
            <div className="bg-surface border border-outline-variant rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/50 text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
              </div>
              <div>
                <p className="text-headline-md font-bold text-on-surface leading-none">{pending}</p>
                <p className="text-label-sm text-on-surface-variant mt-1">In Review</p>
              </div>
            </div>
            <div className="bg-surface border border-outline-variant rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/40 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
              </div>
              <div>
                <p className="text-headline-md font-bold text-on-surface leading-none">{admitted}</p>
                <p className="text-label-sm text-on-surface-variant mt-1">Admitted</p>
              </div>
            </div>
          </section>
        )}

        {isError && (
          <section className="bg-surface rounded-2xl border border-outline-variant shadow-sm">
            <ErrorState
              message={error?.response?.data?.message || 'Something went wrong while loading your applications.'}
              onRetry={() => refetch()}
              logout={logout}
            />
          </section>
        )}

        {!isError && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider">My Applications</h3>
              <span className="text-label-sm text-on-surface-variant">{applications.length} course{applications.length === 1 ? '' : 's'}</span>
            </div>

            {applications.length === 0 && !data && (
              <div className="flex flex-col items-center text-center bg-surface rounded-2xl border border-outline-variant p-8">
                <span className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-body-md text-on-surface">Loading your applications...</p>
              </div>
            )}

            {data && applications.length === 0 && (
              <div className="flex flex-col items-center text-center bg-surface rounded-2xl border border-outline-variant p-8">
                <span className="material-symbols-outlined text-outline text-5xl mb-3">assignment_turned_in</span>
                <h4 className="text-headline-md text-on-surface mb-1">No applications yet</h4>
                <p className="text-body-sm text-on-surface-variant mb-5">You haven't applied for any course yet. Start your journey now.</p>
                <button
                  onClick={() => navigate('/register/step1')}
                  className="h-11 px-6 rounded-xl bg-primary text-on-primary text-label-md flex items-center gap-2 hover:bg-primary-container transition-colors shadow-md shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Apply for a Course
                </button>
              </div>
            )}

            {applications.map((app) => (
              <ApplicationCard key={app._id} app={app} />
            ))}
          </section>
        )}

        <section className="bg-surface-container-low rounded-2xl border border-outline-variant p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">headset_mic</span>
          </div>
          <div className="flex-1">
            <p className="text-label-md text-on-surface font-semibold">Need help with your application?</p>
            <p className="text-body-sm text-on-surface-variant mt-0.5">Contact our admission office — we're happy to help.</p>
          </div>
          <button className="shrink-0 text-primary text-label-md font-semibold hover:underline">Contact</button>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 border-t border-outline-variant bg-surface shadow-lg z-50">
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 active:scale-90 transition-all w-16">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-label-sm mt-1">Home</span>
        </button>
        <button onClick={() => navigate('/')} className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant active:scale-90 transition-all rounded-xl w-16">
          <span className="material-symbols-outlined">public</span>
          <span className="text-label-sm mt-1">Website</span>
        </button>
        <button onClick={logout} className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant active:scale-90 transition-all rounded-xl w-16">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-sm mt-1">Logout</span>
        </button>
      </nav>
    </div>
  );
}
