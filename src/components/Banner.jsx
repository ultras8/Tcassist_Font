import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BackIcon, HomeIcon } from './icons'
import UserProfile from './userProfile'
import { useUser } from '../context/UserContext'

const Banner = ({ showBack = true }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between p-4">
      {/* ส่วน Profile */}
      <UserProfile
        name={user.name}
        profileUrl={user.profileUrl}
      />

      {/* ส่วนไอคอนควบคุม */}
      <div className="flex items-center gap-2">
        {/* ถ้าอยู่หน้าแรกอาจจะไม่โชว์ปุ่ม Back แต่หน้าอื่นโชว์ */}
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-slate-700"
          >
            <BackIcon />
          </button>
        )}

        <button
          onClick={() => navigate('/')}
          className="p-2 text-slate-700 rounded-xl transition-all active:scale-90"
        >
          <HomeIcon />
        </button>
      </div>
    </nav>
  )
}

export default Banner