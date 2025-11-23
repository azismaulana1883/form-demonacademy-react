import React from "react";
    
export default function LivenessFrame({
  children,
  status = "normal", 
  // normal | noface | corrupted | success
}) {
  return (
    <div
      className={`
        relative p-1 rounded-3xl 
        transition-all duration-500
        ${status === "success" ? "shadow-[0_0_40px_#00ff9f]" : ""}
        ${status === "corrupted" ? "shadow-[0_0_40px_#ff0033]" : ""}
        ${status === "noface" ? "shadow-[0_0_40px_#ffaa00]" : ""}
        ${status === "normal" ? "shadow-[0_0_30px_#00d0ff]" : ""}
        bg-gradient-to-br from-slate-900 to-slate-950
        border border-cyan-400/40
      `}
      style={{
        boxShadow:
          status === "normal"
            ? "0 0 20px rgba(0,200,255,0.4)"
            : status === "noface"
            ? "0 0 20px rgba(255,150,0,0.4)"
            : status === "corrupted"
            ? "0 0 20px rgba(255,0,80,0.5)"
            : "0 0 25px rgba(0,255,170,0.5)",
      }}
    >
      {/* HUD Corner */}
      <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-cyan-400 opacity-60"></div>
      <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-cyan-400 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-cyan-400 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-cyan-400 opacity-60"></div>

      {/* ✔ SUCCESS ANIMATION */}
      {status === "success" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="animate-pulse text-emerald-400 text-6xl font-bold">
            ✓
          </div>
        </div>
      )}

      {/* ⚠ 404 FACE NOT FOUND */}
      {status === "noface" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-300 animate-pulse">
              404
            </p>
            <p className="text-lg text-amber-200 font-medium">
              Wajah tidak ditemukan
            </p>
          </div>
        </div>
      )}

      {/* ❌ CORRUPTED LANDMARK */}
      {status === "corrupted" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-rose-400 animate-pulse">
              DATA CORRUPTED
            </p>
            <p className="text-lg text-rose-300 font-medium">
              Landmark tidak valid
            </p>
          </div>
        </div>
      )}

      {/* GLITCH / RGB SHIFT */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 animate-glitchRGB"></div>

      {/* SCAN LINE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-scanline w-full h-1 bg-cyan-300/40"></div>
      </div>

      {/* VIDEO CONTENT */}
      <div className="relative rounded-2xl overflow-hidden">{children}</div>
    </div>
  );
}
