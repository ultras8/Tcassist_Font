import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import axios from "axios";
import { randomImages } from '../assets/randomImages';

function Login() {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const IP_ADDRESS = 'localhost';

  const handleLogin = async () => {
    let newErrors = {};
    if (!formData.email) newErrors.email = "กรุณากรอกอีเมล";
    if (!formData.password) newErrors.password = "กรุณากรอกรหัสผ่าน";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {

      try {
        const response = await axios.post(`http://${IP_ADDRESS}:3000/auth/login`, {
          email: formData.email,
          password: formData.password,
        });

        const { access_token, role, fName } = response.data;

        if (access_token) {
          setUser({
            name: fName || "ผู้ใช้งาน",
            isLoggedIn: true,
            role: role,
            profileUrl: "https://i.pinimg.com/736x/23/e1/33/23e133d64fe89f542de5b850f67d4e15.jpg"
          });

          localStorage.setItem("token", access_token);
          if (role) {
            localStorage.setItem("role", role);
          } else {
            console.warn("⚠️ Warning: Role is missing from API response!");
          }

          const randomIndex = Math.floor(Math.random() * randomImages.length);
          localStorage.setItem('userAvatar', randomImages[randomIndex]);

          alert("ยินดีต้อนรับเข้าสู่ระบบค่ะ!");

          if (role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("API call failed:", err);
        console.log("Error details:", err.response?.data);
        const serverMessage = err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        alert(serverMessage);
      }
    } else {
      console.log("Validation Failed:", newErrors);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-20 font-sans">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-left">
          <h1 className="text-[32px] font-black text-slate-900 italic">Welcome Back!</h1>
          <p className="text-[14px] text-[#8B8B8B]">ลงชื่อเข้าใช้งานเพื่อไปต่อกันเลย</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full h-[45px] px-3 bg-[#F2F7FD] border rounded-[5px] text-[14px] outline-none transition-all
              ${errors.email ? "border-red-500" : "border-[#ADD6F2]"}`}
          />

          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full h-[45px] px-3 bg-[#F2F7FD] border rounded-[5px] text-[14px] outline-none transition-all
                ${errors.password ? "border-red-500" : "border-[#ADD6F2]"}`}
            />
            <div className="text-right">
              <span className="text-[11px] text-[#212587] font-bold cursor-pointer hover:underline">Forgot Password?</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogin}
          type="button"
          className="w-full h-[45px] bg-[#FD7A6C] text-white font-black rounded-[10px] shadow-sm active:scale-[0.98] transition-all"
        >
          SIGN IN
        </button>

        <div className="relative flex items-center py-2 text-center text-[12px]">
          <div className="flex-grow border-t border-[#D8D8D8]"></div>
          <span className="mx-4 text-[#8B8B8B]">or sign in with</span>
          <div className="flex-grow border-t border-[#D8D8D8]"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="h-[45px] bg-[#F2F7FD] border border-[#D8D8D8] rounded-[8px] flex items-center justify-center active:bg-gray-100 transition-all">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="google" />
          </button>
          <button className="h-[45px] bg-[#F2F7FD] border border-[#D8D8D8] rounded-[8px] flex items-center justify-center active:bg-gray-100 transition-all">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" className="w-5 h-5" alt="facebook" />
          </button>
        </div>

        <div className="text-center text-[12px] pt-4">
          <span className="text-black">Don't have an account? </span>
          <span onClick={() => navigate("/register")} className="text-[#212587] font-bold cursor-pointer hover:underline">Sign Up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;