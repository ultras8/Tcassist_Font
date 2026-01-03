import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const RuleItem = ({ isMet, text }) => (
  <div className="flex items-center gap-1.5 transition-all">
    <div className={`w-1.5 h-1.5 rounded-full ${isMet ? "bg-[#212587]" : "bg-[#8B8B8B]"}`}></div>
    <span className={`text-[9px] font-bold ${isMet ? "text-[#212587]" : "text-[#8B8B8B]"}`}>
      {text}
    </span>
  </div>
);

function Register() {
  const navigate = useNavigate();
  const [isStudying, setIsStudying] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    year: '1' // ค่าเริ่มต้นตาม DTO
  });
  const [errors, setErrors] = useState({});

  const validity = {
    minChar: formData.password.length >= 8,
    hasNumberSymbol: /[0-9!@#$%^&#*]/.test(formData.password),
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
  };

  const handleRegister = async () => {
    let newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อจริงด้วยค่ะ";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุลด้วยค่ะ";

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมลด้วยนะคะ";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้องค่ะ";
    }

    if (!Object.values(validity).every((v) => v)) {
      newErrors.password = "กรุณาตั้งรหัสผ่านให้ตรงตามเงื่อนไข";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirm = "รหัสผ่านไม่ตรงกันค่ะ";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:3000/users', {
          fName: formData.firstName,
          lName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          isStudying: isStudying,
          university: isStudying ? formData.university : null,
          year: isStudying ? formData.year : null
        });

        if (response.status === 201 || response.status === 200) {
          alert("สมัครสมาชิกสำเร็จ!");
          navigate('/login');
        }
      } catch (err) {
        const serverMessage = err.response?.data?.message;
        if (Array.isArray(serverMessage)) {
          alert(serverMessage.join('\n'));
        } else {
          alert(serverMessage || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-10 font-sans">
      <div className="w-full max-w-[400px] space-y-5">
        <div className="flex flex-col w-full">
          <div className="flex w-full gap-3">
            <input
              type="text"
              placeholder="First name"
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={`flex-1 min-w-0 h-[40px] px-3 bg-[#F2F7FD] border rounded-[5px] text-[14px] outline-none transition-all
                ${errors.firstName ? 'border-red-500 animate-shake' : 'border-[#ADD6F2]'}`}
            />
            <input
              type="text"
              placeholder="Last name"
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={`flex-1 min-w-0 h-[40px] px-3 bg-[#F2F7FD] border rounded-[5px] text-[14px] outline-none transition-all
                ${errors.lastName ? 'border-red-500 animate-shake' : 'border-[#ADD6F2]'}`}
            />
          </div>
          {(errors.firstName || errors.lastName) && (
            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">
              {errors.firstName || errors.lastName}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full h-[40px] px-3 bg-[#F2F7FD] border rounded-[5px] text-[14px] outline-none transition-all
              ${errors.email ? 'border-red-500 animate-shake' : 'border-[#ADD6F2]'}`}
          />
          {errors.email && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.email}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              onClick={() => setIsStudying(!isStudying)}
              className={`w-[17px] h-[17px] rounded-full border flex items-center justify-center cursor-pointer transition-colors
                ${isStudying ? "bg-[#ADD6F2] border-[#ADD6F2]" : "border-[#8B8B8B] bg-white"}`}
            >
              {isStudying && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
            <span className="text-[13px] text-[#8B8B8B] font-medium">Studying at a degree level</span>
          </div>

          <select
            disabled={!isStudying}
            onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            className={`w-full h-[40px] px-3 border border-[#ADD6F2] rounded-[5px] text-[14px] outline-none transition-opacity
              ${isStudying ? "bg-[#F2F7FD] text-slate-800" : "bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed"}`}
          >
            <option value="">-- University --</option>
            <option value="จุฬาฯ">จุฬาลงกรณ์มหาวิทยาลัย</option>
            <option value="มก">มหาวิทยาลัยเกษตรศาสตร์</option>
          </select>
        </div>

        <div className="space-y-2">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={`w-full h-[40px] px-3 bg-[#F2F7FD] border rounded-[5px] text-[14px] outline-none transition-all
              ${errors.password ? "border-red-500 animate-shake" : "border-[#ADD6F2]"}`}
          />
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 px-1">
            <RuleItem isMet={validity.minChar} text="Min 8 characters" />
            <RuleItem isMet={validity.hasNumberSymbol} text="Numbers & Symbols" />
            <RuleItem isMet={validity.hasUpper} text="Uppercase letters" />
            <RuleItem isMet={validity.hasLower} text="Lowercase letters" />
          </div>
        </div>

        <div className="space-y-1">
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={`w-full h-[40px] px-3 bg-[#F2F7FD] border rounded-[5px] text-[14px] outline-none transition-all
              ${errors.confirm ? "border-red-500 animate-shake" : "border-[#ADD6F2]"}`}
          />
          {errors.confirm && <p className="text-red-500 text-[10px] ml-1 font-bold">{errors.confirm}</p>}
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={handleRegister}
            className="w-full h-[45px] bg-[#FD7A6C] text-white font-black rounded-[10px] shadow-sm active:scale-[0.98] transition-all"
          >
            REGISTER
          </button>
        </div>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-[#D8D8D8]"></div>
          <span className="flex-shrink mx-4 text-[12px] text-[#8B8B8B]">or sign in with</span>
          <div className="flex-grow border-t border-[#D8D8D8]"></div>
        </div>

        <div className="space-y-3">
          <button className="w-full h-[45px] bg-[#F2F7FD] border border-[#D8D8D8] rounded-[8px] text-[14px] font-bold text-[#8B8B8B] flex items-center justify-center gap-3 active:bg-[#e6eef7]">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="google" />
            Continue with Google
          </button>
        </div>

        <div className="mt-6 text-center text-[12px]">
          <span className="text-black">Already have an account? </span>
          <span onClick={() => navigate("/login")} className="text-[#212587] font-bold cursor-pointer hover:underline">Sign In</span>
        </div>
      </div>
    </div>
  );
}

export default Register;