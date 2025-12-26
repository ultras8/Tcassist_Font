// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admission from './pages/admission';
import InsertScore from './pages/insertScore'; // 1. เช็คชื่อไฟล์ให้ถูก (n ตัวเดียว)
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Admission />} />
          <Route path="/score-input" element={<InsertScore />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App