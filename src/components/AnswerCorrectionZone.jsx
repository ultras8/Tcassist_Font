import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnswerCorrectionZone = ({ year, subjectName }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastPageUrl, setLastPageUrl] = useState(''); // เก็บ URL รูปหน้าสุดท้าย

  useEffect(() => {
    if (year && subjectName) {
      fetchAnswers();
    }
  }, [year, subjectName]);

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      // ดึงข้อมูลข้อสอบทั้งหมดของวิชานั้นเพื่อเอาเฉลย
      const response = await axios.get(`http://localhost:3000/exams/questions`, {
        params: { subjectName, year }
      });
      setQuestions(response.data);

      // สมมติว่าหน้าสุดท้ายคือรูปเฉลย (หนูอาจจะต้องปรับ Logic การดึง URL รูปตาม Backend นะคะ)
      // เช่น ถ้ามี 20 หน้า หน้าสุดท้ายคือหน้า 20
      setLastPageUrl(`http://localhost:3000/exams/image/${subjectName}/${year}/last`);
    } catch (err) {
      console.error("Error fetching answers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index, value) => {
    const updated = [...questions];
    updated[index].correctAnswer = value;
    setQuestions(updated);
  };

  const handleSaveAll = async () => {
    try {
      await axios.post(`http://localhost:3000/exams/update-answers`, {
        subjectName,
        year,
        answers: questions.map(q => ({ id: q.id, correctAnswer: q.correctAnswer }))
      });
      alert("บันทึกข้อมูลเฉลยเรียบร้อยแล้วค่ะ");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกค่ะ");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

      {/* ฝั่งซ้าย: รูปหน้าเฉลย (หน้าสุดท้าย) */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-200">
        <h3 className="text-lg font-black mb-4 flex items-center">
          <span className="mr-2">📄</span> รูปภาพเฉลย (หน้าสุดท้าย)
        </h3>
        <div className="bg-slate-100 rounded-3xl overflow-hidden min-h-[500px] flex items-center justify-center border-2 border-dashed border-slate-300">
          {lastPageUrl ? (
            <img src={lastPageUrl} alt="Answer Key" className="w-full h-auto object-contain" />
          ) : (
            <p className="text-slate-400">กำลังโหลดรูปภาพ...</p>
          )}
        </div>
      </div>

      {/* ฝั่งขวา: ตารางกรอกเฉลย */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-200 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black flex items-center">
            <span className="mr-2">✍️</span> แก้ไขข้อมูลเฉลย (Database)
          </h3>
          <button
            onClick={handleSaveAll}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-xl font-black text-sm shadow-lg shadow-green-200 transition-all active:scale-95"
          >
            บันทึกเฉลยทั้งหมด
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 max-h-[600px] custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {questions.map((q, index) => (
              <div key={q.id} className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1">ข้อที่ {q.questionNumber || index + 1}</label>
                <input
                  type="text"
                  value={q.correctAnswer || ''}
                  placeholder="?"
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className={`w-full text-center font-bold py-3 rounded-2xl border-2 transition-all outline-none focus:ring-4
                    ${q.correctAnswer
                      ? 'bg-slate-50 border-slate-100 text-slate-700 focus:border-blue-400 focus:ring-blue-100'
                      : 'bg-red-50 border-red-200 text-red-600 focus:border-red-400 focus:ring-red-100 animate-pulse'
                    }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCorrectionZone;