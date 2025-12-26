import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // ข้อมูลเริ่มต้น (พอ Login สำเร็จก็เอาข้อมูลมาใส่ที่นี่)
  const [user, setUser] = useState({
    name: "น้องพิ้นคนเก่ง",
    profileUrl: "https://i.pinimg.com/736x/23/e1/33/23e133d64fe89f542de5b850f67d4e15.jpg",
    isLoggedIn: false
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// สร้าง Hook ไว้เรียกใช้ง่ายๆ
export const useUser = () => useContext(UserContext);