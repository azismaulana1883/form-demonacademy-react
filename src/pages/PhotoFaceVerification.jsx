import React, { useRef, useState, useEffect } from "react";

export default function PhotoFaceVerification({ onVerified, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");

  const startCamera = async () => {
    setError("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
      });
      setStream(media);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (err) {
      console.error("Error start camera:", err);
      setError("Tidak bisa mengakses kamera. Pastikan izin kamera sudah diberikan.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setStream(null);
    setIsCameraActive(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // mirror seperti preview
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setPhoto(dataUrl);
    stopCamera();
  };

  const resetPhoto = () => {
    setPhoto(null);
    setError("");
  };

  const handleConfirm = () => {
    if (!photo) return;
    // lempar foto ke parent (bisa kamu kirim ke backend)
    onVerified?.(photo);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-400 mb-1">
              Fallback Verification
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Verifikasi Foto Wajah
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Ambil satu foto wajah yang jelas sebagai pengganti liveness check di perangkat ini.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="text-xs md:text-sm text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 rounded-full px-4 py-1.5 transition"
            >
              ← Kembali
            </button>
          )}
        </div>

        {/* Main card */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.6)] p-5 md:p-7 space-y-6">
          <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 items-start">
            {/* Kamera / foto */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black">
                {!photo ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-[4/3] object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                ) : (
                  <img
                    src={photo}
                    alt="Foto wajah"
                    className="w-full aspect-[4/3] object-cover"
                  />
                )}

                {/* Overlay tips kecil */}
                {!photo && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3 text-xs text-slate-200">
                    <p className="font-medium">
                      Pastikan wajah terlihat jelas, tidak terlalu gelap, dan tidak tertutup masker.
                    </p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* Buttons kamera */}
              <div className="flex flex-wrap gap-3">
                {!photo && (
                  <>
                    {!isCameraActive ? (
                      <button
                        onClick={startCamera}
                        className="flex-1 inline-flex justify-center items-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-medium shadow-lg shadow-emerald-500/30 transition"
                      >
                        <span className="text-lg">📷</span>
                        <span>Aktifkan Kamera</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopCamera}
                        className="flex-1 inline-flex justify-center items-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
                      >
                        <span>⏹</span>
                        <span>Matikan Kamera</span>
                      </button>
                    )}

                    <button
                      onClick={takePhoto}
                      disabled={!isCameraActive}
                      className={`flex-1 inline-flex justify-center items-center gap-2 py-3 rounded-xl text-sm font-medium transition ${
                        isCameraActive
                          ? "bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <span>📸</span>
                      <span>Ambil Foto</span>
                    </button>
                  </>
                )}

                {photo && (
                  <>
                    <button
                      onClick={resetPhoto}
                      className="flex-1 inline-flex justify-center items-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium transition"
                    >
                      <span>🔁</span>
                      <span>Ulangi Foto</span>
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 inline-flex justify-center items-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold shadow-lg shadow-emerald-500/40 transition"
                    >
                      <span>✅</span>
                      <span>Konfirmasi &amp; Kirim</span>
                    </button>
                  </>
                )}
              </div>

              {error && (
                <p className="text-xs text-rose-300 mt-1">{error}</p>
              )}
            </div>

            {/* Sidebar instruksi */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">
                  PANDUAN FOTO
                </p>
                <ul className="text-xs md:text-sm text-slate-200 space-y-2">
                  <li>• Wajah menghadap kamera, tidak miring berlebihan.</li>
                  <li>• Jangan memakai masker, kacamata hitam, atau penutup wajah.</li>
                  <li>• Pencahayaan cukup (bukan dari belakang / backlight).</li>
                  <li>• Hanya 1 orang di dalam frame.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs md:text-sm text-amber-100">
                {isMobile ? (
                  <p>
                    Kami mendeteksi kamu menggunakan perangkat mobile. Jika liveness check tidak
                    berjalan normal, metode foto ini akan digunakan sebagai verifikasi pengganti.
                  </p>
                ) : (
                  <p>
                    Metode foto ini bisa digunakan sebagai cadangan apabila liveness check tidak
                    tersedia di perangkat / browser kamu.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info format */}
        <p className="text-[11px] text-slate-500 text-center">
          Foto akan dikirim dalam format <span className="font-mono">PNG (dataURL)</span>. 
          Kamu bisa mengirimkannya ke server untuk disimpan atau diverifikasi manual.
        </p>
      </div>
    </div>
  );
}
