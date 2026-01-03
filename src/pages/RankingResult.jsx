import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Banner from '../components/Banner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

function RankingResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const { results, year } = location.state || { results: [], year: '' };
  const validResults = Array.isArray(results) ? results.filter(item => item !== null) : [];

  // --- ฟังก์ชัน Export PDF ---

  const handleExportPDF = async () => {
    const element = document.getElementById('ranking-report');
    if (!element) return;

    // เก็บสีเดิมไว้ก่อน (Backup)
    const originalStyle = element.style.cssText;

    try {
      // ล้างสีที่มีปัญหาออกให้หมดก่อนเริ่มงาน
      // บังคับเปลี่ยนสีทุกตัวที่เป็นปัญหาให้เป็นค่าที่ Library รู้จัก
      const allNodes = element.querySelectorAll('*');
      allNodes.forEach(node => {
        const style = window.getComputedStyle(node);
        if (style.color.includes('oklch')) node.style.color = '#1e293b';
        if (style.backgroundColor.includes('oklch')) node.style.backgroundColor = '#ffffff';
        if (style.borderColor.includes('oklch')) node.style.borderColor = '#000000';
      });

      // เริ่มการ Download
      const opt = {
        margin: 10,
        filename: 'TCAS-Ranking.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true, // ช่วยให้ตัวอักษรไม่เลื่อนซ้อนกัน
          scrollX: 0,
          scrollY: 0,
          windowWidth: 450, // บังคับความกว้างหน้าต่างจำลองให้เท่ากับที่จัดใน CSS
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

    } catch (err) {
      console.error("Download Error:", err);
      alert("เกิดข้อผิดพลาดในการสร้างไฟล์ กรุณาใช้ปุ่มพิมพ์แทนนะคะ");
    } finally {
      // เปลี่ยนสีกลับคืนเป็นแบบสวยๆ (oklch) เหมือนเดิม
      // คืนค่าสไตล์เดิมหลังทำเสร็จ (หรือแค่ล้าง style inline ออก)
      const allNodes = element.querySelectorAll('*');
      allNodes.forEach(node => {
        node.style.color = '';
        node.style.backgroundColor = '';
        node.style.borderColor = '';
      });
    }
  };

  if (validResults.length === 0) {
    return (
      <div className="min-h-screen bg-[#ADD6F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-2xl font-black mb-2">ว้าย! คำนวณไม่สำเร็จ</h1>
          <p className="font-bold text-slate-600 mb-6">ไม่พบเกณฑ์การรับหรือคะแนนที่ตรงกับคณะที่เลือกค่ะ</p>
          <button onClick={() => navigate(-1)} className="bg-[#FD7A6C] text-white border-2 border-black px-6 py-2 rounded-xl font-black">
            กลับไปเลือกใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ADD6F2] pb-20">
      {/* ส่วนที่ต้องการให้แสดงใน PDF ครอบด้วย id="ranking-report */}
      <div id="ranking-report">
        <Banner />
        <div className="max-w-[450px] mx-auto px-6 mt-8">
          <div className="text-center mb-10">
            <h1 className="text-[32px] font-black text-slate-800 italic uppercase leading-none">RANKING RESULTS</h1>
            <p className="inline-block bg-[#FD7A6C] text-white border-2 border-black px-4 py-1 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-2">
              ปีการศึกษา {year}
            </p>
          </div>

          <div className="space-y-8">
            {validResults.map((item, index) => (
              <div key={index} className="bg-white border-4 border-black rounded-2xl p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                <div className="absolute -top-5 -left-4 w-12 h-12 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center font-black text-2xl z-10">
                  {index + 1}
                </div>

                <div className="mb-4">
                  <h3 className="text-[18px] font-black leading-tight mb-1">{item.programName}</h3>
                  <p className="text-[14px] font-bold text-slate-600 uppercase">{item.universityName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-100 p-3 border-2 border-black rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">คะแนนของคุณ</p>
                    <p className="text-[20px] font-black text-[#FD7A6C]">{item.totalScore}</p>
                  </div>
                  <div className="bg-slate-100 p-3 border-2 border-black rounded-xl text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">ต่ำสุดปีที่แล้ว</p>
                    <p className="text-[20px] font-black">{item.lastYearMinScore || '-'}</p>
                  </div>
                </div>

                {item.failedSubjects?.length > 0 && (
                  <div className="mt-2 p-2 bg-orange-50 border-l-4 border-orange-500 rounded mb-3">
                    <p className="text-[11px] text-orange-700 font-bold">
                      ⚠️ ข้อมูลไม่ครบ: ({item.failedSubjects.join(', ')})
                    </p>
                  </div>
                )}

                <div className={`p-4 border-2 border-black rounded-xl ${item.risk?.status === 'Safe' ? 'bg-green-100' :
                  item.risk?.status === 'Passable' ? 'bg-yellow-100' :
                    item.risk?.status === 'Risk' ? 'bg-red-100' : 'bg-slate-100'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">AI Analysis</span>
                    <span className="text-[14px] font-bold">{item.risk?.status || 'Unknown'}</span>
                  </div>
                  <p className="text-[12px] font-bold text-slate-700 leading-snug">{item.risk?.message}</p>
                </div>

                {item.recommendation && (
                  <div className="mt-4 p-3 bg-blue-50 border-2 border-dashed border-blue-400 rounded-xl">
                    <p className="text-[12px] font-bold text-blue-800 italic">💡 คำแนะนำ: {item.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ปุ่ม Download (อยู่นอก id เพราะไม่ต้องการให้ติดเข้าไปในไฟล์ PDF) */}
      <div className="max-w-[450px] mx-auto px-6 mt-10">
        <button
          onClick={handleExportPDF}
          className="w-full h-[60px] bg-white border-4 border-black rounded-xl font-black text-slate-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase hover:bg-yellow-50"
        >
          Download PDF Report
        </button>
      </div>
    </div>
  );
}

export default RankingResult;