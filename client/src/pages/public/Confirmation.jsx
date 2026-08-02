import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'fars_confirmation';

const methodLabel = (m) => {
  if (m === 'bkash') return 'bKash';
  if (m === 'nagad') return 'Nagad';
  return m || '—';
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(() => {
    if (location.state) return location.state;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location.state) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(location.state));
      } catch {
        // ignore storage errors
      }
    }
  }, [location.state]);

  const payment = data?.payment || {};
  const name = data?.fullName || data?.student?.name || '';
  const code = data?.applicationCode || '—';
  const amount = payment.amount ?? data?.levelFee;

  const [copiedKey, setCopiedKey] = useState('');

  const copyText = async (text, label, key) => {
    if (!text || text === '—') return;
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

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative overflow-hidden antialiased">
      <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[50%] bg-primary-fixed rounded-[100%] blur-3xl opacity-40 pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-lg mx-auto z-10 relative">
        <div className="animate-fade-in-up w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>

        <h1 className="animate-fade-in-up delay-100 text-headline-lg text-on-surface text-center mb-4">
          Registration Submitted!
        </h1>

        {data ? (
          <>
            <div className="animate-fade-in-up delay-200 w-full bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-[0_12px_40px_-12px_rgba(0,53,95,0.18)] mb-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                  </span>
                  <span className="text-headline-md font-bold text-on-surface tracking-tight">FARS</span>
                </div>
                <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Payment Receipt</span>
              </div>

              <div className="flex items-center justify-between gap-3 pb-4">
                <span className="flex items-center gap-2 text-label-sm text-on-surface-variant uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Student Name
                </span>
                <span className="text-body-md text-on-surface font-semibold text-right">{name || '—'}</span>
              </div>

              <div className="w-full border-b border-dashed border-outline-variant/40" />

              <div className="py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[18px]">pin</span>
                    Application Ref
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-body-md text-on-surface font-bold tracking-widest">{code}</span>
                    <button
                      onClick={() => copyText(code, 'Application Ref', 'ref')}
                      disabled={code === '—'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${copiedKey === 'ref' ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'}`}
                      title="Copy Application Ref"
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{copiedKey === 'ref' ? 'check' : 'content_copy'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-body-sm text-on-surface-variant mt-2">Note this code — our admin can locate your application using it or your mobile number.</p>
              </div>

              <div className="w-full border-b border-dashed border-outline-variant/40" />

              <div className="pt-4 flex flex-col gap-3.5">
                <span className="flex items-center gap-2 text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  Payment Details
                </span>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    Application Ref
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-body-md text-on-surface font-bold tracking-widest">{code}</span>
                    <button
                      onClick={() => copyText(code, 'Application Ref', 'ref2')}
                      disabled={code === '—'}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${copiedKey === 'ref2' ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'}`}
                      title="Copy Application Ref"
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{copiedKey === 'ref2' ? 'check' : 'content_copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">{payment.method === 'nagad' ? 'payments' : 'account_balance'}</span>
                    Method
                  </span>
                  <span className="text-body-md text-on-surface font-semibold">{methodLabel(payment.method)}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">qr_code</span>
                    Transaction ID
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-body-md text-on-surface font-semibold">{payment.trxid || '—'}</span>
                    <button
                      onClick={() => copyText(payment.trxid, 'Transaction ID', 'trx')}
                      disabled={!payment.trxid}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 ${copiedKey === 'trx' ? 'text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'}`}
                      title="Copy Transaction ID"
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{copiedKey === 'trx' ? 'check' : 'content_copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 py-2">
                  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    Amount
                  </span>
                  <span className="text-headline-md font-bold text-primary">৳{amount ?? '—'}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    Payment Date
                  </span>
                  <span className="text-body-md text-on-surface font-semibold">{formatDate(payment.payment_date)}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    Course
                  </span>
                  <span className="text-body-md text-on-surface font-semibold text-right">{data.courseName || '—'}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                    Program Level
                  </span>
                  <span className="text-body-md text-on-surface font-semibold text-right">{data.levelName || '—'}</span>
                </div>
              </div>

              <div className="w-full border-b border-dashed border-outline-variant/40 mt-5" />

              <div className="pt-4 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  Status
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm w-fit">
                  Pending Verification
                </span>
              </div>
            </div>

            <div className="animate-fade-in-up delay-300 w-full flex flex-col gap-3 mb-8">
              <button
                onClick={() => window.print()}
                className="w-full bg-primary text-on-primary h-12 rounded-lg text-label-md flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-primary-container"
              >
                <span className="material-symbols-outlined">print</span>
                Print / Download Receipt
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface h-12 rounded-lg text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">home</span>
                Back to Home
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="animate-fade-in-up delay-200 w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm mb-8 flex flex-col gap-3 text-center">
              <span className="material-symbols-outlined text-outline text-4xl mx-auto">receipt_long</span>
              <p className="text-body-md text-on-surface">We couldn't load your application details.</p>
              <p className="text-body-sm text-on-surface-variant">
                This can happen after a page refresh. Please keep the Application Ref code and Transaction ID from the payment confirmation SMS, and contact our admin for assistance.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="animate-fade-in-up delay-300 w-full bg-primary text-on-primary h-12 rounded-lg text-label-md flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-primary-container"
            >
              <span className="material-symbols-outlined">home</span>
              Back to Home
            </button>
          </>
        )}
      </main>

      {data && (
        <div id="print-receipt" className="hidden print:block">
          <div className="bg-white text-black font-sans p-6 max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="material-symbols-outlined text-2xl">school</span>
              <span className="text-xl font-bold tracking-tight">FARS</span>
            </div>
            <p className="text-center text-xs tracking-widest uppercase mb-6">Payment Receipt</p>

            <div className="border border-dashed border-black/40 rounded-lg p-4 mb-4 flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span>Application Ref</span>
                <span className="font-bold">{code}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TrxID</span>
                <span className="font-bold">{payment.trxid || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Method</span>
                <span>{methodLabel(payment.method)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span className="font-bold">৳{amount ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date</span>
                <span>{formatDate(payment.payment_date)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span>Student</span>
                <span className="font-semibold">{name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Mobile</span>
                <span>{data.mobile || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Course</span>
                <span className="text-right">{data.courseName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Program Level</span>
                <span className="text-right">{data.levelName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold">Pending Verification</span>
              </div>
            </div>

            <div className="border-t border-dashed border-black/40 mt-6 pt-4 text-center text-xs">
              Thank you for registering with FARS.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
