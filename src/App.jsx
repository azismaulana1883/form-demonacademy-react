import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import RegForm from "./pages/RegForm";
import MemberList from "./pages/MemberList";
import FaceVerification from "./components/FaceVerificationMPNew";

// WRAPPER - agar bisa navigate setelah verified
function FaceVerificationWrapper() {
  const navigate = useNavigate();

  const handleVerified = () => {
    localStorage.setItem("verified", "true");
    navigate("/register");
  };

  return <FaceVerification onVerified={handleVerified} />;
}

// PROTECT /register - harus sudah verified
function ProtectedRegister() {
  const navigate = useNavigate();

  useEffect(() => {
    const ok = localStorage.getItem("verified");

    if (ok !== "true") {
      navigate("/verify"); // redirect ke face verification
    }
  }, []);

  return <RegForm />;
}

export default function App() {
  useEffect(() => {
    const path = window.location.pathname;

    // Hapus verified jika user tidak sedang berada di /register
    if (path !== "/register") {
      localStorage.removeItem("verified");
    }
  }, []);

  return (
    <Router>
      {/* GLOBAL TOASTER */}
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
        {/* HOME PAGE */}
        <Route path="/" element={<Home />} />

        {/* FACE VERIFICATION */}
        <Route path="/verify" element={<FaceVerificationWrapper />} />

        {/* REGISTER USER - protected */}
        <Route path="/register" element={<ProtectedRegister />} />

        {/* MEMBERS */}
        <Route path="/members" element={<MemberList />} />
      </Routes>
    </Router>
  );
}
