"use client";

import { useState } from "react";

interface Props {
  label: string;
  options: string[];
  selected: string[];
  setSelected: (values: string[]) => void;
}

export default function SearchableMultiSelect({
  label,
  options,
  selected,
  setSelected,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(opt)
  );

  const addOption = (value: string) => {
    setSelected([...selected, value]);
    setSearch("");
  };

  const removeOption = (value: string) => {
    setSelected(selected.filter((item) => item !== value));
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium">{label}</label>
      <div className="mb-2 flex flex-wrap gap-2">
        {selected.map((item) => (
          <span
            key={item}
            className="bg-green-500 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1"
          >
            {item}
            <button onClick={() => removeOption(item)} className="ml-1">
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder={`Search ${label}`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {search && (
        <ul className="bg-gray-700 mt-1 rounded-lg max-h-40 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt}
                onClick={() => addOption(opt)}
                className="px-4 py-2 cursor-pointer hover:bg-green-600"
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
}
