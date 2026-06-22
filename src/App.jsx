import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Admission from "./pages/admission";
import InsertScore from "./pages/insertScore";
import ScoreCalculator from "./pages/scoreCalculatorTemplate";
import ResultView from "./pages/resultView";
import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login";
import RankingSelection from "./pages/RankingSelection";
import RankingResult from "./pages/RankingResult";
import ProtectedAdminRoute from "./components/protectedAdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import { useEffect } from "react";
import { UserProvider } from "./context/UserContext";
import ExamLibrary from "./pages/ExamLibrary";
import MockExam from "./pages/MockExam";
import MyReports from "./components/MyReports";
import ReportChat from "./components/ReportChat";
import CreateReport from "./components/CreateReport";
import axios from "axios";

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 498)) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const publicPages = ["/login", "/register", "/"];
    const isPublicPage = publicPages.includes(location.pathname);

    // ถ้าไม่มี token และไม่ใช่หน้าสาธารณะ ดีดไป login
    if (!token && !isPublicPage) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <UserProvider>
      <div className="App">
        <Routes>
          {/* user zone */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/score-input" element={<InsertScore />} />
          <Route
            path="/calculate/faculty"
            element={<ScoreCalculator type="single" />}
          />
          <Route
            path="/calculate/university"
            element={<ScoreCalculator type="allInUni" />}
          />
          <Route
            path="/calculate/compare"
            element={<ScoreCalculator type="multiUni" />}
          />
          <Route path="/calculate/result" element={<ResultView />} />
          <Route path="/calculate/ranking" element={<RankingSelection />} />
          <Route path="/calculate/ranking-result" element={<RankingResult />} />
          <Route path="/exam-library" element={<ExamLibrary />} />
          <Route path="/mock-exam" element={<MockExam />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/report-chat/:id" element={<ReportChat />} />
          <Route path="/create-report" element={<CreateReport />} />
          {/* admin zone */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;
