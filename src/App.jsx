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
import { useEffect } from "react";
import RankingSelection from "./pages/RankingSelection";
import RankingResult from "./pages/RankingResult";
import { UserProvider } from "./context/UserContext";

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
        </Routes>
      </div>
    </UserProvider>
  );
}

export default App;
