import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// --- แปะ Token ไปกับทุก Request ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- เช็ค Error 401 ทั่วทั้งแอป ---
api.interceptors.response.use(
  (response) => response, // ถ้าผ่านปกติ ก็ส่งข้อมูลไปให้ Component
  (error) => {
    // ถ้า Error เป็น 401 (Unauthorized) แสดงว่า Token หมดอายุ
    if (error.response && error.response.status === 401) {
      localStorage.clear();

      Swal.fire({
        title: "หมดเวลาสนุกแล้วสิ!",
        text: "Token หมดอายุแล้วค่ะ เข้าสู่ระบบใหม่อีกรอบนะคะ",
        icon: "warning",
        confirmButtonText: "ไปหน้า Login กัน!",
        confirmButtonColor: "#ADD6F2",
        background: "#ffffff",
        borderRadius: "25px",
        customClass: {
          title: "font-black text-slate-800",
          htmlContainer: "font-bold text-slate-500",
          confirmButton:
            "border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        },
      }).then(() => {
        window.location.href = "/login";
      });
    }
    return Promise.reject(error);
  }
);

export default api;
