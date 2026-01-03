import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { LogoutIcon } from '../components/icons'

function Home() {
  const navigate = useNavigate();
  const userContext = useUser();
  const user = userContext?.user;

  useEffect(() => {
    const token = localStorage.getItem('token');

    // ไม่มี Token ในเครื่องเลย ให้ดีดทันทีไม่ต้องรอ
    if (!token) {
      console.log("No token found, redirecting...");
      navigate('/login');
      return;
    }

    // มี token แต่รอตั้งนานแล้ว user ก็ยังไม่มา (เช่น token ปลอมหรือหมดอายุ)
    // เพิ่ม timeout เล็กน้อยเผื่อเน็ตช้า ถ้าผ่านไป 3 วินาทียังไม่มี user ให้ดีดออก
    const timeout = setTimeout(() => {
      if (!user) {
        console.log("Session timeout or Invalid user, redirecting...");
        navigate('/login');
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [user, navigate]);

  const handleLogout = () => {
    if (window.confirm("จะออกจากระบบจริงๆ หรอคะ?")) {
      localStorage.removeItem('token'); // ลบ token ออก
      navigate('/login'); // ดีดไปหน้า login
    }
  };

  // ระหว่างที่รอเช็ค หรือถ้า userContext ยังเป็น undefined ให้โชว์ Loading
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

  // ดึงค่ามาใช้ได้อย่างปลอดภัย
  const userName = user?.name || "นักล่าฝัน";

  // ดึงรูปที่สุ่มไว้จาก localStorage ถ้าไม่มีให้ใช้รูป Default จาก assets หรือ UI-Avatar
  const storedAvatar = localStorage.getItem('userAvatar');
  const userProfile = storedAvatar || "https://ui-avatars.com/api/?name=User";

  // ลิสต์คำคม
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
    <div className="min-h-screen bg-[#ADD6F2] flex flex-col items-center px-6">

      <button
        onClick={handleLogout}
        className="absolute top-8 right-6 w-10 h-10 flex items-center justify-center active:translate-y-1 active:shadow-none transition-all hover:bg-red-100"
        title="ออกจากระบบ"
      >
        <span className="text-xl"><LogoutIcon /></span>
      </button>

      <div className="w-full max-w-[344px] mt-20 flex flex-col items-start">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-white border-[3px] border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <img src={userProfile} alt="avatar" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-slate-700 italic mb-1">สวัสดีจ้า,</p>
            <h1 className="text-[34px] font-black text-slate-900 leading-none">{userName}</h1>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/admission')}
        className="w-[344px] h-[279px] mt-20 bg-[#E3BBD4] border-[3px] border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center relative transition-all active:translate-y-2 active:shadow-none"
      >
        <div className="w-24 h-24 bg-white border-[3px] border-black rounded-[30px] flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg]">
          <span className="text-[50px]">🎓</span>
        </div>
        <h3 className="text-[30px] font-black text-slate-800">คำนวณคะแนน</h3>
        <p className="text-[15px] font-bold text-slate-700/80 mt-1 uppercase">Go to Admission Mode</p>
      </button>

      <div className="mt-auto mb-16 text-center w-full max-w-[320px]">
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