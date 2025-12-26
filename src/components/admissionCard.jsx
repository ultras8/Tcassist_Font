import React from 'react'

function AdmissionCard({ title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      // items-center ตรงนี้จะจัด "ก้อน" ข้อความไว้กลางการ์ด
      className="mx-4 mb-4 h-[110px] bg-white rounded-[15px] p-4 shadow-md flex flex-col justify-center items-center transition-transform active:scale-95 cursor-pointer border-2 border-transparent hover:border-black"
    >
      {/* 🎯 จัดการตรงนี้ค่ะ: เพิ่ม text-center และ w-full */}
      <h3 className="text-[16px] font-black text-slate-800 leading-tight whitespace-pre-line text-center w-full">
        {title}
      </h3>

      {/* ส่วนคำอธิบายด้านล่างก็ต้อง text-center ด้วยนะคะ */}
      <p className="text-[12px] text-slate-500 mt-1 text-center w-full">
        {description}
      </p>
    </div>
  )
}

export default AdmissionCard