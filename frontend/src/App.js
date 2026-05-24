import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import TutorLogin from './pages/TutorLogin';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';

// Tutor pages
import TutorDashboard from './pages/tutor/TutorDashboard';
import CreateExam from './pages/tutor/CreateExam';
import TutorsReport from './pages/tutor/TutorsReport';
import StudentsReport from './pages/tutor/StudentsReport';
import QuestionsReport from './pages/tutor/QuestionsReport';
import ResultsReport from './pages/tutor/ResultsReport';
import TutorAccount from './pages/tutor/TutorAccount';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamPage from './pages/student/ExamPage';
import MyResults from './pages/student/MyResults';
import StudentAccount from './pages/student/StudentAccount';
import ResultPage from './pages/student/ResultPage';
import EditExam from './pages/tutor/EditExam';
import CheatingReport from './pages/tutor/CheatingReport';



function TutorRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/tutor-login" />;
  if (role !== 'tutor') return <Navigate to="/student-dashboard" />;
  return children;
}

function StudentRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('role');
  if (!token) return <Navigate to="/student-login" />;
  if (role !== 'student') return <Navigate to="/tutor-dashboard" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/tutor-login" element={<TutorLogin />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/register" element={<StudentRegister />} />

        {/* Tutor */}
        <Route path="/tutor-dashboard" element={<TutorRoute><TutorDashboard /></TutorRoute>} />
        <Route path="/create-exam" element={<TutorRoute><CreateExam /></TutorRoute>} />
        <Route path="/tutors-report" element={<TutorRoute><TutorsReport /></TutorRoute>} />
        <Route path="/students-report" element={<TutorRoute><StudentsReport /></TutorRoute>} />
        <Route path="/questions-report" element={<TutorRoute><QuestionsReport /></TutorRoute>} />
        <Route path="/results-report" element={<TutorRoute><ResultsReport /></TutorRoute>} />
        <Route path="/tutor-account" element={<TutorRoute><TutorAccount /></TutorRoute>} />
        <Route path="/edit-exam/:id" element={<TutorRoute><EditExam /></TutorRoute>} /> 
        <Route path="/cheating-report" element={<TutorRoute><CheatingReport /></TutorRoute>} /> 

        {/* Student */}
        <Route path="/student-dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/exam/:id" element={<StudentRoute><ExamPage /></StudentRoute>} />
        <Route path="/my-results" element={<StudentRoute><MyResults /></StudentRoute>} />
        <Route path="/student-account" element={<StudentRoute><StudentAccount /></StudentRoute>} />
        <Route path="/result" element={<StudentRoute><ResultPage /></StudentRoute>} />
      </Routes>
    </BrowserRouter>
  );
}