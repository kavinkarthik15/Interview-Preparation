import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Signup from "./pages/Signup";
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MockInterview from "./pages/MockInterview";

function App() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/mock" element={<MockInterview />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
