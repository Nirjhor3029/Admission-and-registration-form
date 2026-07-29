import { useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative overflow-hidden antialiased">
      <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[50%] bg-primary-fixed rounded-[100%] blur-3xl opacity-40 pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-md mx-auto z-10 relative">
        <div className="animate-fade-in-up w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>

        <h1 className="animate-fade-in-up delay-100 text-headline-lg text-on-surface text-center mb-4">
          Registration Submitted!
        </h1>

        <div className="animate-fade-in-up delay-200 w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm mb-8 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="flex flex-col gap-1">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Student Name</span>
            <span className="text-body-md text-on-surface font-semibold">Your Application</span>
          </div>
          <div className="w-full border-b border-dashed border-outline-variant/30" />
          <div className="flex flex-col gap-1">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Status</span>
            <span className="text-body-md text-on-surface font-semibold">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-label-sm">
                Pending Verification
              </span>
            </span>
          </div>
          <div className="w-full border-b border-dashed border-outline-variant/30" />
          <div className="flex flex-col gap-1">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Next Steps</span>
            <span className="text-body-md text-on-surface font-semibold">Awaiting payment verification</span>
          </div>
        </div>

        <p className="animate-fade-in-up delay-300 text-body-sm text-on-surface-variant text-center mb-8 px-4">
          We will contact you via Phone/WhatsApp/Email shortly with your next steps.
        </p>

        <button
          onClick={() => navigate('/')}
          className="animate-fade-in-up delay-300 w-full bg-primary text-on-primary h-12 rounded-lg text-label-md flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-primary-container"
        >
          <span className="material-symbols-outlined">home</span>
          Back to Home
        </button>
      </main>
    </div>
  );
}
