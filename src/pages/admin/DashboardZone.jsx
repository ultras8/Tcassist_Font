import React, { useState, useEffect } from "react";
import axios from "axios";

const DashboardZone = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ดึง Role จาก localStorage มาเช็คสิทธิ์
  const myRole = localStorage.getItem("role")?.toLowerCase();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Fetch Users Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 1. แก้ไขฟังก์ชันจัดการสถานะ (Ban/Unban)
  const handleUpdateStatus = async (id, currentIsActive) => {
    // เช็คเผื่อกรณีที่ค่าหลุดมาเป็น undefined ให้ถือว่าเป็น true ไว้ก่อน (หรือตามความจริงใน DB)
    const isCurrentlyActive = currentIsActive === undefined ? true : currentIsActive;

    let newStatusValue;
    let confirmMsg;

    if (isCurrentlyActive === true) {
      // ถ้าตอนนี้ Active (true) -> เราจะ BAN (ส่ง false)
      newStatusValue = false;
      confirmMsg = "ยืนยันการระงับสิทธิ์ (BAN) User คนนี้ใช่ไหมคะ?";
    } else {
      // ถ้าตอนนี้ Banned (false) -> เราจะปลดแบน (ส่ง true)
      newStatusValue = true;
      confirmMsg = "ยืนยันการเปิดใช้งาน User คนนี้ใช่ไหมคะ?";
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:3000/users/${id}/status`,
        { isActive: newStatusValue }, // ส่ง isActive: false ไปเพื่อ BAN
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(newStatusValue ? "เปิดใช้งานสำเร็จค่ะ! ✨" : "ระงับการใช้งานเรียบร้อยค่ะ! 🚫");
      fetchUsers(); // โหลดข้อมูลใหม่
    } catch (err) {
      console.error("Error Update Status:", err.response?.data);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะค่ะ");
    }
  };

  // 2. แก้ไขฟังก์ชันเปลี่ยนสิทธิ์ (Role)
  const handleChangeRole = async (id, currentRole) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    if (!window.confirm(`ต้องการเปลี่ยนสิทธิ์เป็น ${newRole} ใช่ไหมคะ?`)) return;

    try {
      await axios.patch(`http://localhost:3000/users/${id}/role`,
        { role: newRole }, // Body
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchUsers();
    } catch (err) {
      alert("เปลี่ยนสิทธิ์ไม่สำเร็จค่ะ");
    }
  };

  // 1. กำหนดลำดับความสำคัญของ Role (ใครใหญ่สุดให้ค่าน้อยสุด)
  const rolePriority = {
    superadmin: 1,
    admin: 2,
    user: 3
  };

  // 2. จัดการเรียงลำดับและ Filter ข้อมูล
  const filteredUsers = users
    .slice() // สร้าง copy ของ array เพื่อไม่ให้กระทบ state เดิมโดยตรง
    .sort((a, b) => {
      // เรียงตาม Priority ที่เรากำหนดไว้
      const priorityA = rolePriority[a.role?.toLowerCase()] || 99;
      const priorityB = rolePriority[b.role?.toLowerCase()] || 99;
      return priorityA - priorityB;
    })
    .filter(
      (u) =>
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Users
          </p>
          <h4 className="text-4xl font-black text-slate-800 mt-2">
            {users.length}
          </h4>
          <p className="text-emerald-500 text-[10px] font-bold mt-2">
            Active in System
          </p>
        </div>

        <div className="bg-[#0f172a] p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
            Active Admins
          </p>
          <h4 className="text-4xl font-black text-rose-600 mt-2">
            {users.filter((u) => u.isActive === false).length}
          </h4>
          <p className="text-slate-400 text-[10px] font-bold mt-2 font-mono italic">
            Monitoring Active
          </p>
        </div>

        <div className="bg-rose-50 p-8 rounded-[3rem] shadow-sm border border-rose-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
            Banned Users
          </p>
          <h4 className="text-4xl font-black text-rose-600 mt-2">
            {users.filter((u) => u.status === "banned").length}
          </h4>
          <p className="text-rose-300 text-[10px] font-bold mt-2 uppercase italic font-black">
            Restricted
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              USER CONTROL CENTER
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
              Manage permissions and status
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-10 py-6">User Info</th>
                <th className="px-6 py-6 text-center">Role</th>
                <th className="px-6 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 leading-none">
                          {user.username}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold mt-1.5">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span
                      className={`text-[9px] font-black uppercase ${user.isActive === false ? "text-rose-500" : "text-emerald-500"
                        }`}
                    >
                      {user.isActive === false ? "BANNED" : "ACTIVE"}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right space-x-2">
                    <button
                      // ส่ง user.isActive เข้าไปในฟังก์ชัน (เช็คตัวสะกด i ตัวเล็ก A ตัวใหญ่ ให้ตรงเป๊ะนะคะ)
                      onClick={() => handleUpdateStatus(user.id, user.isActive)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${user.isActive === false
                        ? "bg-emerald-50 text-emerald-600" // สีสำหรับปุ่ม UNBAN
                        : "bg-rose-50 text-rose-600"    // สีสำหรับปุ่ม BAN
                        }`}
                    >
                      {/* ถ้า isActive เป็น false แสดงว่าโดนแบนอยู่ ให้ขึ้นปุ่ม UNBAN */}
                      {user.isActive === false ? "UNBAN" : "BAN"}
                    </button>

                    {myRole === "superadmin" && user.role !== "superadmin" && (
                      <button
                        onClick={() => handleChangeRole(user.id, user.role)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-indigo-600"
                      >
                        ROLE
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardZone;
