import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Banner from '../components/Banner';

interface Exam {
  id: number;
  subjectName: string;
  pdfUrl: string;
  year: string;
  source: string;
  link?: string;
}

const ExamLibrary = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('2568');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newExam, setNewExam] = useState({
    subjectName: '',
    year: '',
    source: '',
    link: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/exams/library')
      .then(res => setExams(res.data))
      .catch(err => {
        console.error("โหลดข้อมูลไม่สำเร็จค่ะ:", err);
      });
  }, []);

  // รวมร่าง handleUpload ให้เหลืออันเดียวที่ถูกต้อง
  const handleUpload = async () => {
    if (!file || !newExam.subjectName) {
      alert("กรุณากรอกชื่อวิชาและเลือกไฟล์ PDF ด้วยนะคะ");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subjectName', newExam.subjectName);
    formData.append('year', newExam.year);
    formData.append('source', newExam.source || 'User Contribution');

    if (newExam.link) {
      formData.append('link', newExam.link);
    }

    try {
      const res = await axios.post('http://localhost:3000/exams/library/upload-library', formData);
      setExams([res.data, ...exams]);
      setIsModalOpen(false);
      alert("อัปโหลดสำเร็จแล้วค่ะ! ✨");

      // รีเซ็ตค่าให้สะอาดกริ๊บ
      setFile(null);
      setNewExam({ subjectName: '', year: '', source: '', link: '' });
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดค่ะ!");
    } finally {
      setIsUploading(false);
    }
  };

  const years = ['ทั้งหมด', ...new Set(exams.map(exam => exam.year))].sort().reverse();

  const filteredExams = exams.filter(exam => {
    const matchesYear = selectedYear === 'ทั้งหมด' || exam.year === selectedYear;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      exam.subjectName.toLowerCase().includes(searchLower) ||
      exam.source.toLowerCase().includes(searchLower);

    return matchesYear && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#ADD6F2] pb-20">
      <Banner />

      <div className="max-w-[1200px] mx-auto px-6 mt-8">
        <div className="text-center mb-10">
          <h1 className="text-[40px] font-black text-slate-800 italic uppercase leading-none mb-8">
            คลังข้อสอบ
          </h1>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-4">
            <div className="relative w-full sm:w-auto">
              <select
                className="w-full sm:w-[200px] h-[55px] bg-white border-4 border-black rounded-xl px-4 font-black text-slate-800 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] appearance-none cursor-pointer focus:outline-none"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year === 'ทั้งหมด' ? 'ทุกปีการศึกษา' : `ปี พ.ศ. ${year}`}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="black" strokeWidth="4" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative w-full sm:w-[350px]">
              <input
                type="text"
                placeholder="ค้นหาชื่อวิชา หรือ แหล่งที่มา (เช่น ทปอ.)..."
                className="w-full h-[55px] bg-white border-4 border-black rounded-xl pl-12 pr-4 font-bold text-slate-800 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto h-[55px] bg-[#C3EB37] hover:bg-[#b3d92b] border-4 border-black rounded-xl px-8 font-black text-slate-800 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มข้อสอบ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <div key={exam.id} className="bg-white border-4 border-black rounded-[2rem] p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden group">
                <div className="inline-block bg-[#FD7A6C] text-white border-2 border-black px-4 py-1 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 italic">
                  พ.ศ. {exam.year}
                </div>
                <div className="mb-8">
                  <h3 className="text-[22px] font-black leading-tight text-slate-800 h-14 overflow-hidden italic">
                    {exam.subjectName}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-black uppercase bg-black text-white px-2 py-0.5 rounded">Source</span>
                      <span className="text-[12px] font-bold text-slate-500">{exam.source}</span>
                    </div>
                    {exam.link && (
                      <a
                        href={exam.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 transition-colors no-underline"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                        </svg>
                        ติดตามผู้เขียน
                      </a>
                    )}
                  </div>
                </div>
                <a href={exam.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full h-[60px] bg-yellow-400 hover:bg-yellow-300 border-4 border-black rounded-2xl font-black text-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase no-underline">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </a>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white/50 border-4 border-dashed border-black rounded-[3rem] text-center shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
              <div className="text-6xl mb-4 text-black">🌵</div>
              <h2 className="text-2xl font-black text-slate-800 italic uppercase">Not Found</h2>
              <p className="font-bold text-slate-600 mt-2">ไม่พบข้อสอบที่ตามหา ลองหาใหม่อีกทีนะคะ ✨</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border-[6px] border-black p-8 w-full max-w-lg shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] relative animate-in zoom-in duration-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-6 -right-6 bg-[#FD7A6C] border-4 border-black w-12 h-12 flex items-center justify-center font-black text-2xl hover:bg-red-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                ✕
              </button>

              <h2 className="text-3xl font-black italic uppercase mb-6 underline decoration-[#C3EB37] decoration-8 underline-offset-4">
                Contribute New Exam ✨
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block font-black text-sm uppercase mb-1">ชื่อวิชา / ชื่อข้อสอบ</label>
                  <input
                    type="text"
                    value={newExam.subjectName}
                    placeholder="เช่น A-Level ภาษาอังกฤษ 2568"
                    className="w-full border-4 border-black p-3 font-bold focus:bg-blue-50 outline-none"
                    onChange={(e) => setNewExam({ ...newExam, subjectName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-sm uppercase mb-1">ปี พ.ศ.</label>
                    <input
                      type="text"
                      value={newExam.year}
                      placeholder="25xx"
                      className="w-full border-4 border-black p-3 font-bold focus:bg-yellow-50 outline-none"
                      onChange={(e) => setNewExam({ ...newExam, year: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-black text-sm uppercase mb-1">เครดิต / ที่มา</label>
                    <input
                      type="text"
                      value={newExam.source}
                      placeholder="ชื่อติวเตอร์ / ทปอ."
                      className="w-full border-4 border-black p-3 font-bold focus:bg-pink-50 outline-none"
                      onChange={(e) => setNewExam({ ...newExam, source: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-sm uppercase mb-1 text-black-600">
                    🔗 ลิงก์ติดตามติวเตอร์ (Facebook / IG / Youtube)
                  </label>
                  <input
                    type="text"
                    value={newExam.link}
                    placeholder="https://facebook.com/your-page"
                    className="w-full border-4 border-black p-3 font-bold focus:bg-blue-50 outline-none"
                    onChange={(e) => setNewExam({ ...newExam, link: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block font-black text-sm uppercase mb-1">ไฟล์ PDF ข้อสอบ</label>
                  <div className="relative border-4 border-dashed border-black p-6 bg-gray-50 text-center group cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="font-bold text-slate-500">
                      {file ? `📄 ${file.name}` : "📂 คลิกหรือลากไฟล์ PDF มาวางตรงนี้"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full h-[65px] bg-[#C3EB37] border-4 border-black font-black text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {isUploading ? "UPLOADING..." : "SYNC TO CLOUD 🚀"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamLibrary;