// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admission from './pages/admission';
import InsertScore from './pages/insertScore';
import { UserProvider } from './context/UserContext';
import ScoreCalculator from './pages/scoreCalculatorTemplate';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Admission />} />
          <Route path="/score-input" element={<InsertScore />} />
          {/* หน้าคำนวณคะแนนคณะที่สนใจ (แบบ 2 Dropdown) */}
          <Route path="/calculate/faculty" element={<ScoreCalculator type="single" />} />
          {/* หน้าคำนวณทุกคณะในมหาลัย */}
          <Route path="/calculate/university" element={<ScoreCalculator type="allInUni" />} />
          {/* หน้าคำนวณหนึ่งคณะจากหลายมหาลัย */}
          <Route path="/calculate/compare" element={<ScoreCalculator type="multiUni" />} />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App