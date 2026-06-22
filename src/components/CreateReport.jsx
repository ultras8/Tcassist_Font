import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Banner from '../components/Banner';

const CreateReport = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบข้อมูลก่อนส่ง (Validation เบื้องต้น)
    if (!subject.trim() || !message.trim()) {
      alert("กรุณากรอกหัวข้อและรายละเอียดให้ครบถ้วนก่อนนะคะ");
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const res = await axios.post('http://localhost:3000/reports',
        {
          subject: subject,
          message: message,
          link: link.trim() || null  // ส่ง link ไปตาม DTO ถ้าไม่มีให้เป็น null
        },
        {
          headers: {
            Authorization: `Bearer ${token}` // ส่ง Token ไปให้ JwtAuthGuard ใน Controller เช็คค่ะ
          }
        }
      );

      console.log("สร้าง Ticket สำเร็จแล้วค่ะ:", res.data);
      navigate(`/report-chat/${res.data.id}`);

    } catch (err) {
      console.error("เกิดข้อผิดพลาด:", err);
      const errorMsg = err.response?.data?.message || "สร้างรายการไม่สำเร็จค่ะ";
      alert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg); // แสดง Error จาก Class Validator (DTO)
    }
  };

  return (
    <div className="min-h-screen bg-[#ADD6F2] pb-10">
      <Banner />
      <div className="max-w-2xl mx-auto px-6 mt-10">
        <div className="bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black text-slate-800 italic uppercase mb-6">Open New Ticket</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block font-black text-slate-700 mb-2 uppercase text-xs tracking-widest">Subject / หัวข้อปัญหา</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="เช่น พบข้อผิดพลาดในข้อสอบ..."
                className="w-full border-4 border-black rounded-2xl p-4 font-bold focus:outline-none focus:bg-slate-50 transition-colors"
              />
            </div>

            {/* Link (เพิ่มเติม) */}
            <div>
              <label className="block font-black text-slate-700 mb-2 uppercase text-xs tracking-widest">
                Evidence Link / ลิงก์หลักฐาน (ถ้ามี)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="เช่น https://imgur.com/xyz"
                className="w-full border-4 border-black rounded-2xl p-4 font-bold focus:outline-none focus:bg-slate-50 transition-colors border-dashed bg-slate-50/50"
              />
              <p className="text-[10px] font-bold text-slate-500 mt-2 italic">* สามารถฝากรูปไว้ที่ Imgur แล้วเอาลิงก์มาแปะได้นะคะ</p>
            </div>

            {/* Description */}
            <div>
              <label className="block font-black text-slate-700 mb-2 uppercase text-xs tracking-widest">Description / รายละเอียด</label>
              <textarea
                required
                value={message}
                rows={4}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="อธิบายรายละเอียดให้แอดมินหน่อยนะคะ..."
                className="w-full border-4 border-black rounded-2xl p-4 font-bold focus:outline-none focus:bg-slate-50 transition-colors"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/my-reports')}
                className="flex-1 border-4 border-black py-4 rounded-2xl font-black text-slate-800 hover:bg-slate-100 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 bg-black text-white py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] active:translate-y-1 active:shadow-none"
              >
                SUBMIT TICKET
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;