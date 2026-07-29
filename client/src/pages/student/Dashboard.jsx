import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const statusColors = {
  pending: 'bg-secondary-container text-on-secondary-container border-secondary/20',
  payment_under_review: 'bg-secondary-container text-on-secondary-container border-secondary/20',
  payment_verified: 'bg-surface-variant text-on-surface border-outline-variant',
  admitted: 'bg-tertiary-container text-tertiary border-tertiary/20',
  rejected: 'bg-error-container text-error border-error/20',
};

const statusLabels = {
  pending: 'Pending',
  payment_under_review: 'Under Review',
  payment_verified: 'Payment Verified',
  admitted: 'Admitted',
  rejected: 'Rejected',
};

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  const { data } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => api.get('/student/dashboard').then(r => r.data.data || r.data),
    refetchInterval: 30000,
  });

  const student = data?.student || user || {};
  const payments = data?.payments || [];
  const hasInvoice = data?.hasInvoice;
  const hasAdmissionLetter = data?.hasAdmissionLetter;
  const isAdmitted = student.status === 'admitted';

  return (
    <div className="bg-background text-on-background antialiased min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <h1 className="text-headline-md font-bold text-primary tracking-tight">FARS</h1>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-primary-container text-on-primary-container flex items-center justify-center">
          <span className="text-label-sm font-bold">{(student.student_name || student.name || 'S')[0]}</span>
        </div>
      </header>

      <main className="pt-24 pb-28 px-4 flex flex-col gap-8 max-w-[600px] mx-auto w-full">
        <section className="flex flex-col gap-2">
          <h2 className="text-headline-lg text-on-surface">Welcome, {student.student_name || student.name || 'Student'}</h2>
          <div className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full border shadow-sm ${statusColors[student.status] || 'bg-surface-variant'}`}>
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            <span className="text-label-md">Status: {statusLabels[student.status] || student.status}</span>
          </div>
        </section>

        {isAdmitted && (
          <section className="bg-surface rounded-xl border border-outline-variant p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col">
                <span className="text-label-sm text-primary uppercase tracking-wider mb-1">Up Next</span>
                <h3 className="text-headline-md text-on-surface">{student.course_id?.name || 'Course Name'}</h3>
                <p className="text-body-sm text-on-surface-variant mt-0.5">{student.course_id?.code || ''} • {student.batch_id?.name || ''}</p>
              </div>
              <div className="bg-surface-container-highest rounded-lg p-2 flex flex-col items-center min-w-[60px]">
                <span className="text-label-sm text-on-surface-variant">Today</span>
                <span className="text-headline-md text-primary -mt-1">2:00</span>
                <span className="text-label-sm text-on-surface-variant -mt-1">PM</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant z-10">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              Building 4, Room 402
            </div>
            <button className="w-full h-12 mt-2 bg-primary text-on-primary text-label-md rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform z-10 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">video_camera_front</span>
              Join Virtual Class
            </button>
          </section>
        )}

        <section>
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Documents</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 bg-surface rounded-xl border border-outline-variant p-4 shadow-sm flex items-center gap-4">
              <div className="w-16 h-10 rounded shadow-sm overflow-hidden bg-surface-container-high border border-outline-variant flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/60">badge</span>
              </div>
              <div className="flex flex-col flex-grow">
                <span className="text-label-md text-on-surface">Student ID Card</span>
                <span className="text-body-sm text-on-surface-variant">Digital Preview</span>
              </div>
              {isAdmitted ? (
                <button className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-variant flex items-center justify-center text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </button>
              ) : (
                <span className="material-symbols-outlined text-outline">lock</span>
              )}
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between aspect-square">
              <span className="material-symbols-outlined text-primary text-[28px]">receipt_long</span>
              <div className="mt-auto">
                <h4 className="text-label-md text-on-surface">Term Invoice</h4>
                <p className="text-body-sm text-on-surface-variant mt-1 mb-3">Fall 2024</p>
                {hasInvoice ? (
                  <a href="/api/student/invoice" className="text-primary text-label-sm flex items-center gap-1">
                    Download <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  </a>
                ) : (
                  <span className="text-on-surface-variant text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span> Unavailable
                  </span>
                )}
              </div>
            </div>
            <div className="bg-surface rounded-xl border border-outline-variant p-4 shadow-sm flex flex-col justify-between aspect-square">
              <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
              <div className="mt-auto">
                <h4 className="text-label-md text-on-surface">Admission</h4>
                <p className="text-body-sm text-on-surface-variant mt-1 mb-3">Official Letter</p>
                {hasAdmissionLetter ? (
                  <a href="/api/student/admission-letter" className="text-primary text-label-sm flex items-center gap-1">
                    Download <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  </a>
                ) : (
                  <span className="text-on-surface-variant text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span> Unavailable
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider">Payment History</h3>
          </div>
          <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            {payments.length > 0 ? payments.map((p, i) => (
              <div key={i} className="flex justify-between items-center p-4 border-b border-outline-variant/50 last:border-b-0 hover:bg-surface-container-lowest transition-colors">
                <div className="flex flex-col">
                  <span className="text-label-md text-on-surface">{p.description || 'Payment'}</span>
                  <span className="text-body-sm text-on-surface-variant mt-0.5">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-label-md text-on-surface">৳{p.amount}</span>
                  <span className={`text-label-sm flex items-center gap-1 mt-0.5 ${p.status === 'verified' ? 'text-tertiary' : 'text-secondary'}`}>
                    <span className="material-symbols-outlined text-[14px]">{p.status === 'verified' ? 'check_circle' : 'schedule'}</span>
                    {p.status === 'verified' ? 'Paid' : p.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-on-surface-variant text-body-sm">No payment history</div>
            )}
          </div>
        </section>

        {isAdmitted && (
          <section>
            <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Course Progression</h3>
            <div className="bg-surface rounded-xl border border-outline-variant p-1 shadow-sm flex flex-col">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-label-md text-on-surface">Module 1: Introduction</span>
                  <span className="text-body-sm text-primary mt-0.5">Available Now</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg opacity-60 bg-surface-container-lowest">
                <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-label-md text-on-surface">Module 2: Fundamentals</span>
                  <span className="text-body-sm text-on-surface-variant mt-0.5">Unlocks Week 3</span>
                </div>
              </div>
              <div className="w-full h-px bg-outline-variant/30 my-2" />
              <div className="flex items-center gap-4 p-3 rounded-lg opacity-50 bg-surface-container-lowest">
                <div className="w-12 h-12 rounded border border-dashed border-outline-variant flex items-center justify-center flex-shrink-0 bg-surface">
                  <span className="material-symbols-outlined text-outline">workspace_premium</span>
                </div>
                <div className="flex flex-col flex-grow">
                  <span className="text-label-md text-on-surface">Completion Certificate</span>
                  <span className="text-body-sm text-on-surface-variant mt-0.5">Complete all modules to unlock</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 border-t border-outline-variant bg-surface shadow-lg z-50">
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 active:scale-90 transition-all w-16">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-label-sm mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant active:scale-90 transition-all rounded-xl w-16">
          <span className="material-symbols-outlined">assignment_turned_in</span>
          <span className="text-label-sm mt-1">Status</span>
        </button>
        <button onClick={logout} className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-variant active:scale-90 transition-all rounded-xl w-16">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-sm mt-1">Logout</span>
        </button>
      </nav>
    </div>
  );
}
