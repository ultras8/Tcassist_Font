import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackIcon, HomeIcon, LogoutIcon, ChatIcon } from './Icons' // อย่าลืมเพิ่ม ChatIcon ในไฟล์ Icons นะคะ
import UserProfile from './UserProfile'
import { useUser } from '../context/UserContext'
import axios from 'axios'

const Banner = ({ showBack = true }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [localAvatar, setLocalAvatar] = useState('/default-avatar.png');
  const [hasNewMessage, setHasNewMessage] = useState(false); // State สำหรับเช็คว่ามีข้อความใหม่ไหม

  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) setLocalAvatar(savedAvatar);


    const checkNewMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // ถ้าไม่มี token ไม่ต้องดึง

        const res = await axios.get('http://localhost:3000/reports/my-reports', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // เช็คความปลอดภัยของข้อมูลก่อน some
        if (res.data && Array.isArray(res.data)) {
          const hasUpdate = res.data.some(report => report.status === 'resolved');
          setHasNewMessage(hasUpdate);
        }
      } catch (err) {
        // ลบ console.error ออกถ้ามันรกตา หรือเก็บไว้ debug เฉพาะตอน dev ค่ะ
        console.log("ยังไม่พบข้อมูลใหม่ค่ะ");
      }
    };

    if (user) {
      checkNewMessages();
      // เช็คทุกๆ 30 วินาที เผื่อ Admin ตอบกลับมาตอนเราเปิดหน้าอื่นอยู่
      const interval = setInterval(checkNewMessages, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    if (window.confirm("จะออกจากระบบจริงๆ หรอคะ?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userAvatar');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 no-print backdrop-blur-md sticky top-0 z-50">
      <UserProfile
        name={user?.name || 'Guest'}
        profileUrl={localAvatar}
      />

      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/my-reports')}
          className="p-2 text-slate-700 relative group transition-all active:scale-90"
          title="Messages"
        >
          <ChatIcon />

          {hasNewMessage && (
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white text-[7px] text-white font-black items-center justify-center">
                NEW
              </span>
            </span>
          )}
        </button>

        {showBack && (
          <button onClick={() => navigate(-1)} className="p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-all">
            <BackIcon />
          </button>
        )}

        <button onClick={() => navigate('/')} className="p-2 text-slate-700 hover:bg-slate-50 rounded-full transition-all">
          <HomeIcon />
        </button>

        <button onClick={handleLogout} className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
          <LogoutIcon />
        </button>
      </div>
    </nav>
  )
}

export default Banner