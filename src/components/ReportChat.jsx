import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Banner from '../components/Banner';

const ReportChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages?.length]);

  // ฟังก์ชันดึงแชทแบบทีละห้อง (ฝั่ง User)
  const fetchChatDetails = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/reports/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTicket(res.data);
    } catch (err) {
      console.error("Error fetching chat details:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatDetails(true);
  }, [id]);

  //  ทำระบบจำลอง Socket (Polling) ฝั่ง User คอยรีเฟรชข้อความคุยใหม่ๆ ทุก 4 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChatDetails(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [id]);

  const handleSendMessage = async () => {
    if (!replyText.trim()) return;

    try {
      const res = await axios.post(`http://localhost:3000/reports/${id}/messages`,
        { message: replyText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setTicket(prev => ({
        ...prev,
        messages: [...(prev.messages || []), res.data]
      }));
      setReplyText("");
    } catch (err) {
      alert("ไม่สามารถส่งข้อความได้ค่ะ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ADD6F2]">
        <Banner />
        <div className="text-center py-40 font-black text-slate-800 opacity-30 text-4xl italic">LOADING CHAT...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ADD6F2] pb-10">
      <Banner />

      <div className="max-w-3xl mx-auto px-6 mt-6">
        <button
          onClick={() => navigate('/my-reports')}
          className="mb-4 bg-white border-2 border-black px-4 py-2 rounded-xl font-black text-xs hover:bg-slate-50 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
        >
          ⬅️ ย้อนกลับไปประวัติของฉัน
        </button>

        <div className="bg-white border-4 border-black rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-[700px]">

          {/* Header */}
          <div className="p-6 bg-slate-900 text-white border-b-4 border-black flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="font-black italic text-sm text-white uppercase tracking-wider">SUPPORT ROOM CHAT</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status: {ticket?.status}</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#F7F9FC] space-y-6 custom-scrollbar">

            <div className="flex justify-center">
              <div className="bg-white border-4 border-black p-6 rounded-[2rem] w-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left space-y-3">
                <div className="border-b-2 border-slate-100 pb-1">
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    📌 รายละเอียดปัญหาที่แจ้งเข้ามา
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">SUBJECT / หัวเรื่อง</p>
                  <h4 className="text-sm font-black text-slate-800 italic text-indigo-600">"{ticket?.subject}"</h4>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">DESCRIPTION / คำอธิบาย</p>
                  <p className="text-xs text-slate-600 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {ticket?.message}
                  </p>
                </div>

                {ticket?.link && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">EVIDENCE LINK / ลิงก์แนบ</p>
                    <a
                      href={ticket.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-[11px] font-black text-indigo-600 border border-indigo-200 transition-all truncate max-w-full"
                    >
                      <span>🔗 คลิกเพื่อเปิดลิงก์หลักฐานแนบของคุณ</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bubble ข้อความโต้ตอบ */}
            {ticket?.messages?.map((msg) => {
              const isAdminMsg = msg.senderRole === 'admin';
              return (
                <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-start' : 'justify-end'} animate-in fade-in`}>
                  <div className={`max-w-[75%] p-4 rounded-[1.5rem] shadow-sm text-xs font-bold
                    ${isAdminMsg
                      ? 'bg-slate-900 text-white rounded-bl-none shadow-slate-200'
                      : 'bg-white text-slate-700 border-2 border-black rounded-br-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                    <p className="leading-relaxed">{msg.message}</p>

                    <p className="text-[7px] mt-1 font-black opacity-40 text-right uppercase">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={chatEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-5 bg-white border-t-4 border-black">
            {ticket?.status !== 'closed' ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="พิมพ์ข้อความคุยกับแอดมินที่นี่..."
                  className="flex-1 border-4 border-black rounded-2xl px-5 py-3 text-xs font-bold focus:outline-none focus:bg-slate-50"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] active:translate-y-1 active:shadow-none"
                >
                  SEND
                </button>
              </div>
            ) : (
              <div className="text-center py-3 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🔒 แชทนี้ถูกปิดการสนทนาเรียบร้อยแล้วค่ะ</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportChat;