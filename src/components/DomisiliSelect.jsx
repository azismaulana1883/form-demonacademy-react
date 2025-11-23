import React from "react";
import Select from "react-select";

export default function DomisiliSelect({
  provinces, regencies, districts, villages,
  selectedProvince, selectedRegency, selectedDistrict, selectedVillage,
  setSelectedProvince, setSelectedRegency, setSelectedDistrict, setSelectedVillage,
  selectStyles, errors
}) {
  return (
    <div className="space-y-4">

      {/* PROVINSI */}
      <div>
        <label className="text-xs font-medium text-slate-200">Provinsi</label>
        <Select
          styles={selectStyles}
          menuPortalTarget={null}
          menuPosition="fixed"
          menuPlacement="auto"
          placeholder="Pilih Provinsi…"
          options={provinces.map((p) => ({ value: p.id, label: p.name }))}
          value={
            selectedProvince
              ? { value: selectedProvince, label: provinces.find(p => p.id == selectedProvince)?.name }
              : null
          }
          onChange={(e) => {
            setSelectedProvince(e?.value || "");
            setSelectedRegency("");
            setSelectedDistrict("");
            setSelectedVillage("");
          }}
          isClearable
        />

        {errors.province && <p className="text-red-400 text-xs mt-1">{errors.province}</p>}
      </div>

      {/* KABUPATEN */}
      <div>
        <label className="text-xs font-medium text-slate-200">Kabupaten / Kota</label>
        <Select
          styles={selectStyles}
          menuPortalTarget={null}
          menuPosition="fixed"
          menuPlacement="auto"
          placeholder="Pilih Kabupaten / Kota…"
          options={regencies.map((r) => ({ value: r.id, label: r.name }))}
          value={
            selectedRegency
              ? { value: selectedRegency, label: regencies.find(r => r.id == selectedRegency)?.name }
              : null
          }
          onChange={(e) => {
            setSelectedRegency(e?.value || "");
            setSelectedDistrict("");
            setSelectedVillage("");
          }}
          isDisabled={!selectedProvince}
          isClearable
        />

        {errors.regency && <p className="text-red-400 text-xs mt-1">{errors.regency}</p>}
      </div>

      {/* KECAMATAN */}
      <div>
        <label className="text-xs font-medium text-slate-200">Kecamatan</label>
        <Select
          styles={selectStyles}
          menuPortalTarget={null}
          menuPosition="fixed"
          menuPlacement="auto"
          placeholder="Pilih Kecamatan…"
          options={districts.map((d) => ({ value: d.id, label: d.name }))}
          value={
            selectedDistrict
              ? { value: selectedDistrict, label: districts.find(d => d.id == selectedDistrict)?.name }
              : null
          }
          onChange={(e) => {
            setSelectedDistrict(e?.value || "");
            setSelectedVillage("");
          }}
          isDisabled={!selectedRegency}
          isClearable
        />

        {errors.district && <p className="text-red-400 text-xs mt-1">{errors.district}</p>}
      </div>

      {/* KELURAHAN */}
      <div>
        <label className="text-xs font-medium text-slate-200">Kelurahan</label>
        <Select
          styles={selectStyles}
          menuPortalTarget={null}
          menuPosition="fixed"
          menuPlacement="auto"
          placeholder="Pilih Kelurahan…"
          options={villages.map((v) => ({ value: v.id, label: v.name }))}
          value={
            selectedVillage
              ? { value: selectedVillage, label: villages.find(v => v.id == selectedVillage)?.name }
              : null
          }
          onChange={(e) => setSelectedVillage(e?.value || "")}
          isDisabled={!selectedDistrict}
          isClearable
        />

        {errors.village && <p className="text-red-400 text-xs mt-1">{errors.village}</p>}
      </div>
    </div>
  );
}
