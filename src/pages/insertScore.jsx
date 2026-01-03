import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner'
import Loader from '../components/loader'
import axios from 'axios';

function InsertScore() {
  const [data, setData] = useState(null); // ตัวแปรเก็บข้อมูลจาก GitHub
  const [selectedYear, setSelectedYear] = useState(""); // ปีที่ User เลือก
  const [loading, setLoading] = useState(true); // สถานะรอโหลด
  const [isSaving, setIsSaving] = useState(false);

  const [scores, setScores] = useState({}); // เก็บเป็น Object เช่น { "TGAT": "75.5", "TPAT3": "80" }
  const handleScoreChange = (subName, value) => {
    setScores(prev => ({
      ...prev,
      [subName]: value // อัปเดตคะแนนรายวิชาโดยใช้ชื่อวิชาเป็น Key
    }));
  };

  useEffect(() => {
    // ฟังก์ชันไปดึงข้อมูลจาก GitHub
    const fetchSubjects = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/ultras8/my-admission-api/refs/heads/main/subjects.json');
        const result = await response.json();

        setData(result);
        setSelectedYear(result.years[0].id); // ตั้งค่าเริ่มต้นเป็นปีแรกที่เจอ (2568)
        setLoading(false);
      } catch (error) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", error);
        setLoading(false);
      }
    };

    fetchSubjects();

  }, []);

  useEffect(() => {
    const fetchMyScore = async () => {
      const token = localStorage.getItem("token");
      if (!token || !selectedYear) return;

      setScores({}); // ล้างคะแนนเก่าออกก่อนเริ่มโหลดปีใหม่ เพื่อความชัวร์

      try {
        const response = await axios.get(`http://localhost:3000/scores/${selectedYear}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.data) {
          setScores(response.data.data);
        }
      } catch (error) {
        console.log("ยังไม่มีคะแนนปีนี้ หรือโหลดไม่สำเร็จ");
      }
    };

    fetchMyScore();
  }, [selectedYear]); // ทำงานทุกครั้งที่เลือกปีเปลี่ยน (selectedYear)

  const handleSubmit = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาเข้าสู่ระบบก่อนนะคะ");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/scores",
        {
          year: selectedYear,
          scores: scores
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("บันทึกสำเร็จ!");
      setIsSaving(false);
    } catch (error) {
      console.error(error);
      alert("บันทึกไม่สำเร็จ");
      setIsSaving(false);
    }
  };

  if (loading) return <Loader message="กำลังดึงข้อมูลวิชาล่าสุด..." />;
  if (!data) return <div className="text-center mt-20 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;

  // ดึงข้อมูลของปีที่เลือก
  const currentYearData = data.years.find(y => y.id === selectedYear);

  return (
    <div className="min-h-screen bg-[#ADD6F2] pb-10 flex flex-col items-center">
      <div className="w-full">
        <Banner />
      </div>

      <div className="mx-4 p-4 bg-white/20 rounded-[15px] border border-white/30 backdrop-blur-sm space-y-2 text-[14px] text-slate-800">
        <p>• กรอกคะแนนดิบที่ได้ ไม่ต้องกรอกคะแนนมาตรฐาน (T-Score)</p>
        <p>• มหาวิทยาลัยไหนที่กำหนดใช้คะแนนมาตรฐาน (T-Score) โปรแกรมจะแปลงจากคะแนนดิบให้เอง</p>
        <p>• วิชาที่ไม่ได้เข้าสอบ ให้เว้นว่างไว้ ไม่ต้องกรอกเป็น 0 คะแนน</p>
      </div>

      <div className="w-full max-w-[360px] px-4 mt-6 mb-8 flex justify-center">
        <div className="inline-flex items-center bg-white p-1 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-3 py-1 bg-slate-100 rounded-xl mr-2">
            <span className="text-[12px] font-black text-slate-500 uppercase">Year</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-[220px] pr-8 pl-1 py-1.5 bg-transparent font-bold text-slate-800 focus:outline-none appearance-none cursor-pointer"
            style={{
              backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
          >
            {data.years.map(year => (
              <option key={year.id} value={year.id}>{year.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* วาดช่องกรอกคะแนนตามข้อมูลใน GitHub */}
      <div className="w-full max-w-[360px] space-y-8 px-4">
        {currentYearData?.groups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col items-center">
            {/* หัวข้อกลุ่ม (เช่น TGAT, GPAX) */}
            <div
              style={{ backgroundColor: group.color }}
              className="px-6 py-1 rounded-full mb-4 shadow-sm"
            >
              <span className="text-white text-sm font-bold">{group.name}</span>
            </div>

            {/* วนลูปสร้าง Input ตามรายชื่อวิชา */}
            <div className="flex flex-wrap justify-center gap-4">
              {group.subjects.map((subName, sIdx) => (
                <div key={sIdx} className="flex flex-col items-center">
                  {/* ล็อคความสูงแค่ส่วนชื่อวิชา */}
                  <div className="h-[40px] flex items-center justify-center">
                    <label className="text-[10px] font-bold text-gray-600 text-center w-24 leading-tight">
                      {subName}
                    </label>
                  </div>

                  {/* ช่อง Input จะอยู่ตำแหน่งเดิมเป๊ะทุกตัว */}
                  <input
                    type="number"
                    placeholder="0.00"
                    value={scores[subName] || ""} // ดึงคะแนนจาก State มาโชว์ (ถ้าไม่มีให้ว่างไว้)
                    onChange={(e) => handleScoreChange(subName, e.target.value)}
                    className="w-16 h-10 bg-white rounded-lg border-2 border-black text-center text-[13px] font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:bg-yellow-50 focus:outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={isSaving}
        onClick={handleSubmit}
        className={`mt-10 px-10 py-3 bg-white border-2 border-black rounded-full font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${isSaving ? "opacity-50 cursor-not-allowed" : "active:translate-y-1 active:shadow-none cursor-pointer"
          }`}
      >
        {isSaving ? "SAVING..." : "SAVE SCORE"}
      </button>
    </div>
  );
}

export default InsertScore;