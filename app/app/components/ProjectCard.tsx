"use client";

import type { ClickedProject } from "../types";
import { STATUS_META, STAGE_LABEL, TYPE_LABEL } from "../constants";

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="text-white text-right">{value}</dd>
    </div>
  );
}

interface ProjectCardProps {
  project: ClickedProject;
  onClose: () => void;
}

export default function ProjectCard({ project, onClose }: ProjectCardProps) {
  const status = STATUS_META[project.status];

  return (
    <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-lg shadow-black/50">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-white font-bold text-base leading-snug">
          {project.name}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-500 hover:text-white text-xl leading-none shrink-0"
        >
          &times;
        </button>
      </div>

      <div className="flex items-center flex-wrap gap-2 mt-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            color: status.color,
            backgroundColor: `${status.color}22`,
            border: `1px solid ${status.color}55`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          {status.label}
        </span>
        <span className="text-xs text-gray-400">
          {TYPE_LABEL[project.type]}
        </span>
        {project.status === "development" && (
          <span className="text-xs text-gray-500">
            · {STAGE_LABEL[project.stage]}
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        <Row label="Country" value={project.country} />
        <Row label="Operator" value={project.operator} />
        <Row label="Location" value={project.location} />
        <Row label="Capacity" value={project.capacity} />
      </dl>

      <p className="mt-3 text-xs text-gray-300 leading-relaxed">
        {project.description}
      </p>
    </div>
  );
}
