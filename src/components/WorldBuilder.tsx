/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GeneratedWorld, GridTile, ProjectDb } from "../types";
import { buildProceduralMap, perlinNoise2D } from "../data";
import {
  Map,
  Sliders,
  Sparkles,
  Download,
  Info,
  Layers,
  MapPin,
  HelpCircle,
  Gem,
  RefreshCw,
  Home,
  Compass,
  Crosshair,
  Grid,
  FileJson,
  Scroll,
  Eye,
  Check,
  Copy,
  SlidersHorizontal,
  Terminal,
  Skull,
  ShieldAlert,
  Sword,
  Wand
} from "lucide-react";

interface WorldBuilderProps {
  map: GeneratedWorld;
  onSave: (map: GeneratedWorld) => void;
  db: ProjectDb;
}

type RightPanelTab = "settings" | "inspector" | "exporter";
type ExportFormatTab = "json" | "gdscript" | "packed";

export default function WorldBuilder({ map, onSave, db }: WorldBuilderProps) {
  // Option Slices for map procedural drafts
  const [width, setWidth] = useState(map.width);
  const [height, setHeight] = useState(map.height);
  const [seed, setSeed] = useState(map.seed);
  const [waterAmount, setWaterAmount] = useState(map.waterAmount);
  const [forestAmount, setForestAmount] = useState(map.forestAmount);
  const [mountainAmount, setMountainAmount] = useState(map.mountainAmount);
  const [villageCount, setVillageCount] = useState(map.villageCount);
  const [resourceDensity, setResourceDensity] = useState(map.resourceDensity);
  const [monsterDensity, setMonsterDensity] = useState(map.monsterDensity);

  // Expanded Tab Navigation for Right Control Panel
  const [rightTab, setRightTab] = useState<RightPanelTab>("settings");
  const [exportTab, setExportTab] = useState<ExportFormatTab>("json");

  // Selection inspection states for grid tile click triggers
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number; type: GridTile } | null>(null);
  
  // Hover inspection item coordinates
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number; type: GridTile } | null>(null);

  const [copied, setCopied] = useState<string | null>(null);

  // Re-run draft compiler as parameters variables shift
  const handleRegenerate = () => {
    const rawMap = buildProceduralMap({
      width,
      height,
      seed,
      waterAmount,
      forestAmount,
      mountainAmount,
      villageCount,
      resourceDensity,
      monsterDensity,
    });
    onSave(rawMap);
  };

  // Sync initial loading values on changes
  useEffect(() => {
    handleRegenerate();
  }, [width, height, seed, waterAmount, forestAmount, mountainAmount, villageCount, resourceDensity, monsterDensity]);

  // Adjust selectedTile on bounds resize
  useEffect(() => {
    if (selectedTile && (selectedTile.x >= map.width || selectedTile.y >= map.height)) {
      setSelectedTile(null);
    }
  }, [map.width, map.height, selectedTile]);

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 99999));
  };

  const tileNames: Record<GridTile, string> = {
    void: "Void Void",
    grass: "Lush Grass plains",
    sand: "Arid Desert dunes",
    water: "Deep Water shores",
    forest: "Dense Jungle canopy",
    mountain: "Steep Peak heights",
    spawn: "Spawn Point",
    chest: "Hidden Resource Chest",
    village: "Outpost Village Hub",
  };

  const tileColors: Record<GridTile, string> = {
    void: "bg-slate-950",
    grass: "bg-emerald-650 bg-emerald-600 hover:bg-emerald-500 border border-emerald-700/30",
    sand: "bg-amber-100/90 text-amber-850 hover:bg-amber-100 border border-amber-200/30",
    water: "bg-blue-600 hover:bg-blue-500 animate-pulse border border-blue-700/20",
    forest: "bg-emerald-900 border border-emerald-800/80 hover:bg-emerald-800",
    mountain: "bg-slate-500 hover:bg-slate-400 border border-slate-650/40",
    spawn: "bg-amber-500 border-2 border-slate-100 hover:bg-amber-400 font-bold text-slate-900",
    chest: "bg-yellow-500 hover:bg-yellow-400 border border-yellow-600 font-bold text-slate-950",
    village: "bg-indigo-605 bg-indigo-600 hover:bg-indigo-500 border border-indigo-750 font-bold text-slate-100",
  };

  const tileSymbols: Record<GridTile, string> = {
    void: "",
    grass: "•",
    sand: "~",
    water: "≈",
    forest: "▲",
    mountain: "◮",
    spawn: "★",
    chest: "▣",
    village: "▰",
  };

  // Safe manual selection overriding coordinates painting function
  const handleTileTypeOverride = (newType: GridTile) => {
    if (!selectedTile) return;
    const { x, y } = selectedTile;

    const modifiedGrid = map.grid.map((row, rIdx) =>
      row.map((cell, cIdx) => (cIdx === x && rIdx === y ? newType : cell))
    );

    const updatedWorld = {
      ...map,
      grid: modifiedGrid
    };

    onSave(updatedWorld);
    setSelectedTile({ x, y, type: newType });
  };

  // Direct copy feedback command
  const triggerCopyFeedback = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Retrieve deterministic elevation and moisture metrics on the fly
  const getTileMetricsRange = (x: number, y: number) => {
    const elev = perlinNoise2D(x * 0.14, y * 0.14, map.seed, 4, 0.55);
    const moist = perlinNoise2D(x * 0.14, y * 0.14, map.seed + 9999, 3, 0.5);
    
    // Extrapolate dummy local temperature
    let temp = 25 - (elev * 20); // cold in mountains
    if (moist < 0.3) temp += 15; // scorching hot in dried deserts
    
    return {
      elevation: Math.min(100, Math.floor(elev * 100)),
      moisture: Math.min(100, Math.floor(moist * 100)),
      temperature: parseFloat(temp.toFixed(1))
    };
  };

  // Determine which database monsters should tie to specific locations procedurally
  const getMappedMonstersForTile = (type: GridTile): any[] => {
    if (!db.monsters || db.monsters.length === 0) return [];

    return db.monsters.filter((mon: any) => {
      const tags = (mon.tags || []).map((t: string) => t.toLowerCase());
      const element = (mon.element || "none").toLowerCase();
      const threat = (mon.threatLevel || "D");

      switch (type) {
        case "water":
          return element === "water" || tags.includes("water") || tags.includes("sea") || tags.includes("aquatic");
        case "sand":
          return tags.includes("desert") || tags.includes("sand") || element === "fire" || element === "none" || threat === "E";
        case "forest":
          return tags.includes("forest") || tags.includes("common") || tags.includes("nature") || mon.type === "slime";
        case "mountain":
          return tags.includes("mountain") || element === "earth" || element === "fire" || threat === "B" || threat === "A" || threat === "S";
        case "spawn":
        case "village":
        case "grass":
        default:
          return tags.includes("starter") || tags.includes("common") || tags.includes("grass") || threat === "E" || threat === "D";
      }
    });
  };

  // Map database items dynamically to spawn table UI too
  const getMappedItemsForTile = (type: GridTile): any[] => {
    if (!db.items || db.items.length === 0) return [];

    return db.items.filter((itm: any) => {
      const tags = (itm.tags || []).map((t: string) => t.toLowerCase());
      const rarity = (itm.rarity || "common");

      switch (type) {
        case "mountain":
          return itm.type === "weapon" || itm.type === "armor" || tags.includes("iron") || rarity === "rare" || rarity === "epic";
        case "forest":
          return tags.includes("bow") || tags.includes("wood") || tags.includes("herbs") || tags.includes("material");
        case "sand":
          return tags.includes("scout") || tags.includes("cloth") || rarity === "uncommon";
        case "water":
          return itm.type === "consumable" || tags.includes("potion") || rarity === "common";
        default:
          return rarity === "common" || tags.includes("starter");
      }
    });
  };

  // Generate organized Coordinate export formats in actual standard JSON TileMap structure
  const compileJsonLayerData = (): string => {
    const list: any[] = [];
    map.grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        // assign hypothetical atlas coordinates
        let atlasX = 0;
        let atlasY = 0;
        if (cell === "sand") atlasX = 1;
        else if (cell === "water") atlasX = 2;
        else if (cell === "forest") atlasX = 3;
        else if (cell === "mountain") atlasX = 4;
        else if (cell === "spawn") atlasX = 5;
        else if (cell === "chest") atlasX = 6;
        else if (cell === "village") atlasX = 7;

        list.push({
          x,
          y,
          tile_type: cell,
          atlas_coords: [atlasX, atlasY],
          source_id: 0,
          resource_path: `res://data/tiles/${cell}.tres`
        });
      });
    });
    return JSON.stringify(list, null, 2);
  };

  // Compile standard Godot PackedByteArray for high speed reading
  const compilePackedByteArrayString = (): string => {
    const layerCells: string[] = [];
    map.grid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell !== "grass") {
          let atlasIdx = 1;
          if (cell === "water") atlasIdx = 2;
          else if (cell === "forest") atlasIdx = 3;
          else if (cell === "mountain") atlasIdx = 4;
          else if (cell === "village") atlasIdx = 5;
          layerCells.push(`0x${cIdx.toString(16)}, 0x${rIdx.toString(16)}, 0x${atlasIdx.toString(16)}`);
        }
      });
    });
    return `PackedByteArray([\n  ${layerCells.join(", ") || "# No offset vector tiles"}\n])`;
  };

  // Compile high utility copyable GDscript Loader segment
  const compileGdscriptLoader = (): string => {
    return `# Godot 4.x TileMapLayer procedural vector decoder
extends TileMapLayer

# Drag and drop map JSON file directly in resources
@export var world_map_file: JSON

func _ready() -> void:
\tif not world_map_file:
\t\tpush_warning("World map database file unconfigured.")
\t\treturn
\t\t
\tvar payload = world_map_file.data
\tseed(payload.seed)
\tprint("Generating seed " + str(payload.seed) + " map with Perlin noise...")
\t
\tfor cell in payload.layer_data:
\t\tvar coords = Vector2i(cell.x, cell.y)
\t\t# Set cells dynamically matching atlas columns
\t\tset_cell(coords, cell.source_id, Vector2i(cell.atlas_coords[0], cell.atlas_coords[1]))
\t\t
\tprint("Procedural Haven loaded successfully. Placed spawn vector: ", payload.spawn_point)`;
  };

  // Export full map bundle dictionary matching standard Godot assets importers
  const generateFullGodotImporterPacket = () => {
    const exportData = {
      meta: {
        engine: "Godot 4.x",
        class_name: "TileMapLayerDataStore",
        generated_at: new Date().toISOString()
      },
      id: map.id,
      name: map.name,
      width: map.width,
      height: map.height,
      seed: map.seed,
      spawn_point: [map.spawnPoint.x, map.spawnPoint.y],
      water_amount: map.waterAmount,
      forest_amount: map.forestAmount,
      mountain_amount: map.mountainAmount,
      layer_data: JSON.parse(compileJsonLayerData())
    };

    return JSON.stringify(exportData, null, 2);
  };

  const handleDownloadStructuredJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(generateFullGodotImporterPacket());
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `procedural_godot_map_${seed}.json`);
    dlAnchor.click();
  };

  const selectedMetrics = selectedTile ? getTileMetricsRange(selectedTile.x, selectedTile.y) : null;
  const selectedMonstersSpawns = selectedTile ? getMappedMonstersForTile(selectedTile.type) : [];
  const selectedItemsSpawns = selectedTile ? getMappedItemsForTile(selectedTile.type) : [];

  return (
    <div className="space-y-6">
      
      {/* Title & Stats Dashboard HUD element */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4" id="world-banner">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest block">
            Map Generation Control Module
          </span>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} /> Seeded Fractal Terrain Synthesizer
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
             generate infinite, highly stable gaming structures backed by 2D Perlin fractal brownian noise algorithms and map database configurations.
          </p>
        </div>

        {/* Global Statistics Indicators */}
        <div className="flex bg-slate-900 border border-slate-800 p-3 rounded-lg font-mono text-[11px] gap-6" id="world-mesh-hud">
          <div className="space-y-0.5">
            <span className="text-slate-500 block">Total Tiles</span>
            <span className="text-slate-200 font-bold text-sm block">{map.width * map.height} cells</span>
          </div>
          <div className="space-y-0.5 border-l border-slate-800 pl-6">
            <span className="text-slate-500 block">Resources count</span>
            <span className="text-amber-400 font-bold text-sm block">{map.resourcePoints?.length || 0} chests</span>
          </div>
          <div className="space-y-0.5 border-l border-slate-800 pl-6">
            <span className="text-slate-500 block">Active Seed</span>
            <span className="text-indigo-400 font-bold text-sm block">{map.seed}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* Left Side: Generative Map Preview Frame */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="world-preview-panel">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-amber-500" />
                <h3 className="font-sans font-bold text-slate-100 text-xs uppercase tracking-wider">
                  Cellular Grid Preview ({map.width}x{map.height})
                </h3>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800 text-[10px] font-mono text-slate-400">
                <span className="px-1.5">Spawn Point: {map.spawnPoint.x},{map.spawnPoint.y}</span>
              </div>
            </div>

            {/* Grid Container */}
            <div className="w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-3 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-slate-900/40"></div>
              
              {/* Grid drawing matrix */}
              <div
                className="grid gap-[1.5px] w-full h-full relative z-10"
                style={{
                  gridTemplateColumns: `repeat(${map.width}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${map.height}, minmax(0, 1fr))`,
                }}
                id="world-tile-matrix"
              >
                {map.grid.map((row, y) =>
                  row.map((cell, x) => {
                    const isSpawn = map.spawnPoint.x === x && map.spawnPoint.y === y;
                    const displayCell = isSpawn ? ("spawn" as GridTile) : cell;
                    const isSelected = selectedTile?.x === x && selectedTile?.y === y;

                    return (
                      <button
                        key={`${x}-${y}`}
                        onClick={() => setSelectedTile({ x, y, type: displayCell })}
                        onMouseEnter={() => setHoverTile({ x, y, type: displayCell })}
                        onMouseLeave={() => setHoverTile(null)}
                        className={`w-full h-full rounded-[2px] transition-all flex items-center justify-center font-mono select-none relative focus:outline-none focus:ring-1 focus:ring-amber-500 ${tileColors[displayCell]} ${
                          isSelected
                            ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 z-20 scale-105 border border-slate-100 shadow-lg shadow-amber-400/20"
                            : "hover:scale-105 hover:z-10"
                        }`}
                        style={{ aspectRatio: "1/1" }}
                      >
                        <span className="opacity-35 font-bold text-slate-100 text-[9px] sm:text-xs">
                          {tileSymbols[displayCell]}
                        </span>
                        
                        {isSpawn && (
                          <div className="absolute w-2 h-2 rounded-full bg-slate-100 animate-ping opacity-75"></div>
                        )}
                        
                        {isSelected && (
                          <div className="absolute inset-0 border border-white rounded-[2px] animate-pulse"></div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Live Hover Coordinate Bar */}
            <div className="mt-3 bg-slate-950/80 border border-slate-850 px-4 py-2.5 rounded-lg flex justify-between items-center text-xs font-mono">
              <span className="text-slate-500">Live grid coordinates reader:</span>
              {hoverTile ? (
                <span className="text-slate-200 capitalize font-semibold flex items-center gap-1.5 animate-pulse">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  X: {hoverTile.x}, Y: {hoverTile.y} • <span className="text-amber-400 font-bold">{tileNames[hoverTile.type]}</span>
                </span>
              ) : selectedTile ? (
                <span className="text-slate-200 capitalize font-bold flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
                  Selected Tile: X: {selectedTile.x}, Y: {selectedTile.y} • <span className="text-emerald-400">{tileNames[selectedTile.type]}</span>
                </span>
              ) : (
                <span className="text-slate-600 italic">Click tile on grid for complete simulation info</span>
              )}
            </div>

            {/* Legend row */}
            <div className="mt-4 p-3 bg-slate-950/40 rounded-lg border border-slate-850 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[10px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600 border border-blue-700/20"></span> Water (≈) [Moist]</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700/30"></span> Grass (•) [Temperate]</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-900 border border-emerald-800"></span> Forest (▲) [Jungle]</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-500 border border-slate-650/40"></span> Mountain (◮) [Cold]</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-105 bg-amber-100 border border-amber-200/30"></span> Desert (~) [Dry]</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-550 bg-amber-500"></span> Spawn Point (★)</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500"></span> Resource (▣) [Mine]</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600"></span> Village Outpost (▰)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleDownloadStructuredJson}
              className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow"
              id="world-download-json-btn"
            >
              <Download className="w-3.5 h-3.5" /> Export Map JSON (.json)
            </button>
            <button
              onClick={() => {
                setSelectedTile(null);
                handleRegenerate();
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Force Regenerate Noise
            </button>
          </div>
        </div>

        {/* Right Side: Options Adjustments */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Tab Selector layout */}
          <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex gap-1">
            <button
              onClick={() => setRightTab("settings")}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                rightTab === "settings"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Settings
            </button>

            <button
              onClick={() => setRightTab("inspector")}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative ${
                rightTab === "inspector"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" /> Inspector
              {selectedTile && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setRightTab("exporter")}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                rightTab === "exporter"
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Export Data
            </button>
          </div>

          {/* VIEW TAB A: SLIDERS & PARAMETERS MAP COMPILER */}
          {rightTab === "settings" && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6" id="world-sliders-panel">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  Procedural Values Config
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleRandomizeSeed}
                    className="bg-slate-800 text-slate-300 hover:bg-slate-750 px-2 py-1 text-[11px] font-mono rounded border border-slate-700 flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-500" /> Auto-Seed
                  </button>
                </div>
              </div>

              {/* Seed slider row */}
              <div className="grid grid-cols-2 gap-4 font-mono text-xs text-slate-400">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1">Canvas Grid Size</label>
                  <select
                    value={width}
                    onChange={(e) => {
                      const size = parseInt(e.target.value);
                      setWidth(size);
                      setHeight(size);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-2 text-xs text-center focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                  >
                    <option value={12}>12 x 12 (Chunk size)</option>
                    <option value={16}>16 x 16 (Standard)</option>
                    <option value={20}>20 x 20 (Expanded Field)</option>
                    <option value={24}>24 x 24 (Maximum Space)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block mb-1">Interactive Seed</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 2026)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-bold rounded p-2 text-xs text-center focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Slider variables mapping */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Water Level Cutoff
                    </span>
                    <span className="text-blue-400 font-bold">{waterAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(parseInt(e.target.value))}
                    className="w-full accent-blue-500 bg-slate-950 h-1 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span> Jungle Density Coverage
                    </span>
                    <span className="text-emerald-500 font-bold">{forestAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={forestAmount}
                    onChange={(e) => setForestAmount(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-950 h-1 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Mountain Rock Peaks
                    </span>
                    <span className="text-slate-400 font-bold">{mountainAmount}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={mountainAmount}
                    onChange={(e) => setMountainAmount(parseInt(e.target.value))}
                    className="w-full accent-slate-500 bg-slate-950 h-1 rounded"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5 border-t border-slate-800/60 pt-4">
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1 text-center">Villages Count</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={villageCount}
                      onChange={(e) => setVillageCount(Math.min(10, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono text-center rounded py-1.5 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1 text-center">Resource Items</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={resourceDensity}
                      onChange={(e) => setResourceDensity(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono text-center rounded py-1.5 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1 text-center">Spawn Density</label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={monsterDensity}
                      onChange={(e) => setMonsterDensity(Math.min(45, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono text-center rounded py-1.5 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB B: DETAILED COORDINATES INSPECTOR */}
          {rightTab === "inspector" && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5" id="world-inspector-panel">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-emerald-500" />
                  Tactical Cell Inspector
                </h3>
              </div>

              {selectedTile && selectedMetrics ? (
                <div className="space-y-5">
                  
                  {/* Selected summary */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                          Coordinates Zone
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-100 font-mono">
                          X: {selectedTile.x}, Y: {selectedTile.y}
                        </h4>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 font-mono font-bold rounded-lg border uppercase shadow-sm ${
                        selectedTile.type === "water" ? "bg-blue-900/20 text-blue-400 border-blue-500/22" :
                        selectedTile.type === "sand" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        selectedTile.type === "forest" ? "bg-emerald-555/10 bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        selectedTile.type === "mountain" ? "bg-slate-500/10 text-slate-350 border-slate-500/20" :
                        "bg-emerald-950/20 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {selectedTile.type}
                      </span>
                    </div>

                    {/* Extrapolated metrics panel info */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-3">
                      <div className="space-y-0.5">
                        <span className="text-slate-600 block">Elevation</span>
                        <span className="text-white font-bold block">{selectedMetrics.elevation}%</span>
                      </div>
                      <div className="space-y-0.5 border-l border-slate-900 pl-2">
                        <span className="text-slate-600 block">Moisture</span>
                        <span className="text-white font-bold block">{selectedMetrics.moisture}%</span>
                      </div>
                      <div className="space-y-0.5 border-l border-slate-900 pl-2">
                        <span className="text-slate-600 block">Climate temp</span>
                        <span className="text-white font-bold block">{selectedMetrics.temperature}°C</span>
                      </div>
                    </div>
                  </div>

                  {/* Manual coordinates overrider painting layout */}
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850/60 space-y-2.5">
                    <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                       Manual Terrain Overrider (Painter)
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                      {(["grass", "sand", "water", "forest", "mountain", "chest", "village"] as GridTile[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTileTypeOverride(type)}
                          className={`px-2 py-1 rounded text-[10px] font-mono capitalize border transition-all ${
                            selectedTile.type === type
                              ? "bg-amber-500 border-transparent text-slate-950 font-bold"
                              : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic monsters spawns table list */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Skull className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                        Connected Biome Monster Spawns ({selectedMonstersSpawns.length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {selectedMonstersSpawns.length > 0 ? (
                        selectedMonstersSpawns.map((mon) => (
                          <div
                            key={mon.id}
                            className="p-2.5 bg-slate-950 rounded-lg border border-slate-850/60 flex items-center justify-between font-mono text-xs hover:border-slate-800 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" style={{ backgroundColor: mon.color }}></span>
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-200">{mon.name}</span>
                                <span className="text-[9px] bg-slate-900 text-slate-500 px-1 py-0.2 rounded border border-slate-800 uppercase block w-max">
                                  {mon.type}
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-[10px]">
                              <span className="text-amber-400 font-bold block">{mon.threatLevel} Rating</span>
                              <span className="text-slate-500 block">HP: {mon.stats?.hp} • SP: {mon.stats?.speed}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-slate-950/20 text-center text-[10.5px] italic text-slate-600 border border-slate-850/40 rounded">
                          No active monster records match this tile biome tags. Match on monsters DB.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic matching items drops */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Gem className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                        Associated Drops & Resources ({selectedItemsSpawns.length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedItemsSpawns.length > 0 ? (
                        selectedItemsSpawns.map((itm) => (
                          <div
                            key={itm.id}
                            className="p-2 bg-slate-950 rounded-lg border border-slate-850/60 flex items-center justify-between font-mono text-xs hover:border-slate-800 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-bold" style={{ color: itm.color }}>
                                {itm.iconShape === "sword" ? "⚔" : itm.iconShape === "shield" ? "⛨" : "◈"}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-200">{itm.name}</span>
                                <span className="text-[9.5px] uppercase tracking-wider block" style={{ color: itm.color }}>
                                  {itm.rarity}
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-[9.5px] text-slate-500">
                              <span>Value: {itm.stats?.value}g</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-slate-950/20 text-center text-[10.5px] italic text-slate-600 border border-slate-850/40 rounded">
                          No specific lore items mapped here.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                  <Crosshair className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <p className="text-slate-350 font-sans font-bold text-xs">
                      No Active Coordinate Selected
                    </p>
                    <p className="text-[10.5px] font-sans text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Click directly on any grid tile vector coordinate in the 2D grid above to review elevations, active monster tables, drops, and climates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW TAB C: GODOT COORDINATE EXPORTER PANELS */}
          {rightTab === "exporter" && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4" id="world-exporter-panel">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="font-sans font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-500" />
                  TileMapLayer Exporter
                </h3>
              </div>

              {/* Sub tabs selectors */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-[10.5px] font-mono">
                <button
                  onClick={() => setExportTab("json")}
                  className={`flex-1 py-1 rounded transition-all font-bold ${
                    exportTab === "json"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-450 hover:text-slate-200"
                  }`}
                >
                  Standard JSON
                </button>
                <button
                  onClick={() => setExportTab("gdscript")}
                  className={`flex-1 py-1 rounded transition-all font-bold ${
                    exportTab === "gdscript"
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-450 hover:text-slate-200"
                  }`}
                >
                  GDScript Loader
                </button>
                <button
                  onClick={() => setExportTab("packed")}
                  className={`flex-1 py-1 rounded transition-all font-bold ${
                    exportTab === "packed"
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-450 hover:text-slate-200"
                  }`}
                >
                  Packed Cell Vector
                </button>
              </div>

              {/* EXPORT DISPLAY TILES */}
              {exportTab === "json" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                       Importable Coordinates Database
                    </span>
                    <button
                      onClick={() => triggerCopyFeedback("json", generateFullGodotImporterPacket())}
                      className="text-[10px] bg-slate-950 hover:bg-slate-850 px-2.5 py-1 text-slate-300 font-mono rounded border border-slate-800 flex items-center gap-1 transition-all"
                    >
                      {copied === "json" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Output
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto select-all max-h-64 leading-relaxed">
                    <pre>{generateFullGodotImporterPacket()}</pre>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Exports metadata and 2D arrays containing tile labels and coordinate matrices for standard client deserialize calls!
                  </p>
                </div>
              )}

              {exportTab === "gdscript" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                      GDScript 4.x Importer Code
                    </span>
                    <button
                      onClick={() => triggerCopyFeedback("gd", compileGdscriptLoader())}
                      className="text-[10px] bg-slate-950 hover:bg-slate-850 px-2.5 py-1 text-slate-300 font-mono rounded border border-slate-800 flex items-center gap-1 transition-all"
                    >
                      {copied === "gd" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto select-all max-h-64 leading-relaxed">
                    <pre>{compileGdscriptLoader()}</pre>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Construct coordinates dynamically on your TileMap layers inside your Godot project with this ready-to-test GDScript snippet!
                  </p>
                </div>
              )}

              {exportTab === "packed" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                      Godot Pattern PackedByteArray Representation
                    </span>
                    <button
                      onClick={() => triggerCopyFeedback("packed", compilePackedByteArrayString())}
                      className="text-[10px] bg-slate-950 hover:bg-slate-850 px-2.5 py-1 text-slate-300 font-mono rounded border border-slate-800 flex items-center gap-1 transition-all"
                    >
                      {copied === "packed" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Byte Array
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 overflow-x-auto select-all max-h-64 leading-relaxed">
                    <pre>{compilePackedByteArrayString()}</pre>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    This compresses position vectors and map layers tile coordinates indexes into hex segments list for high speed asset parsing layers.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
