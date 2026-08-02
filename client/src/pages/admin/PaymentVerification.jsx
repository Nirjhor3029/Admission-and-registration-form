import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const methodLabel = (m) => {
  if (m === 'bkash') return 'bKash';
  if (m === 'nagad') return 'Nagad';
  return m || '—';
};

const methodBadge = (m) => {
  if (m === 'bkash') return 'bg-[#E2136E]/10 text-[#E2136E] border-[#E2136E]/30';
  if (m === 'nagad') return 'bg-[#F6921E]/10 text-[#F6921E] border-[#F6921E]/30';
  return 'bg-surface-variant text-on-surface-variant border-outline-variant';
};

const statusChip = (st) => {
  if (st === 'verified') return 'bg-tertiary-container/30 text-tertiary border-tertiary-container';
  if (st === 'rejected') return 'bg-error-container/30 text-error border-error-container';
  if (st === 'pending') return 'bg-secondary-container/50 text-on-secondary-container border-secondary-container/50';
  return 'bg-surface-variant text-on-surface-variant border-outline-variant';
};

const statusLabel = (st) => {
  if (st === 'verified') return 'Verified';
  if (st === 'rejected') return 'Rejected';
  if (st === 'pending') return 'Pending';
  return st || '—';
};

const statusFilterOptions = [
  { value: 'payment_under_review', label: 'Under Review' },
  { value: 'payment_verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All Statuses' },
];

const Avatar = ({ url, name }) => (
  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold overflow-hidden shrink-0">
    {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : (name || '?')[0]}
  </div>
);

export default function PaymentVerification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [courseId, setCourseId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [status, setStatus] = useState('payment_under_review');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setSelectedId(null);
  }, [search, status, courseId, levelId]);

  const { data } = useQuery({
    queryKey: ['applications', 'payments', status, search, courseId, levelId],
    queryFn: () => api.get('/applications', {
      params: {
        status: status || undefined,
        search: search || undefined,
        course_id: courseId || undefined,
        level_id: levelId || undefined,
        limit: 50,
      },
    }).then(r => r.data.data || r.data),
  });
  const students = data?.students || [];

  const { data: coursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(r => r.data.data.courses || []),
  });
  const courses = Array.isArray(coursesData) ? coursesData : [];

  const { data: levelsData } = useQuery({
    queryKey: ['program-levels'],
    queryFn: () => api.get('/program-levels').then(r => r.data.data || []),
  });
  const allLevels = Array.isArray(levelsData) ? levelsData : [];
  const levels = useMemo(
    () => allLevels.filter((l) => !courseId || String(l.course_id?._id || l.course_id) === String(courseId)),
    [allLevels, courseId]
  );

  const stats = useMemo(() => {
    let total = 0;
    let bkash = 0;
    let nagad = 0;
    students.forEach((s) => {
      if (s.payment_amount) total += Number(s.payment_amount);
      if (s.payment_method === 'bkash') bkash += 1;
      if (s.payment_method === 'nagad') nagad += 1;
    });
    return { total, bkash, nagad };
  }, [students]);

  const { data: detail } = useQuery({
    queryKey: ['student-payment', selectedId],
    queryFn: () => api.get(`/applications/${selectedId}`).then(r => r.data.data || r.data),
    enabled: !!selectedId,
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.patch(`/applications/${selectedId}/payment/verify`),
    onSuccess: () => {
      toast.success('Payment approved');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['student-payment'] });
      setSelectedId(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => api.patch(`/applications/${selectedId}/payment/reject`, { reason }),
    onSuccess: () => {
      toast.success('Payment rejected');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['student-payment'] });
      setReason('');
      setSelectedId(null);
    },
  });

  const student = detail?.student || detail;
  const payment = student?.payments?.[0] || detail?.payments?.[0];

  const copyTrx = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Transaction ID copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const selectCls = 'h-11 px-3 rounded-lg border border-outline-variant bg-surface text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none';

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/payments')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-headline-lg text-on-surface">Payment Verification</h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">Search, filter, and verify student payments.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Showing</p>
            <p className="text-headline-md font-bold text-on-surface">{students.length}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-secondary-container/50 text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Amount</p>
            <p className="text-headline-md font-bold text-on-surface">৳{stats.total.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Payment Methods</p>
            <p className="text-headline-md font-bold text-on-surface"><span className="text-[#E2136E]">{stats.bkash}</span> bKash · <span className="text-[#F6921E]">{stats.nagad}</span> Nagad</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, mobile, TrxID or application code..."
            className="w-full h-11 pl-10 pr-3 rounded-lg border border-outline-variant bg-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setLevelId(''); }} className={`${selectCls} lg:w-56`}>
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.name || c.title}</option>)}
        </select>
        <select value={levelId} onChange={(e) => setLevelId(e.target.value)} className={`${selectCls} lg:w-56`}>
          <option value="">All Program Levels</option>
          {levels.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${selectCls} lg:w-44`}>
          {statusFilterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low/50 flex items-center justify-between">
              <h3 className="text-headline-md text-on-surface">Student Payments</h3>
              <span className="text-label-sm text-on-surface-variant">{students.length} result{students.length === 1 ? '' : 's'}</span>
            </div>
            <div className="divide-y divide-outline-variant/40">
              {students.map((s) => (
                <div
                  key={s._id}
                  onClick={() => setSelectedId(s._id === selectedId ? null : s._id)}
                  className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors relative ${
                    selectedId === s._id ? 'bg-primary/5' : 'hover:bg-surface-container-low'
                  }`}
                >
                  {selectedId === s._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                  <Avatar url={s.student_photo_url} name={s.student_name || s.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-body-md text-on-surface font-medium truncate">{s.student_name || s.name}</p>
                      {s.payment_method && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-sm border ${methodBadge(s.payment_method)}`}>
                          {methodLabel(s.payment_method)}
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-on-surface-variant truncate">{s.mobile} · <span className="font-mono">{s.payment_trxid || '—'}</span></p>
                    {s.course_id?.name && (
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">
                        {s.course_id.name}{s.level_id?.name ? ` · ${s.level_id.name}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-body-md font-bold text-on-surface">৳{s.payment_amount || '—'}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-label-sm border mt-1 ${statusChip(s.payment_status)}`}>
                      {statusLabel(s.payment_status)}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-outline shrink-0">chevron_right</span>
                </div>
              ))}
              {students.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <span className="material-symbols-outlined text-outline text-5xl mb-3">search_off</span>
                  <p className="text-body-md text-on-surface">No payments found</p>
                  <p className="text-body-sm text-on-surface-variant mt-1">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>

          {selectedId && student && (
            <>
              <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-headline-md text-on-surface mb-4">Student Information</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-headline-md overflow-hidden shrink-0">
                    {student.student_photo_url ? (
                      <img src={student.student_photo_url} alt={student.student_name || student.name} className="w-full h-full object-cover" />
                    ) : (
                      (student.student_name || student.name || '?')[0]
                    )}
                  </div>
                  <div>
                    <p className="text-body-md text-on-surface font-medium">{student.student_name || student.name}</p>
                    <p className="text-body-sm text-on-surface-variant">{student.mobile}</p>
                    {student.application_code && (
                      <p className="text-body-sm text-on-surface-variant font-mono">Ref: {student.application_code}</p>
                    )}
                  </div>
                </div>
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
                    <div className="col-span-2 flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Amount Paid</span>
                      <span className="text-headline-md font-bold text-primary">৳{payment.amount}</span>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Method</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-sm border ${methodBadge(payment.method)}`}>
                        {methodLabel(payment.method)}
                      </span>
                    </div>
                    <div>
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-label-sm border ${statusChip(payment.status)}`}>
                        {statusLabel(payment.status)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Transaction ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-body-md text-on-surface font-mono">{payment.trxid}</p>
                        <button
                          onClick={() => copyTrx(payment.trxid)}
                          className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-variant text-on-surface-variant"
                          title="Copy Transaction ID"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2">
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
