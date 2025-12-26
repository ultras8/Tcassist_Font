import React from 'react'

const UserProfile = ({ name, profileUrl }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[36px] h-[36px] overflow-hidden rounded-full ">
        <img
          src={profileUrl}
          alt={`Profile of ${name}`}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-slate-700">{name}</span>
    </div>
  )
}

export default UserProfile