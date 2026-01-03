import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Banner from '../components/Banner';
import Select from 'react-select';

const CustomSelect = ({ placeholder, onChange, options = [], value, loading }) => {
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      height: '55px',
      borderRadius: '15px',
      border: '2px solid black',
      boxShadow: state.isFocused ? 'none' : '4px 4px 0px 0px rgba(0,0,0,1)',
      fontWeight: 'bold',
      fontSize: '14px',
      backgroundColor: 'white',
      '&:hover': { border: '2px solid black' }
    }),
    option: (provided, state) => ({
      ...provided,
      fontWeight: 'bold',
      backgroundColor: state.isSelected ? '#FD7A6C' : state.isFocused ? '#FFF0EE' : 'white',
      color: state.isSelected ? 'white' : '#334155',
      cursor: 'pointer'
    })
  };

  return (
    <Select
      placeholder={loading ? "กำลังโหลด..." : placeholder}
      options={options}
      styles={customStyles}
      value={options.find(opt => opt.value === value) || null}
      onChange={(selectedOption) => {
        onChange({ target: { value: selectedOption ? selectedOption.value : '' } });
      }}
      isSearchable={true}
      isClearable={true}
    />
  );
};

function ScoreCalculator({ type }) {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [allUniquePrograms, setAllUniquePrograms] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedUni, setSelectedUni] = useState('');
  const [selectedProgramCode, setSelectedProgramCode] = useState('');
  const [selectedYear, setSelectedYear] = useState('2568');

  const years = ['2568', '2567', '2566', '2565', '2564'];

  // โหลดรายชื่อมหาลัย
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const res = await axios.get('http://localhost:3000/calculator/universities');
        setUniversities(res.data);
      } catch (err) {
        console.error("โหลดรายชื่อมหาลัยไม่สำเร็จ", err);
      }
    };
    fetchUnis();
  }, []);

  // โหลดคณะตามมหาลัย (Single Mode)
  useEffect(() => {
    if (type !== 'single' || !selectedUni) {
      setPrograms([]);
      return;
    }
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/calculator/programs/${selectedUni}?year=${selectedYear}`);
        const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        const formatted = rawData.map(p => ({
          label: p.displayName || "ไม่ระบุชื่อสาขา",
          value: p.programCode || ""
        }));
        setPrograms(formatted);
      } catch (err) {
        console.error("โหลดคณะไม่สำเร็จ", err);
      } finally { setLoading(false); }
    };
    fetchPrograms();
  }, [selectedUni, selectedYear, type]);

  // โหลดชื่อสาขารวม (MultiUni Mode) - แก้ไขตรงนี้ให้รองรับข้อมูลแบบ String Array
  useEffect(() => {
    if (type !== 'multiUni') return;
    const fetchAllMajors = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/calculator/programs/all-majors?year=${selectedYear}`);

        // Backend ส่งมาเป็น ['วิศวะคอม', 'บัญชี']
        const rawData = Array.isArray(res.data) ? res.data : [];

        // Map จาก String ให้เป็น Object ที่ Select ต้องการ
        const formatted = rawData.map(majorName => ({
          label: majorName, // แสดงชื่อสาขา
          value: majorName  // ใช้ชื่อสาขาเป็นค่า value ไปเลย
        }));

        setAllUniquePrograms(formatted);
      } catch (err) {
        console.error("โหลดรายชื่อสาขารวมไม่สำเร็จ", err);
      } finally { setLoading(false); }
    };
    fetchAllMajors();
  }, [selectedYear, type]);

  const configs = {
    single: {
      title: "Interested Faculty",
      description: "( Specific University & Faculty )",
      subDescription: "คำนวณคะแนนเจาะจงคณะและมหาวิทยาลัยที่สนใจ",
      showTwoDropdowns: true,
      label1: "เลือกมหาวิทยาลัย",
      label2: "เลือกคณะ/สาขา"
    },
    multiUni: {
      title: "Interested Major",
      description: "( Compare same major across universities )",
      subDescription: "เปรียบเทียบคะแนนสาขาเดียวกันจากหลายมหาวิทยาลัย",
      showTwoDropdowns: false,
      label1: "เลือกคณะ/สาขา"
    },
    allInUni: {
      title: "Interested University",
      description: "( Explore all faculties in one place )",
      subDescription: "ดูโอกาสติดทุกคณะในมหาวิทยาลัยเดียว",
      showTwoDropdowns: false,
      label1: "เลือกมหาวิทยาลัย"
    }
  };

  const current = configs[type] || configs.single;

  const handleContinue = () => {
    const isMulti = type === 'multiUni';

    if (isMulti && !selectedProgramCode) return alert('กรุณาเลือกสาขาที่สนใจค่ะ');
    if (!isMulti && !selectedUni) return alert('กรุณาเลือกมหาวิทยาลัยค่ะ');

    navigate('/calculate/result', {
      state: {
        // แก้ตรงนี้: ถ้าเป็น multiUni ให้ส่ง type เป็น 'major' 
        // เพื่อให้ตรงกับเงื่อนไขใน resultView และ path ของ Backend
        type: isMulti ? 'major' : type,
        universityId: selectedUni,
        programCode: isMulti ? '' : selectedProgramCode,
        majorName: isMulti ? selectedProgramCode : '',
        year: selectedYear
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#ADD6F2] flex flex-col items-center">
      <div className="w-full"><Banner /></div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[360px] px-8 space-y-8 mt-0 pb-10">
        <div className="text-center space-y-1">
          <h1 className="text-[26px] font-black text-slate-800 leading-tight">{current.title}</h1>
          <p className="text-[14px] font-bold text-slate-600 italic">{current.description}</p>
          <p className="text-[12px] text-slate-500 mt-2 font-medium">{current.subDescription}</p>
        </div>

        <div className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 ml-1">ปีการศึกษา</label>
            <CustomSelect
              placeholder="-- เลือกปีการศึกษา --"
              options={years.map(y => ({ label: `ปีการศึกษา ${y}`, value: y }))}
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedUni('');
                setSelectedProgramCode('');
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 ml-1">{current.label1}</label>
            <CustomSelect
              placeholder={`-- ${current.label1} --`}
              options={type === 'multiUni'
                ? allUniquePrograms
                : universities.map(u => ({ label: u.name, value: u.id }))
              }
              value={type === 'multiUni' ? selectedProgramCode : selectedUni}
              loading={loading}
              onChange={(e) => {
                if (type === 'multiUni') {
                  setSelectedProgramCode(e.target.value);
                } else {
                  setSelectedUni(e.target.value);
                  setSelectedProgramCode('');
                }
              }}
            />
          </div>

          {current.showTwoDropdowns && (
            <div className={`space-y-1.5 transition-opacity ${!selectedUni ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[13px] font-bold text-slate-700 ml-1">{current.label2}</label>
              <CustomSelect
                placeholder="-- ค้นหาชื่อคณะ หรือ สาขาวิชา --"
                options={programs}
                value={selectedProgramCode}
                loading={loading}
                onChange={(e) => setSelectedProgramCode(e.target.value)}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={
            (type === 'multiUni' && !selectedProgramCode) ||
            (type !== 'multiUni' && !selectedUni) ||
            (current.showTwoDropdowns && !selectedProgramCode)
          }
          className="w-full h-[52px] mt-4 bg-[#FD7A6C] rounded-[18px] border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-[22px] font-black active:translate-y-1 active:shadow-none transition-all disabled:bg-slate-400 disabled:shadow-none"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}

export default ScoreCalculator;