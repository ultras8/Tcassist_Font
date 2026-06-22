import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import Banner from "../components/Banner";
import Swal from "sweetalert2";

const IP_ADDRESS = "localhost";
const API_BASE_URL = `http://${IP_ADDRESS}:3000`;

const MockExam = () => {
  // --- [Data States] ---
  const [allData, setAllData] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentCriteria, setCurrentCriteria] = useState([]);
  const [imageSrc, setImageSrc] = useState("");

  // --- [Selection States] ---
  const [selectedYear, setSelectedYear] = useState("2568");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(90);

  // --- [UI/Exam States] ---
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState({
    totalScore: 0,
    fullScore: 0,
    correctCount: 0,
  });

  // --- [Timer States] ---
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  const q = questions[currentIdx];

  const timeOptions = [
    { value: 10, label: "10 นาที" },
    { value: 15, label: "15 นาที" },
    { value: 20, label: "20 นาที" },
    { value: 25, label: "25 นาที" },
    { value: 30, label: "30 นาที" },
    { value: 60, label: "60 นาที" },
    { value: 90, label: "90 นาที" },
    { value: 120, label: "120 นาที" },
  ];

  const [realImageSize, setRealImageSize] = useState({
    width: 0,
    height: 0
  });

  const containerWidth = 800;

  const BASE_WIDTH = 2480;
  const BASE_HEIGHT = 3508;

  const actualWidth =
    realImageSize.width ||
    q?.imageWidth ||
    BASE_WIDTH;

  const actualHeight =
    realImageSize.height ||
    q?.imageHeight ||
    BASE_HEIGHT;

  const scale = containerWidth / BASE_WIDTH;

  const ratioX = actualWidth / BASE_WIDTH;
  const ratioY = actualHeight / BASE_HEIGHT;

  // --- [Effects] ---
  // 1. useEffect ชุดโหลดรูปภาพจาก ID ปลายทาง
  useEffect(() => {
    let objectUrl = "";

    const loadImage = async () => {
      try {
        setImageSrc("");

        setRealImageSize({
          width: 0,
          height: 0
        });

        const response = await axios.get(
          `${API_BASE_URL}/exams/image/${selectedSubject.id}/${q.pageNumber}`,
          { responseType: "blob" }
        );

        objectUrl = URL.createObjectURL(response.data);

        // อ่านขนาดภาพจริง
        const img = new Image();

        img.onload = () => {
          setRealImageSize({
            width: img.naturalWidth,
            height: img.naturalHeight
          });

          setImageSrc(objectUrl);
        };

        img.src = objectUrl;

      } catch (err) {
        console.error(err);
        setImageSrc("");
      }
    };

    // เช็กว่ามี ID อยู่จริงค่อยเริ่มโหลดรูป
    if (q && q.pageNumber && selectedSubject?.id) {
      loadImage();
    } else {
      setImageSrc("");
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [q, selectedSubject]);

  // 2. โหลด Metadata สารบัญสอบครั้งแรก
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/exams/library`);
        setAllData(res.data);
        const years = [...new Set(res.data.map((item) => String(item.year)))]
          .sort()
          .reverse();
        setAvailableYears(years);
        if (years.length > 0) setSelectedYear(years[0]);
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ", err);
      }
    };
    fetchMetadata();
  }, []);

  // 3. ปรับให้ Map ข้อมูลโครงสร้างแบบมี ID ติดมาด้วยเมื่อสลับปีการศึกษา
  useEffect(() => {
    if (allData.length > 0) {
      const subjectsInYear = allData
        .filter((item) => String(item.year) === selectedYear)
        .map((item) => ({
          id: item.id,
          value: item.subjectName,
          label: item.subjectName
        }));

      // ทำ Unique ป้องกันวิชาซ้ำ
      const uniqueSubjects = [];
      const map = new Map();
      for (const item of subjectsInYear) {
        if (!map.has(item.value)) {
          map.set(item.value, true);
          uniqueSubjects.push(item);
        }
      }

      setAvailableSubjects(uniqueSubjects);
      if (uniqueSubjects.length > 0) {
        setSelectedSubject(uniqueSubjects[0]);
      } else {
        setSelectedSubject(null);
      }
    }
  }, [selectedYear, allData]);

  // 4. วิ่งตัวนับเวลาถอยหลัง
  useEffect(() => {
    if (isExamStarted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted]);

  // --- [Logic: Exam Sequence] ---
  const startExamSequence = async () => {
    if (!selectedSubject?.value) {
      Swal.fire(
        "กรุณาเลือกวิชา",
        "เลือกวิชาที่ต้องการสอบก่อนนะคะ ✨",
        "warning",
      );
      return;
    }

    const confirmStart = await Swal.fire({
      title: "ข้อแนะนำก่อนเริ่มสอบ ✨",
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p><b>1. การตอบข้อตัวเลือก:</b> ให้ตอบเฉพาะ <b>"เลขข้อ"</b> ที่เลือกเท่านั้น ไม่ต้องมีจุดหรือคำต่อท้ายนะคะ</p>
          <p><b>2. การตอบข้อเขียน:</b> ให้เขียนเฉพาะ <b>"คำตอบ"</b> ไม่ต้องมีคำอธิบายเพิ่มเติมค่ะ</p>
          <p><b>3. ข้อมูลข้อสอบ:</b> ในกรณีที่ระบบยังไม่ได้ตรวจทานข้อมูล อาจจะมีโจทย์แปลกๆ ปะปนมาบ้าง (ตามพิกัดที่ AI แนะนำเบื้องต้นค่ะ)</p>
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "เริ่มทำข้อสอบ ✨",
      cancelButtonText: "ยังไม่พร้อม",
      confirmButtonColor: "#10b981",
    });

    if (!confirmStart.isConfirmed) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/exams/questions/${selectedYear}/${encodeURIComponent(selectedSubject.value)}/all`,
      );
      let rawData = Array.isArray(res.data) ? res.data : res.data.questions;

      if (rawData && rawData.length > 0) {
        setQuestions(
          [...rawData].sort(
            (a, b) => Number(a.questionNumber) - Number(b.questionNumber),
          ),
        );

        try {
          const criteriaRes = await axios.get(
            `${API_BASE_URL}/exams/criteria/${selectedYear}/${encodeURIComponent(selectedYear + " " + selectedSubject.value)}`,
          );
          if (criteriaRes.data?.criteriaJson) {
            setCurrentCriteria(
              typeof criteriaRes.data.criteriaJson === "string"
                ? JSON.parse(criteriaRes.data.criteriaJson)
                : criteriaRes.data.criteriaJson,
            );
          }
        } catch (err) {
          setCurrentCriteria([]);
        }

        setTimeLeft(selectedDuration * 60);
        setElapsedTime(0);
        setCurrentIdx(0);
        setUserAnswers({});
        setIsExamStarted(true);
        setIsFinished(false);
      } else {
        Swal.fire("ไม่พบข้อมูล", "วิชานี้ยังไม่มีข้อสอบนะคะ", "info");
      }
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อสอบได้ค่ะ", "error");
    }
  };

  const calculateScore = (questionsData, answers, criteriaList) => {
    let total = 0, full = 0, correct = 0;
    questionsData.forEach((question) => {
      const rule = criteriaList.find(
        (c) =>
          Number(question.questionNumber) >= Number(c.startNumber) &&
          Number(question.questionNumber) <= Number(c.endNumber),
      );
      const point = rule ? Number(rule.point) : 1;
      full += point;

      const userAns = String(answers[question.id] || "").trim();
      const correctAns = String(question.correctAnswer || "").trim();
      if (correctAns === "") return;

      const uNum = parseFloat(userAns), cNum = parseFloat(correctAns);
      const isNum =
        !isNaN(uNum) &&
        !isNaN(cNum) &&
        /^-?\d*\.?\d+$/.test(userAns) &&
        /^-?\d*\.?\d+$/.test(correctAns);

      if (
        isNum
          ? uNum === cNum
          : userAns.toLowerCase() === correctAns.toLowerCase()
      ) {
        total += point;
        correct += 1;
      }
    });
    return { totalScore: total, fullScore: full, correctCount: correct };
  };

  const submitExamData = async (isAuto = false) => {
    try {
      await axios.post(`${API_BASE_URL}/exams/submit`, {
        year: selectedYear,
        subject: selectedSubject?.value, // ส่งแค่ชื่อข้อความกลับไปหาหลังบ้านประมวลผลต่อ
        answers: Object.entries(userAnswers).map(([id, ans]) => ({
          questionId: Number(id),
          answer: ans,
        })),
        usedTime: elapsedTime,
      });
    } catch (err) {
      console.error("Submit Error", err);
    }
  };

  const handleFinish = async () => {
    const result = await Swal.fire({
      title: "ส่งข้อสอบเลยไหมคะ?",
      text: "ตรวจสอบคำตอบดีแล้วนะคะ ✨",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ส่งและดูคะแนน",
      confirmButtonColor: "#10b981",
    });

    if (result.isConfirmed) {
      if (timerRef.current) clearInterval(timerRef.current);
      setScoreResult(calculateScore(questions, userAnswers, currentCriteria));
      await submitExamData(false);
      setIsExamStarted(false);
      setIsFinished(true);
    }
  };

  const handleAutoSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsExamStarted(false);
    await Swal.fire({
      title: "หมดเวลาแล้วค่ะ!",
      icon: "warning",
      timer: 2000,
      showConfirmButton: false,
    });
    setScoreResult(calculateScore(questions, userAnswers, currentCriteria));
    await submitExamData(true);
    setIsFinished(true);
  };

  const formatTime = (sec) =>
    `${Math.floor(sec / 60)
      .toString()
      .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFC] flex flex-col items-center">
      <div className="w-full overflow-hidden">
        <Banner className="w-full" />
      </div>

      <div className="w-full max-w-4xl px-4 pt-10 relative z-10">
        {/* [1] Setup Mode */}
        {!isExamStarted && !isFinished && (
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-10 text-center italic">
              Mock Examination
            </h2>
            <div className="space-y-6">
              <select
                className="w-full bg-slate-50 px-6 py-4 rounded-2xl font-bold border-2 border-transparent focus:border-indigo-200 outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    ปีการศึกษา {y}
                  </option>
                ))}
              </select>

              <Select
                options={availableSubjects}
                value={selectedSubject}
                onChange={(opt) => setSelectedSubject(opt)}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "1rem",
                    padding: "0.4rem",
                    border: "2px solid #F1F5F9",
                  }),
                }}
              />

              <div className="grid grid-cols-3 gap-2">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedDuration(opt.value)}
                    className={`py-3 rounded-xl font-bold text-[12px] border-2 ${selectedDuration === opt.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-50 bg-slate-50 text-slate-400"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={startExamSequence}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-indigo-600 transition-all text-lg shadow-lg"
              >
                เริ่มทำข้อสอบทันที ✨
              </button>
            </div>
          </div>
        )}

        {/* [2] Result Mode */}
        {isFinished && (
          <div className="bg-white p-10 sm:p-16 rounded-[2.5rem] shadow-2xl text-center">
            <span className="bg-emerald-100 text-emerald-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              Mission Completed ✨
            </span>
            <h2 className="text-4xl font-black text-slate-800 mt-6 mb-2">
              สรุปผลสอบ
            </h2>
            <p className="text-slate-400 font-bold mb-10">
              {selectedSubject?.value} ({selectedYear})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border">
                <p className="text-[11px] font-black text-slate-400 uppercase">
                  คะแนนรวม
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-black text-indigo-600">
                    {scoreResult.totalScore}
                  </span>
                  <span className="text-xl font-bold text-slate-300">
                    / {scoreResult.fullScore}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border flex flex-col justify-center">
                <p className="text-[11px] font-black text-slate-400 uppercase">
                  ความถูกต้อง
                </p>
                <p className="text-4xl font-black text-slate-700">
                  {scoreResult.correctCount}{" "}
                  <span className="text-lg text-slate-400">ข้อ</span>
                </p>
              </div>
            </div>
            <div className="mb-10 bg-slate-900 text-white p-6 rounded-[2rem] flex items-center justify-between px-10">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  เวลาที่ใช้ทั้งหมด
                </p>
                <p className="text-3xl font-black font-mono text-indigo-400">
                  {formatTime(elapsedTime)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  ความเร็วเฉลี่ย
                </p>
                <p className="text-sm font-bold">
                  {Math.round(elapsedTime / questions.length)} วินาที/ข้อ
                </p>
              </div>
            </div>
          </div>
        )}

        {/* [3] Exam Mode */}
        {isExamStarted && q && (
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 w-full">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div className="flex gap-6">
                <div>
                  <p className="text-[9px] uppercase text-slate-400">
                    Time Left
                  </p>
                  <p className="text-xl font-black font-mono">
                    {formatTime(timeLeft)}
                  </p>
                </div>
                <div className="border-l border-slate-700 pl-6">
                  <p className="text-[9px] uppercase text-slate-400">Elapsed</p>
                  <p className="text-xl font-black font-mono text-indigo-400">
                    {formatTime(elapsedTime)}
                  </p>
                </div>
              </div>
              <p className="font-black bg-white/10 px-4 py-2 rounded-full text-sm">
                ข้อที่ {currentIdx + 1} / {questions.length}
              </p>
            </div>
            <div className="p-6 sm:p-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800">
                  ข้อที่ {q.questionNumber}
                </h2>
                <span className="text-sm font-bold text-slate-400">
                  หน้า {q.pageNumber}
                </span>
              </div>
              <div
                className="relative mx-auto overflow-hidden bg-slate-50 border rounded-lg"
                style={{
                  width: `${Number(q.width) * scale}px`,
                  height: `${Number(q.height) * scale}px`,
                }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    className="absolute max-w-none transition-all duration-500 origin-top-left"
                    style={{
                      width: `${actualWidth * scale}px`,
                      height: `${actualHeight * scale}px`,
                      left: `-${Number(q.x) * scale}px`,
                      top: `-${Number(q.y) * scale}px`,
                    }}
                    alt="Question"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-bold text-sm">
                    กำลังโหลดรูปภาพโจทย์... 📝
                  </div>
                )}
              </div>
              <div className="mt-12 mb-8 flex flex-col items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                  คำตอบของคุณ
                </label>
                <input
                  type="text"
                  className="w-full max-w-[140px] text-center text-xl font-bold py-3 bg-slate-50 rounded-xl border-2 outline-none focus:border-indigo-300 transition-all"
                  value={userAnswers[q.id] || ""}
                  onChange={(e) =>
                    setUserAnswers({ ...userAnswers, [q.id]: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-between mt-12 pt-8 border-t">
                <button
                  onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="px-6 py-4 rounded-xl font-black bg-slate-100 text-slate-500 disabled:opacity-30"
                >
                  ← Back
                </button>
                <button
                  onClick={() =>
                    currentIdx < questions.length - 1
                      ? setCurrentIdx(currentIdx + 1)
                      : Swal.fire("ข้อสุดท้ายแล้วค่ะ ✨")
                  }
                  className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black hover:bg-indigo-600 shadow-lg"
                >
                  Next →
                </button>
              </div>
              <button
                onClick={handleFinish}
                className="w-full mt-10 bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-100"
              >
                ส่งข้อสอบและดูคะแนน ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockExam;