/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ProjectDb } from "../types";
import {
  Users,
  Skull,
  Feather,
  Map,
  BookOpen,
  ArrowRight,
  Database,
  Terminal,
  HelpCircle,
  TrendingUp,
  Flame,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface DashboardProps {
  db: ProjectDb;
  projectName: string;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ db, projectName, setActiveTab }: DashboardProps) {
  const [showGuide, setShowGuide] = useState(true);

  // Calculate dynamic statistics
  const stats = [
    { label: "Characters", count: db.characters.length, icon: Users, tab: "char-builder", color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Monsters", count: db.monsters.length, icon: Skull, tab: "monster-builder", color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Items & Gear", count: db.items.length, icon: Feather, tab: "item-builder", color: "text-sky-400", bg: "bg-sky-400/10" },
    { label: "World Maps", count: db.maps.length, icon: Map, tab: "world-builder", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Upper Welcome Header */}
      <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800" id="dash-banner">
        <div>
          <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest block mb-1">
            Active Workspace
          </span>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Greetings, Developer
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            You are drafting content databases, procedures, and sheets for project{" "}
            <span className="text-amber-400 font-mono font-semibold">"{projectName}"</span>. 
            All changes are securely retained in local browser storage.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-right">
          <div className="bg-slate-900 border border-slate-800/80 px-4 py-2.5 rounded-lg">
            <span className="text-[10px] font-mono text-slate-500 block">DB ENGINE</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">LOCAL_STORAGE</span>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 px-4 py-2.5 rounded-lg">
            <span className="text-[10px] font-mono text-slate-500 block">COMPATIBILITY</span>
            <span className="text-xs font-mono text-amber-500 font-bold">GODOT 4.X</span>
          </div>
        </div>
      </div>

      {/* Grid Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dash-stats">
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <button
              key={st.label}
              onClick={() => setActiveTab(st.tab)}
              className="bg-slate-900 hover:bg-slate-800/60 transition-all border border-slate-800 p-5 rounded-xl text-left focus:outline-none focus:ring-1 focus:ring-amber-500 group"
              id={`dash-stat-${st.label.toLowerCase()}`}
            >
              <div className="flex justify-between items-center">
                <div className={`${st.bg} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${st.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-mono font-bold text-slate-100">{st.count}</span>
                <p className="text-xs text-slate-500 mt-1 font-medium">{st.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Collapsible Integration Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl" id="dash-guide-panel">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex justify-between items-center px-6 py-4 border-b border-slate-800 text-left hover:bg-slate-800/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-sans font-bold text-slate-100 text-sm">
              Pro Godot 4.x Workflow Guide (Highly Recommended)
            </h3>
          </div>
          {showGuide ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showGuide && (
          <div className="p-6 space-y-4 text-sm text-slate-300">
            <p>
              This app is tailored to save weeks of custom engine setup. You can formulate layout sheets, characters, XML datasets, 
              and maps.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-amber-500 font-bold block mb-2">1. DESIGN & EDIT</span>
                Draft characters with parts, map out monsters inside XML formats, and procedurally render worlds with customized density curves.
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-sky-400 font-bold block mb-2">2. EXPORT PACK</span>
                Generate the Godot Data Pack inside the <span className="text-slate-100 bg-slate-800 px-1 rounded">Export Center</span>. It configures the full recursive <code className="text-slate-100">res://</code> skeleton!
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-2">3. LOAD IN GODOT</span>
                Import the loaded script singles into your project autoloads. It parses characters, behaviors, and biomes into native dictionaries instantly.
              </div>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-lg border border-slate-800/80 flex gap-3">
              <Terminal className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 block mb-1">
                  GDScript Sample Load Workflow:
                </span>
                <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto bg-slate-950 p-2.5 rounded border border-slate-900">
{`# Instantiate your Character database anywhere
var hero_hp = DataLoader.characters["char_001"]["hp"]
print("Resolved Spawn Hero: HP = ", hero_hp)`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Core Content Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Active Hero Setup Details */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="dash-preview-character">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="font-sans font-bold text-slate-100 text-sm uppercase tracking-wide">
                Latest Character Record
              </h3>
            </div>
            {db.characters.length > 0 ? (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60 flex items-center gap-4">
                {/* Micro preview mock */}
                <div className="w-16 h-16 rounded bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent"></div>
                  <Users className="w-7 h-7 text-amber-500/70" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100">{db.characters[0].name}</h4>
                  <p className="text-xs text-slate-400 capitalize">
                    {db.characters[0].race} • {db.characters[0].job}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {db.characters[0].tags.slice(0, 3).map((tg) => (
                      <span key={tg} className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No characters configured yet.</p>
            )}
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Define visual states of head, accessory, clothes, and colors. Then render high-fidelity PNG frames and atlas sheet setups.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("char-builder")}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            Open Character Builder <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Active Map Simulation Details */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="dash-preview-world">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <h3 className="font-sans font-bold text-slate-100 text-sm uppercase tracking-wide">
                Current World Dimensions
              </h3>
            </div>
            {db.maps.length > 0 ? (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/60">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-100 text-sm">{db.maps[0].name}</span>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">{db.maps[0].width}x{db.maps[0].height} Grid</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>• Seed: <span className="text-slate-200">{db.maps[0].seed}</span></div>
                  <div>• Water: <span className="text-slate-200">{db.maps[0].waterAmount}%</span></div>
                  <div>• Forests: <span className="text-slate-200">{db.maps[0].forestAmount}%</span></div>
                  <div>• Mountains: <span className="text-slate-200">{db.maps[0].mountainAmount}%</span></div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs">No active map generated yet.</p>
            )}
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Setup tile sizes, monster density curves, resource zones, and seed maps to output full TileMapLayer cellular datasets.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("world-builder")}
            className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            Configure World Generator <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
