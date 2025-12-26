import React from 'react'

const AdmissionCard = ({ title, description }) => {
  return (
    <div className="my-12 mx-4 h-[105px] bg-white rounded-[15px] p-5 shadow-lg flex flex-col justify-center items-center text-center transition-transform active:scale-95 cursor-pointer
    /* ใช้ Gradient ภายในตัวการ์ด */
    bg-gradient-to-r from-white/0 to-[#DCEEFA]">

      <h3 className="text-[20px] font-bold text-slate-800 leading-tight whitespace-pre-line">
        {title}
      </h3>

      <p className="text-[18px] font-normal text-slate-800 mt-1">
        {description}
      </p>

    </div>
  )
}

export default AdmissionCard