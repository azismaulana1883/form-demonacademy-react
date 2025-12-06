import { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "https://api-suffergatte.vercel.app/api"; // <— GANTI DI SINI

export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("All");

  // POPUP STATE
  const [showPopup, setShowPopup] = useState(false);
  const [editId, setEditId] = useState(null);
  const [oldNickname, setOldNickname] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [uniqueKeyInput, setUniqueKeyInput] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  function formatDateID(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // LOAD DATA
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}/biodata/get-all`);
        const json = await res.json();
        if (json.success) {
          setMembers(json.data);
          setFiltered(json.data);
        }
      } catch (err) {
        toast.error("Gagal memuat data.");
      }
    }
    fetchData();
  }, []);

  // FILTER
  useEffect(() => {
    let r = [...members];

    if (search.trim()) {
      r = r.filter(
        (m) =>
          m.nama.toLowerCase().includes(search.toLowerCase()) ||
          m.nickname.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterGender !== "All") {
      r = r.filter((m) => m.jenis_kelamin === filterGender);
    }

    setFiltered(r);
  }, [search, filterGender, members]);

  // OPEN POPUP
  const openEditPopup = (member) => {
    setEditId(member.id);
    setOldNickname(member.nickname);
    setNewNickname("");
    setUniqueKeyInput("");
    setShowPopup(true);
  };

  // SAVE NICKNAME
  const saveNickname = async () => {
    if (!uniqueKeyInput.trim()) return toast.error("Unique key wajib diisi!");
    if (!newNickname.trim()) return toast.error("Nickname baru wajib diisi!");

    setLoadingUpdate(true);

    try {
        const res = await fetch(`${API_BASE}/biodata/get-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: editId,
            unique_key: uniqueKeyInput,
            new_nickname: newNickname,
        }),
        });

        const json = await res.json();
        setLoadingUpdate(false);

        if (!json.success) {
        toast.error(json.message || "Gagal update.");
        return;
        }

        toast.success("Nickname berhasil diperbarui!");

        setMembers((prev) =>
        prev.map((m) =>
            m.id === editId ? { ...m, nickname: newNickname } : m
        )
        );

        setShowPopup(false);
    } catch (err) {
        setLoadingUpdate(false);
        toast.error("Server error!");
    }
    };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-200 px-6 py-12 text-slate-800">

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e293b",
            color: "#fff",
          },
        }}
      />

      {/* POPUP EDIT */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-96 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Update Nickname</h2>

            <label className="text-sm">Unique Key</label>
            <input
              type="text"
              className="w-full px-3 py-2 mb-3 rounded-lg border"
              placeholder="Masukkan unique key..."
              value={uniqueKeyInput}
              onChange={(e) => setUniqueKeyInput(e.target.value)}
            />

            <label className="text-sm">Nickname Lama</label>
            <input
              disabled
              className="w-full px-3 py-2 mb-3 rounded-lg border bg-slate-100"
              value={oldNickname}
            />

            <label className="text-sm">Nickname Baru</label>
            <input
              type="text"
              className="w-full px-3 py-2 mb-5 rounded-lg border"
              placeholder="Nickname baru..."
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg"
                disabled={loadingUpdate}
                onClick={saveNickname}
              >
                {loadingUpdate ? "Menyimpan..." : "Simpan"}
              </button>

              <button
                className="flex-1 bg-slate-300 py-2 rounded-lg"
                onClick={() => setShowPopup(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TITLE */}
      <h1 className="text-4xl font-bold text-center mb-10 tracking-wide text-blue-600 drop-shadow-sm">
        SUFFERGATTE — Members
      </h1>

      {/* FILTER */}
      <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Cari nama / nickname..."
          className="w-full md:w-1/2 px-4 py-2 rounded-xl bg-white/70 border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-3">
          {["All", "Laki-laki", "Perempuan"].map((g) => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition shadow-sm ${
                filterGender === g
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-white/70 border-slate-300 hover:bg-blue-100"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* GRID MEMBERS */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:shadow-xl hover:scale-[1.03] transition"
          >
            <div className="h-56 w-full overflow-hidden">
              <img
                src={m.path} // <--- NO MORE LOCAL HOST
                alt={m.nama}
                className="w-full h-full object-cover transition hover:scale-110"
              />
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Nama</p>
              <p className="text-lg font-semibold text-slate-800">{m.nama}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Nickname</p>
                  <p className="text-xl font-bold text-blue-600">{m.nickname}</p>
                </div>

                <button onClick={() => openEditPopup(m)}>
                  <PencilIcon className="h-6 w-6 text-blue-600 hover:text-blue-800" />
                </button>
              </div>

              <p className="text-xs text-slate-500 uppercase tracking-wide">Domisili</p>
              <p className="flex items-center gap-2 text-slate-700 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {m.kab}
              </p>

              <p className="text-xs text-slate-500 uppercase tracking-wide">Join</p>
              <p className="text-slate-700 text-sm">{formatDateID(m.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
