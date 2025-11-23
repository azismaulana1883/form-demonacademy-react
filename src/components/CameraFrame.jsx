import React from "react";

export default function CameraFrame({
  children,
  status = "normal",
  cameraActive = false,
  photo = null,
}) {
  return (
    <div
      className={`
        relative p-1 rounded-3xl overflow-hidden
        transition-all duration-500
        bg-gradient-to-br from-slate-900 to-slate-950
        border border-cyan-400/40
        ${
          status === "success"
            ? "shadow-[0_0_40px_#00ff9f]"
            : status === "corrupted"
            ? "shadow-[0_0_40px_#ff0033]"
            : status === "noface"
            ? "shadow-[0_0_40px_#ffaa00]"
            : "shadow-[0_0_30px_#00d0ff]"
        }
      `}
    >
      {/* Frame HUD corner */}
      <div className="absolute top-0 left-0 w-10 h-10 border-l-4 border-t-4 border-cyan-400 opacity-60 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-10 h-10 border-r-4 border-t-4 border-cyan-400 opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-10 h-10 border-l-4 border-b-4 border-cyan-400 opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-10 h-10 border-r-4 border-b-4 border-cyan-400 opacity-60 pointer-events-none"></div>

      {/* Glitch RGB */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-40 animate-glitchRGB"></div>

      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-scanline w-full h-1 bg-cyan-300/40"></div>
      </div>

      {/* Content container */}
      <div className="relative rounded-2xl overflow-hidden">
        {children}
      </div>

      {/* Overlay kamera belum aktif */}
      {!cameraActive && !photo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm px-4 text-center">
          <p className="text-sm font-semibold text-slate-100">Kamera belum aktif</p>
          <p className="mt-1 text-xs text-slate-400">
            Tekan tombol <b>Aktifkan Kamera</b> untuk memulai.
          </p>
        </div>
      )}

      {/* Overlay noface */}
      {status === "noface" && cameraActive && !photo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-300 animate-pulse">404</p>
            <p className="text-lg text-amber-200 font-medium">
              Wajah tidak ditemukan
            </p>
          </div>
        </div>
      )}

      {/* Overlay corrupted */}
      {status === "corrupted" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center">
            <p className="text-2xl font-bold text-rose-400 animate-pulse">DATA CORRUPTED</p>
            <p className="text-sm text-rose-300 font-medium">
              Kamera tidak dapat memproses gambar
            </p>
          </div>
        </div>
      )}

      {/* Overlay success */}
      {status === "success" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="animate-pulse text-emerald-400 text-6xl font-bold">✓</div>
        </div>
      )}
    </div>
  );
}
