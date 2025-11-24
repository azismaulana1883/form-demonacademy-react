// src/components/FaceVerificationMPNew.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
import * as faceapi from "face-api.js";
import LivenessFrame from "./LivenessFrame.jsx";
import * as tf from '@tensorflow/tfjs';

const STORAGE_KEY = "face_liveness_progress_v2";
const GENDER_KEY = "detected_gender_v1";

export default function FaceVerificationMPNew({ onVerified }) {
  useEffect(() => {
  async function setupBackend() {
    try {
      await tf.setBackend("cpu");
      await tf.ready();
      console.log("TF backend:", tf.getBackend());
    } catch (err) {
      console.error("TF backend error:", err);
    }
  }
  setupBackend();
}, []);
  const videoRef = useRef(null);

  const faceLandmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const rafIdRef = useRef(null);

  const [phase, setPhase] = useState("idle"); // idle | loading | calibrate | verify | done | error
  const [debug, setDebug] = useState("");
  const [frameStatus, setFrameStatus] = useState("normal"); // normal | noface | corrupted | success
  const [isReadyModel, setIsReadyModel] = useState(false);

  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [calibCount, setCalibCount] = useState(0);

  const neutralYaw = useRef(0);
  const yawSmooth = useRef(0);
  const calibFrames = useRef(0);
  const yawSum = useRef(0);

  const rightHold = useRef(0);
  const leftHold = useRef(0);
  const centerHold = useRef(0);

  const noFaceFrames = useRef(0);

  const phaseRef = useRef(phase);
  const progressRef = useRef(progress);

  const YAW_THRESHOLD = 0.018;
  const NEUTRAL_THRESHOLD = 0.012;
  const HOLD_FRAMES = 5;

  // ==== STATE & REF UNTUK GENDER ====
  const [isGenderModelReady, setIsGenderModelReady] = useState(false);
  const [genderDetected, setGenderDetected] = useState(() => {
    try {
      return localStorage.getItem(GENDER_KEY) || "";
    } catch {
      return "";
    }
  });
  const genderDetectOnceRef = useRef(false); // biar cuma ke-detect sekali

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    progressRef.current = progress;
    try {
      localStorage.setItem(STORAGE_KEY, progress.toString());
    } catch {}
  }, [progress]);

  // ================== INIT MODEL LIVENESS (Mediapipe) ==================
  useEffect(() => {
    let cancelled = false;

    async function initModel() {
      try {
        setPhase("loading");
        setDebug("Loading FaceLandmarker model...");
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            },
            runningMode: "VIDEO",
            numFaces: 1,
          }
        );

        if (cancelled) {
          faceLandmarker.close();
          return;
        }

        faceLandmarkerRef.current = faceLandmarker;
        setIsReadyModel(true);
        setPhase("idle");
        setDebug("Model siap. Tekan 'Mulai verifikasi'.");
      } catch (err) {
        console.error("Error init FaceLandmarker:", err);
        setPhase("error");
        setDebug("Gagal load FaceLandmarker. Coba refresh halaman.");
      }
    }

    initModel();

    return () => {
      cancelled = true;
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
      stopCameraAndLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================== INIT MODEL GENDER (face-api.js) ==================
  useEffect(() => {
    let cancelled = false;

    async function loadGenderModels() {
      try {
        // pastikan path ini sesuai dengan folder di public/
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) {
          setIsGenderModelReady(true);
          setDebug((prev) => prev + " | Gender model siap");
        }
      } catch (err) {
        console.error("Error load gender models:", err);
      }
    }

    loadGenderModels();

    return () => {
      cancelled = true;
    };
  }, []);

  // ================== CAMERA + LOOP ==================
  const stopCameraAndLoop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const computeYawSafe = (face) => {
    if (!face || !face.length) return null;

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

    const xs = [];
    for (let i = 0; i < face.length; i++) {
      const v = face[i]?.x;
      if (!Number.isFinite(v)) continue;
      if (Math.abs(v) > 2) continue;
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

  // ================== DETEKSI GENDER (1x) ==================
  const detectGenderOnce = useCallback(async () => {
    if (
      !videoRef.current ||
      !isGenderModelReady ||
      genderDetectOnceRef.current
    ) {
      return;
    }

    try {
      const detections = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withAgeAndGender();

      if (detections && detections.gender) {
        const g =
          detections.gender === "male" ? "Laki-laki" : "Perempuan";
        genderDetectOnceRef.current = true;
        setGenderDetected(g);
        try {
          localStorage.setItem(GENDER_KEY, g);
        } catch {}
        setDebug((prev) => prev + ` | gender: ${g}`);
      }
    } catch (err) {
      console.error("Error detect gender:", err);
    }
  }, [isGenderModelReady]);

  const handleResults = useCallback(
    (results, timestamp) => {
      const faces = results?.faceLandmarks;
      const face = faces?.[0];

      if (!face) {
        noFaceFrames.current++;
        setFrameStatus("noface");
        if (noFaceFrames.current > 30) {
          setDebug("no face detected – coba dekatkan wajah & tambah cahaya.");
        }
        return;
      }

      noFaceFrames.current = 0;
      setFrameStatus("normal");

      const yawInfo = computeYawSafe(face);
      if (!yawInfo) {
        setFrameStatus("corrupted");
        setDebug("Landmark tidak valid / data corrupted.");
        return;
      }

      const yawRaw = yawInfo.yaw;

      const alpha = 0.4;
      yawSmooth.current =
        yawSmooth.current === 0
          ? yawRaw
          : yawSmooth.current * (1 - alpha) + yawRaw * alpha;
      const yaw = yawSmooth.current;

      const baseNeutral = Number.isFinite(neutralYaw.current)
        ? neutralYaw.current
        : 0;
      const delta = yaw - baseNeutral;

      const phaseNow = phaseRef.current;
      const progressNow = progressRef.current;

      setDebug(
        `phase: ${phaseNow} | prog: ${progressNow} | yaw: ${yaw.toFixed(
          4
        )} | neutral: ${baseNeutral.toFixed(4)} | delta: ${delta.toFixed(
          4
        )} | mode: ${yawInfo.mode}${
          yawInfo.pts ? " | pts:" + yawInfo.pts : ""
        } | gender: ${genderDetected || "-"}`
      );

      // ====== KALIBRASI ======
      if (phaseNow === "calibrate") {
        calibFrames.current += 1;
        yawSum.current += yaw;
        setCalibCount(calibFrames.current);

        // panggil deteksi gender sekali di awal kalibrasi
        if (calibFrames.current === 8) {
          detectGenderOnce();
        }

        if (calibFrames.current >= 25) {
          neutralYaw.current = yawSum.current / calibFrames.current;
          calibFrames.current = 0;
          yawSum.current = 0;
          setPhase("verify");
        }
        return;
      }

      if (phaseNow !== "verify") return;

      // ====== HOLD COUNTERS ======
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

      // STEP 1: hadap kanan
      if (progressNow === 0 && rightHold.current >= HOLD_FRAMES) {
        setProgress(1);
        centerHold.current = 0;
        return;
      }

      // STEP 2: kembali tengah
      if (progressNow === 1 && centerHold.current >= HOLD_FRAMES) {
        setProgress(2);
        leftHold.current = 0;
        return;
      }

      // STEP 3: hadap kiri
      if (progressNow === 2 && leftHold.current >= HOLD_FRAMES) {
        setProgress(3);
        centerHold.current = 0;
        return;
      }

      // STEP 4: kembali tengah → selesai
      if (progressNow === 3 && centerHold.current >= HOLD_FRAMES) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {}
        setFrameStatus("success");
        setPhase("done");
        setTimeout(() => {
          stopCameraAndLoop();
          onVerified?.();
        }, 900);
      }
    },
    [detectGenderOnce, genderDetected, onVerified, stopCameraAndLoop]
  );

  const loopDetect = useCallback(() => {
    if (!faceLandmarkerRef.current || !videoRef.current) {
      rafIdRef.current = requestAnimationFrame(loopDetect);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      rafIdRef.current = requestAnimationFrame(loopDetect);
      return;
    }

    const nowMs = performance.now();
    const results = faceLandmarkerRef.current.detectForVideo(video, nowMs);

    handleResults(results, nowMs);

    rafIdRef.current = requestAnimationFrame(loopDetect);
  }, [handleResults]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Browser tidak mendukung kamera.");
      return;
    }
    try {
      stopCameraAndLoop();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setFrameStatus("normal");

      const onLoaded = () => {
        rafIdRef.current = requestAnimationFrame(loopDetect);
      };

      if (videoRef.current?.readyState >= 2) {
        onLoaded();
      } else {
        videoRef.current?.addEventListener("loadeddata", onLoaded, {
          once: true,
        });
      }
    } catch (err) {
      console.error("Error start camera:", err);
      alert("Tidak bisa mengakses kamera. Pastikan izin sudah diberikan.");
    }
  }, [loopDetect, stopCameraAndLoop]);

  // ================== CONTROL ==================
  const start = async () => {
    if (!isReadyModel) {
      alert("Model belum siap. Tunggu sebentar lalu coba lagi.");
      return;
    }
    // reset state yaw & hold
    neutralYaw.current = 0;
    yawSmooth.current = 0;
    calibFrames.current = 0;
    yawSum.current = 0;
    rightHold.current = 0;
    leftHold.current = 0;
    centerHold.current = 0;
    noFaceFrames.current = 0;
    setCalibCount(0);
    setFrameStatus("normal");
    // progress dibiarkan (resume allowed)
    await startCamera();
    setPhase("calibrate");
  };

  const resetAll = () => {
    if (!window.confirm("Reset semua progress verifikasi?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      // gender sengaja TIDAK dihapus, biar tetap kepake ke form
    } catch {}
    setProgress(0);
    setPhase("idle");
    setFrameStatus("normal");
    setDebug("");
    neutralYaw.current = 0;
    yawSmooth.current = 0;
    calibFrames.current = 0;
    yawSum.current = 0;
    rightHold.current = 0;
    leftHold.current = 0;
    centerHold.current = 0;
    noFaceFrames.current = 0;
    genderDetectOnceRef.current = false;
    stopCameraAndLoop();
  };

  const getInstruction = () => {
    if (phase === "loading") return "Memuat model liveness…";
    if (phase === "calibrate") return "Lihat ke kamera dan diam sebentar…";
    if (phase === "verify") {
      if (progress === 0) return "Tengok pelan ke KANAN";
      if (progress === 1) return "Kembali hadap TENGAH";
      if (progress === 2) return "Tengok pelan ke KIRI";
      if (progress === 3) return "Balik hadap TENGAH";
    }
    if (phase === "done") return "Verifikasi selesai ✓";
    return "Tekan 'Mulai verifikasi' untuk memulai.";
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

  // ================== UI ==================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Face Liveness New Version
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">
              Ikuti instruksi gerakan kepala untuk menyelesaikan verifikasi.
            </p>
            {genderDetected && (
              <p className="text-xs text-emerald-300 mt-1">
                Rekomendasi gender terdeteksi: <b>{genderDetected}</b>
              </p>
            )}
          </div>

          <button
            onClick={start}
            disabled={!isReadyModel || phase === "loading"}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg transition ${
              !isReadyModel || phase === "loading"
                ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30"
            }`}
          >
            <span className="text-lg">
              {phase === "loading" ? "…" : "▶"}
            </span>
            <span>
              {phase === "loading"
                ? "Memuat model…"
                : progress > 0
                ? "Lanjutkan verifikasi"
                : "Mulai verifikasi"}
            </span>
          </button>
        </div>

        {/* Main card (sisanya tetap seperti punyamu tadi) */}
        {/* ... (biarkan layout steps + debug sama seperti kode awalmu, yang di bawah ini sudah sama) */}

        <div className="grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
          {/* Video + status */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-xl">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-2 bg-black/40 backdrop-blur-sm text-xs text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      phase === "idle" || phase === "loading"
                        ? "bg-slate-500"
                        : phase === "done"
                        ? "bg-emerald-400"
                        : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  Kamera
                  <span className="font-semibold">
                    {phase === "idle" || phase === "loading"
                      ? "siap"
                      : phase === "done"
                      ? "selesai"
                      : "aktif"}
                  </span>
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                  Liveness Mode v2
                </span>
              </div>

              <LivenessFrame status={frameStatus}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />
              </LivenessFrame>
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
              {phase !== "idle" && phase !== "loading" && (
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
                      <p className="text-xs text-slate-400">Langkah {step}</p>
                      <p className="text-sm md:text-base font-medium">
                        {stepLabel(step)}
                      </p>
                    </div>
                    {progress + 1 === step && phase === "verify" && (
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
                  progress: {progress}/3 | calib: {calibCount}
                </span>
              </div>
              <div className="text-slate-200 break-words min-h-[2rem]">
                {debug}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
