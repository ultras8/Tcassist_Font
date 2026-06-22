import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LogoutIcon, ChatIcon } from '../components/Icons';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const userContext = useUser();
  const user = userContext?.user;

  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const checkNewMessages = async () => {
      try {
        const res = await axios.get('http://localhost:3000/reports/my-reports');
        if (res.data && Array.isArray(res.data)) {
          const hasUpdate = res.data.some(report => report.status === 'resolved');
          setHasNewMessage(hasUpdate);
        }
      } catch (err) {
        console.log("ยังไม่พบข้อมูลใหม่ค่ะ");
      }
    };

    if (user) {
      checkNewMessages();
      const interval = setInterval(checkNewMessages, 30000); // เช็คทุก 30 วิ
      return () => clearInterval(interval);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    if (window.confirm("จะออกจากระบบจริงๆ หรอคะ?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userAvatar');
      navigate('/login');
    }
  };

  if (!userContext || !user) {
    return (
      <div className="min-h-screen bg-[#ADD6F2] flex items-center justify-center font-black text-slate-900">
        <div className="text-center">
          <p className="animate-bounce text-2xl mb-2">🎓</p>
          <p>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
        </div>
      </div>
    );
  }

  const userName = user?.name || "นักล่าฝัน";
  const storedAvatar = localStorage.getItem('userAvatar');
  const userProfile = storedAvatar || "https://ui-avatars.com/api/?name=User";

  const quotes = [
    "ความพยายามไม่เคยทำร้ายใคร สู้เขานะ!",
    "ว่าที่นิสิตนักศึกษาใหม่ อยู่ตรงนี้แล้ว!",
    "วันนี้เป็นวันที่ดีที่จะเริ่มทบทวนบทเรียนนะ",
    "อย่าเพิ่งท้อนะ ความสำเร็จรออยู่ข้างหน้า",
    "เชื่อมั่นในตัวเองเข้าไว้ น้องทำได้แน่นอน!",
    "เหนื่อยก็พัก แต่อย่าเพิ่งล้มเลิกนะจ๊ะ",
    "คณะในฝันอยู่ไม่ไกล ถ้าเราตั้งใจจริง"
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="min-h-screen bg-[#ADD6F2] flex flex-col items-center px-6 pb-10 relative">

      {/* ส่วนปุ่มกดด้านบน (Top Actions) */}
      <div className="absolute top-8 right-6 flex items-center gap-2 z-10">

        <button
          onClick={() => navigate('/my-reports')}
          className="w-10 h-10 flex items-center justify-center relative active:scale-90 transition-all hover:bg-white/50 rounded-full"
          title="ดูรายงานและข้อความ"
        >
          <span className="text-xl text-slate-800"><ChatIcon /></span>

          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#ADD6F2] text-[7px] text-white font-black items-center justify-center">
                NEW
              </span>
            </span>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center active:translate-y-1 active:shadow-none transition-all hover:bg-red-100 rounded-full"
          title="ออกจากระบบ"
        >
          <span className="text-xl"><LogoutIcon /></span>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="w-full max-w-[344px] mt-16 flex flex-col items-start">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white border-[3px] border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <img src={userProfile} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-slate-700 italic mb-1">สวัสดีจ้า,</p>
            <h1 className="text-[34px] font-black text-slate-900 leading-none">{userName}</h1>
          </div>
        </div>
      </div>

      {/* Main Menu Buttons */}
      <div className="flex flex-col gap-8 mt-12 mb-12">
        <button
          onClick={() => navigate('/admission')}
          className="w-[344px] h-[160px] bg-[#E3BBD4] border-[3px] border-black rounded-[30px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center p-6 gap-6 transition-all active:translate-y-1 active:shadow-none hover:-translate-y-1"
        >
          <div className="w-20 h-20 bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg] shrink-0">
            <span className="text-[40px]">🎓</span>
          </div>
          <div className="text-left">
            <h3 className="text-[24px] font-black text-slate-800 leading-tight">คำนวณคะแนน</h3>
            <p className="text-[12px] font-bold text-slate-700/70 mt-1 uppercase tracking-wider">Admission Mode</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/exam-library')}
          className="w-[344px] h-[160px] bg-[#FDE68A] border-[3px] border-black rounded-[30px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center p-6 gap-6 transition-all active:translate-y-1 active:shadow-none hover:-translate-y-1"
        >
          <div className="w-20 h-20 bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[3deg] shrink-0">
            <span className="text-[40px]">📚</span>
          </div>
          <div className="text-left">
            <h3 className="text-[24px] font-black text-slate-800 leading-tight">คลังข้อสอบ</h3>
            <p className="text-[12px] font-bold text-slate-700/70 mt-1 uppercase tracking-wider">Past Papers</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/mock-exam')}
          className="w-[344px] h-[160px] bg-[#A7F3D0] border-[3px] border-black rounded-[30px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center p-6 gap-6 transition-all active:translate-y-1 active:shadow-none hover:-translate-y-1"
        >
          <div className="w-20 h-20 bg-white border-[3px] border-black rounded-[20px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg] shrink-0">
            <span className="text-[40px]">⏱️</span>
          </div>
          <div className="text-left">
            <h3 className="text-[24px] font-black text-slate-800 leading-tight">จำลองสอบ</h3>
            <p className="text-[12px] font-bold text-slate-700/70 mt-1 uppercase tracking-wider">Mock Exam</p>
          </div>
        </button>
      </div>

      {/* Quote Section */}
      <div className="mt-auto mb-10 text-center w-full max-w-[320px]">
        <div className="bg-white/30 backdrop-blur-sm border-2 border-dashed border-black/20 p-5 rounded-3xl">
          <p className="text-[16px] font-bold text-slate-800 italic leading-relaxed">
            "{randomQuote}"
          </p>
          <div className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Daily Inspiration
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;