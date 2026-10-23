export type ProjectStatus = "operational" | "underperforming" | "development";

export type ProjectStage =
  | "operational"
  | "construction"
  | "planning"
  | "advanced development"
  | "early development";

export type ProjectType =
  | "capture"
  | "storage"
  | "power"
  | "hydrogen"
  | "DAC"
  | "industrial"
  | "hub"
  | "bioenergy";

export type Project = {
  name: string;
  country: string;
  status: ProjectStatus;
  stage: ProjectStage;
  type: ProjectType;
  operator: string;
  location: string;
  capacity: string;
  description: string;
};

export type ClickedProject = Project & {
  longitude: number;
  latitude: number;
};
