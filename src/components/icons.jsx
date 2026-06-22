import React from 'react'

// ไอคอนลูกศรย้อนกลับ
export const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

// ไอคอนรูปบ้าน
export const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

export const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

// export const ChatIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="20"
//     height="20"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2.5"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//   </svg>
// );

export const ChatIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    stroke="currentColor"
    strokeWidth="1.5"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* วงโค้งหูฟังด้านบน */}
    <path d="M3 11c0-4.97 4.03-9 9-9s9 4.03 9 9" />

    {/* ตัวหูฟังซ้าย-ขวา แบบมีมิติ */}
    <rect x="2" y="11" width="4" height="6" rx="1.5" />
    <rect x="18" y="11" width="4" height="6" rx="1.5" />

    {/* ก้านไมโครโฟนที่ยื่นออกมา */}
    <path d="M20 17c0 1.66-1.34 3-3 3h-1" />

    {/* รูปคนแบบ Minimalist อยู่ตรงกลาง */}
    <circle cx="12" cy="13" r="3" />
    <path d="M7 21c0-2.5 2-4.5 5-4.5s5 2 5 4.5" />
  </svg>
);