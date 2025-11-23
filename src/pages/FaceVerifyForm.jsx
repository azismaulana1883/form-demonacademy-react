import React, { useRef, useState, useEffect } from "react";

export default function FaceVerifyForm() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);

  const startCamera = async () => {
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(cam);
      setCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = cam;
    } catch {
      alert("Tidak bisa akses kamera.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    setPhoto(canvas.toDataURL("image/png"));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <div
        className="
          bg-white/10 backdrop-blur-2xl 
          border border-white/20 
          shadow-[0_0_60px_rgba(0,0,0,0.4)]
          rounded-3xl p-10 relative overflow-hidden
        "
      >
        {/* Gradient Orbs */}
        <div className="absolute -top-32 -right-10 w-72 h-72 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 -left-10 w-64 h-64 bg-purple-400/20 blur-3xl rounded-full"></div>
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-blue-500/10 blur-2xl rounded-full"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Verifikasi Wajah & Form Modern
          </h1>
          <p className="text-slate-300 mb-10">
            Isi data kamu, lalu lakukan verifikasi wajah untuk keamanan tambahan.
          </p>

          <div className="grid md:grid-cols-2 gap-14">
            {/* FORM */}
            <div className="space-y-6">
              <div>
                <label className="text-sm text-slate-200">Nama Lengkap</label>
                <input
                  type="text"
                  className="
                    w-full mt-2 p-3
                    rounded-2xl bg-slate-900/40 border border-slate-700
                    text-white placeholder-slate-500
                    outline-none focus:ring-2 focus:ring-indigo-500 transition
                  "
                  placeholder="Masukkan nama..."
                />
              </div>

              <div>
                <label className="text-sm text-slate-200">Email</label>
                <input
                  type="email"
                  className="
                    w-full mt-2 p-3
                    rounded-2xl bg-slate-900/40 border border-slate-700
                    text-white placeholder-slate-500
                    outline-none focus:ring-2 focus:ring-indigo-500 transition
                  "
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm text-slate-200">Catatan</label>
                <textarea
                  className="
                    w-full mt-2 p-3 h-[110px]
                    rounded-2xl bg-slate-900/40 border border-slate-700
                    text-white placeholder-slate-500
                    outline-none focus:ring-2 focus:ring-indigo-500 transition
                    resize-none
                  "
                  placeholder="Catatan tambahan..."
                ></textarea>
              </div>

              <button
                disabled={!photo}
                className={`
                  w-full py-3 mt-3 rounded-2xl font-bold transition
                  ${
                    photo
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  }
                `}
              >
                Submit Form
              </button>
            </div>

            {/* CAMERA */}
            <div className="space-y-6">
              <p className="text-slate-200 font-medium">Verifikasi Wajah</p>

              <div
                className="
                  relative aspect-video rounded-2xl overflow-hidden
                  bg-black border border-slate-700
                "
              >
                {/* Video */}
                {!photo && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`
                      w-full h-full object-cover 
                      ${cameraActive ? "opacity-100" : "opacity-40"}
                      transition
                    `}
                  />
                )}

                {/* Placeholder ketika kamera off */}
                {!cameraActive && !photo && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <span className="text-3xl mb-1">📷</span>
                    Kamera belum aktif
                  </div>
                )}

                {/* Captured Photo */}
                {photo && (
                  <img
                    src={photo}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
              </div>

              {/* Hidden Canvas */}
              <canvas ref={canvasRef} className="hidden"></canvas>

              <div className="grid grid-cols-2 gap-3">
                {!cameraActive ? (
                  <button
                    onClick={startCamera}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    Aktifkan Kamera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    Matikan Kamera
                  </button>
                )}

                <button
                  onClick={capturePhoto}
                  disabled={!cameraActive}
                  className={`
                    py-2.5 rounded-xl transition
                    ${
                      cameraActive
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/40"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    }
                  `}
                >
                  Ambil Foto
                </button>
              </div>

              {photo && (
                <button
                  onClick={() => setPhoto(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Ulangi Foto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
