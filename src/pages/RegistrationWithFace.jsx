import React, { useRef, useState } from "react";

export default function RegistrationWithFace() {
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(cam);
      setCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = cam;
    } catch {
      alert("Kamera tidak bisa diakses.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const capture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/png");
    setPhoto(img);

    stopCamera();
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      {/* ========================= */}
      {/* ==== STEP 1: VERIFY FACE ==== */}
      {/* ========================= */}
      {step === 1 && (
        <div className="max-w-xl mx-auto text-center mt-10">

          <h1 className="text-4xl font-bold mb-3">Verifikasi Wajah</h1>
          <p className="text-slate-300 mb-8">
            Ambil foto wajah terlebih dahulu untuk melanjutkan ke formulir.
          </p>

          <div className="relative bg-black rounded-2xl border border-slate-700 overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <canvas ref={canvasRef} className="hidden"></canvas>

          <div className="mt-6 flex gap-3 justify-center">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold"
              >
                Aktifkan Kamera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Matikan Kamera
              </button>
            )}

            <button
              onClick={capture}
              disabled={!cameraActive}
              className={`px-6 py-3 rounded-xl font-semibold ${
                cameraActive
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            >
              Ambil Foto
            </button>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* ==== STEP 2: FORM ==== */}
      {/* ========================= */}
      {step === 2 && (
        <div className="max-w-3xl mx-auto mt-10">
          <h1 className="text-4xl font-bold mb-3">Registrasi Pengguna</h1>
          <p className="text-slate-300 mb-10">
            Lengkapi data diri berikut.
          </p>

          <div className="grid md:grid-cols-2 gap-10">

            {/* FORM */}
            <div className="space-y-6">
              
              <div>
                <label className="block text-sm mb-1">Nama Lengkap</label>
                <input className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-700 outline-none" />
              </div>

              <div>
                <label className="block text-sm mb-1">Nickname</label>
                <input className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-700 outline-none" />
              </div>

              <div>
                <label className="block text-sm mb-1">Tanggal Lahir</label>
                <input type="date" className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-700 outline-none" />
              </div>

              <div>
                <label className="block text-sm mb-1">Tempat Lahir</label>
                <input className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-700 outline-none" />
              </div>

              <div>
                <label className="block text-sm mb-1">Domisili</label>
                <input className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-700 outline-none" />
              </div>

              <div>
                <label className="block text-sm mb-1">Jabatan</label>
                <input className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-700 outline-none" />
              </div>

              <div>
                <label className="block text-sm mb-1">Anime Kesukaan</label>
                <input className="w-full p-3 rounded-xl bg-slate-900/40 border border-slate-700 outline-none" />
              </div>

              <button className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold">
                Submit
              </button>
            </div>

            {/* FOTO WAJAH */}
            <div>
              <p className="text-sm mb-2">Foto Verifikasi</p>
              <img
                src={photo}
                className="rounded-2xl border border-slate-700 shadow-lg w-full"
              />

              <button
                onClick={() => setStep(1)}
                className="mt-4 w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Ulangi Foto
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
