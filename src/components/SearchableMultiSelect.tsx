"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

interface Props {
  label: string
  options: string[]
  selected: string[]
  setSelected: (values: string[]) => void
}

export default function SearchableMultiSelect({ label, options, selected, setSelected }: Props) {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredOptions = options.filter(
    (opt) => opt.toLowerCase().includes(search.toLowerCase()) && !selected.includes(opt),
  )

  const addOption = (value: string) => {
    setSelected([...selected, value])
    setSearch("")
  }

  const removeOption = (value: string) => {
    setSelected(selected.filter((item) => item !== value))
  }

  return (
    <div className="relative">
      {/* Selected items */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selected.map((item) => (
          <span key={item} className="flex items-center rounded-full bg-[#008F8C] px-3 py-1 text-sm text-white">
            {item}
            <button
              onClick={() => removeOption(item)}
              className="ml-2 rounded-full p-0.5 hover:bg-[#015958]"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#C7FFED]/70">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          className="w-full rounded-lg border border-[#008F8C]/30 bg-[#015958]/30 py-3 pl-10 pr-4 text-[#D8FFDB] placeholder-[#D8FFDB]/50 focus:border-[#008F8C] focus:outline-none focus:ring-1 focus:ring-[#008F8C]"
          placeholder={`Search ${label}`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (e.target.value && !isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>

      {/* Dropdown */}
      {isOpen && search && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[#008F8C]/30 bg-[#023535] shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt}
                onClick={() => addOption(opt)}
                className="cursor-pointer px-4 py-2 text-[#D8FFDB] hover:bg-[#015958]"
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-[#D8FFDB]/50">No matches found</li>
          )}
        </ul>
      )}
    </div>
  )
}
