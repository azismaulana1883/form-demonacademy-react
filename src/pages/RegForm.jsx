import React, { useRef, useState, useEffect } from "react";
import CameraFrame from "../components/CameraFrame.jsx";
import FormInput from "../components/FormInputReg.jsx";
import DomisiliSelect from "../components/DomisiliSelect.jsx";

export default function RegForm() {
  const [frameStatus, setFrameStatus] = useState("normal");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);

  // ============================
  // FORM INPUT STATE
  // ============================
  const [nama, setNama] = useState("");
  const [nickname, setNickname] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [anime, setAnime] = useState("");

  // ============================
  // DOMISILI STATE
  // ============================
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [errors, setErrors] = useState({});

  // ============================
  // FETCH DOMISILI
  // ============================
  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;
    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`
    )
      .then((res) => res.json())
      .then((data) => setRegencies(data));
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedRegency) return;
    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedRegency}.json`
    )
      .then((res) => res.json())
      .then((data) => setDistricts(data));
  }, [selectedRegency]);

  useEffect(() => {
    if (!selectedDistrict) return;
    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict}.json`
    )
      .then((res) => res.json())
      .then((data) => setVillages(data));
  }, [selectedDistrict]);

  // ============================
  // CAMERA
  // ============================
  const startCamera = async () => {
    try {
      const cam = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      setStream(cam);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = cam;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          console.log(
            "VIDEO READY:",
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
          );
        };
      }
    } catch (err) {
      alert("Tidak bisa membuka kamera.");
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Metadata belum siap
    if (video.readyState < 2) {
      console.log("Video belum siap, retry...");
      return setTimeout(takePhoto, 250);
    }

    let w = video.videoWidth;
    let h = video.videoHeight;

    if (w === 0 || h === 0) {
      console.log("Resolusi 0, retry...");
      return setTimeout(takePhoto, 250);
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);

    const imageBase64 = canvas.toDataURL("image/png");
    setPhoto(imageBase64);

    stopCamera();
  };

  // Stop kamera saat unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // ============================
  // VALIDATION
  // ============================
  const validateForm = () => {
    const e = {};
    if (!nama.trim()) e.nama = "Nama wajib diisi.";
    if (!nickname.trim()) e.nickname = "Nickname wajib diisi.";
    if (!tanggalLahir.trim()) e.tanggal = "Tanggal lahir wajib diisi.";
    if (!tempatLahir.trim()) e.tempat = "Tempat lahir wajib diisi.";
    if (!jabatan.trim()) e.jabatan = "Jabatan wajib diisi.";
    if (!anime.trim()) e.anime = "Anime kesukaan wajib diisi.";

    if (!selectedProvince) e.province = "Provinsi wajib dipilih.";
    if (!selectedRegency) e.regency = "Kabupaten wajib dipilih.";
    if (!selectedDistrict) e.district = "Kecamatan wajib dipilih.";
    if (!selectedVillage) e.village = "Kelurahan wajib dipilih.";

    if (!photo) e.photo = "Foto wajib diambil.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    setErrors(prev => {
      const updated = { ...prev };

      if (nama.trim()) delete updated.nama;
      if (nickname.trim()) delete updated.nickname;
      if (tanggalLahir.trim()) delete updated.tanggal;
      if (tempatLahir.trim()) delete updated.tempat;
      if (jabatan.trim()) delete updated.jabatan;
      if (anime.trim()) delete updated.anime;

      if (selectedProvince) delete updated.province;
      if (selectedRegency) delete updated.regency;
      if (selectedDistrict) delete updated.district;
      if (selectedVillage) delete updated.village;

      if (photo) delete updated.photo;

      return updated;
    });
  }, [
    nama,
    nickname,
    tanggalLahir,
    tempatLahir,
    jabatan,
    anime,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
    selectedVillage,
    photo
  ]);

  const handleSubmit = () => {
    if (!validateForm()) return;
    alert("Form valid!.");
  };

  // ============================
  // SELECT STYLE
  // ============================
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "rgba(15,23,42,0.6)",
      borderRadius: "1rem",
      borderColor: state.isFocused ? "#6366f1" : "rgba(51,65,85,0.8)",
      padding: "4px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(99,102,241,0.4)" : "none",
      color: "#fff",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#0f172a",
      color: "#fff",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "rgba(99,102,241,0.4)"
        : "rgba(15,23,42,0.6)",
      color: "#fff",
    }),
    singleValue: (base) => ({ ...base, color: "#fff" }),
  };

  // ============================
  // RENDER (UI CANTIK TETAP)
  // ============================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Form Registrasi Pengguna
            </h1>
            <p className="text-sm md:text-base text-slate-400 mt-1">
              Lengkapi data dan ambil foto wajah untuk menyelesaikan proses.
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="relative rounded-3xl transition-all duration-300">

          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] relative z-10">

            {/* FORM */}
            <div className="space-y-6">
              <FormInput label="Nama Lengkap" value={nama} setValue={setNama} error={errors.nama} />
              <FormInput label="Nickname" value={nickname} setValue={setNickname} error={errors.nickname} />
              <FormInput label="Tanggal Lahir" type="date" value={tanggalLahir} setValue={setTanggalLahir} error={errors.tanggal} />
              <FormInput label="Tempat Lahir" value={tempatLahir} setValue={setTempatLahir} error={errors.tempat} />
              <FormInput label="Jabatan" value={jabatan} setValue={setJabatan} error={errors.jabatan} />
              <FormInput label="Anime Kesukaan" value={anime} setValue={setAnime} error={errors.anime} />

              <DomisiliSelect
                provinces={provinces}
                regencies={regencies}
                districts={districts}
                villages={villages}
                selectedProvince={selectedProvince}
                selectedRegency={selectedRegency}
                selectedDistrict={selectedDistrict}
                selectedVillage={selectedVillage}
                setSelectedProvince={setSelectedProvince}
                setSelectedRegency={setSelectedRegency}
                setSelectedDistrict={setSelectedDistrict}
                setSelectedVillage={setSelectedVillage}
                selectStyles={selectStyles}
                errors={errors}
              />

              <button
                type="button"
                onClick={handleSubmit}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Submit Form
              </button>
            </div>

            {/* CAMERA */}
          <div className="space-y-4">
            <CameraFrame status={frameStatus} cameraActive={cameraActive} photo={photo}>
              {!photo ? (
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={photo} alt="Foto hasil" className="h-full w-full object-cover" />
              )}
            </CameraFrame>

            <canvas ref={canvasRef} className="hidden" />

            <div className="grid grid-cols-2 gap-3 mt-2">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="bg-slate-800 px-3 py-2.5 rounded-2xl text-sm"
                >
                  Aktifkan Kamera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="bg-slate-800 px-3 py-2.5 rounded-2xl text-sm"
                >
                  Matikan Kamera
                </button>
              )}

              <button
                type="button"
                disabled={!cameraActive}
                onClick={takePhoto}
                className={`
                  px-3 py-2.5 rounded-2xl text-sm font-medium transition
                  ${
                    cameraActive
                      ? "bg-emerald-600 text-white hover:bg-emerald-500"
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
                  className="mx-auto block bg-slate-800 px-6 py-2.5 rounded-2xl text-sm"
                >
                  Ulangi Foto
              </button>

            )}

            {errors.photo && <p className="text-red-400 text-xs">{errors.photo}</p>}
          </div>

          </div>

        </div>

      </div>
    </div>
  );
}
