import React, { useState } from 'react';
import Banner from '../components/Banner';

function ScoreCalculator({ type }) {
  // 🎯 1. ตั้งค่า Config ให้ครบตามที่น้องพิ้นต้องการ
  const configs = {
    single: {
      title: "Interested Faculty",
      description: "(from interested universities)",
      subDescription: "คำนวณคะแนนคณะที่สนใจ",
      showTwoDropdowns: true, // ตัวบอกว่าหน้าไหนมี 2 อัน
      label1: "เลือกมหาวิทยาลัย",
      label2: "เลือกคณะ/สาขา"
    },
    allInUni: {
      title: "Interested Universities",
      description: "(from various faculty)",
      subDescription: "คำนวณคะแนนทุกคณะในมหาวิทยาลัยที่สนใจ",
      showTwoDropdowns: false,
      label1: "เลือกมหาวิทยาลัย"
    },
    multiUni: {
      title: "Many Universities",
      description: "(from various universities)",
      subDescription: "คำนวณคะแนนคณะที่สนใจจากหลายมหาวิทยาลัย",
      showTwoDropdowns: false,
      label1: "เลือกคณะที่สนใจ"
    }
  };

  const current = configs[type];

  return (
    <div className="min-h-screen bg-[#ADD6F2] flex flex-col items-center">
      <Banner />

      {/* 📦 กล่องเนื้อหากลางหน้าจอ */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[360px] px-8 space-y-8 -mt-16">

        {/* 1. ส่วนหัวข้อและคำอธิบาย */}
        <div className="text-center space-y-1">
          <h1 className="text-[26px] font-black text-slate-800 leading-tight">
            {current.title}
          </h1>
          <p className="text-[14px] font-bold text-slate-600 italic">
            {current.description}
          </p>
          {current.subDescription && (
            <p className="text-[12px] text-slate-500 mt-2 font-medium">
              {current.subDescription}
            </p>
          )}
        </div>

        {/* 2. ส่วน Dropdown (เช็คเงื่อนไขว่าโชว์กี่อัน) */}
        <div className="w-full space-y-5">
          {/* Dropdown ที่ 1 (มีทุกหน้า) */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 ml-1">{current.label1}</label>
            <CustomSelect placeholder={`-- ${current.label1} --`} />
          </div>

          {/* Dropdown ที่ 2 (เฉพาะหน้าที่มี 2 อัน) */}
          {current.showTwoDropdowns && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[13px] font-bold text-slate-700 ml-1">{current.label2}</label>
              <CustomSelect placeholder={`-- ${current.label2} --`} />
            </div>
          )}
        </div>

        {/* 3. ปุ่มกดไปต่อ */}
        <button className="w-full h-[52px] mt-4 bg-[#FD7A6C] rounded-[18px] border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-[22px] font-black active:translate-y-1 active:shadow-none transition-all">
          CONTINUE
        </button>

      </div>
    </div>
  );
}

// 🎨 Component ย่อยสำหรับ Select ให้หน้าตาเหมือนกันเป๊ะ
const CustomSelect = ({ placeholder }) => (
  <div className="relative">
    <select className="w-full h-[55px] px-4 bg-white rounded-[15px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-slate-800 appearance-none outline-none focus:ring-2 ring-orange-400">
      <option value="">{placeholder}</option>
    </select>
    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

export default ScoreCalculator;