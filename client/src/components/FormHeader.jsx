
function FormHeader() {
  return (
    <>
        {/* Premium Brand Header */}
        <header className="w-full relative pt-16">
            <div className="absolute inset-0 bg-primary z-0 overflow-hidden">
            <img alt="Students" className="w-full h-full object-cover opacity-20 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida/AP1WRLuS_j7vLGZ_R2g5AuR3GRmBCiSMhbooFMJ43dnaibuMgqPGn6RhPJHIr0Xe-VaVurNRKTnis8i9Rlh-LuSekR_LbhqBnjD2HiJ_9FT635vuqIyEtdiV72eMDZGgesur0eTRDFPCZ3-qHwnVn4eQb7LmgTq34NltU1Av_02J2zq11dd43ynHjrZ2KM7rlgZWJncp6SjyVNFVeZwE7rlTGr3ShMcRsUuidtbeMuIbq-WbDuAvifnIcefFzHpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-primary/40" />
            </div>
            <div className="relative z-10 w-full max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-6 md:py-8 flex flex-col justify-center min-h-[180px]">
            <div className="absolute top-4 right-4 md:right-8 flex items-center">
                <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <span className="font-label-sm text-label-sm uppercase tracking-wider hidden md:block">Cancel</span>
                <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
                <div className="flex flex-col">
                <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl font-bold text-white tracking-tight drop-shadow-sm">Nanosoft Training Institute</h1>
                <p className="font-body-sm text-body-sm text-white/80 mt-1"></p>
                <p className="font-body-sm text-body-sm text-white/60 mt-0.5">Sister concern of Nano Information Technology (Nanosoft)</p>
                </div>
            </div>
            </div>
        </header>

        
    </>
  )
}

export default FormHeader