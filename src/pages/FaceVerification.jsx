import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const STORAGE_KEY = "face_liveness_progress";

/* ================== PHOTO VERIFICATION (FALLBACK) ================== */

function PhotoVerification({ onVerified, onBack }) {
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
        video: { facingMode: "user" },
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
    onVerified?.(photo);
  };

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
                    Liveness tidak berjalan normal di perangkat ini. Foto wajah akan digunakan
                    sebagai metode verifikasi pengganti.
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

        <p className="text-[11px] text-slate-500 text-center">
          Foto dikirim sebagai <span className="font-mono">dataURL PNG</span>. Simpan atau kirim ke
          server sesuai kebutuhan.
        </p>
      </div>
    </div>
  );
}

/* ================== FACE LIVENESS + FALLBACK ================== */

export default function FaceVerification({ onVerified }) {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | calibrate | verify | unsupported
  const [calibCount, setCalibCount] = useState(0);
  const [debug, setDebug] = useState("");
  const [isUnsupportedMobile, setIsUnsupportedMobile] = useState(false);
  const [usePhotoFallback, setUsePhotoFallback] = useState(false);

  // 0 = belum, 1 = kanan selesai, 2 = kembali netral, 3 = kiri selesai
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const neutralYaw = useRef(0);
  const calibFrames = useRef(0);
  const yawSum = useRef(0);
  const yawSmooth = useRef(0);

  const rightHold = useRef(0);
  const leftHold = useRef(0);
  const centerHold = useRef(0);
  const noFaceFrames = useRef(0);
  const buggyFrames = useRef(0);

  const phaseRef = useRef(phase);
  const progressRef = useRef(progress);
  const isMobileRef = useRef(false);
  const unsupportedRef = useRef(false);

  // threshold ramah HP
  const YAW_THRESHOLD = 0.018;
  const NEUTRAL_THRESHOLD = 0.012;
  const HOLD_FRAMES = 5;

  // deteksi mobile sekali di mount
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent || "";
      isMobileRef.current = /Android|iPhone|iPad|iPod/i.test(ua);
    }
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
    unsupportedRef.current = phase === "unsupported";
  }, [phase]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, progress.toString());
    } catch {}
  }, [progress]);

  // ================== HELPER: hitung yaw aman ==================
  const computeYawSafe = (face) => {
    // 1) coba dulu 3 titik (lebih akurat kalau sehat)
    const getX = (idx) => {
      const v = face[idx]?.x;
      return Number.isFinite(v) ? v : null;
    };

    const noseX = getX(1);
    const leftEyeX = getX(263);
    const rightEyeX = getX(33);

    if (noseX !== null && leftEyeX !== null && rightEyeX !== null) {
      const eyeCenterX = (leftEyeX + rightEyeX) / 2;
      const yawRaw = eyeCenterX - noseX;
      if (Number.isFinite(yawRaw) && Math.abs(yawRaw) <= 1) {
        return { yaw: yawRaw, mode: "3pts" };
      }
    }

    // 2) fallback: pakai semua landmark (kebal 1–2 titik rusak)
    const xs = [];
    for (let i = 0; i < face.length; i++) {
      const v = face[i]?.x;
      if (!Number.isFinite(v)) continue;
      if (Math.abs(v) > 2) continue; // buang 7.99e+34 dkk
      xs.push(v);
    }
    if (xs.length < 20) return null;

    xs.sort((a, b) => a - b);
    const third = Math.max(5, Math.floor(xs.length / 3));
    const leftSlice = xs.slice(0, third);
    const rightSlice = xs.slice(xs.length - third);

    const mean = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
    const leftMean = mean(leftSlice);
    const rightMean = mean(rightSlice);

    const yawRaw = rightMean - leftMean;
    if (!Number.isFinite(yawRaw) || Math.abs(yawRaw) > 1) return null;

    return { yaw: yawRaw, mode: "allpts", pts: xs.length };
  };

  const markUnsupportedMobile = useCallback(() => {
    if (!isMobileRef.current) return; // cuma berlaku di mobile
    try {
      cameraRef.current?.stop();
    } catch {}
    setIsUnsupportedMobile(true);
    setPhase("unsupported");
    setUsePhotoFallback(true); // 🔁 aktifkan fallback foto
    setDebug(
      "Environment mobile kemungkinan tidak sepenuhnya mendukung FaceMesh (bug landmark). Beralih ke verifikasi foto."
    );
  }, []);

  // ================== onResults ==================
  const onResults = useCallback(
    (results) => {
      if (unsupportedRef.current) return; // kalau sudah unsupported, jangan proses apa-apa

      const face = results.multiFaceLandmarks?.[0];

      if (!face) {
        noFaceFrames.current++;
        if (noFaceFrames.current > 30) {
          setDebug(
            "no face detected (coba dekatkan wajah ke kamera dan tambah cahaya)"
          );
        }
        return;
      }

      noFaceFrames.current = 0;

      const yawInfo = computeYawSafe(face);
      if (!yawInfo) {
        // ada face tapi yaw gagal dihitung (landmark kacau)
        if (isMobileRef.current) {
          buggyFrames.current++;
          // kalau berturut-turut sering gagal di mobile → anggap env bug
          if (buggyFrames.current > 80) {
            markUnsupportedMobile();
          }
        }
        return;
      }

      // kalau sampai sini berarti frame sehat
      buggyFrames.current = 0;

      const yawRaw = yawInfo.yaw;

      // smoothing
      const alpha = 0.4;
      yawSmooth.current =
        yawSmooth.current === 0
          ? yawRaw
          : yawSmooth.current * (1 - alpha) + yawRaw * alpha;
      const yaw = yawSmooth.current;

      const phaseNow = phaseRef.current;
      const progressNow = progressRef.current;
      const baseNeutral = Number.isFinite(neutralYaw.current)
        ? neutralYaw.current
        : 0;
      const delta = yaw - baseNeutral;

      setDebug(
        `phase: ${phaseNow} | prog: ${progressNow} | yaw: ${yaw.toFixed(
          4
        )} | neutral: ${baseNeutral.toFixed(4)} | delta: ${delta.toFixed(
          4
        )} | mode: ${yawInfo.mode}${
          yawInfo.pts ? ` | pts:${yawInfo.pts}` : ""
        }`
      );

      // ==== KALIBRASI ====
      if (phaseNow === "calibrate") {
        calibFrames.current += 1;
        yawSum.current += yaw;
        setCalibCount(calibFrames.current);

        if (calibFrames.current >= 25) {
          neutralYaw.current = yawSum.current / calibFrames.current;
          calibFrames.current = 0;
          yawSum.current = 0;
          setPhase("verify");
        }
        return;
      }

      if (phaseNow !== "verify") return;

      // update hold counters
      if (delta > YAW_THRESHOLD) {
        rightHold.current++;
      } else {
        rightHold.current = 0;
      }

      if (delta < -YAW_THRESHOLD) {
        leftHold.current++;
      } else {
        leftHold.current = 0;
      }

      if (Math.abs(delta) < NEUTRAL_THRESHOLD) {
        centerHold.current++;
      } else {
        centerHold.current = 0;
      }

      // STEP 1 → KANAN
      if (progressNow === 0 && rightHold.current >= HOLD_FRAMES) {
        setProgress(1);
        centerHold.current = 0;
        return;
      }

      // STEP 2 → TENGAH
      if (progressNow === 1 && centerHold.current >= HOLD_FRAMES) {
        setProgress(2);
        leftHold.current = 0;
        return;
      }

      // STEP 3 → KIRI
      if (progressNow === 2 && leftHold.current >= HOLD_FRAMES) {
        setProgress(3);
        centerHold.current = 0;
        return;
      }

      // STEP 4 → TENGAH LAGI → DONE
      if (progressNow === 3 && centerHold.current >= HOLD_FRAMES) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        setTimeout(() => {
          cameraRef.current?.stop();
          onVerified?.(); // liveness sukses
        }, 800);
      }
    },
    [onVerified, markUnsupportedMobile]
  );

  // ================== initCamera ==================
  const initCamera = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (!faceMeshRef.current) {
        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false, // lebih ringan, cocok HP
          minDetectionConfidence: 0.3,
          minTrackingConfidence: 0.3,
          selfieMode: isMobileRef.current, // selfie di mobile aja
        });

        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;
      }

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && faceMeshRef.current && !unsupportedRef.current) {
            await faceMeshRef.current.send({ image: videoRef.current });
          }
        },
        width: 480,
        height: 360,
        facingMode: "user",
      });

      cameraRef.current = camera;
      await camera.start();
    } catch (err) {
      console.error("Error init camera:", err);
      alert("Tidak bisa mengakses kamera. Pastikan izin kamera sudah diizinkan.");
    }
  }, [onResults]);

  // cleanup
  useEffect(() => {
    return () => {
      try {
        cameraRef.current?.stop();
      } catch {}
      if (faceMeshRef.current?.close) faceMeshRef.current.close();
    };
  }, []);

  // ================== control ==================
  const start = async () => {
    await initCamera();
    neutralYaw.current = 0;
    yawSmooth.current = 0;
    calibFrames.current = 0;
    yawSum.current = 0;
    rightHold.current = 0;
    leftHold.current = 0;
    centerHold.current = 0;
    noFaceFrames.current = 0;
    buggyFrames.current = 0;
    setCalibCount(0);
    setDebug("");
    setIsUnsupportedMobile(false);
    setUsePhotoFallback(false);
    setPhase("calibrate");
  };

  const resetAll = () => {
    if (confirm("Reset semua progress?")) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      setProgress(0);
      setPhase("idle");
      calibFrames.current = 0;
      yawSum.current = 0;
      neutralYaw.current = 0;
      yawSmooth.current = 0;
      rightHold.current = 0;
      leftHold.current = 0;
      centerHold.current = 0;
      noFaceFrames.current = 0;
      buggyFrames.current = 0;
      setIsUnsupportedMobile(false);
      setUsePhotoFallback(false);
      setDebug("");
    }
  };

  const getInstruction = () => {
    if (phase === "unsupported") {
      return "Perangkat/browser kamu tidak mendukung liveness secara optimal. Gunakan metode verifikasi foto.";
    }
    if (phase === "calibrate") return "Lihat ke kamera dan diam sebentar…";
    if (progress === 0) return "Tengok ke KANAN";
    if (progress === 1) return "Kembali hadap TENGAH";
    if (progress === 2) return "Tengok ke KIRI";
    if (progress === 3) return "Balik hadap TENGAH";
    return "Verifikasi selesai";
  };

  const stepActiveClass = (step) =>
    progress >= step
      ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
      : "border-white/10 bg-white/5 text-white/60";

  const stepIcon = (step) => {
    const done = progress >= step;
    if (done) return "✓";
    if (step === 1) return "→";
    if (step === 2) return "◎";
    if (step === 3) return "←";
    if (step === 4) return "◎";
    return "•";
  };

  const stepLabel = (step) => {
    if (step === 1) return "Hadap kanan";
    if (step === 2) return "Kembali tengah";
    if (step === 3) return "Hadap kiri";
    if (step === 4) return "Kembali tengah";
    return "";
  };

  /* ========== SWITCH KE PHOTO FALLBACK JIKA MOBILE UNSUPPORTED ========== */
  if (usePhotoFallback && isMobileRef.current) {
    return (
      <PhotoVerification
        onVerified={onVerified}
        onBack={() => {
          // kalau user mau coba lagi liveness
          setUsePhotoFallback(false);
          setPhase("idle");
        }}
      />
    );
  }

  // ================== UI LIVENESS ==================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Face Liveness Check
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">
              Ikuti instruksi gerakan kepala untuk menyelesaikan verifikasi.
            </p>
          </div>

          {phase === "idle" && (
            <button
              onClick={start}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-sm font-medium shadow-lg shadow-emerald-500/30 transition"
            >
              <span className="text-lg">▶</span>
              <span>
                {progress > 0 ? "Lanjutkan verifikasi" : "Mulai verifikasi"}
              </span>
            </button>
          )}
        </div>

        {/* Main card */}
        <div className="grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Video + status */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-2 bg-black/40 backdrop-blur-sm text-xs text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Kamera
                  <span className="font-semibold">
                    {phase === "idle"
                      ? "siap"
                      : isUnsupportedMobile
                      ? "nonaktif"
                      : "aktif"}
                  </span>
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  Liveness Mode
                </span>
              </div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover"
                style={{ transform: "scaleX(-1)" }}
              />

              {phase === "calibrate" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="h-14 w-14 rounded-full border-4 border-emerald-400/40 border-t-emerald-400 animate-spin mb-4" />
                  <p className="text-base md:text-lg font-medium">
                    Waiting for check…
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Tetap hadap kamera dan jangan banyak bergerak.
                  </p>
                </div>
              )}

              {phase === "unsupported" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-4 text-center">
                  <p className="text-base md:text-lg font-semibold text-amber-300 mb-2">
                    Perangkat / browser tidak sepenuhnya mendukung liveness.
                  </p>
                  <p className="text-xs md:text-sm text-slate-300">
                    Kamu akan dialihkan ke metode verifikasi foto sebagai pengganti.
                  </p>
                </div>
              )}
            </div>

            {/* Instruction banner */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Instruksi
                </p>
                <p className="text-base md:text-lg font-medium text-sky-200">
                  {getInstruction()}
                </p>
              </div>
              {phase !== "idle" && (
                <button
                  onClick={resetAll}
                  className="text-xs md:text-sm text-rose-300 hover:text-rose-200 underline underline-offset-4"
                >
                  Reset &amp; mulai ulang
                </button>
              )}
            </div>
          </div>

          {/* Steps + debug */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-4 md:px-5 md:py-5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-4">
                PROGRESS
              </p>

              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 md:px-3.5 md:py-3 transition ${stepActiveClass(
                      step
                    )}`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-lg">
                      {stepIcon(step)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">
                        Langkah {step}
                      </p>
                      <p className="text-sm md:text-base font-medium">
                        {stepLabel(step)}
                      </p>
                    </div>
                    {progress + 1 === step &&
                      phase === "verify" &&
                      !isUnsupportedMobile && (
                        <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                      )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/60 px-3.5 py-3 font-mono text-xs md:text-sm text-slate-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                  DEBUG
                </span>
                <span className="text-[11px] text-slate-500">
                  progress: {progress}/3
                </span>
              </div>
              <div className="text-slate-200 break-words">{debug}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
