import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import RegForm from "./pages/RegForm";
import MemberList from "./pages/MemberList";
import FaceVerification from "./components/FaceVerificationMPNew";

function FaceVerificationWrapper() {
  const navigate = useNavigate();

  const handleVerified = () => {
    localStorage.setItem("verified", "true");
    navigate("/register");
  };

  return <FaceVerification onVerified={handleVerified} />;
}

function ProtectedRegister() {
  const navigate = useNavigate();

  useEffect(() => {
    const ok = localStorage.getItem("verified");

    if (ok !== "true") {
      navigate("/");
    }
  }, []);

  return <RegForm />;
}

export default function App() {
  useEffect(() => {
    const path = window.location.pathname;
    // Hapus verified jika BUKAN di /register
    if (path !== "/register") {
      localStorage.removeItem("verified");
    }
  }, []);

  return (
    <Router>
      {/* TOASTER WAJIB DI DALAM RETURN */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />

      <Routes>
        <Route path="/" element={<FaceVerificationWrapper />} />
        <Route path="/register" element={<ProtectedRegister />} />
        <Route path="/members" element={<MemberList />} />
      </Routes>
    </Router>
  );
}
