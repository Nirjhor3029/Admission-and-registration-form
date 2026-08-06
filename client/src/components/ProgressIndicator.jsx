
function ProgressIndicator() {
  return (
    <>
        {/* Progress Indicator (Glassmorphism) */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white mb-stack-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">Step 1 of 2</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Personal &amp; Course Info</span>
            </div>
            <div className="w-full bg-surface-variant/50 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-700 w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full animate-shimmer" />
            </div>
            </div>
        </div>
    </>
  )
}

export default ProgressIndicator