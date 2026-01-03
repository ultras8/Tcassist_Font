import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import Banner from "../components/Banner";
import ScoreCard from "../components/ScoreCard";

function ResultView() {
  const location = useLocation();
  const navigate = useNavigate();

  const [resultData, setResultData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // หน้าปัจจุบัน
  const [totalItems, setTotalItems] = useState(0); // จำนวนคณะทั้งหมด
  const limit = 5; // โหลดทีละ 5 

  const { type, universityId, programCode, majorName, year } = location.state || {};

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let params = { year, page };

      if (type === "allInUni") {
        endpoint = `/calculator/university/${universityId}`;
      } else if (type === "major") {
        endpoint = `/calculator/major`;
        params.majorName = majorName;
      } else if (type === "single") {
        endpoint = `/calculator/single`;
        params.programCode = programCode;
      } else {
        console.error("Unknown type:", type);
        return;
      }

      // ใช้ api (axios instance) ที่ import มา
      const response = await api.get(endpoint, { params });

      if (type === "allInUni" || type === "major") {
        setResultData(response.data.data || []);
        setTotalItems(response.data.total || 0);
      } else {
        setResultData([response.data]);
        setTotalItems(1);
      }
    } catch (error) {
      console.error("Fetch error details:", error.response?.data || error.message);
      // ถ้า Error 401 แปลว่า Token หมดอายุ หรือไม่ได้ Login
      if (error.response?.status === 401) {
        alert("กรุณาเข้าสู่ระบบก่อนใช้งานค่ะ");
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // เลื่อนหน้าจอกลับไปด้านบนเวลาเปลี่ยนหน้า
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]); // โหลดใหม่ทุกครั้งที่เลขหน้าเปลี่ยน

  const totalPages = Math.ceil(totalItems / limit);

  if (loading) return (
    <div className="min-h-screen bg-[#ADD6F2] flex items-center justify-center font-black">
      กำลังคำนวณคะแนน...
    </div>
  );

  // ฟังก์ชันนี้จะใช้เฉพาะหน้า Interested Major
  // คลีนชื่อสาขาเพราะ สาขาต่างมหาลัยชื่อคล้ายกันแต่ไม่เหมือนกัน
  const getGroupedMajorOptions = (allData) => {
    const seen = new Set();
    const options = [];

    allData.forEach(item => {
      // ใช้ logic "ตบชื่อ" ให้คลีนเหมือนที่เราคุยกัน
      let cleanName = item.programName
        .replace(/\s*\(.*?\)\s*/g, '') // ตัดวงเล็บ
        .replace(/สาขาวิชา|หลักสูตร|วิชาเอก/g, '') // ตัดคำสร้อย
        .trim();

      // Mapping พิเศษเพื่อให้รัฐศาสตร์ทุกที่รวมกัน
      if (cleanName.includes("รัฐศาสตร์") && !cleanName.includes("รัฐประศาสนศาสตร์")) {
        cleanName = "รัฐศาสตร์";
      }

      if (!seen.has(cleanName)) {
        seen.add(cleanName);
        options.push({ label: cleanName, value: cleanName });
      }
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  };

  return (
    <div className="min-h-screen bg-[#ADD6F2] flex flex-col pb-20">
      <Banner />
      <div className="flex-1 px-6 pt-10">
        <div className="max-w-[400px] mx-auto">

          {/* ส่วนแสดงการ์ดคะแนน */}
          {resultData.length > 0 ? (
            resultData.map((item, index) => (
              <ScoreCard
                key={index}
                university={item.universityName}
                faculty={item.programName}
                score={item.totalScore}
                fullScore={100}
                year={item.year}
                criteria={item.isPassedCriteria ? "ผ่านเกณฑ์ขั้นต่ำ" : "ไม่ผ่านเกณฑ์"}
                risk={item.risk} // ส่งก้อน { status: 'Safe', message: '...' } ไปด้วย
                recommendation={item.recommendation}
              />
            ))
          ) : (
            <div className="text-center bg-white p-10 rounded-3xl border-2 border-black font-black">
              ไม่พบข้อมูลการคำนวณ
            </div>
          )}

          {/* ส่วนควบคุมหน้า (Pagination) */}
          {totalItems > limit && (
            <div className="flex justify-between items-center mt-6 mb-10 bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-black disabled:opacity-30"
              >
                PREV
              </button>

              <span className="font-black">
                PAGE {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-slate-100 rounded-xl font-black disabled:opacity-30"
              >
                NEXT
              </button>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full h-[52px] bg-white border-2 border-black rounded-[18px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-slate-800 active:translate-y-1 active:shadow-none transition-all"
          >
            BACK TO CALCULATOR
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultView;