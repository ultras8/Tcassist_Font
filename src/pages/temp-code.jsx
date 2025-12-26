import React from 'react'
import Banner from '../components/Banner'

function InsertScore() {
  const aLevelSubjects = [
    "คณิตศาสตร์ 1", "คณิตศาสตร์ 2", "วิทยาศาสตร์ประยุกต์",
    "ฟิสิกส์", "เคมี", "ชีววิทยา",
    "ภาษาไทย", "สังคมศึกษา", "ภาษาอังกฤษ"
  ];
  return (
    <div className="min-h-screen bg-[#ADD6F2] pb-10 flex flex-col items-center">
      {/* Banner กว้างเต็มจอปกติ */}
      <div className="w-full">
        <Banner />
      </div>

      {/* ส่วนคำแนะนำ (จัดกลางและจำกัดความกว้างให้พอดีกับเนื้อหาด้านล่าง) */}
      <div className="mx-4 mt-2 mb-6 p-4 bg-white/20 rounded-[15px] border border-white/30 backdrop-blur-sm space-y-2 text-[14px] text-slate-800">
        <p>• กรอกคะแนนดิบที่ได้ ไม่ต้องกรอกคะแนนมาตรฐาน (T-Score)</p>
        <p>• มหาวิทยาลัยไหนที่กำหนดใช้คะแนนมาตรฐาน (T-Score) โปรแกรมจะแปลงจากคะแนนดิบให้เอง</p>
        <p>• วิชาที่ไม่ได้เข้าสอบ ให้เว้นว่างไว้ ไม่ต้องกรอกเป็น 0 คะแนน</p>
      </div>

      {/* Container หลักที่คุมทุกอย่างให้อยู่กลางจอ */}
      <div className="w-full max-w-[360px] flex flex-col items-center space-y-8">

        {/* 1. กลุ่ม GPAX */}
        <section className="w-full flex flex-col items-center">
          <div className="w-[149px] h-[22px] bg-[#FD7A6C] rounded-[15px] flex items-center justify-center mb-4">
            <span className="text-white text-[14px]">GPAX</span>
          </div>
          <input
            type="number"
            placeholder="0.00"
            className="w-[342px] h-[52px] bg-white rounded-[10px] border-2 border-black shadow-md px-4 text-center outline-none focus:ring-2 ring-orange-300"
          />
        </section>

        {/* 2. กลุ่ม TGAT */}
        <section className="w-full flex flex-col items-center">
          <div className="w-[176px] h-[22px] bg-[#FD7A6C] rounded-[15px] flex items-center justify-center">
            <span className="text-white text-[14px]">TGAT ความถนัดทั่วไป</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <ScoreInputItem title="TGAT1 อังกฤษ" />
            <ScoreInputItem title="TGAT2 คิด/เหตุผล" />
            <ScoreInputItem title="TGAT3 สมรรถนะ" />
          </div>
        </section>

        {/* 3. กลุ่ม TPAT */}
        <section className="w-full flex flex-col items-center">
          <div className="w-[242px] h-[22px] bg-[#FD7A6C] rounded-[15px] flex items-center justify-center">
            <span className="text-white text-[14px] ">TPAT 1-5 ความถนัดเฉพาะทาง</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <ScoreInputItem title="TPAT1 กสพท" />
            <ScoreInputItem title="TPAT2 ศิลปกรรม" />
            <ScoreInputItem title="TPAT3 วิทย์/วิศวะ" />
          </div>
        </section>

        {/* 4. กลุ่ม A-Level */}
        <section className="w-full flex flex-col items-center">
          <div className="w-[149px] h-[22px] bg-[#FD7A6C] rounded-[15px] flex items-center justify-center ">
            <span className="text-white text-[14px]">A-Level</span>
          </div>

          {/* ใช้ flex-wrap เพื่อให้กล่องเรียงกัน 3 กล่องต่อแถวสวยๆ */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-[5px]">
            {aLevelSubjects.map((subject, index) => (
              <ScoreInputItem key={index} title={subject} />
            ))}
          </div>
        </section>

      </div>
      <div className="w-full flex justify-center mt-12 mb-10">
        <button
          className="
            w-[287px] h-[41px] 
            bg-[#FD7A6C] 
            rounded-[15px] 
            border-2 border-black 
            shadow-md 
            flex items-center justify-center
            text-white text-[20px]
            transition-transform active:scale-95
          "
        >
          SAVE
        </button>
      </div>
    </div>
  )
}

// Component ย่อย (ใช้ shadow-md สำหรับเงานุ่มปกติ)
const ScoreInputItem = ({ title }) => (
  <div className="flex flex-col items-center">
    <label className="text-[10px] text-slate-500 mb-1 text-center h-[25px] flex items-end">
      {title}
    </label>
    <input
      type="number"
      className="w-[110px] h-[52px] bg-white rounded-[10px] border-2 border-black shadow-md text-center outline-none focus:ring-2 ring-orange-300"
    />
  </div>
)

export default InsertScore