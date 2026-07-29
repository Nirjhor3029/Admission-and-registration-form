import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PaymentVerification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { data } = useQuery({
    queryKey: ['students', 'payment_under_review'],
    queryFn: () => api.get('/students', { params: { status: 'payment_under_review', limit: 50 } }).then(r => r.data.data || r.data),
  });
  const students = data?.students || [];

  const { data: detail } = useQuery({
    queryKey: ['student-payment', selectedId],
    queryFn: () => api.get(`/students/${selectedId}`).then(r => r.data.data || r.data),
    enabled: !!selectedId,
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.patch(`/students/${selectedId}/payment/verify`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); queryClient.invalidateQueries({ queryKey: ['student-payment'] }); setSelectedId(null); },
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.patch(`/students/${selectedId}/payment/reject`, { reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); queryClient.invalidateQueries({ queryKey: ['student-payment'] }); setReason(''); setSelectedId(null); },
  });

  const student = detail?.student || detail;
  const payment = student?.payments?.[0] || detail?.payments?.[0];

  return (
    <div className="flex flex-col gap-6 h-full">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/payments')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-headline-lg text-on-surface">Verify Transaction</h1>
          {payment && <p className="text-body-sm text-on-surface-variant mt-1">Ref: {payment.trxid || payment._id?.slice(-8)}</p>}
        </div>
        {payment && (
          <span className={`ml-auto inline-flex items-center px-3 py-1.5 rounded-md text-label-sm border ${
            payment.status === 'verified' ? 'bg-tertiary-container/30 text-tertiary border-tertiary-container' :
            payment.status === 'rejected' ? 'bg-error-container/30 text-error border-error-container' :
            'bg-secondary-container/50 text-on-secondary-container border-secondary-container/50'
          }`}>
            {payment.status || 'Pending'}
          </span>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1">
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="text-headline-md text-on-surface mb-4">Students Awaiting Verification</h3>
            <div className="space-y-2">
              {students.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelectedId(s._id)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedId === s._id ? 'bg-primary/5 border border-primary/30' : 'hover:bg-surface-container-low border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                      {(s.student_name || s.name || '?')[0]}
                    </div>
                    <div>
                      <p className="text-body-md text-on-surface font-medium">{s.student_name || s.name}</p>
                      <p className="text-body-sm text-on-surface-variant">{s.mobile} · ৳{s.payment_amount || s.amount || '—'}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline">chevron_right</span>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-center py-8 text-on-surface-variant">No pending verifications</p>
              )}
            </div>
          </div>

          {selectedId && student && (
            <>
              <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-headline-md text-on-surface mb-4">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Name</p>
                    <p className="text-body-md text-on-surface">{student.student_name || student.name}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Mobile</p>
                    <p className="text-body-md text-on-surface">{student.mobile}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Email</p>
                    <p className="text-body-md text-on-surface">{student.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Course</p>
                    <p className="text-body-md text-on-surface">{student.course_id?.name || student.course_id?.title || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-headline-md text-on-surface mb-4">Payment Details</h3>
                {payment ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Amount</p>
                      <p className="text-body-md text-on-surface font-medium">৳{payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Method</p>
                      <p className="text-body-md text-on-surface capitalize">{payment.method || '—'}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Transaction ID</p>
                      <p className="text-body-md text-on-surface font-mono">{payment.trxid}</p>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Date</p>
                      <p className="text-body-md text-on-surface">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-on-surface-variant">No payment data available</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          {selectedId && payment?.screenshot_url && (
            <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-label-md text-on-surface">Receipt Image</h3>
                <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">zoom_in</span></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">rotate_right</span></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">fullscreen</span></button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center bg-surface-container-low min-h-[300px]">
                <img src={payment.screenshot_url} alt="Payment receipt" className="max-w-full max-h-[400px] object-contain rounded-lg shadow-sm" />
              </div>
            </div>
          )}

          {selectedId && (payment?.status === 'pending' || payment?.status === undefined) && (
            <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm sticky bottom-0">
              <h3 className="text-headline-md text-on-surface mb-4">Actions</h3>
              <div className="flex flex-col gap-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Rejection reason..."
                  className="w-full p-3 border border-outline-variant rounded-lg text-body-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => rejectMutation.mutate()}
                    disabled={rejectMutation.isPending || !reason}
                    className="flex-1 h-10 rounded-lg border-2 border-error text-error text-label-md hover:bg-error-container/20 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => verifyMutation.mutate()}
                    disabled={verifyMutation.isPending}
                    className="flex-1 h-10 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors disabled:opacity-50"
                  >
                    Approve Payment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
