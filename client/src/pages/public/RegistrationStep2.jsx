import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const schema = z.object({
  method: z.string().min(1, 'Select payment method'),
  amount: z.string().min(1, 'Amount is required'),
  trxid: z.string().min(1, 'Transaction ID is required'),
  payment_date: z.string().min(1, 'Payment date is required'),
});

export default function RegistrationStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const studentData = location.state;
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { method: 'bkash', trxid: '' },
  });

  if (!studentData?.studentId) {
    navigate('/register/step1', { replace: true });
    return null;
  }

  const handleMethodChange = (method) => {
    setPaymentMethod(method);
    setValue('method', method);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleTrxidChange = (e) => {
    const uppercased = e.target.value.toUpperCase();
    e.target.value = uppercased;
    setValue('trxid', uppercased);
  };

  const onSubmit = async (data) => {
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('method', data.method);
      formData.append('amount', data.amount);
      formData.append('trxid', data.trxid);
      formData.append('payment_date', data.payment_date);
      if (screenshotFile) formData.append('screenshot', screenshotFile);

      await api.post(`/registrations/${studentData.studentId}/payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Payment submitted! Your application is under review.');
      navigate('/register/confirmed', { state: studentData });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Payment submission failed. Please try again.';
      toast.error(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const merchantNumber = '017XX-XXXXXX';
  const copyMerchantNumber = () => {
    navigator.clipboard.writeText(merchantNumber);
  };

  return (
    <div className="bg-background text-on-background min-h-screen antialiased">
      <header className="sticky top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">school</span>
          <span className="text-headline-md font-bold text-primary">FARS</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-outline text-[20px]">person</span>
        </div>
      </header>

      <main className="w-full pb-8">
        <div className="max-w-md mx-auto px-4 pt-8 flex flex-col gap-8">
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-label-sm text-primary uppercase tracking-widest">Step 2 of 2</span>
              <div className="h-1.5 flex-1 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary w-full rounded-full" />
              </div>
            </div>
            <h1 className="text-headline-lg text-on-background">Payment Verification</h1>
            <p className="text-body-sm text-on-surface-variant">Securely submit your payment details to complete your academic registration process.</p>
          </section>

          <section className="bg-surface-container-low border border-primary-fixed-dim rounded-xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed opacity-50 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <p className="text-label-sm text-primary mb-1">Official University Merchant Number</p>
              <p className="text-headline-md text-on-background font-bold tracking-tight">{merchantNumber}</p>
            </div>
            <button
              type="button"
              onClick={copyMerchantNumber}
              className="relative z-10 w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary hover:bg-primary-fixed transition-colors"
            >
              <span className="material-symbols-outlined">content_copy</span>
            </button>
          </section>

          <section className="flex flex-col gap-2">
            <label className="text-label-md text-on-background">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`relative rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'bg-surface-container-lowest border-2 border-primary shadow-[0_4px_12px_rgba(45,97,151,0.08)]'
                    : 'bg-surface-container-lowest border border-outline-variant hover:border-primary-fixed-dim hover:bg-surface-container-low'
                }`}
              >
                <input type="radio" name="method" value="bkash" className="sr-only" checked={paymentMethod === 'bkash'} onChange={() => handleMethodChange('bkash')} />
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'bkash' ? 'border-primary' : 'border-outline-variant'
                }`}>
                  {paymentMethod === 'bkash' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <div className={`w-14 h-14 bg-surface rounded-full flex items-center justify-center overflow-hidden border border-outline-variant shadow-sm ${
                  paymentMethod === 'bkash' ? '' : 'grayscale opacity-70'
                }`}>
                  <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
                </div>
                <span className={`text-label-md font-bold ${paymentMethod === 'bkash' ? 'text-on-background' : 'text-on-surface-variant font-medium'}`}>bKash</span>
              </label>
              <label
                className={`relative rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'nagad'
                    ? 'bg-surface-container-lowest border-2 border-primary shadow-[0_4px_12px_rgba(45,97,151,0.08)]'
                    : 'bg-surface-container-lowest border border-outline-variant hover:border-primary-fixed-dim hover:bg-surface-container-low'
                }`}
              >
                <input type="radio" name="method" value="nagad" className="sr-only" checked={paymentMethod === 'nagad'} onChange={() => handleMethodChange('nagad')} />
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'nagad' ? 'border-primary' : 'border-outline-variant'
                }`}>
                  {paymentMethod === 'nagad' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
                <div className={`w-14 h-14 bg-surface rounded-full flex items-center justify-center overflow-hidden border border-outline-variant shadow-sm ${
                  paymentMethod === 'nagad' ? '' : 'grayscale opacity-70'
                }`}>
                  <span className="material-symbols-outlined text-secondary text-3xl">payments</span>
                </div>
                <span className={`text-label-md font-bold ${paymentMethod === 'nagad' ? 'text-on-background' : 'text-on-surface-variant font-medium'}`}>Nagad</span>
              </label>
            </div>
          </section>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-[0_2px_8px_rgba(11,28,48,0.04)]">
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-body-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm text-on-surface-variant" htmlFor="amount">Amount Paid</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-md text-on-surface-variant select-none">BDT</span>
                <input id="amount" type="number" placeholder="e.g. 15000" className={`w-full h-12 pl-12 pr-3 rounded-lg border ${errors.amount ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant/60`} {...register('amount')} />
              </div>
              {errors.amount && <span className="text-body-sm text-error">{errors.amount.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm text-on-surface-variant" htmlFor="trxid">Transaction ID</label>
              <input id="trxid" placeholder="Enter the 10-digit ID from your SMS" className={`w-full h-12 px-3 rounded-lg border ${errors.trxid ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all uppercase placeholder:normal-case placeholder:text-outline-variant/60`} maxLength={15} {...register('trxid')} onChange={handleTrxidChange} />
              {errors.trxid && <span className="text-body-sm text-error">{errors.trxid.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm text-on-surface-variant" htmlFor="payment_date">Date of Payment</label>
              <input id="payment_date" type="date" className={`w-full h-12 px-3 rounded-lg border ${errors.payment_date ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md text-on-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`} {...register('payment_date')} />
              {errors.payment_date && <span className="text-body-sm text-error">{errors.payment_date.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-label-sm text-on-surface-variant">Upload Payment Screenshot</label>
              <div className="relative w-full rounded-xl border-2 border-dashed border-outline-variant bg-surface hover:bg-surface-container-low hover:border-primary flex flex-col items-center justify-center py-6 px-4 cursor-pointer transition-all group overflow-hidden">
                <input accept="image/png, image/jpeg" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" onChange={handleScreenshotChange} />
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Screenshot preview" className="max-h-32 object-contain" />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-3 group-hover:scale-110 group-hover:bg-primary-fixed transition-all">
                      <span className="material-symbols-outlined">cloud_upload</span>
                    </div>
                    <span className="text-label-md text-primary mb-1 text-center group-hover:text-primary-container transition-colors">Tap to browse or drag file here</span>
                    <span className="text-body-sm text-outline text-center">Supports JPG, PNG (Max 5MB)</span>
                  </>
                )}
              </div>
            </div>

            <section className="mt-2">
              <button type="submit" disabled={submitting} className="w-full h-12 bg-secondary-container text-on-secondary-container rounded-lg text-label-md shadow-[0_4px_14px_rgba(254,166,25,0.25)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Submitting...' : 'Submit Registration'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span className="text-label-sm tracking-wide">SECURE 256-BIT ENCRYPTION</span>
              </div>
            </section>
          </form>
        </div>
      </main>
    </div>
  );
}
