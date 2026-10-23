"use client";

import { useMemo, useRef, useState } from "react";
import MapGL, {
  Source,
  Layer,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "maplibre-gl";
import type { GeoJSON, FeatureCollection, Point } from "geojson";
import type {
  ClickedProject,
  Project,
  ProjectStatus,
} from "../types";
import { STATUS_META } from "../constants";

const BASEMAP =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const INITIAL_VIEW = {
  longitude: 15,
  latitude: 25,
  zoom: 1.4,
};

type Tooltip = { x: number; y: number; name: string; status: string } | null;

interface MapProps {
  data: GeoJSON | null;
  countryFilter: string | null;
  statusFilter: ProjectStatus | null;
  onFeatureClick: (project: ClickedProject | null) => void;
}

export default function Map({
  data,
  countryFilter,
  statusFilter,
  onFeatureClick,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const filteredData = useMemo<FeatureCollection | null>(() => {
    if (!data) return null;
    const source = data as FeatureCollection;
    const features = source.features.filter((f) => {
      const props = f.properties as Project | null;
      if (!props) return false;
      if (countryFilter && props.country !== countryFilter) return false;
      if (statusFilter && props.status !== statusFilter) return false;
      return true;
    });
    return { type: "FeatureCollection", features };
  }, [data, countryFilter, statusFilter]);

  const projectByName = useMemo(() => {
    const byName = new globalThis.Map<string, Project>();
    for (const feature of (data as FeatureCollection | null)?.features ?? []) {
      const props = feature.properties as Project | null;
      if (props?.name) byName.set(props.name, props);
    }
    return byName;
  }, [data]);

  const handleClick = (event: MapLayerMouseEvent) => {
    const features = event.features ?? [];

    const cluster = features.find((f) => f.layer.id === "projects-clusters");
    if (cluster && mapRef.current) {
      const geometry = cluster.geometry as Point;
      if (geometry.type === "Point" && geometry.coordinates.length >= 2) {
        const [lng, lat] = geometry.coordinates;
        const zoom = Math.min((mapRef.current.getZoom() ?? 2) + 2.5, 11);
        mapRef.current.easeTo({ center: [lng, lat], zoom });
      }
      onFeatureClick(null);
      return;
    }

    const feature = features.find((f) => f.layer.id === "projects-circles");
    if (!feature) {
      onFeatureClick(null);
      return;
    }
    const name = feature.properties?.name;
    const project = name ? projectByName.get(String(name)) : undefined;
    if (!project) {
      onFeatureClick(null);
      return;
    }
    onFeatureClick({
      ...project,
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
    });
  };

  const handleMouseMove = (event: MapLayerMouseEvent) => {
    const features = event.features ?? [];
    const circle = features.find((f) => f.layer.id === "projects-circles");
    const cluster = features.find((f) => f.layer.id === "projects-clusters");
    if (mapRef.current) {
      mapRef.current.getCanvas().style.cursor =
        circle || cluster ? "pointer" : "";
    }
    if (circle) {
      const props = circle.properties as Project;
      setTooltip({
        x: event.point.x,
        y: event.point.y,
        name: props.name,
        status: STATUS_META[props.status]?.label ?? props.status,
      });
    } else {
      setTooltip(null);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        style={{ width: "100%", height: "100%" }}
        mapStyle={BASEMAP}
        interactiveLayerIds={["projects-clusters", "projects-circles"]}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setTooltip(null);
          if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
        }}
      >
        <NavigationControl position="bottom-right" />

        {filteredData && (
          <Source
            id="projects"
            type="geojson"
            data={filteredData}
            cluster
            clusterMaxZoom={13}
            clusterRadius={50}
          >
            <Layer
              id="projects-clusters"
              type="circle"
              filter={["has", "point_count"]}
              paint={{
                "circle-color": "#E5E7EB",
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["get", "point_count"],
                  2,
                  12,
                  10,
                  18,
                  50,
                  26,
                ],
                "circle-stroke-color": "#111827",
                "circle-stroke-width": 2,
                "circle-opacity": 0.85,
              }}
            />
            <Layer
              id="projects-cluster-count"
              type="symbol"
              filter={["has", "point_count"]}
              layout={{
                "text-field": "{point_count_abbreviated}",
                "text-size": 12,
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              }}
              paint={{ "text-color": "#111827" }}
            />
            <Layer
              id="projects-circles"
              type="circle"
              filter={["!", ["has", "point_count"]]}
              paint={{
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  1,
                  4,
                  3,
                  6,
                  6,
                  8,
                  10,
                  10,
                ],
                "circle-color": [
                  "match",
                  ["get", "status"],
                  "operational",
                  "#22C55E",
                  "underperforming",
                  "#F59E0B",
                  "development",
                  "#3B82F6",
                  "#9CA3AF",
                ],
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 1.5,
                "circle-opacity": 0.9,
              }}
            />
            <Layer
              id="projects-labels"
              type="symbol"
              filter={["!", ["has", "point_count"]]}
              minzoom={3.4}
              layout={{
                "text-field": ["get", "name"],
                "text-size": 11,
                "text-offset": [0, 1.6],
                "text-allow-overlap": false,
                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              }}
              paint={{
                "text-color": "#FFFFFF",
                "text-halo-color": "#000000",
                "text-halo-width": 1.5,
              }}
            />
          </Source>
        )}
      </MapGL>

      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 12 }}
        >
          <div className="bg-black/90 border border-white/15 rounded px-2 py-1 shadow-lg">
            <span className="block text-white text-xs font-semibold">
              {tooltip.name}
            </span>
            <span className="block text-gray-400 text-[10px]">
              {tooltip.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
