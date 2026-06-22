import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import CoordinateAdjusterPage from "./CoordinateAdjusterPage";
import DashboardZone from "./DashboardZone";
import InboxZone from "./InboxZone";

const CriteriaSettingZone = ({ id, year, subjectName }) => {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchCriteria = useCallback(async () => {
    if (!year || !subjectName) return;

    try {
      const res = await axios.get(
        `http://localhost:3000/exams/criteria/${year}/${subjectName}`,
      );

      if (res.data && res.data.criteriaJson) {
        setCriteria(res.data.criteriaJson);
      } else {
        setCriteria([]);
      }
    } catch (err) {
      console.error("Fetch Criteria Error:", err);
    }
  }, [year, subjectName]);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  const addRow = () =>
    setCriteria([...criteria, { startNumber: "", endNumber: "", point: 1 }]);

  const removeRow = (index) =>
    setCriteria(criteria.filter((_, i) => i !== index));

  const handleUpdate = (index, field, value) => {
    const updated = [...criteria];

    updated[index][field] = value;

    setCriteria(updated);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      await axios.post(`http://localhost:3000/exams/criteria`, {
        year: String(year),

        subjectName: subjectName,

        criteriaJson: criteria,
      });

      alert("บันทึกเกณฑ์คะแนนสำเร็จแล้วค่ะ! ✨💖");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกค่ะ");
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = id ? `http://localhost:3000/exams/image/${id}/2` : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      <div className="lg:w-1/2 bg-white rounded-[3rem] p-6 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-800">📄 PAGE 2 REFERENCE</h3>

          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">
            เกณฑ์คะแนน
          </span>
        </div>

        <div className="bg-slate-50 rounded-[2rem] overflow-hidden min-h-[500px] border-2 border-dashed border-slate-200 flex items-center justify-center">
          {imageUrl ? (
            <img
              key={imageUrl}
              src={imageUrl}
              className="w-full object-contain"
              alt="Criteria Ref"
              onError={(e) => {
                // ถ้าโหลดรูปไม่ขึ้น ให้ซ่อนรูปนี้ไปเลย แล้วไปแสดงข้อความแทน (หรือใส่รูปในเครื่อง)
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `
          <div class="flex flex-col items-center text-slate-400 p-10">
            <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p class="text-lg font-medium">ไม่พบไฟล์รูปภาพในโฟลเดอร์ค่ะ</p>
            <p class="text-sm italic">${imageUrl.split('/').pop()}</p>
          </div>
        `;
              }}
            />
          ) : (
            <div className="text-slate-400">กรุณาเลือกวิชาเพื่อดูหน้าข้อสอบค่ะ</div>
          )}
        </div>
      </div>

      <div className="lg:w-1/2 bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 flex flex-col">
        {/* ส่วนหัว: ปรับให้ไม่เบียดกันแล้วค่ะ! */}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg text-lg">
                📊
              </span>

              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                SCORE CRITERIA
              </h3>
            </div>

            <p className="text-[11px] text-blue-500 font-black uppercase tracking-[0.15em] leading-relaxed max-w-[300px]">
              กำหนดคะแนนรายช่วงสำหรับ: <br />
              <span className="text-slate-400 text-xs lowercase font-medium">
                {subjectName}
              </span>
            </p>
          </div>

          <button
            onClick={addRow}
            className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold text-[10px] transition-all duration-300 shadow-lg shadow-slate-200 flex items-center gap-2 shrink-0"
          >
            <span>+</span> เพิ่มช่วงข้อสอบ
          </button>
        </div>

        {/* ส่วนตารางกรอกข้อมูล */}

        <div className="space-y-4 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
          {criteria.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <div className="text-4xl mb-3 opacity-20">📝</div>

              <p className="text-slate-400 font-bold text-sm">
                ยังไม่ได้กำหนดเกณฑ์พิเศษค่ะ
              </p>

              <p className="text-[10px] text-slate-300 uppercase mt-1">
                กดปุ่มด้านบนเพื่อเพิ่มเกณฑ์
              </p>
            </div>
          ) : (
            criteria.map((item, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                      เริ่มข้อ
                    </label>

                    <input
                      type="number"
                      value={item.startNumber}
                      onChange={(e) =>
                        handleUpdate(index, "startNumber", e.target.value)
                      }
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                      ถึงข้อ
                    </label>

                    <input
                      type="number"
                      value={item.endNumber}
                      onChange={(e) =>
                        handleUpdate(index, "endNumber", e.target.value)
                      }
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">
                      คะแนน/ข้อ
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      value={item.point}
                      onChange={(e) =>
                        handleUpdate(index, "point", e.target.value)
                      }
                      className="w-full bg-indigo-50 text-indigo-700 border-none rounded-xl px-4 py-3 font-black text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* ปุ่มลบแบบลอยตัวนิดๆ */}

                <button
                  onClick={() => removeRow(index)}
                  className="absolute -top-2 -right-2 bg-white text-rose-400 hover:text-rose-600 w-8 h-8 rounded-full shadow-md border border-slate-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* ปุ่มบันทึก */}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-auto pt-6"
        >
          <div className="bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[2rem] font-black text-xs tracking-[0.2em] shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-3">
            {loading ? "SAVING DATA..." : "💾 SAVE ALL CRITERIA"}
          </div>
        </button>
      </div>
    </div>
  );
};

const AnswerCorrectionZone = ({ subjectId, year, subjectName }) => {
  const [questions, setQuestions] = useState([]);

  const [lastPageUrl, setLastPageUrl] = useState("");

  const [loading, setLoading] = useState(false);

  const [isScanning, setIsScanning] = useState(false); // GIF สำหรับ OCR

  const addQuestion = () => {
    // 1. ดึงเลขข้อทั้งหมดที่มีตอนนี้ แปลงเป็นตัวเลขแล้วเรียงจากน้อยไปมาก
    const currentNumbers = questions
      .map(q => parseInt(q.questionNumber) || 0)
      .filter(num => num > 0)
      .sort((a, b) => a - b);

    let targetNumber = 1;

    // 2. วิ่งวนลูปหาว่าเลขไหนที่หายไปเป็นเลขแรก
    if (currentNumbers.length > 0) {
      // หาเลขที่ขาดไปในช่องว่าง (เช่น มี 1, 3 -> เจอเลข 2 หายไป)
      for (let i = 1; i <= Math.max(...currentNumbers); i++) {
        if (!currentNumbers.includes(i)) {
          targetNumber = i;
          break;
        }
      }

      // ถ้าไม่มีช่องว่างเลย (เช่น มีครบ 1, 2, 3) ให้เอาค่าสูงสุด + 1 (จะได้เลข 4)
      if (targetNumber === 1 && currentNumbers[0] !== 1) {
        targetNumber = 1; // กรณีที่ไม่มีข้อ 1 เลย ให้เริ่มที่ข้อ 1
      } else if (!currentNumbers.includes(targetNumber)) {
        // ป้องกันกรณีที่หลุดลูปแล้วยังหาไม่เจอ
      } else {
        targetNumber = Math.max(...currentNumbers) + 1;
      }
    }

    // 3. สร้าง Object ข้อใหม่ขึ้นมา
    const newQuestion = {
      id: `temp-${Date.now()}`,
      questionNumber: targetNumber.toString(),
      correctAnswer: "",
      isNew: true
    };

    // 4. เอาข้อใหม่ใส่เข้าไปใน State แล้วจัดเรียงลำดับ (Sort) ใหม่ทันที!
    // เพื่อให้กล่องข้อ 2 วิ่งไปแทรกอยู่ระหว่างข้อ 1 กับ ข้อ 3 แบบสวยงาม
    const updatedQuestions = [...questions, newQuestion].sort(
      (a, b) => parseInt(a.questionNumber) - parseInt(b.questionNumber)
    );

    setQuestions(updatedQuestions);
  };

  // ฟังก์ชันดึงข้อมูลเฉลยจาก exam_questions

  const fetchAnswers = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:3000/exams/questions/by-library/${subjectId}`
      );

      const sorted = (response.data || []).sort(
        (a, b) => parseInt(a.questionNumber) - parseInt(b.questionNumber)
      );
      setQuestions(sorted);

      // 2. ดึงรูปหน้าสุดท้าย
      const pagesRes = await axios.get(`http://localhost:3000/exams/last-page`, {
        params: { subjectId: subjectId } // ปรับที่ Backend ให้รับ ID ใน Query ด้วยนะคะ
      });
      console.log('Backend Response:', pagesRes);

      if (pagesRes.data && pagesRes.data.lastPage) {
        const finalUrl = `http://localhost:3000/exams/image/${subjectId}/${pagesRes.data.lastPage}`;
        setLastPageUrl(finalUrl);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setQuestions([]); // ป้องกันการค้างของข้อมูลเก่า
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  // ฟังก์ชันรัน OCR (ไม่ลบ GIF แน่นอนค่ะ!)

  const handleAutoScan = async () => {
    if (
      !window.confirm(
        "ยืนยันรัน Python OCR ใช่ไหมค่ะ?",
      )
    )
      return;

    setIsScanning(true); // เปิด GIF ทันที

    try {
      const payload = {
        subjectName: subjectName, // ชื่อโฟลเดอร์วิชา (e.g., "2568 ข้อสอบวิชา A-Level...")

        year: String(year), // ปี (e.g., "2568")
      };

      console.log("Sending to Python via NestJS:", payload);

      const response = await axios.post(
        `http://localhost:3000/exams/scan-answers`,
        payload,
      );

      if (response.data.status === "success") {
        await fetchAnswers();
        alert(
          "AI รัน Python เสร็จแล้วและอัปเดตข้อมูลลงฐานข้อมูลเรียบร้อยค่ะ! ✨",
        );
      }
    } catch (err) {
      console.error("❌ Python Execution Error:", err);
      alert("การส่งข้อมูลไปรัน Python ขัดข้องค่ะ เช็คที่ Console นะคะ");
    } finally {
      setIsScanning(false);
    }
  };

  const handleInputChange = (index, value) => {
    const updated = [...questions];

    updated[index].correctAnswer = value;

    setQuestions(updated);
  };

  const handleSaveAll = async () => {
    try {
      const payload = {
        subjectId: Number(subjectId),
        subjectName,
        year,
        answers: questions.map((q) => ({
          id: q.id || q.questionId || null,
          questionNumber: String(q.questionNumber),
          correctAnswer: q.correctAnswer,
        })),
      };

      console.log("🚀 กำลังส่งข้อมูลไปเซฟแบบไร้รอยต่อ:", payload);

      const res = await axios.post(`http://localhost:3000/exams/update-answers`, payload);
      alert("บันทึกการแก้ไขเรียบร้อยค่ะ! ✨");

      await fetchAnswers();

    } catch (err) {
      console.error("Save Error:", err);
      alert("บันทึกไม่สำเร็จค่ะ");
    }
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 pb-10">

      {isScanning && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl rounded-[3rem] transition-all duration-500">
          <div className="relative">
            {/* วงแหวน Effect รอบภาพ */}
            <div className="absolute -inset-4 rounded-full border-4 border-indigo-500/30 border-t-indigo-600 animate-spin"></div>
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRocWlqZjF5dGl0NXprczZjMzUweXVtMmhsNmpveXo2ZHU1OGFtdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3y0oCOkdKKRi0/giphy.gif" // น้องหุ่นยนต์สแกนล้ำๆ
              className="w-48 h-48 rounded-full object-cover shadow-2xl border-4 border-white"
              alt="AI Scanning..."
            />
          </div>

          <div className="mt-10 text-center space-y-2">
            <h3 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent animate-pulse">
              AI IS ANALYZING...
            </h3>

            <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">
              กำลังอ่านเฉลยด้วยระบบ Python OCR ค่ะ
            </p>
          </div>
        </div>
      )}

      {/* ซ้าย: รูป Reference */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl border border-slate-100">
        <h3 className="font-black mb-4">📄 ANSWER KEY REFERENCE</h3>
        <div className="bg-slate-50 rounded-[2rem] overflow-hidden min-h-[500px] flex items-center justify-center border-2 border-dashed border-slate-200">
          {lastPageUrl ? (
            <img src={lastPageUrl} className="w-full object-contain" />
          ) : (
            "ไม่พบรูป"
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-xl italic text-slate-800">
            ✍️ DATABASE CORRECTION
          </h3>
          <div className="flex gap-2">
            <button
              onClick={addQuestion}
              className="bg-slate-800 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-slate-700 transition-colors"
            >
              + ADD QUESTION
            </button>

            <button
              onClick={handleAutoScan}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black"
            >
              AUTO OCR
            </button>

            <button
              onClick={handleSaveAll}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black"
            >
              SAVE DB
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {questions.map((q, index) => (
            <div key={q.id || index} className="group relative text-center bg-slate-50/50 p-2 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
              {/* ส่วนเลขข้อ: เปลี่ยนเป็น input ขนาดเล็กเผื่อแก้ไข */}
              <input
                type="number"
                value={q.questionNumber}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[index].questionNumber = e.target.value;
                  setQuestions(updated);
                }}
                className="w-full text-[10px] font-black text-slate-400 mb-1 bg-transparent border-none focus:ring-0 text-center"
                placeholder="ข้อที่"
              />

              {/* ส่วนช่องใส่เฉลย */}
              <input
                type="text"
                value={q.correctAnswer || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className={`w-full text-center py-3 rounded-xl border-2 font-black text-sm transition-all
      ${q.correctAnswer ? "bg-white border-slate-100 shadow-sm" : "bg-rose-50 border-rose-200"}`}
              />

              {/* ปุ่มลบ (จะโผล่มาตอน hover) */}
              <button
                onClick={() => setQuestions(questions.filter((_, i) => i !== index))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [lastPage, setLastPage] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState("home");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [importData, setImportData] = useState({
    year: "",
    subjectName: "",
    credit: "",
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("กรุณาอัปโหลดไฟล์เป็น PDF เท่านั้นค่ะ! ❌");
      e.target.value = null;
      return;
    }
    setImportData({ ...importData, file });
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importData.file || !importData.year || !importData.subjectName) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนก่อนอัปโหลดนะคะ ✨");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", importData.file);
    formData.append("year", importData.year);
    formData.append("subjectName", importData.subjectName);
    formData.append("credit", importData.credit);

    try {
      const res = await axios.post(
        "http://localhost:3000/exams/library/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${localStorage.getItem("token")}` // ส่ง Token ไปด้วย
          }
        }
      );

      if (res.data) {
        await fetchSubjects();
      }

      setIsImportModalOpen(false);
      setUploading(false);
      alert("อัปโหลดและเริ่มประมวลผล PDF เรียบร้อยแล้วค่ะ! ✨");
    } catch (err) {
      console.error("Upload Error:", err);
    }
  };

  const fetchTotalPages = async (subjectName, year) => {
    try {
      const response = await axios.get('http://localhost:3000/exams/total-pages', {
        params: { subjectName, year }, // ตรวจสอบว่าส่งไปทั้งสองตัว
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });

      if (response.data) {
        setTotalPages(response.data.total); // รับค่า .total มาเก็บใน state
        return response.data;
      }
    } catch (error) {
      console.error("ไม่สามารถดึงจำนวนหน้าได้ค่ะ:", error);
      setTotalPages(0);
    }
  };

  const fetchLastPage = async (subjectName, year) => {
    try {
      const res = await axios.get(`http://localhost:3000/exams/last-page`, {
        params: {
          subjectName: subjectName, // Axios จะต่อ ?subjectName=... ให้เอง
          year: year
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      // เปลี่ยนจาก /exams/subjects เป็น /exams/library
      const response = await axios.get("http://localhost:3000/exams/library", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      setSubjects(response.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    let ignore = false; // สร้างตัวแปรควบคุม
    const loadExamInfo = async () => {
      if (!selectedSubject || !selectedYear) return;

      try {
        const [totalRes, lastRes] = await Promise.all([
          fetchTotalPages(selectedSubject, selectedYear),
          fetchLastPage(selectedSubject, selectedYear)
        ]);

        if (!ignore) { // ถ้ายังไม่เปลี่ยนใจ ก็ค่อยอัปเดต State
          if (totalRes) setTotalPages(totalRes.total);
          if (lastRes) setLastPage(lastRes.pageNumber);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadExamInfo();
    return () => { ignore = true; }; // ล้างค่าเมื่อ Component ถูก Unmount หรือ Dependencies เปลี่ยน
  }, [selectedSubject, selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      const filtered = subjects.filter((s) => {
        // แปลงทั้งคู่ให้เป็น String และลบช่องว่างทิ้งก่อนเทียบ
        const subjectYear = s.year ? String(s.year).trim() : "";
        const targetYear = String(selectedYear).trim();

        return subjectYear === targetYear;
      });

      setAvailableSubjects(filtered);
      setSelectedSubject("");
    }
  }, [selectedYear, subjects]);

  const handleLogout = () => {
    if (window.confirm("ยืนยันการออกจากระบบไหมค่ะ? ✨")) {
      localStorage.removeItem("token");

      window.location.href = "/login";
    }
  };

  const uniqueYears = Array.from(
    new Set(
      subjects
        .map((s) => (s.year ? String(s.year).trim() : "")) // ตรงนี้เรา trim แล้ว
        .filter((y) => y !== "")
    )
  ).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] font-sans text-slate-900">
      {/*  TOP NAVIGATION BAR (แถบบนสุด) */}
      <nav className="w-full bg-[#0f172a] text-white px-8 py-4 flex items-center justify-between sticky top-0 z-[1000] shadow-xl">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-black italic text-blue-400 tracking-tighter">
            TCASSIST
          </h1>

          {/* Main Menu Items */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-xs transition-all ${activeTab === "home" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              HOME
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-xs transition-all ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              DASHBOARD
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-xs transition-all ${activeTab === "inbox" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              INBOX
            </button>
          </div>
        </div>

        {/* User Section / Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-blue-400 uppercase leading-none">
              Administrator
            </p>

            <p className="text-xs font-bold text-slate-300">Super User</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white p-2.5 rounded-xl transition-all border border-rose-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
        {activeTab === "home" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Folder Selector (ย้ายมาไว้ข้างในหน้า Home) */}
            <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center max-w-3xl">
              <div className="flex-1 px-6 border-r border-slate-100">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                  Select Year
                </label>
                <select
                  className="w-full font-bold text-sm outline-none bg-transparent cursor-pointer"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">เลือกปี...</option>
                  {uniqueYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-[1.5] px-6">
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
                  Subject Name
                </label>

                <select
                  className="w-full font-bold text-sm outline-none bg-transparent cursor-pointer"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    const subId = e.target.value;
                    setSelectedSubjectId(subId);
                    const subObj = availableSubjects.find(s => String(s.id) === String(subId));
                    if (subObj) setSelectedSubject(subObj.subjectName);
                  }}
                  disabled={!selectedYear}
                >
                  <option value="">เลือกวิชา...</option>

                  {availableSubjects.map((s) => (
                    // 1. ใช้ s.id เป็น key เพื่อแก้ Error "unique key"
                    // 2. ใช้ s.subjectName แทน s.displayName ที่ไม่มีอยู่จริง
                    <option key={s.id} value={s.id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* ปุ่ม Reset กลับค่า Default */}
              <button
                onClick={() => {
                  setSelectedYear("");
                  setSelectedSubject("");
                  setSelectedSubjectId("");
                }}
                title="ล้างการเลือกทั้งหมด"
                className="ml-2 p-4 bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-2xl transition-all duration-300 group flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-active:rotate-[-180deg] transition-transform duration-500"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />

                  <path d="M3 3v5h5" />
                </svg>

                <span className="text-[10px] font-black uppercase hidden sm:block">
                  Reset
                </span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="ml-2 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[10px] font-black uppercase hidden sm:block">Import PDF</span>
              </button>
            </div>

            {/* Coordinate Section */}
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden min-h-[600px] border border-slate-50">
              {selectedYear && selectedSubject ? (
                <CoordinateAdjusterPage
                  key={`${selectedYear}-${selectedSubjectId}`}
                  year={selectedYear}
                  subjectName={selectedSubject}
                  subjectId={selectedSubjectId}
                  initialPage={3}
                  totalPages={totalPages} // ส่งจำนวนหน้าทั้งหมดไปใช้สร้าง Pagination หรือตรวจสอบเงื่อนไข
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-40 opacity-30">
                  <div className="text-6xl mb-4">📂</div>

                  <p className="font-black uppercase tracking-widest text-sm text-slate-500">
                    Please select a subject to start
                  </p>
                </div>
              )}
            </div>

            {/* Answers & Criteria */}
            {selectedYear && selectedSubject && (
              <>
                <AnswerCorrectionZone
                  subjectId={selectedSubjectId}
                  year={selectedYear}
                  subjectName={selectedSubject}
                />

                <CriteriaSettingZone
                  id={selectedSubjectId}
                  year={selectedYear}
                  subjectName={selectedSubject}
                />
              </>
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            {/* <div className="text-6xl mb-6">📊</div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">DASHBOARD OVERVIEW</h2>
            <p className="text-slate-400 font-medium">ส่วนนี้จะเป็นข้อมูลสถิติการตรวจข้อสอบทั้งหมดของคุณค่ะ</p> */}
            <DashboardZone />
          </div>
        )}

        {activeTab === "inbox" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <InboxZone />
          </div>
        )}
      </div>
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 transform animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">IMPORT NEW EXAM</h2>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">เพิ่มชุดข้อสอบใหม่เข้าระบบ</p>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <form onSubmit={handleImportSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">ปีการศึกษา (พ.ศ.)</label>
                    <input
                      type="text" placeholder="เช่น 2568" required
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      onChange={(e) => setImportData({ ...importData, year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">ชื่อวิชา</label>
                    <input
                      type="text" placeholder="A-Level คณิตศาสตร์" required
                      className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                      onChange={(e) => setImportData({ ...importData, subjectName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">ที่มา / เครดิต</label>
                  <input
                    type="text" placeholder="เช่น ทปอ. / พี่บีติวเตอร์"
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-3.5 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                    onChange={(e) => setImportData({ ...importData, credit: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">ไฟล์ข้อสอบ (PDF ONLY)</label>
                  <div className="relative group">
                    <input
                      type="file" accept=".pdf" required
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[2rem] p-8 text-center group-hover:bg-indigo-100 transition-all">
                      <div className="text-3xl mb-2">📄</div>
                      <p className="text-xs font-black text-indigo-600 uppercase">
                        {importData.file ? importData.file.name : "Click or Drag PDF here"}
                      </p>
                      <p className="text-[9px] text-indigo-400 mt-1 font-bold">MAX SIZE: 20MB</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xs tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50"
                >
                  {uploading ? "UPLOADING & PROCESSING..." : "🚀 START IMPORT PROCESS"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminLayout;
