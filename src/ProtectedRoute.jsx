import { useNavigate } from "react-router-dom";

export default function FaceVerificationMPNew({ onVerified }) {
  const navigate = useNavigate();

  const handleSuccess = () => {
    if (onVerified) onVerified();

    // langsung redirect
    navigate("/register");
  };

  // lalu panggil handleSuccess saat liveness / face verification selesai
}
