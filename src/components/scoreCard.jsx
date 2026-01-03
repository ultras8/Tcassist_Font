const ScoreCard = ({ university, faculty, score, fullScore, year, risk, isMini = false, recommendation }) => {
  // คำนวณ % คะแนน (สมมติเกณฑ์ผ่านอยู่ที่ 50% ของคะแนนเต็ม)
  const scoreRatio = (score / fullScore) * 100;
  const passThreshold = 55; // เกณฑ์สมมติ

  // Logic เลือกสี Badge ตามสถานะความเสี่ยง
  const getRiskColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'safe':
        return 'bg-green-400 text-green-900';
      case 'passable':
        return 'bg-yellow-300 text-yellow-900';
      case 'risk':
        return 'bg-red-400 text-red-900';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  };

  let status = {
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: '⚠️ คะแนนไม่ผ่านเกณฑ์',
    message: 'ไม่เป็นไรนะ! พยายามอีกนิด อีกนิดเดียวเท่านั้น สู้ๆ นะคะ ✌️'
  };

  if (scoreRatio >= passThreshold + 5) {
    status = {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: '✨ คะแนนผ่านเกณฑ์',
      message: 'เก่งมากเลยค่ะ! รักษามาตรฐานนี้ไว้ ติดชัวร์ๆ ยินดีด้วยนะ 🎉'
    };
  } else if (scoreRatio >= passThreshold - 3) {
    // 🟡 Risk Zone (คะแนนก้ำกึ่ง +/- นิดเดียว)
    status = {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      label: '⚖️ คะแนนต้องลุ้น!',
      message: 'ก้ำกึ่งมากเลย! ยังมีโอกาสนะ ทำคะแนนส่วนอื่นเพิ่มอีกนิด ลุ้นหนักแต่เป็นไปได้! 🔥'
    };
  }

  return (
    <div className={`w-full bg-white border-2 border-black rounded-[25px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6 ${isMini ? 'min-h-[350px]' : 'min-h-[480px]'} flex flex-col justify-between transition-all hover:-translate-y-1`}>
      <div>
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <span className="bg-[#ADD6F2] text-slate-800 px-3 py-1 rounded-full text-[12px] font-black border border-black">TCAS {year}</span>
            {risk && (
              <span className={`px-3 py-1 rounded-full text-[12px] font-black border ${getRiskColor(risk.status)}`}>
                AI: {risk.status}
              </span>
            )}
          </div>

          <span className={`px-3 py-1 rounded-lg text-[11px] font-bold ${status.bg} ${status.color} border ${status.border}`}>
            {status.label.split(' ')[0]}
          </span>
        </div>

        <h3 className="text-[20px] font-black text-slate-800 mt-4 leading-tight">{university}</h3>
        <p className="text-[15px] font-bold text-slate-500">{faculty}</p>

        {/* ส่วนแสดงคะแนน */}
        <div className="mt-8 text-center bg-slate-50 py-4 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">คะแนนที่คำนวณได้</p>
          <div className="my-1">
            <span className={`text-[42px] font-black ${status.color} leading-none`}>
              {score.toLocaleString()}
            </span>
            <span className="text-[18px] font-bold text-slate-400 ml-1">/ {fullScore.toLocaleString()}</span>
          </div>

          <p className={`text-[16px] font-black ${status.color}`}>
            {risk ? `โอกาสติด: ${risk.message}` : status.label}
          </p>
        </div>
      </div>

      {recommendation && (
        <div className="mt-4 p-3 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl">
          <p className="text-[12px] font-bold text-blue-800 italic">
            💡 คำแนะนำ: {recommendation}
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-slate-800 rounded-xl relative">
        <p className="text-[12px] text-white font-medium leading-relaxed italic">
          " {status.message} "
        </p>
      </div>
    </div>
  );
};
export default ScoreCard