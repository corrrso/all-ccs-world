"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { FeatureCollection } from "geojson";
import LayerPanel from "./components/LayerPanel";
import ProjectCard from "./components/ProjectCard";
import type { ClickedProject, Project, ProjectStatus } from "./types";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function Home() {
  const [projects, setProjects] = useState<FeatureCollection | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | null>(null);
  const [clicked, setClicked] = useState<ClickedProject | null>(null);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/data/projects.geojson`,
        );
        if (!response.ok) throw new Error(String(response.status));
        const json = (await response.json()) as FeatureCollection;
        if (!cancelled) setProjects(json);
      } catch (error) {
        console.error("Could not load projects", error);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { countries, counts } = useMemo(() => {
    const countrySet = new Set<string>();
    const counts: Record<ProjectStatus, number> = {
      operational: 0,
      underperforming: 0,
      development: 0,
    };
    for (const feature of projects?.features ?? []) {
      const props = feature.properties as Project | null;
      if (!props?.country) continue;
      countrySet.add(props.country);
      if (props.status in counts) counts[props.status] += 1;
    }
    return { countries: [...countrySet].sort(), counts };
  }, [projects]);

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden">
      <div className="absolute inset-0">
        <Map
          data={projects}
          countryFilter={countryFilter}
          statusFilter={statusFilter}
          onFeatureClick={setClicked}
        />
      </div>

      {/* Title / caveat */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4">
        <div className="bg-black/75 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 text-center shadow-lg">
          <h1 className="text-white text-sm font-bold leading-tight">
            Global Carbon Capture &amp; Storage
          </h1>
          <p className="text-gray-400 text-[11px] leading-tight">
            Rough reference map — active · underperforming · in construction/planning
          </p>
        </div>
      </div>

      {/* Desktop: filters + legend */}
      <div className="hidden md:block absolute top-3 left-3 z-10 w-64">
        <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3">
          <LayerPanel
            countries={countries}
            countryFilter={countryFilter}
            statusFilter={statusFilter}
            counts={counts}
            onCountryChange={setCountryFilter}
            onStatusChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Mobile: filter toggle + panel */}
      <div className="md:hidden absolute bottom-4 left-2 right-2 z-20 flex flex-col items-stretch gap-2">
        {mobilePanelOpen && (
          <div className="bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-lg max-h-[45vh] overflow-y-auto">
            <LayerPanel
              countries={countries}
              countryFilter={countryFilter}
              statusFilter={statusFilter}
              counts={counts}
              onCountryChange={setCountryFilter}
              onStatusChange={setStatusFilter}
            />
          </div>
        )}
        <button
          onClick={() => setMobilePanelOpen((v) => !v)}
          className="self-start bg-black/85 backdrop-blur-sm border border-white/15 rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-lg"
        >
          {mobilePanelOpen ? "Hide filters" : "Filters & legend"}
        </button>
      </div>

      {/* Desktop: selected project card */}
      {clicked && (
        <div className="hidden md:block absolute z-10 top-3 right-3 w-96">
          <ProjectCard project={clicked} onClose={() => setClicked(null)} />
        </div>
      )}

      {/* Mobile: selected project bottom sheet */}
      {clicked && (
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-30 p-2">
          <ProjectCard project={clicked} onClose={() => setClicked(null)} />
        </div>
      )}
    </div>
  );
}
