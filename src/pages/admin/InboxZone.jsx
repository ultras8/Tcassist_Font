import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Banner from '../../components/Banner';

const InboxZone = () => {
  const [reports, setReports] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages?.length]);

  // ฟังก์ชันดึงรายงานทั้งหมด
  const fetchReports = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await axios.get('http://localhost:3000/reports', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReports(res.data);

      // Sync ข้อมูลแชทปัจจุบันที่กำลังเปิดอยู่แบบ Real-time
      if (selectedChat) {
        const updated = res.data.find(r => r.id === selectedChat.id);
        if (updated) setSelectedChat(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedChat?.id]);

  const handleSendMessage = async () => {
    if (!replyText.trim() || loading) return;

    try {
      const res = await axios.post(`http://localhost:3000/reports/${selectedChat.id}/messages`,
        { message: replyText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const newMessage = res.data;

      // อัปเดตแชทปัจจุบันที่เปิดอยู่ทันที
      setSelectedChat(prev => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage]
      }));

      setReplyText("");

      // อัปเดตลงในรายการแถบซ้ายมือ (Inbox List) ด้วย
      setReports(prevReports =>
        prevReports.map(r =>
          r.id === selectedChat.id
            ? { ...r, messages: [...(r.messages || []), newMessage] }
            : r
        )
      );

    } catch (err) {
      alert("ส่งไม่ไปค่ะ");
    }
  };

  const handleCloseChat = async (id) => {
    if (!window.confirm("ปิดแชทนี้เลยไหมคะ? จะพิมพ์เพิ่มไม่ได้แล้วนะ")) return;
    try {
      await axios.patch(`http://localhost:3000/reports/${id}/close`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchReports(true);
    } catch (err) { alert("ปิดไม่ได้ค่ะ"); }
  };

  const handleDeleteChat = async (id) => {
    if (!window.confirm("ลบแชทนี้ออก?")) return;
    try {
      await axios.delete(`http://localhost:3000/reports/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedChat(null);
      fetchReports(true);
    } catch (err) { alert("ลบไม่ได้ค่ะ"); }
  };

  return (
    <div className="flex h-[800px] bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      <div className="w-1/3 border-r border-slate-50 flex flex-col bg-slate-50/20">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md">
          <div>
            <h3 className="text-xl font-black text-slate-800 italic leading-none">INBOX</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {reports.filter(r => r.status === 'pending').length} Pending Tasks
            </p>
          </div>
          <button
            onClick={() => fetchReports(true)}
            className={`p-3 hover:bg-white rounded-2xl transition-all active:rotate-180 duration-500 shadow-sm border border-slate-100 ${loading ? 'animate-spin' : ''}`}
          >
            🔄
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedChat(report)}
              className={`p-6 cursor-pointer transition-all border-l-4 flex gap-4
                ${selectedChat?.id === report.id ? 'bg-white shadow-inner border-indigo-500' : 'border-transparent hover:bg-white/50'}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-xs shadow-sm
                ${report.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                {report.sender?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-xs font-black truncate ${report.status === 'pending' ? 'text-slate-800' : 'text-slate-400'}`}>
                    {report.sender?.username}
                  </p>
                  <span className="text-[9px] text-slate-300 font-bold italic">
                    {new Date(report.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
                <p className={`text-[11px] truncate ${report.status === 'pending' ? 'text-slate-600 font-bold' : 'text-slate-300'}`}>
                  {report.subject}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#FBFBFE]">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white border-b border-slate-50 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-slate-200">
                  {selectedChat.sender?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm">{selectedChat.sender?.username}</h4>
                  <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">● Online Support</p>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedChat.status !== 'closed' ? (
                  <button onClick={() => handleCloseChat(selectedChat.id)} className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-black text-[10px] hover:bg-amber-200 transition-all">
                    CLOSE CHAT
                  </button>
                ) : (
                  <span className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl font-black text-[10px]">ARCHIVED</span>
                )}
                <button onClick={() => handleDeleteChat(selectedChat.id)} className="bg-rose-50 text-rose-500 p-2 rounded-xl hover:bg-rose-100 transition-all">
                  🗑️
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-[#FBFBFE] space-y-6">

              <div className="flex justify-center mb-8">
                <div className="bg-white border-4 border-black p-6 rounded-[2rem] max-w-xl w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left space-y-3">
                  <div className="flex justify-between items-center border-b-2 border-slate-100 pb-2">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      🎫 TICKET INFORMATION
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      ID: #{selectedChat.id}
                    </span>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">SUBJECT / หัวเรื่อง</p>
                    <h4 className="text-sm font-black text-slate-800">{selectedChat.subject}</h4>
                  </div>

                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase">DESCRIPTION / คำอธิบายเพิ่มเติม</p>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {selectedChat.message}
                    </p>
                  </div>

                  {selectedChat.link && (
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">EVIDENCE / ลิงก์หลักฐาน</p>
                      <a
                        href={selectedChat.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl text-[11px] font-black text-indigo-600 border border-indigo-200 transition-all truncate max-w-full"
                      >
                        <span>📎 เปิดลิงก์แนบหลักฐาน</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {selectedChat.messages?.map((msg) => {
                const isAdmin = msg.senderRole?.toLowerCase() === 'admin' || msg.sender?.role?.toLowerCase() === 'admin';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <div className={`max-w-[75%] p-5 rounded-[1.8rem] shadow-sm text-sm font-medium
        ${isAdmin
                        ? 'bg-slate-900 text-white rounded-br-none shadow-indigo-100' // แอดมินอยู่ขวา
                        : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none' // ยูสเซอร์อยู่ซ้าย
                      }`}
                    >
                      {msg.message}
                      <p className={`text-[8px] mt-2 font-black opacity-40 uppercase tracking-tighter ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            {/* Chat Footer */}
            <div className="p-8 bg-white border-t border-slate-50">
              {selectedChat.status !== 'closed' ? (
                <div className="relative flex gap-3">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="พิมพ์ข้อความตอบกลับ..."
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    SEND
                  </button>
                </div>
              ) : (
                <div className="text-center py-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Read Only Mode</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10">
            <div className="text-[100px] mb-4">📫</div>
            <p className="font-black text-lg uppercase tracking-[0.3em]">No Message Selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxZone;