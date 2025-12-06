import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6">
      <div className="relative w-full max-w-md">
        
        {/* GLOW EFFECT BACKGROUND */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-3xl blur-3xl opacity-20"></div>

        {/* CARD */}
        <div className="relative text-center space-y-8 bg-white/10 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-2xl">
          
          {/* LOGO / TITLE */}
          <h1 className="text-5xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-300 text-transparent bg-clip-text drop-shadow-lg">
            SUFFERGATTE
          </h1>

          <p className="text-slate-300 text-sm tracking-wide">
            Pilih menu untuk melanjutkan proses registrasi atau melihat anggota.
          </p>

          <div className="space-y-5 mt-6">
            
            {/* REGISTER BUTTON */}
            <button
              onClick={() => navigate("/verify")}
              className="
                w-full py-3.5 rounded-2xl font-semibold text-white 
                bg-gradient-to-r from-indigo-600 to-cyan-500 
                hover:from-indigo-500 hover:to-cyan-400 
                shadow-lg hover:shadow-cyan-500/30 
                transition-all duration-300 active:scale-95
              "
            >
              Register (Face Verification)
            </button>

            {/* MEMBER LIST BUTTON */}
            <button
              onClick={() => navigate("/members")}
              className="
                w-full py-3.5 rounded-2xl font-semibold 
                bg-slate-800/70 text-slate-200 
                border border-white/10
                hover:bg-slate-700 hover:text-white 
                transition-all duration-300 active:scale-95
                shadow-md hover:shadow-slate-600/20
              "
            >
              Lihat Members
            </button>

          </div>

          {/* FOOTER */}
          <p className="text-xs text-slate-400 mt-6 tracking-wide">
            © {new Date().getFullYear()} SUFFERGATTE — Identity System
          </p>
        </div>
      </div>
    </div>
  );
}
