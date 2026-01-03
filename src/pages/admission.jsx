import React from 'react'
import { useNavigate } from 'react-router-dom';
import Banner from '../components/Banner';
import AdmissionCard from '../components/admissionCard';

function Admission() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">

      <div className="w-full bg-[#ADD6F2] rounded-b-[40px] pb-12 shadow-inner flex flex-col items-center">
        <div className="w-full overflow-hidden">
          <Banner className="w-full" />
        </div>

        <div className="w-full max-w-[400px] px-6 space-y-4 mt-4">
          <AdmissionCard
            title={"Interested Faculty \n ( Specific University & Faculty )"}
            description={"คำนวณคะแนนเจาะจงคณะและมหาวิทยาลัยที่สนใจ"}
            onClick={() => navigate('/calculate/faculty')}
          />
          <AdmissionCard
            title={"Interested University \n ( Explore all faculties in one place ) "}
            description={"ดูโอกาสติดทุกคณะในมหาวิทยาลัยเดียว"}
            onClick={() => navigate('/calculate/university')}
          />
          <AdmissionCard
            title={"Interested Major \n ( Compare same major across universities )"}
            description={"เปรียบเทียบคะแนนสาขาเดียวกันจากหลายมหาวิทยาลัย"}
            onClick={() => navigate('/calculate/compare')}
          />
          <AdmissionCard
            title={"TOP 10"}
            description={"ลองจัด 10 อันดับคละคณะและมหาวิทยาลัย"}
            onClick={() => navigate('/calculate/ranking')}
          />

          <div
            onClick={() => navigate('/score-input')}
            className="w-full h-[100px] bg-[#FD7A6C] border-2 border-black rounded-[20px] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center text-center transition-all active:translate-y-1 active:shadow-none cursor-pointer mt-6"
          >
            <h3 className="text-[28px] font-black text-white leading-tight">
              กรอกคะแนน
            </h3>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Admission