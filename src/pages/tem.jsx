import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CoordinateAdjusterPage from './CoordinateAdjusterPage';

const CriteriaSettingZone = ({ year, subjectName }) => {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลเกณฑ์ที่มีอยู่เดิมจากฐานข้อมูล
  const fetchCriteria = useCallback(async () => {
    if (!year || !subjectName) return;
    try {
      const res = await axios.get(`http://localhost:3000/exams/criteria/${year}/${subjectName}`);
      if (res.data && res.data.criteriaJson) {
        setCriteria(res.data.criteriaJson);
      } else {
        setCriteria([]);
      }
    } catch (err) {
      console.error("Fetch Criteria Error:", err);
    }
  }, [year, subjectName]);

  useEffect(() => { fetchCriteria(); }, [fetchCriteria]);

  const addRow = () => {
    setCriteria([...criteria, { startNumber: '', endNumber: '', point: 1 }]);
  };

  const removeRow = (index) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

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
        criteriaJson: criteria
      });
      alert("บันทึกเกณฑ์คะแนนสำเร็จแล้วค่ะ!");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกค่ะ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-2xl border border-slate-100 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800">📊 SCORE CRITERIA SETTING</h3>
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">กำหนดคะแนนรายช่วงสำหรับ {subjectName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addRow} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs transition-all">
            + เพิ่มช่วงข้อ
          </button>
          <button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg shadow-indigo-100 transition-all">
            {loading ? "SAVING..." : "SAVE CRITERIA"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {criteria.length === 0 && (
          <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-bold text-sm">
            ยังไม่ได้กำหนดเกณฑ์พิเศษ (ระบบจะใช้เกณฑ์มาตรฐานข้อละ 1 คะแนนค่ะ)
          </div>
        )}
        {criteria.map((item, index) => (
          <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
            <div className="flex-1 grid grid-cols-3 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">ข้อเริ่มต้น</label>
                <input
                  type="number"
                  value={item.startNumber}
                  onChange={(e) => handleUpdate(index, 'startNumber', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">ถึงข้อ</label>
                <input
                  type="number"
                  value={item.endNumber}
                  onChange={(e) => handleUpdate(index, 'endNumber', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2">คะแนนที่ได้รับ</label>
                <input
                  type="number"
                  step="0.1"
                  value={item.point}
                  onChange={(e) => handleUpdate(index, 'point', e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-sm outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <button onClick={() => removeRow(index)} className="mt-4 text-rose-400 hover:text-rose-600 p-2 transition-colors">
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnswerCorrectionZone = ({ year, subjectName }) => {
  const [questions, setQuestions] = useState([]);
  const [lastPageUrl, setLastPageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAnswers = useCallback(async () => {
    if (!year || !subjectName) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/exams/questions/all`, {
        params: { subjectName, year }
      });
      const sorted = (response.data || []).sort((a, b) => a.questionNumber - b.questionNumber);
      setQuestions(sorted);
      const encodedName = encodeURIComponent(subjectName);
      setLastPageUrl(`http://localhost:3000/exams/image/${encodedName}/${year}/last`);
    } catch (err) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [year, subjectName]);

  useEffect(() => { fetchAnswers(); }, [fetchAnswers]);

  const handleAutoScan = async () => {
    if (!window.confirm("ระบบจะรัน Python OCR เพื่อดึงเฉลยอัตโนมัติ ยืนยันไหมคะ?")) return;
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:3000/exams/scan-answers`, { subjectName, year });
      if (response.data.status === 'success') {
        alert("สแกนสำเร็จ! ✨");
        await fetchAnswers();
      }
    } catch (err) {
      alert("การสแกนขัดข้องค่ะ");
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
        subjectName, year,
        answers: questions.map(q => ({ id: q.id, correctAnswer: q.correctAnswer }))
      });
      alert("บันทึกเฉลยเรียบร้อย! ✨");
    } catch (err) { alert("บันทึกไม่สำเร็จ"); }
  };

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10 pb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl border-4 border-blue-100">
          <img
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJueGZ3bmZqZzR4eGZ3bmZqZzR4eGZ3bmZqZzR4eGZ3bmZqZzR4JnB2PTAmbGM9ZW4mZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PXM/3y0oCOkdKKRi0/giphy.gif"
            alt="AI Loading"
            className="w-56 h-56 object-contain"
          />
          <h3 className="text-2xl font-black text-blue-600 animate-pulse mt-4">AI กำลังอ่านเฉลย...</h3>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">✨ TCASSIST Smart OCR System ✨</p>
        </div>
      )}

      {/* ฝั่งซ้าย: รูปเฉลย */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <h3 className="text-lg font-black mb-4 flex items-center text-slate-800 uppercase">
          <span className="bg-blue-500 text-white w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-sm shadow-lg shadow-blue-200">📄</span>
          แผ่นเฉลย Reference
        </h3>
        <div className="bg-slate-50 rounded-[2rem] overflow-hidden min-h-[550px] flex items-center justify-center border-2 border-dashed border-slate-200">
          {lastPageUrl ? (
            <img src={lastPageUrl} alt="Answer Key" className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-700" />
          ) : (
            <p className="text-slate-400 font-bold">รอแสดงผลรูปภาพ...</p>
          )}
        </div>
      </div>

      {/* ฝั่งขวา: ตารางกรอกเฉลย */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xl font-black text-slate-800 italic">✍️ DATABASE CORRECTION</h3>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-[4px]">Verified by TCASSIST</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAutoScan} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] shadow-xl shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest">
              🔍 Auto OCR
            </button>
            <button onClick={handleSaveAll} disabled={questions.length === 0 || loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] shadow-xl shadow-emerald-100 transition-all active:scale-95 uppercase tracking-widest">
              Save Changes
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 max-h-[600px] scrollbar-hide grid grid-cols-2 sm:grid-cols-4 gap-4">
          {questions.map((q, index) => (
            <div key={q.id || index} className="group flex flex-col items-center">
              <label className="text-[10px] font-black text-slate-400 mb-1">ข้อ {q.questionNumber}</label>
              <input
                type="text"
                value={q.correctAnswer || ''}
                placeholder="-"
                onChange={(e) => handleInputChange(index, e.target.value)}
                className={`w-full text-center font-black py-4 rounded-2xl border-2 transition-all outline-none text-base
                  ${q.correctAnswer ? 'bg-slate-50 border-slate-100 text-slate-700 focus:border-blue-400' : 'bg-rose-50 border-rose-100 text-rose-500 focus:border-rose-400'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('http://localhost:3000/exams/subjects');
        setSubjects(response.data);
      } catch (err) { console.error(err); }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      setAvailableSubjects(subjects.filter(s => s.year === selectedYear));
      setSelectedSubject('');
    }
  }, [selectedYear, subjects]);

  const uniqueYears = [...new Set(subjects.map(s => s.year))].sort().reverse();

  return (
    <div className="min-h-screen w-full bg-[#FDFDFF] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-[1500px] mx-auto space-y-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f172a] text-white p-8 rounded-[3rem] shadow-2xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h1 className="text-3xl font-black italic tracking-tighter text-blue-400 leading-none">TCASSIST</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[4px] mt-3">Super Admin Engine</p>
          </div>

          <div className="bg-white p-4 rounded-[3rem] shadow-xl border border-slate-100 flex items-center">
            <div className="flex-1 px-4 border-r border-slate-100">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Select Year</label>
              <select className="w-full bg-transparent font-black text-sm focus:ring-0 outline-none cursor-pointer" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                <option value="">เลือกปี...</option>
                {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex-[1.5] px-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Subject</label>
              <select className="w-full bg-transparent font-black text-sm focus:ring-0 outline-none cursor-pointer" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedYear}>
                <option value="">รายวิชา...</option>
                {availableSubjects.map(s => <option key={s.originalName} value={s.originalName}>{s.displayName}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shadow-inner">AD</div>
              <div>
                <p className="text-xs font-black text-slate-800">ADMINISTRATOR</p>
                <div className="flex items-center mt-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">System Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedYear && selectedSubject && (
          <div className="bg-amber-50 border-l-8 border-amber-400 p-6 rounded-[2rem] flex items-center shadow-lg shadow-amber-100 animate-in zoom-in duration-500">
            <span className="text-3xl mr-5">🚧</span>
            <div>
              <h4 className="text-amber-900 font-black text-sm uppercase">Workflow Guidelines</h4>
              <p className="text-amber-700 text-xs font-bold mt-1">1. ปรับพิกัดใน Adjuster (ด้านล่าง) ให้ตรงทุกข้อ ⮕ 2. กดปุ่ม OCR เพื่อดึงเฉลยเข้า Database</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100 min-h-[700px] flex flex-col relative transition-all duration-700">
          {selectedYear && selectedSubject ? (
            <CoordinateAdjusterPage key={`${selectedYear}-${selectedSubject}`} year={selectedYear} subjectName={selectedSubject} pageNumber={1} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse text-5xl">📂</div>
              <p className="font-black text-slate-400 uppercase tracking-[5px] text-sm">Please Select Folder</p>
              <p className="text-xs mt-3 text-slate-400 font-medium italic">เลือก "ปี" และ "วิชา" เพื่อเริ่มจัดการพิกัดข้อสอบนะคะ</p>
            </div>
          )}
        </div>

        {selectedYear && selectedSubject && (
          <AnswerCorrectionZone year={selectedYear} subjectName={selectedSubject} />
        )}

        {selectedYear && selectedSubject && (
          <CriteriaSettingZone year={selectedYear} subjectName={selectedSubject} />
        )}

      </div>
    </div>
  );
};

export default AdminLayout;