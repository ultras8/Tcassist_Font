const ScoreReport = ({ score, total, usedTime, subject }) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center bg-white p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full border border-slate-100">
      {/* ส่วนหัว: หัวข้อวิชา */}
      <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">{subject}</h2>
      <h1 className="text-3xl font-black text-slate-800 mb-8 italic">Examination Result</h1>

      {/* วงกลมคะแนนพรีเมียม */}
      <div className="relative flex items-center justify-center w-56 h-56 rounded-full bg-gradient-to-tr from-indigo-50 to-white shadow-inner border-8 border-white mb-10">
        <div className="text-center">
          <span className="text-7xl font-black text-slate-900">{score}</span>
          <span className="text-2xl font-bold text-slate-400"> / {total}</span>
          <p className="text-[10px] font-black text-indigo-400 mt-1 tracking-widest uppercase">Total Score</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        <div className="bg-slate-50 p-6 rounded-[2rem] text-center border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Accuracy</p>
          <p className="text-2xl font-black text-emerald-500">{percentage}%</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-[2rem] text-center border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Time Used</p>
          <p className="text-2xl font-black text-slate-700">{usedTime}</p>
        </div>
      </div>

      {/* ปุ่ม Action */}
      <div className="flex gap-4 w-full">
        <button onClick={() => window.location.reload()} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg">
          Try Again ✨
        </button>
        <button className="flex-1 py-4 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-black hover:bg-slate-50 transition-all">
          Home
        </button>
      </div>
    </div>
  );
};
export default ScoreReport;