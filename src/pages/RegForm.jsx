// src/pages/RegForm.jsx
import React, { useRef, useState, useEffect } from "react";
import CameraFrame from "../components/CameraFrame.jsx";
import FormInput from "../components/FormInputReg.jsx";
import DomisiliSelect from "../components/DomisiliSelect.jsx";
import Select from "react-select";
import toast from "react-hot-toast";
import { resizeBase64, validateImageFile } from "../utils/imageTools";
import { useNavigate } from "react-router-dom";

const GENDER_KEY = "detected_gender_v1";

export default function RegForm() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [frameStatus] = useState("normal");
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  const [photo, setPhoto] = useState(null);
  const [uploadFileBase64, setUploadFileBase64] = useState(null);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [uploadFilename, setUploadFilename] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [uniqueKey, setUniqueKey] = useState("");
  const navigate = useNavigate();

  // FORM STATE
  const [nama, setNama] = useState("");
  const [nickname, setNickname] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [jabatan, setJabatan] = useState("");

  const [gender, setGender] = useState(() => {
    try {
      return localStorage.getItem(GENDER_KEY) || "";
    } catch {
      return "";
    }
  });

  // DOMISILI STATE
  const [provinces, setProvinces] = useState([]);
  const [regencies, setRegencies] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedRegency, setSelectedRegency] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  const [errors, setErrors] = useState({});

  // =============================
  // UPLOAD FILE + RESIZE
  // =============================
  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const err = validateImageFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    setUploadLoading(true);
    setUploadFilename(file.name);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const resized = await resizeBase64(reader.result, 480, 0.8);
        setUploadFileBase64(resized);
      } catch {
        toast.error("Gagal memproses gambar.");
      } finally {
        setUploadLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // =============================
  // FETCH DOMISILI
  // =============================
  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((r) => r.json())
      .then(setProvinces);
  }, []);

  useEffect(() => {
    if (!selectedProvince) return;
    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince}.json`
    )
      .then((r) => r.json())
      .then(setRegencies);
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedRegency) return;
    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedRegency}.json`
    )
      .then((r) => r.json())
      .then(setDistricts);
  }, [selectedRegency]);

  useEffect(() => {
    if (!selectedDistrict) return;
    fetch(
      `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict}.json`
    )
      .then((r) => r.json())
      .then(setVillages);
  }, [selectedDistrict]);

  // =============================
  // CAMERA
  // =============================
  const startCamera = async () => {
    try {
      const cam = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(cam);
      setCameraActive(true);

      videoRef.current.srcObject = cam;
      videoRef.current.onloadedmetadata = () => videoRef.current.play();
    } catch {
      toast.error("Tidak bisa membuka kamera.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setCameraActive(false);
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCameraLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      setTimeout(takePhoto, 200);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg");

    const resizedFace = await resizeBase64(base64, 720, 0.8);

    setPhoto(resizedFace);
    stopCamera();
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, [stream]);

  // =============================
  // VALIDASI FORM
  // =============================
  const validateForm = () => {
    const e = {};

    if (!nama.trim()) e.nama = "Nama wajib diisi.";
    if (!nickname.trim()) e.nickname = "Nickname wajib diisi.";
    if (!tanggalLahir.trim()) e.tanggal = "Tanggal lahir wajib diisi.";
    if (!tempatLahir.trim()) e.tempat = "Tempat lahir wajib diisi.";
    if (!jabatan.trim()) e.jabatan = "Jabatan wajib diisi.";
    if (!gender.trim()) e.gender = "Jenis kelamin wajib dipilih.";
    if (!selectedProvince) e.province = "Provinsi wajib dipilih.";
    if (!selectedRegency) e.regency = "Kabupaten wajib dipilih.";
    if (!selectedDistrict) e.district = "Kecamatan wajib dipilih.";
    if (!selectedVillage) e.village = "Kelurahan wajib dipilih.";

    if (!uploadFileBase64) e.path = "Foto upload wajib diisi.";
    if (!photo) e.photo = "Foto kamera wajib diambil.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // =============================
  // SUBMIT
  // =============================
  const handleSubmit = async () => {
    if (uploadLoading || cameraLoading) {
      toast.error("Tunggu gambar selesai diproses...");
      return;
    }

    if (!validateForm()) {
      toast.error("Masih ada data yang belum lengkap!");
      return;
    }

    const payload = {
      nama,
      nickname,
      tanggal_lahir: tanggalLahir,
      tempat_lahir: tempatLahir,
      jabatan,
      jenis_kelamin: gender,
      prov: provinces.find((p) => p.id == selectedProvince)?.name || "",
      kab: regencies.find((r) => r.id == selectedRegency)?.name || "",
      kec: districts.find((d) => d.id == selectedDistrict)?.name || "",
      kel: villages.find((v) => v.id == selectedVillage)?.name || "",

      path: uploadFileBase64,
      path_verify: photo,
    };

    try {
      const res = await fetch("https://api-suffergatte.vercel.app/api/biodata/get-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Gagal submit.");
        return;
      }

      setUniqueKey(data.unique_key);
      setShowPopup(true);
    } catch (err) {
      toast.error("Server error.");
    }
  };

  // =============================
  // COPY UNIQUE KEY
  // =============================
  const copyUniqueKey = () => {
    navigator.clipboard.writeText(uniqueKey);
    toast.success("Unique Key disalin!");

    setShowPopup(false);
    setTimeout(() => (window.location.href = "/members"), 200);
  };

  // =============================
  // STYLING SELECT
  // =============================
  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "rgba(15,23,42,0.6)",
      borderRadius: "1rem",
      borderColor: "rgba(148,163,184,0.5)",
      padding: "4px",
      color: "#fff",
    }),
    menu: (b) => ({ ...b, backgroundColor: "#0f172a" }),
    option: (b, s) => ({
      ...b,
      backgroundColor: s.isFocused ? "rgba(99,102,241,0.4)" : "transparent",
    }),
    singleValue: (b) => ({ ...b, color: "#fff" }),
  };

  const genderOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
  ];

  // =============================
  // RENDER
  // =============================
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      
      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-80 text-center shadow-xl">
            <h2 className="text-xl font-bold mb-3">Registrasi Berhasil!</h2>
            <p className="text-slate-300 text-sm mb-2">
              Ini adalah <b>Unique Key</b> kamu:
            </p>

            <div className="bg-slate-900 border border-indigo-500 text-indigo-300 font-mono p-3 rounded-xl mb-4">
              {uniqueKey}
            </div>

            <button
              onClick={copyUniqueKey}
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl text-white"
            >
              Salin & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* FORM */}
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-semibold">Form Registrasi Pengguna</h1>
        <p className="text-slate-400 text-sm mt-1">
          Lengkapi data dan ambil foto wajah untuk menyelesaikan proses.
        </p>

        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] mt-8">

          {/* INPUT FORM */}
          <div className="space-y-6">
            <FormInput label="Nama Lengkap" value={nama} setValue={setNama} error={errors.nama} />
            <FormInput label="Nickname" value={nickname} setValue={setNickname} error={errors.nickname} />
            <FormInput label="Tanggal Lahir" type="date" value={tanggalLahir} setValue={setTanggalLahir} error={errors.tanggal} />
            <FormInput label="Tempat Lahir" value={tempatLahir} setValue={setTempatLahir} error={errors.tempat} />
            <FormInput label="Jabatan" value={jabatan} setValue={setJabatan} error={errors.jabatan} />

            {/* GENDER */}
            <div>
              <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
              <Select
                value={genderOptions.find((o) => o.value === gender) || null}
                onChange={(o) => setGender(o?.value || "")}
                options={genderOptions}
                styles={selectStyles}
                placeholder="Pilih jenis kelamin"
              />
              {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* DOMISILI */}
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

            {/* UPLOAD FILE */}
            <div>
              <label className="block text-sm font-medium mb-1">Upload Foto (jpg/png)</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleUploadFile}
                className="block w-full bg-slate-800 rounded-xl px-3 py-2 text-sm"
              />

              {uploadLoading && <p className="text-indigo-400 text-xs mt-1">Mengompres gambar...</p>}

              {uploadFilename && (
                <p className="text-slate-400 text-xs mt-1">File: {uploadFilename}</p>
              )}

              {uploadFileBase64 && (
                <img src={uploadFileBase64} alt="Preview Upload" className="mt-3 w-40 rounded-xl border border-slate-600" />
              )}

              {errors.path && <p className="text-red-400 text-xs mt-1">{errors.path}</p>}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-2xl text-sm font-semibold"
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
                <button onClick={startCamera} className="bg-slate-800 px-3 py-2.5 rounded-2xl text-sm">
                  Aktifkan Kamera
                </button>
              ) : (
                <button onClick={stopCamera} className="bg-slate-800 px-3 py-2.5 rounded-2xl text-sm">
                  Matikan Kamera
                </button>
              )}

              <button
                type="button"
                disabled={!cameraActive}
                onClick={takePhoto}
                className={`px-3 py-2.5 rounded-2xl text-sm font-medium transition ${
                  cameraActive
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                Ambil Foto
              </button>
            </div>

            {cameraLoading && <p className="text-indigo-400 text-xs">Memproses foto...</p>}

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
  );
}
