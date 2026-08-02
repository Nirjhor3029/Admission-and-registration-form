import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const statusColors = {
  draft: 'bg-surface-variant text-on-surface-variant border-outline-variant',
  pending: 'bg-secondary-container/50 text-on-secondary-container border-secondary-container/50',
  payment_under_review: 'bg-secondary-container/50 text-on-secondary-container border-secondary-container/50',
  payment_verified: 'bg-surface-variant text-on-surface border-outline-variant',
  admitted: 'bg-tertiary-container/30 text-tertiary border-tertiary-container',
  rejected: 'bg-error-container/30 text-error border-error-container',
};

const statusLabels = {
  draft: 'Draft',
  pending: 'Pending',
  payment_under_review: 'Under Review',
  payment_verified: 'Payment Verified',
  admitted: 'Admitted',
  rejected: 'Rejected',
};

export default function StudentManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [confirmStudent, setConfirmStudent] = useState(null);

  const { data } = useQuery({
    queryKey: ['students', page, search, statusFilter],
    queryFn: () => api.get('/students', { params: { page, limit: 20, search, status: statusFilter || undefined } }).then(r => r.data.data || r.data),
  });

  const students = data?.students || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const { data: detail } = useQuery({
    queryKey: ['student', selectedId],
    queryFn: () => api.get(`/students/${selectedId}`).then(r => r.data.data || r.data),
    enabled: !!selectedId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/students/${id}/status`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['students'] }); queryClient.invalidateQueries({ queryKey: ['student'] }); },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id) => api.delete(`/students/${id}`),
    onSuccess: () => {
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => api.delete('/students', { params: { search, status: statusFilter || undefined } }),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Students deleted.');
      setShowDeleteAll(false);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Could not delete students.');
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status === statusFilter ? '' : status);
    setPage(1);
  };

  const student = detail?.student || detail;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-xl text-on-surface">Student Management</h1>
          <p className="text-body-md text-on-surface-variant mt-1">Review registrations, verify payments, and manage enrollment status.</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm"
            placeholder="Search by name, ID, or mobile..."
          />
        </form>
        <button onClick={() => setShowDeleteAll(true)} className="h-10 px-4 bg-error text-on-error rounded-lg text-label-md hover:bg-error-container transition-colors flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
          Delete All
        </button>
      </header>

      <div className="flex flex-wrap gap-2 items-center pb-2 border-b border-outline-variant/50">
        <span className="text-label-sm text-on-surface-variant mr-2 uppercase tracking-wider">Status Filter:</span>
        {['', 'draft', 'pending', 'payment_under_review', 'admitted', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-4 py-1.5 rounded-full text-label-sm shadow-sm transition-transform active:scale-95 ${
              statusFilter === s
                ? 'bg-primary text-on-primary'
                : 'bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            {s ? statusLabels[s] : 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <section className={`${selectedId ? 'md:col-span-8' : 'md:col-span-12'} bg-surface rounded-xl shadow-[0_4px_20px_-10px_rgba(0,53,95,0.15)] border border-outline-variant overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant font-semibold">Name</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant font-semibold">Mobile</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant font-semibold">Course & Batch</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant font-semibold">Amount</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant font-semibold">Date</th>
                  <th className="px-4 py-4 text-label-md text-on-surface-variant font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s._id}
                    onClick={() => setSelectedId(s._id === selectedId ? null : s._id)}
                    className={`border-b border-outline-variant hover:bg-surface-container-low cursor-pointer transition-colors h-[56px] even:bg-[#fcfdfe] ${
                      s._id === selectedId ? 'bg-primary/5 border-b-primary/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 relative">
                      {s._id === selectedId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                      <div className="font-medium text-on-surface">{s.student_name || s.name}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">ID: {s.student_id_number || s._id?.slice(-6)}</div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{s.mobile}</td>
                    <td className="px-4 py-3">
                      <div>{s.course_id?.name || s.course_id?.title || '—'}</div>
                      <div className="text-xs text-on-surface-variant">{s.batch_id?.name || s.batch_id?.code || ''}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">৳{s.payment_amount || s.amount || '—'}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-label-sm border ${statusColors[s.status] || 'bg-surface-variant text-on-surface-variant'}`}>
                        {statusLabels[s.status] || s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant">
              <span className="text-body-sm text-on-surface-variant">Page {pagination.page} of {pagination.pages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded border border-outline-variant text-body-sm disabled:opacity-50">Prev</button>
                <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded border border-outline-variant text-body-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </section>

        {selectedId && student && (
          <aside className="md:col-span-4 bg-surface rounded-xl shadow-[0_4px_20px_-10px_rgba(0,53,95,0.15)] border border-outline-variant p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-md text-on-surface">Student Details</h3>
              <button onClick={() => setSelectedId(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-headline-xl font-bold">
                {(student.student_name || student.name || '?')[0]}
              </div>
              <div>
                <h4 className="text-headline-md text-on-surface">{student.student_name || student.name}</h4>
                <p className="text-body-sm text-on-surface-variant">ID: {student.student_id_number || student._id?.slice(-6)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Contact</p>
                <p className="text-body-md text-on-surface">{student.mobile}</p>
                {student.email && <p className="text-body-sm text-on-surface-variant">{student.email}</p>}
                {student.whatsapp && <p className="text-body-sm text-on-surface-variant">WhatsApp: {student.whatsapp}</p>}
              </div>
              <div className="border-t border-outline-variant/30 pt-4">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Course & Batch</p>
                <p className="text-body-md text-on-surface">{student.course_id?.name || student.course_id?.title || '—'}</p>
                <p className="text-body-sm text-on-surface-variant">{student.batch_id?.name || student.batch_id?.code || ''}</p>
              </div>
              <div className="border-t border-outline-variant/30 pt-4">
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Payment</p>
                <p className="text-body-md text-on-surface">৳{student.payment_amount || student.amount || '—'}</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-label-sm border mt-1 ${statusColors[student.status] || 'bg-surface-variant'}`}>
                  {statusLabels[student.status] || student.status}
                </span>
              </div>
            </div>

            {student.status === 'draft' && (
              <>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant text-body-sm text-on-surface-variant">
                  This is an incomplete draft. The student has not submitted payment yet.
                </div>
                <div className="flex gap-3 pt-2 border-t border-outline-variant/30">
                  <button onClick={() => statusMutation.mutate({ id: selectedId, status: 'cancelled' })} disabled={statusMutation.isPending} className="flex-1 h-10 rounded-lg border-2 border-error text-error text-label-md hover:bg-error-container/20 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={() => statusMutation.mutate({ id: selectedId, status: 'pending' })} disabled={statusMutation.isPending} className="flex-1 h-10 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">
                    Activate
                  </button>
                </div>
              </>
            )}

            {student.status === 'pending' && (
              <div className="flex gap-3 pt-2 border-t border-outline-variant/30">
                <button onClick={() => statusMutation.mutate({ id: selectedId, status: 'rejected' })} disabled={statusMutation.isPending} className="flex-1 h-10 rounded-lg border-2 border-error text-error text-label-md hover:bg-error-container/20 transition-colors disabled:opacity-50">
                  Reject
                </button>
                <button onClick={() => statusMutation.mutate({ id: selectedId, status: 'payment_under_review' })} disabled={statusMutation.isPending} className="flex-1 h-10 rounded-lg bg-primary text-on-primary text-label-md hover:bg-primary-container transition-colors disabled:opacity-50">
                  Mark Under Review
                </button>
              </div>
            )}

            {student.status !== 'admitted' && (!detail?.payments || detail.payments.length === 0) && (
              <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
                <button onClick={() => setConfirmStudent(student)} disabled={deleteStudentMutation.isPending} className="w-full h-10 rounded-lg bg-error/10 text-error text-label-md hover:bg-error/20 transition-colors disabled:opacity-50">
                  {deleteStudentMutation.isPending ? 'Deleting...' : 'Delete Student'}
                </button>
                <p className="text-body-sm text-on-surface-variant">Students with payment history or admitted students cannot be deleted.</p>
              </div>
            )}
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        title="Delete All Students"
        description={`This permanently deletes ${pagination.total} student(s) matching the current filter${statusFilter ? ` (status: ${statusLabels[statusFilter] || statusFilter})` : ''}. Students who are admitted or have payment history are automatically protected.`}
        confirmText="DELETE"
        confirmLabel="Delete All"
        icon="delete_sweep"
        loading={deleteAllMutation.isPending}
        onConfirm={() => deleteAllMutation.mutate()}
      />

      <ConfirmDialog
        open={!!confirmStudent}
        onClose={() => setConfirmStudent(null)}
        title="Delete Student"
        description={`"${confirmStudent?.student_name || confirmStudent?.name || ''}" will be permanently deleted along with any draft data. This cannot be undone.`}
        confirmLabel="Delete Student"
        icon="person_remove"
        loading={deleteStudentMutation.isPending}
        onConfirm={() => { if (confirmStudent) deleteStudentMutation.mutate(confirmStudent._id); }}
      />
    </div>
  );
}
