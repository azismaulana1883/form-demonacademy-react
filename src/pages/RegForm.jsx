import React, { useRef, useState, useEffect } from "react";

export default function RegForm() {
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
      alert("Tidak bisa akses kamera. Pastikan izin kamera sudah diizinkan.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/png");
    setPhoto(dataUrl);
    stopCamera();
  };

  // pastikan kamera dimatikan saat unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Form Registrasi Pengguna
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">
              Lengkapi data diri dan ambil foto wajah untuk menyelesaikan proses.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end text-xs text-slate-400">
            <span className="uppercase tracking-[0.25em] text-slate-500">
              STATUS
            </span>
            <span
              className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 border text-xs ${
                cameraActive
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-600 bg-slate-900 text-slate-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  cameraActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                }`}
              />
              Kamera {cameraActive ? "aktif" : "non-aktif"}
            </span>
          </div>
        </div>

        {/* Card utama */}
        <div
          className="
            relative overflow-hidden
            rounded-3xl border border-white/10
            bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950
            shadow-[0_40px_120px_rgba(0,0,0,0.8)]
            px-6 py-8 md:px-10 md:py-10
          "
        >
          {/* blobs background */}
          <div className="pointer-events-none absolute -top-32 -right-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 -left-10 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative z-10 grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            {/* FORM FIELD */}
            <div className="space-y-6">
              <div className="mb-2">
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mb-1">
                  Langkah 1
                </p>
                <p className="text-sm text-slate-200">
                  Isi data diri sesuai identitas kamu.
                </p>
              </div>

              {[
                { label: "Nama Lengkap", type: "text" },
                { label: "Nickname", type: "text" },
                { label: "Tanggal Lahir", type: "date" },
                { label: "Tempat Lahir", type: "text" },
                { label: "Domisili", type: "text" },
                { label: "Jabatan", type: "text" },
                { label: "Anime Kesukaan", type: "text" },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="text-xs font-medium text-slate-200">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="
                      mt-2 w-full rounded-2xl border border-slate-700/80
                      bg-slate-900/60 px-3 py-2.5 text-sm
                      outline-none
                      placeholder:text-slate-500
                      focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/60
                    "
                    placeholder={
                      field.type === "text" ? `Masukkan ${field.label.toLowerCase()}` : ""
                    }
                  />
                </div>
              ))}

              <button
                type="button"
                className="
                  mt-2 inline-flex w-full items-center justify-center gap-2
                  rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold
                  text-white shadow-lg shadow-indigo-500/40
                  transition hover:bg-indigo-500 active:scale-[0.99]
                "
              >
                <span>Submit Form</span>
              </button>
            </div>

            {/* FOTO WAJAH */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                      Langkah 2
                    </p>
                    <p className="text-sm text-slate-200 mt-1">
                      Ambil foto wajah (foto final).
                    </p>
                  </div>
                  <span className="hidden md:inline-flex rounded-full bg-black/40 px-3 py-1 text-[11px] text-slate-300 border border-white/10">
                    Pastikan wajah terlihat jelas.
                  </span>
                </div>
              </div>

              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-700/80 bg-black/80">
                {!photo ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={photo}
                    alt="Foto hasil"
                    className="h-full w-full object-cover"
                  />
                )}

                {/* overlay jika kamera mati dan belum ada foto */}
                {!cameraActive && !photo && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center px-4">
                    <p className="text-sm font-medium text-slate-100">
                      Kamera belum aktif
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Tekan tombol &quot;Aktifkan Kamera&quot; untuk memulai.
                    </p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* Buttons kamera */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl bg-slate-800 px-3 py-2.5 text-sm
                      text-slate-100 hover:bg-slate-700
                      transition
                    "
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Aktifkan Kamera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="
                      inline-flex items-center justify-center gap-2
                      rounded-2xl bg-slate-800 px-3 py-2.5 text-sm
                      text-slate-100 hover:bg-slate-700
                      transition
                    "
                  >
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span>Matikan Kamera</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!cameraActive}
                  onClick={takePhoto}
                  className={`
                    inline-flex items-center justify-center gap-2
                    rounded-2xl px-3 py-2.5 text-sm font-medium
                    transition
                    ${
                      cameraActive
                        ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/40"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }
                  `}
                >
                  <span>Ambil Foto</span>
                </button>
              </div>

              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="
                    mt-3 inline-flex w-full items-center justify-center gap-2
                    rounded-2xl bg-slate-800 px-3 py-2.5 text-sm
                    text-slate-100 hover:bg-slate-700
                    transition
                  "
                >
                  <span>Ulangi Foto</span>
                </button>
              )}

              {/* Tips kecil */}
              <div className="mt-3 rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/70 px-3.5 py-3">
                <p className="text-xs font-medium text-slate-200 mb-1">
                  Tips foto yang baik:
                </p>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li>Pastikan wajah menghadap kamera dan cukup pencahayaan.</li>
                  <li>Jangan gunakan filter atau efek berlebihan.</li>
                  <li>Pastikan hanya satu wajah yang terlihat di kamera.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Status kamera kecil di mobile */}
        <div className="mt-4 flex md:hidden justify-end">
          <span
            className={`
              inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs
              ${
                cameraActive
                  ? "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : "border border-slate-600 bg-slate-900 text-slate-300"
              }
            `}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                cameraActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            Kamera {cameraActive ? "aktif" : "non-aktif"}
          </span>
        </div>
      </div>
    </div>
  );
}
