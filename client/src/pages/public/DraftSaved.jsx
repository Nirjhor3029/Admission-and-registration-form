import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const DRAFT_KEY = 'fars_draft';

const formatDate = () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const drawRoundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export default function DraftSaved() {
  const navigate = useNavigate();
  const location = useLocation();

  let draft = null;
  try {
    draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') || location.state || null;
  } catch {
    draft = location.state || null;
  }

  const code = draft?.code || '';
  const mobile = draft?.mobile || '';
  const name = draft?.name || '';

  useEffect(() => {
    if (!code) {
      navigate('/register/step1', { replace: true });
    }
  }, [code, navigate]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Draft code copied');
    } catch {
      toast.error('Could not copy code. Please copy manually.');
    }
  };

  const downloadTxt = () => {
    const content = [
      'FARS - Draft Resume Card',
      '',
      `Draft Code: ${code}`,
      `Mobile: ${mobile}`,
      `Name: ${name}`,
      `Saved: ${formatDate()}`,
      '',
      'Resume your application on the FARS registration page.',
      'Use the draft code or mobile number above to continue.',
      '',
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fars-draft-code.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Draft code downloaded');
  };

  const downloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 500);
    grad.addColorStop(0, '#00355f');
    grad.addColorStop(1, '#0f4c81');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 500);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 40px Inter, Arial, sans-serif';
    ctx.fillText('FARS', 60, 70);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '400 18px Inter, Arial, sans-serif';
    ctx.fillText('Admission & Registration', 60, 98);

    drawRoundedRect(ctx, 50, 130, 700, 290, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#43474e';
    ctx.font = '600 18px Inter, Arial, sans-serif';
    ctx.fillText('YOUR DRAFT CODE', 400, 190);

    ctx.fillStyle = '#00355f';
    ctx.font = '700 52px "Courier New", monospace';
    ctx.fillText(code, 400, 250);

    ctx.strokeStyle = '#c2c7d1';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(100, 275);
    ctx.lineTo(700, 275);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#43474e';
    ctx.font = '400 20px Inter, Arial, sans-serif';
    ctx.fillText(`Name: ${name || '-'}`, 400, 315);
    ctx.fillText(`Mobile: ${mobile || '-'}`, 400, 350);
    ctx.fillText(`Saved: ${formatDate()}`, 400, 385);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '400 16px Inter, Arial, sans-serif';
    ctx.fillText('Keep this card safe to resume your FARS application.', 400, 465);

    const link = document.createElement('a');
    link.download = 'fars-draft-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Draft card downloaded');
  };

  if (!code) return null;

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative overflow-hidden antialiased">
      <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[50%] bg-primary-fixed rounded-[100%] blur-3xl opacity-40 pointer-events-none" />

      <header className="w-full bg-surface-container-lowest border-b border-outline-variant px-4 md:px-10 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="text-headline-md font-bold text-primary tracking-tight">FARS</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/register/step1')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="text-label-sm uppercase tracking-wider hidden md:block">Cancel</span>
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full max-w-md mx-auto z-10 relative">
        <div className="animate-fade-in-up w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
        </div>

        <h1 className="animate-fade-in-up delay-100 text-headline-lg text-on-surface text-center mb-2">
          Draft Saved!
        </h1>
        <p className="animate-fade-in-up delay-100 text-body-sm text-on-surface-variant text-center mb-8 px-4">
          Your application is safe with us. Keep your draft code handy to resume anytime.
        </p>

        <div className="animate-fade-in-up delay-200 w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm mb-6 flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Your Draft Code</span>
            <span className="text-headline-xl font-black text-primary tracking-[0.15em] select-all">{code}</span>
          </div>
          <div className="w-full border-b border-dashed border-outline-variant/30" />
          <div className="w-full grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Mobile</span>
              <span className="text-body-md text-on-surface font-semibold">{mobile || '—'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Saved</span>
              <span className="text-body-md text-on-surface font-semibold">{formatDate()}</span>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up delay-200 grid grid-cols-2 gap-3 w-full mb-6">
          <button
            type="button"
            onClick={copyCode}
            className="h-12 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            Copy Code
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="h-12 rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md text-on-surface flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">image</span>
            Download Card
          </button>
        </div>

        <button
          type="button"
          onClick={downloadTxt}
          className="animate-fade-in-up delay-200 w-full mb-8 h-11 rounded-lg text-label-md text-primary flex items-center justify-center gap-2 bg-transparent hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-lg">description</span>
          Download as text (.txt)
        </button>

        <button
          onClick={() => navigate('/register/step1')}
          className="animate-fade-in-up delay-300 w-full bg-primary text-on-primary h-12 rounded-lg text-label-md flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:bg-primary-container"
        >
          Continue Registration
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>

        <p className="animate-fade-in-up delay-300 text-body-sm text-on-surface-variant text-center mt-6 px-4">
          You can also resume anytime using your mobile number or draft code on the registration page.
        </p>
      </main>
    </div>
  );
}
