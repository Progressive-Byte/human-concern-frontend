const FinalizeScreen = ({ loading, error, onRetry, onGoHistory }) => {
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F6F6] pt-[140px] px-4">
        <div className="max-w-[720px] mx-auto bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6">
          <h1 className="text-[20px] font-bold text-[#383838]">Finalizing your donation…</h1>
          <p className="text-[13px] text-[#737373] mt-1">Please keep this tab open.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#F6F6F6] pt-[140px] px-4">
        <div className="max-w-[720px] mx-auto bg-white rounded-2xl border border-dashed border-[#EBEBEB] p-6">
          <h1 className="text-[20px] font-bold text-[#383838]">We couldn't finalize your donation</h1>
          <p className="text-[13px] text-[#737373] mt-1">{error}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-[#EA3335] px-4 py-2 text-[13px] font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={onGoHistory}
              className="rounded-xl border border-[#E5E5E5] bg-white px-4 py-2 text-[13px] font-semibold text-[#383838] hover:bg-[#F9F9F9] transition cursor-pointer"
            >
              Go to Donation History
            </button>
          </div>
        </div>
      </main>
    );
  }

  return null;
};

export default FinalizeScreen;
