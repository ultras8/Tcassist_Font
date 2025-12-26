import React from 'react'
import { BackIcon, HomeIcon } from '../components/icons'
import UserProfile from '../components/userProfile'
import AdmissionCard from '../components/admissionCard'
import { useNavigate } from 'react-router-dom';
import Bannner from '../components/Banner'
import Banner from '../components/Banner';

function Admission() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* 2. การ์ดสีฟ้า #ADD6F2 (ส่วนบน) */}
      <div
        className="w-full h-[703px] bg-[#ADD6F2] rounded-b-[25px] absolute top-0 left-0"
        style={{ height: 'calc(703 / 852 * 100vh)' }} // สูตรคำนวณให้เป๊ะตามสัดส่วนจอ
      >

        {/* 🖼 Banner */}
        <Banner />

        <AdmissionCard
          title={"Interested Department \n ( from interested universities )"}
          description={"คำนวณคะแนนคณะที่สนใจ"}
          onClick={() => navigate('/calculate/faculty')}
        />
        <AdmissionCard
          title={"Interested Universities \n ( from various department) "}
          description={"คำนวณคะแนนทุกคณะในมหาวิทยาลัยที่สนใจ"}
          onClick={() => navigate('/calculate/university')}
        />
        <AdmissionCard
          title={"Interested Department \n ( from various universities) "}
          description={"คำนวณคะแนนคณะที่สนใจจากหลายมหาวิทยาลัย"}
          onClick={() => navigate('/calculate/compare')}
        />
        <AdmissionCard
          title={"TOP 10"}
          description={"ลองจัด 10 อันดับคละคณะและมหาวิทยาลัย"}
        />
        <div className="my-12 mx-4 h-[105px] bg-[#FD7A6C] rounded-[15px] p-5 shadow-lg flex flex-col justify-center items-center text-center transition-transform active:scale-95 cursor-pointer">

          <h3
            onClick={() => navigate('/score-input')}
            className="text-[30px] font-bold text-white leading-tight whitespace-pre-line">
            กรอกคะแนน
          </h3>

        </div>

      </div>
    </div>
  )
}

export default Admission