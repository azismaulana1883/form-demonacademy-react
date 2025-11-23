import React from "react";

export default function FormInput({ label, value, setValue, type = "text", error }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-200">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`
          mt-2 w-full rounded-2xl border px-3 py-2.5 text-sm outline-none
          bg-slate-900/60 border-slate-700/80 placeholder:text-slate-500
          focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/60
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/60" : ""}
        `}
      />

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
