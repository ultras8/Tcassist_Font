import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axiosConfig';
import Banner from '../components/Banner';
import Select from 'react-select';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

const customStyles = {
  control: (provided) => ({
    ...provided,
    height: '50px',
    borderRadius: '12px',
    border: '2px solid black',
    boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
    fontWeight: 'bold',
  }),
  option: (provided, state) => ({
    ...provided,
    fontWeight: 'bold',
    backgroundColor: state.isSelected ? '#FD7A6C' : 'white',
    color: state.isSelected ? 'white' : 'black',
  })
};

function RankingSelection() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2568');
  const years = ['2568', '2567', '2566', '2565', '2564'];

  const [rankings, setRankings] = useState([
    { id: Date.now(), universityId: '', programCode: '', programs: [] }
  ]);

  // โหลดมหาลัย
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const res = await api.get('/calculator/universities'); // ใช้ path สั้นๆ ตาม config
        setUniversities(res.data.map(u => ({ label: u.name, value: u.id })));
      } catch (err) {
        console.error("โหลดมหาลัยไม่ได้ค่ะ:", err);
      }
    };
    fetchUnis();
  }, []);

  const handleUniChange = async (index, uniId) => {
    const newRankings = [...rankings];
    newRankings[index].universityId = uniId;
    newRankings[index].programCode = '';

    setLoading(true);
    try {
      const res = await api.get(`/calculator/programs/${uniId}`, {
        params: { year: selectedYear }
      });

      newRankings[index].programs = res.data.map(p => ({
        label: p.displayName,
        value: p.programCode
      }));
      setRankings(newRankings);
    } catch (err) {
      console.error("ดึงคณะไม่สำเร็จ:", err);
      newRankings[index].programs = [];
      setRankings(newRankings);
    } finally {
      setLoading(false);
    }
  };

  const moveRanking = (index, direction) => {
    const newRankings = [...rankings];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRankings.length) return;
    const temp = newRankings[index];
    newRankings[index] = newRankings[targetIndex];
    newRankings[targetIndex] = temp;
    setRankings(newRankings);
  };

  const addRankingSlot = () => {
    if (rankings.length < 10) {
      setRankings([...rankings, { id: Date.now() + Math.random(), universityId: '', programCode: '', programs: [] }]);
    }
  };

  const removeRankingSlot = (index) => {
    const newRankings = rankings.filter((_, i) => i !== index);
    setRankings(newRankings);
  };

  const handleNext = async () => {
    const finalCodes = rankings.filter(r => r.programCode).map(r => r.programCode);
    if (finalCodes.length === 0) return alert("เลือกอย่างน้อย 1 อันดับนะจ๊ะ");

    setLoading(true);
    // console.log("Data finalCodes:");
    // finalCodes.forEach(e => console.log(e));

    try {
      const res = await api.post('/calculator/calculate-rankings', {
        programCodes: finalCodes,
        year: selectedYear
      });

      // console.log("Data from Backend:", res.data);

      if (res.data && res.data.length > 0) {
        navigate('/calculate/ranking-result', {
          state: { results: res.data, year: selectedYear }
        });
      } else {
        alert("Backend ส่งข้อมูลกลับมาเป็นค่าว่างค่ะ ลองเช็คคะแนนที่บันทึกไว้นะคะ");
      }
    } catch (err) {
      console.error(err);
      alert("คำนวณไม่สำเร็จค่ะ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ADD6F2] pb-20">
      <Banner />

      <div className="max-w-[400px] mx-auto px-6 mt-8 flex flex-col items-center">
        <div className="text-center mb-6">
          <h1 className="text-[32px] font-black text-slate-800 tracking-tighter italic">TOP 10 RANKING</h1>
          <p className="text-[14px] font-bold text-slate-700 bg-white border-2 border-black px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            ลองจัด 10 อันดับเพื่อดูโอกาสสอบติด
          </p>
        </div>

        <div className="w-full mb-8 bg-[#FFF0EE] p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <label className="text-[13px] font-black text-slate-700 ml-1 mb-2 block uppercase">ปีการศึกษาที่ต้องการคำนวณ</label>
          <Select
            options={years.map(y => ({ label: `ปีการศึกษา ${y}`, value: y }))}
            styles={customStyles}
            value={{ label: `ปีการศึกษา ${selectedYear}`, value: selectedYear }}
            onChange={(opt) => {
              setSelectedYear(opt.value);
              // เมื่อเปลี่ยนปี ล้างข้อมูลคณะเดิมออกเพราะรหัสหรือคณะที่เปิดอาจเปลี่ยนไป
              setRankings([{ id: Date.now(), universityId: '', programCode: '', programs: [] }]);
            }}
          />
          <p className="text-[10px] font-bold text-[#FD7A6C] mt-2">* หากเปลี่ยนปี ระบบจะล้างอันดับที่เลือกไว้เดิมออกค่ะ</p>
        </div>

        {/* List of Ranking Slots */}
        <div className="w-full space-y-6">
          {rankings.map((rank, index) => (
            <div key={rank.id} className="relative bg-white p-5 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#FD7A6C] border-2 border-black rounded-full flex items-center justify-center font-black text-white z-10 shadow-sm">
                {index + 1}
              </div>

              <div className="absolute top-2 right-2 flex items-center space-x-1">
                <button onClick={() => moveRanking(index, 'up')} disabled={index === 0} className="p-1 hover:bg-slate-100 rounded-md disabled:opacity-20"><ChevronUp size={20} strokeWidth={3} /></button>
                <button onClick={() => moveRanking(index, 'down')} disabled={index === rankings.length - 1} className="p-1 hover:bg-slate-100 rounded-md disabled:opacity-20"><ChevronDown size={20} strokeWidth={3} /></button>
                <button onClick={() => removeRankingSlot(index)} className="ml-1 p-1 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-md border border-red-200"><X size={20} strokeWidth={3} /></button>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-[11px] font-black mb-1 block text-slate-500 uppercase">Step 1: เลือกมหาวิทยาลัย</label>
                  <Select
                    options={universities}
                    styles={customStyles}
                    placeholder="เลือกมหาลัย..."
                    value={universities.find(u => u.value === rank.universityId)}
                    onChange={(opt) => handleUniChange(index, opt.value)}
                  />
                </div>

                <div className={!rank.universityId ? 'opacity-30 pointer-events-none' : ''}>
                  <label className="text-[11px] font-black mb-1 block text-slate-500 uppercase">Step 2: เลือกคณะ/สาขาวิชา</label>
                  <Select
                    options={rank.programs}
                    styles={customStyles}
                    placeholder="เลือกคณะ..."
                    value={rank.programs.find(p => p.value === rank.programCode)}
                    onChange={(opt) => {
                      const newRankings = [...rankings];
                      newRankings[index].programCode = opt.value;
                      setRankings(newRankings);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-10 space-y-4">
          <button onClick={addRankingSlot} className="w-full h-[55px] bg-white border-2 border-black rounded-xl font-black text-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">+ เพิ่มอันดับ ({rankings.length}/10)</button>
          <button onClick={handleNext} disabled={loading} className="w-full h-[60px] bg-[#FD7A6C] border-2 border-black rounded-2xl font-black text-white text-[22px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 uppercase">
            {loading ? "กำลังวิเคราะห์..." : "ถัดไป →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RankingSelection;