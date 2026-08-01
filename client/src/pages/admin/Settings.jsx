import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Settings() {
  const queryClient = useQueryClient();
  const [bkash, setBkash] = useState('');
  const [nagad, setNagad] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payment-config'],
    queryFn: () => api.get('/payment-config').then(r => r.data.data?.config || r.data.data || {}),
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (data) {
      setBkash(data.bkash_number || '');
      setNagad(data.nagad_number || '');
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => api.put('/payment-config', { bkash_number: bkash, nagad_number: nagad }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-config'] });
      toast.success('Payment settings saved');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save payment settings');
    },
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <header>
        <h1 className="text-headline-xl text-on-surface">Settings</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Configure the merchant numbers shown to students during registration payment.</p>
      </header>

      <section className="bg-surface rounded-xl shadow-[0_4px_20px_-10px_rgba(0,53,95,0.15)] border border-outline-variant p-6">
        {isLoading ? (
          <p className="text-body-sm text-on-surface-variant">Loading payment settings...</p>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm text-on-surface-variant" htmlFor="bkash">bKash Merchant Number</label>
              <input
                id="bkash"
                value={bkash}
                onChange={(e) => setBkash(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-12 px-3 border border-outline-variant rounded-md bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              />
              <p className="text-body-sm text-on-surface-variant">Shown on the payment page when a student selects bKash. Empty value shows the default placeholder.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label-sm text-on-surface-variant" htmlFor="nagad">Nagad Merchant Number</label>
              <input
                id="nagad"
                value={nagad}
                onChange={(e) => setNagad(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-12 px-3 border border-outline-variant rounded-md bg-surface-container-lowest text-body-md text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
              />
              <p className="text-body-sm text-on-surface-variant">Shown on the payment page when a student selects Nagad. Empty value shows the default placeholder.</p>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/30">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="h-11 px-8 rounded-lg bg-primary text-on-primary text-label-md shadow-md hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
              <p className="text-body-sm text-on-surface-variant">You can use the same number for both, or different numbers.</p>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
