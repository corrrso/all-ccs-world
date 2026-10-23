import type { ProjectStage, ProjectStatus, ProjectType } from "./types";

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; color: string }
> = {
  operational: { label: "Active", color: "#22C55E" },
  underperforming: { label: "Active, underperforming", color: "#F59E0B" },
  development: { label: "In construction / planning", color: "#3B82F6" },
};

export const STATUS_ORDER: ProjectStatus[] = [
  "operational",
  "underperforming",
  "development",
];

export const STATUS_FILTERS: { label: string; value: ProjectStatus | null }[] = [
  { label: "All statuses", value: null },
  ...STATUS_ORDER.map((status) => ({
    label: STATUS_META[status].label,
    value: status,
  })),
];

export const STAGE_LABEL: Record<ProjectStage, string> = {
  operational: "Operational",
  construction: "In construction",
  planning: "In planning",
  "advanced development": "Advanced development",
  "early development": "Early development",
};

export const TYPE_LABEL: Record<ProjectType, string> = {
  capture: "Carbon capture",
  storage: "CO₂ storage",
  power: "Power with CCS",
  hydrogen: "Hydrogen with CCS",
  DAC: "Direct air capture",
  industrial: "Industrial capture",
  hub: "CO₂ hub / network",
  bioenergy: "Bioenergy with CCS",
};
