import { useEffect, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "https://api-suffergatte.vercel.app/api";

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
      } catch {
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

  // SAVE
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
    } catch {
      setLoadingUpdate(false);
      toast.error("Server error!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 px-6 py-12 text-white">

      <Toaster position="top-center" />

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 w-96 rounded-2xl shadow-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Update Nickname</h2>

            <label className="text-sm text-slate-300">Unique Key</label>
            <input
              className="w-full px-3 py-2 mb-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
              placeholder="Masukkan unique key..."
              value={uniqueKeyInput}
              onChange={(e) => setUniqueKeyInput(e.target.value)}
            />

            <label className="text-sm text-slate-300">Nickname Lama</label>
            <input
              disabled
              className="w-full px-3 py-2 mb-3 rounded-lg bg-slate-600 border border-slate-500 text-white"
              value={oldNickname}
            />

            <label className="text-sm text-slate-300">Nickname Baru</label>
            <input
              className="w-full px-3 py-2 mb-5 rounded-lg bg-slate-700 border border-slate-600 text-white"
              placeholder="Nickname baru..."
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow"
                disabled={loadingUpdate}
                onClick={saveNickname}
              >
                {loadingUpdate ? "Menyimpan..." : "Simpan"}
              </button>

              <button
                className="flex-1 bg-slate-500 hover:bg-slate-600 py-2 rounded-lg"
                onClick={() => setShowPopup(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TITLE */}
      <h1 className="text-4xl font-extrabold text-center mb-10 tracking-wide drop-shadow-lg">
        SUFFERGATTE — Members
      </h1>

      {/* FILTER */}
      <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl shadow-xl">
        
        <input
          type="text"
          placeholder="Cari nama / nickname..."
          className="w-full md:w-1/2 px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-3">
          {["All", "Laki-laki", "Perempuan"].map((g) => (
            <button
              key={g}
              onClick={() => setFilterGender(g)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition backdrop-blur-md shadow-lg ${
                filterGender === g
                  ? "bg-blue-600 border-blue-400 text-white"
                  : "bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="bg-slate-800 rounded-2xl border border-white/10 shadow-xl overflow-hidden transition hover:scale-[1.03] hover:shadow-2xl"
          >
            <div className="h-56 w-full overflow-hidden">
              <img
                src={m.path}
                alt={m.nama}
                className="w-full h-full object-cover transition hover:scale-110"
              />
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-400">Nama</p>
              <p className="text-lg font-semibold">{m.nama}</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Nickname</p>
                  <p className="text-xl font-bold text-blue-400">{m.nickname}</p>
                </div>

                <button onClick={() => openEditPopup(m)}>
                  <PencilIcon className="h-6 w-6 text-blue-400 hover:text-blue-200" />
                </button>
              </div>

              <p className="text-xs text-slate-400">Domisili</p>
              <p className="text-slate-200 text-sm flex gap-2 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                {m.kab}
              </p>

              <p className="text-xs text-slate-400">Join</p>
              <p className="text-slate-200 text-sm">{formatDateID(m.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
