import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background antialiased">
      {/* Top App Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-sm h-16">
        <div className="flex justify-between items-center w-full h-full px-4 md:px-10 max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <div className="flex flex-col justify-center leading-none">
              <span className="text-headline-md font-bold text-primary tracking-tight">SARS</span>
              <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-on-surface-variant mt-0.5">Online Admission &amp; Registration System</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-primary font-bold hover:bg-surface-variant transition-colors px-3 py-2 rounded-lg" href="/">Home</a>
            <a className="text-on-surface-variant hover:bg-surface-variant transition-colors px-3 py-2 rounded-lg" href="/student/login">Status</a>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center ml-4 cursor-pointer hover:bg-surface-variant transition-colors">
              <span className="text-label-sm">US</span>
            </div>
          </nav>
          <div className="md:hidden w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
            <span className="text-label-sm">US</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-[1280px] mx-auto w-full pt-16">
        {/* Hero Section */}
        <section className="px-4 md:px-10 py-12 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full w-fit mb-4">
              <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <span className="text-label-sm text-primary font-medium">New Semester Enrollment Open</span>
            </div>
            <h1 className="text-headline-xl md:text-5xl lg:text-6xl text-primary font-extrabold leading-tight">
              Advance Your Academic Journey with SARS
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl">
              Experience a seamless, secure, and intuitive platform designed to streamline your registration, course management, and academic progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => navigate('/register/step1')}
                className="bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container text-label-md px-8 py-4 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Apply Now
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/register/step1')}
                className="bg-surface hover:bg-surface-container border border-outline-variant text-primary text-label-md px-8 py-4 rounded-lg transition-all active:scale-95"
              >
                Explore Courses
              </button>
            </div>
            <button
              onClick={() => navigate('/student/login')}
              className="mt-4 inline-flex items-center gap-2 w-fit bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary text-label-md px-5 py-3 rounded-lg transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
              Already Applied? Check Course Status
            </button>
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-outline-variant/30">
              <div className="flex flex-col">
                <span className="text-headline-md text-primary font-bold">10k+</span>
                <span className="text-label-sm text-on-surface-variant">Active Students</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/50" />
              <div className="flex flex-col">
                <span className="text-headline-md text-primary font-bold">500+</span>
                <span className="text-label-sm text-on-surface-variant">Expert Mentors</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/50" />
              <div className="flex flex-col">
                <span className="text-headline-md text-primary font-bold">98%</span>
                <span className="text-label-sm text-on-surface-variant">Success Rate</span>
              </div>
            </div>
          </div>
          <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-outline-variant/20 bg-surface-container-low group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-surface-variant/30 flex items-center justify-center">
              <div className="text-center p-8">
                <span className="material-symbols-outlined text-6xl text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                <p className="text-on-surface-variant/60 text-body-md mt-4">Empowering Future Leaders</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-6 left-6 bg-surface/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div>
                <p className="text-label-md text-on-surface font-bold">Accredited Platform</p>
                <p className="text-label-sm text-on-surface-variant">Globally recognized standards</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-2 bg-surface border-t border-outline-variant z-50 shadow-lg">
        <div className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl p-2 min-w-[64px] active:scale-90 transition-all cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-2 min-w-[64px] hover:bg-surface-variant active:scale-90 transition-all rounded-xl cursor-pointer" onClick={() => navigate('/student/login')}>
          <span className="material-symbols-outlined">assignment_turned_in</span>
          <span className="text-[10px] mt-1">Status</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-2 min-w-[64px] hover:bg-surface-variant active:scale-90 transition-all rounded-xl cursor-pointer">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] mt-1">Profile</span>
        </div>
      </nav>

      {/* Footer */}
      <footer className="w-full bg-primary text-on-primary mt-auto">
        <div className="max-w-[1280px] mx-auto py-8 px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-label-md uppercase tracking-wider font-bold">SARS Platform</div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="text-body-sm text-on-primary/80 hover:text-[#ffb95f] transition-colors" href="#">Privacy Policy</a>
            <a className="text-body-sm text-on-primary/80 hover:text-[#ffb95f] transition-colors" href="#">Terms of Service</a>
            <a className="text-body-sm text-on-primary/80 hover:text-[#ffb95f] transition-colors" href="#">Contact Support</a>
          </div>
          <div className="text-body-sm text-on-primary/60">© 2024 SARS Platform. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
