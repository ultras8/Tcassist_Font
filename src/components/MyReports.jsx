import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Banner from './Banner';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // const fetchMyReports = async () => {
  //   try {
  //     const res = await axios.get('http://localhost:3000/reports/my-reports', {
  //       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  //     });
  //     setReports(res.data);
  //   } catch (err) {
  //     console.error("โหลดข้อมูลไม่สำเร็จค่ะ", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchMyReports = async () => {
    try {
      const res = await axios.get('http://localhost:3000/reports/my-reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReports(res.data);
    } catch (err) {
      console.error("โหลดข้อมูลไม่สำเร็จค่ะ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyReports(); }, []);

  // ฟังก์ชันเลือกสีตามสถานะ
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'closed': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    // 1. เปลี่ยน bg-slate-50 เป็น bg-[#ADD6F2] ให้เหมือนหน้า ExamLibrary ค่ะ
    <div className="min-h-screen bg-[#ADD6F2] pb-20 animate-in fade-in duration-700">

      {/* 2. Banner กว้างเต็มจอเหมือนเดิม */}
      <Banner />

      {/* 3. ส่วนเนื้อหาที่บีบเข้ากลางจอ */}
      <div className="max-w-4xl mx-auto px-6 mt-10">

        {/* Header & Create Button */}
        <div className="flex justify-between items-end mb-10">
          <div>
            {/* ปรับสีตัวอักษรให้เข้มชัดสู้กับพื้นหลังสีฟ้า */}
            <h2 className="text-[40px] font-black text-slate-800 italic uppercase leading-none">
              Support Tickets
            </h2>
            <p className="text-slate-700 font-bold mt-2 uppercase tracking-widest text-sm">
              ติดตามสถานะการแจ้งปัญหาของคุณ
            </p>
          </div>

          {/* ปุ่มสไตล์เดียวกับหน้าข้อสอบ (มีเงาสีดำ Shadow-Neobrutalism) */}
          <button
            onClick={() => navigate('/create-report')}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center gap-2"
          >
            <span>+</span> OPEN NEW TICKET
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 font-black text-slate-800 opacity-30 text-4xl italic">LOADING...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border-4 border-dashed border-slate-800 rounded-[3rem] py-20 text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
            <p className="text-slate-600 font-black uppercase tracking-widest">ยังไม่มีประวัติการแจ้งเรื่องค่ะ ✨</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/report-chat/${ticket.id}`)}
                // เพิ่มเส้นขอบดำและเงาแบบ Neobrutalism ให้เข้ากับหน้าคลังข้อสอบค่ะ
                className="group bg-white p-7 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  {/* วงกลมไอคอนสถานะ */}
                  <div className={`w-16 h-16 rounded-2xl border-2 border-black flex items-center justify-center text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${getStatusStyle(ticket.status)}`}>
                    {ticket.status === 'resolved' ? '✅' : '⏳'}
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors italic">
                      {ticket.subject}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[11px] font-black uppercase px-4 py-1 rounded-full border-2 border-black ${getStatusStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="text-xs text-slate-500 font-black italic">
                        DATE: {new Date(ticket.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-black group-hover:text-indigo-600 transition-all transform group-hover:translate-x-2">
                  <ArrowRightIcon />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ไอคอนลูกศรเล็กๆ
const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);

export default MyReports;