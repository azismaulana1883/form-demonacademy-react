import { useState } from "react";
import FaceVerification from "./components/FaceVerificationMPNew.jsx";
import RegForm from "./pages/RegForm";

export default function App() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      {!verified ? (
        <FaceVerification onVerified={() => setVerified(true)} />
      ) : (
        <RegForm />
      )}
    </div>
  );
}
