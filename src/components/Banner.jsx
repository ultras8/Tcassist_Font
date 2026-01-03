import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackIcon, HomeIcon, LogoutIcon } from './icons'
import UserProfile from './userProfile'
import { useUser } from '../context/UserContext'

const Banner = ({ showBack = true }) => {
  const { user, setUser } = useUser(); // ดึง setUser มาด้วยเพื่อใช้ตอน Logout
  const navigate = useNavigate();

  // สร้าง state สำหรับเก็บรูปโปรไฟล์ที่ดึงมาจากเครื่อง
  const [localAvatar, setLocalAvatar] = useState('/default-avatar.png');

  useEffect(() => {
    // ไปหยิบรูปที่สุ่มไว้ตอน Login มาจาก localStorage
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setLocalAvatar(savedAvatar);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("จะออกจากระบบจริงๆ หรอคะ?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userAvatar'); // ล้างรูปทิ้ง
      setUser(null); // ล้างค่า user ใน context
      navigate('/login');
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 no-print"> {/* เพิ่ม no-print เผื่อไว้ตอนพิมพ์ PDF */}
      <UserProfile
        name={user?.name || 'Guest'}
        profileUrl={localAvatar} // ใช้รูปที่ดึงมาจาก localStorage
      />

      <div className="flex items-center gap-1">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-2 text-slate-700">
            <BackIcon />
          </button>
        )}

        <button onClick={() => navigate('/')} className="p-2 text-slate-700">
          <HomeIcon />
        </button>

        <button onClick={handleLogout} className="p-2 text-slate-700 hover:text-red-500">
          <LogoutIcon />
        </button>
      </div>
    </nav>
  )
}

export default Banner