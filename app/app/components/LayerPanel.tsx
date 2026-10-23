"use client";

import { STATUS_FILTERS, STATUS_META, STATUS_ORDER } from "../constants";
import type { ProjectStatus } from "../types";

interface LayerPanelProps {
  countries: string[];
  countryFilter: string | null;
  statusFilter: ProjectStatus | null;
  counts: Record<ProjectStatus, number>;
  onCountryChange: (value: string | null) => void;
  onStatusChange: (value: ProjectStatus | null) => void;
}

export default function LayerPanel({
  countries,
  countryFilter,
  statusFilter,
  counts,
  onCountryChange,
  onStatusChange,
}: LayerPanelProps) {
  return (
    <div className="flex flex-col">
      <h3 className="text-accent text-xs font-bold uppercase tracking-wider mb-1.5">
        Countries
      </h3>
      <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
        <button
          onClick={() => onCountryChange(null)}
          className={`px-2 py-1.5 rounded text-xs text-left transition-colors ${
            countryFilter === null
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          All countries
        </button>
        {countries.map((country) => (
          <button
            key={country}
            onClick={() => onCountryChange(country)}
            className={`px-2 py-1.5 rounded text-xs text-left transition-colors ${
              countryFilter === country
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {country}
          </button>
        ))}
      </div>

      <div className="border-t border-white/10 mt-3 pt-3">
        <h3 className="text-accent text-xs font-bold uppercase tracking-wider mb-1.5">
          Status
        </h3>
        <div className="flex flex-col gap-1">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => onStatusChange(value)}
              className={`px-2 py-1.5 rounded text-xs text-left transition-colors ${
                statusFilter === value
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 mt-3 pt-3">
        <h3 className="text-accent text-xs font-bold uppercase tracking-wider mb-2">
          Legend
        </h3>
        <div className="flex flex-col gap-1.5">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  backgroundColor: STATUS_META[status].color,
                  border: "1.5px solid #FFFFFF",
                }}
              />
              <span className="text-gray-300">
                {STATUS_META[status].label}
              </span>
              <span className="text-gray-500 ml-auto tabular-nums">
                {counts[status] ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
