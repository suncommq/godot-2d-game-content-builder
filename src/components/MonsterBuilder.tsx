/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Monster } from "../types";
import {
  Skull,
  Flame,
  ShieldAlert,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Sparkle,
  Dna,
  Heart,
  Sword,
  Zap,
  Eye,
  CheckCircle2
} from "lucide-react";

interface MonsterBuilderProps {
  monsters: Monster[];
  onSave: (monster: Monster) => void;
}

export default function MonsterBuilder({ monsters, onSave }: MonsterBuilderProps) {
  const [id, setId] = useState("mon_new");
  const [name, setName] = useState("Desert Claw beast");
  const [type, setType] = useState("beast");
  const [description, setDescription] = useState("An ancient predator carrying sharp sand-spikes and heavy heat-plating.");
  const [threatLevel, setThreatLevel] = useState<"E" | "D" | "C" | "B" | "A" | "S">("B");
  const [element, setElement] = useState<any>("earth");
  const [visualType, setVisualType] = useState<"beast" | "slime" | "golem" | "demon">("beast");
  const [color, setColor] = useState("#ca8a04");
  const [tags, setTags] = useState<string>("beast,desert,spiked");

  const [stats, setStats] = useState({
    hp: 150,
    speed: 90,
    attack: 24,
    defense: 14,
  });

  const [notif, setNotif] = useState<string | null>(null);

  // Load selected preset from lists
  const handleLoad = (mon: Monster) => {
    setId(mon.id);
    setName(mon.name);
    setType(mon.type);
    setDescription(mon.description);
    setThreatLevel(mon.threatLevel);
    setElement(mon.element);
    setVisualType(mon.visualType);
    setColor(mon.color);
    setTags(mon.tags.join(","));
    setStats({ ...mon.stats });
    setNotif(`Loaded profile: ${mon.name}`);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleReset = () => {
    setId("mon_new");
    setName("Crimson Fiend");
    setType("demon");
    setDescription("A quick, dangerous predator of deep volcanic tunnels.");
    setThreatLevel("A");
    setElement("fire");
    setVisualType("demon");
    setColor("#dc2626");
    setTags("demon,volcano,fast");
    setStats({ hp: 120, speed: 130, attack: 35, defense: 10 });
  };

  const handleSave = () => {
    const freshMonster: Monster = {
      id: id === "mon_new" ? `mon_${Date.now()}` : id,
      name,
      type,
      description,
      stats,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      element,
      threatLevel,
      visualType,
      color,
    };
    onSave(freshMonster);
    setNotif(`Saved monster "${name}" to project databases!`);
    setTimeout(() => setNotif(null), 3000);
  };

  // Inline SVG procedural builder for different shapes
  const renderMonsterSvg = () => {
    let shapeG = "";

    switch (visualType) {
      case "slime":
        shapeG = `
          <!-- Slime layer -->
          <path d="M 15,70 C 15,35 35,25 50,25 C 65,25 85,35 85,70 C 85,82 78,85 50,85 C 22,85 15,82 15,70 Z" fill="${color}" stroke="#111827" stroke-width="3"/>
          <ellipse cx="38" cy="55" rx="5" ry="5" fill="#f8fafc" stroke="#111827" stroke-width="1.5"/>
          <ellipse cx="62" cy="55" rx="5" ry="5" fill="#f8fafc" stroke="#111827" stroke-width="1.5"/>
          <ellipse cx="40" cy="56" rx="2" ry="2" fill="#111827"/>
          <ellipse cx="60" cy="56" rx="2" ry="2" fill="#111827"/>
          <path d="M 45,68 Q 50,72 55,68" stroke="#111827" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        `;
        break;
      case "golem":
        shapeG = `
          <!-- Golem layer -->
          <rect x="25" y="35" width="50" height="45" rx="4" fill="${color}" stroke="#111827" stroke-width="3"/>
          <rect x="35" y="20" width="30" height="15" rx="2" fill="${color}" stroke="#111827" stroke-width="3"/>
          <rect x="12" y="38" width="10" height="35" rx="2" fill="${color}" stroke="#111827" stroke-width="3"/>
          <rect x="78" y="38" width="10" height="35" rx="2" fill="${color}" stroke="#111827" stroke-width="3"/>
          <circle cx="42" cy="28" r="3" fill="#38bdf8"/>
          <circle cx="58" cy="28" r="3" fill="#38bdf8"/>
          <!-- Rock plates -->
          <line x1="30" y1="50" x2="45" y2="50" stroke="#111827" stroke-width="2"/>
          <line x1="55" y1="65" x2="70" y2="65" stroke="#111827" stroke-width="2"/>
        `;
        break;
      case "demon":
        shapeG = `
          <!-- Demon layer -->
          <path d="M 30,75 C 30,35 40,25 50,25 C 60,25 70,35 70,75 Z" fill="${color}" stroke="#111827" stroke-width="3"/>
          <polygon points="26,24 35,32 24,35" fill="#f43f5e" stroke="#111827" stroke-width="2"/>
          <polygon points="74,24 65,32 76,35" fill="#f43f5e" stroke="#111827" stroke-width="2"/>
          <circle cx="40" cy="45" r="4.5" fill="#e11d48"/>
          <circle cx="60" cy="45" r="4.5" fill="#e11d48"/>
          <path d="M 35,55 L 43,58 L 50,55 L 57,58 L 65,55" stroke="#111827" stroke-width="2" fill="none"/>
          <polygon points="45,65 50,72 55,65" fill="#111827"/>
        `;
        break;
      case "beast":
      default:
        shapeG = `
          <!-- Beast layer -->
          <circle cx="50" cy="50" r="30" fill="${color}" stroke="#111827" stroke-width="3"/>
          <!-- Spikes -->
          <polygon points="20,50 10,40 25,35" fill="#111827"/>
          <polygon points="80,50 90,40 75,35" fill="#111827"/>
          <polygon points="50,20 50,5 58,15" fill="#f59e0b" stroke="#111827" stroke-width="2"/>
          <!-- Big single cyclops eye/angry slits -->
          <circle cx="50" cy="45" r="12" fill="#ffffff" stroke="#111827" stroke-width="2"/>
          <circle cx="50" cy="45" r="5" fill="#ef4444"/>
          <path d="M 38,32 Q 50,40 62,32" stroke="#111827" stroke-width="3" fill="none"/>
          <path d="M 40,65 Q 50,72 60,65" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round"/>
        `;
        break;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <!-- Ambient floor footprint -->
        <ellipse cx="50" cy="85" rx="26" ry="6" fill="#111827" opacity="0.3"/>
        <g>
          ${shapeG}
        </g>
      </svg>
    `;
  };

  const threatColors = {
    E: "bg-emerald-500/10 border-emerald-500 text-emerald-400",
    D: "bg-sky-500/10 border-sky-500 text-sky-400",
    C: "bg-blue-500/10 border-blue-500 text-blue-400",
    B: "bg-amber-500/10 border-amber-500 text-amber-400",
    A: "bg-orange-500/10 border-orange-500 text-orange-400",
    S: "bg-red-500/10 border-red-500 text-red-500 animate-pulse font-bold"
  };

  return (
    <div className="space-y-6">
      {notif && (
        <div className="bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 animate-bounce shadow" id="mon-notif">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column - Visual synthesizer & presets */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="mon-visualiser-box">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">
              Synthesized Anatomy Preview
            </span>

            <div className="w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25"></div>
              
              <div
                className="w-48 h-48 relative z-10 transition-transform duration-300"
                dangerouslySetInnerHTML={{ __html: renderMonsterSvg() }}
              />

              {/* Threat Indicator Badging */}
              <div className={`absolute top-3 left-3 px-2 py-0.5 border text-xs font-mono rounded ${threatColors[threatLevel]}`}>
                Class {threatLevel}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                Visual Body Shape
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                {(["beast", "slime", "golem", "demon"] as const).map((vt) => (
                  <button
                    key={vt}
                    onClick={() => setVisualType(vt)}
                    className={`py-1 rounded text-center border capitalize transition-all ${
                      visualType === vt
                        ? "bg-amber-500/10 border-amber-500 text-amber-500 font-bold"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preset monster profile switchers */}
          <div className="mt-6 pt-5 border-t border-slate-800/60 p-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
              Monster DB Presets
            </span>
            <div className="flex flex-col gap-1">
              {monsters.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleLoad(m)}
                  className="w-full text-left bg-slate-950/40 hover:bg-slate-800 border border-slate-800/60 px-3 py-2 rounded text-xs text-slate-300 font-mono transition-all flex justify-between items-center"
                >
                  <span className="truncate">{m.name}</span>
                  <span className="text-[10px] bg-slate-800 px-1 text-amber-400 rounded">
                    {m.threatLevel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Configuration inputs */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-sans font-bold text-slate-200 text-sm flex items-center gap-2">
              <Dna className="w-4 h-4 text-amber-500" />
              Genetic Parameters & Stats
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="bg-slate-800 text-slate-300 hover:bg-slate-750 px-2.5 py-1 text-xs font-mono rounded border border-slate-700 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 px-3 py-1 text-xs font-mono font-bold rounded flex items-center gap-1.5 shadow"
              >
                <Save className="w-3.5 h-3.5" /> Sync to DB
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Monster Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Internal Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded p-2 text-xs"
              >
                <option value="beast">Beast</option>
                <option value="slime">Slime</option>
                <option value="demon">Demon</option>
                <option value="undead">Undead</option>
                <option value="golem">Stone golem</option>
                <option value="dragon">Winged Drake</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Elemental Affinity</label>
              <select
                value={element}
                onChange={(e) => setElement(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded p-2 text-xs"
              >
                <option value="none">None</option>
                <option value="fire">Fire 🔥</option>
                <option value="water">Water 💧</option>
                <option value="earth">Earth ⛰️</option>
                <option value="wind">Wind 💨</option>
                <option value="dark">Dark ☠️</option>
                <option value="light">Light ✨</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Threat Class</label>
              <div className="flex gap-1.5">
                {(["E", "D", "C", "B", "A", "S"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setThreatLevel(lvl)}
                    className={`flex-1 py-1 text-xs font-mono font-bold border rounded transition-all ${
                      threatLevel === lvl
                        ? "bg-amber-500 text-slate-950 border-amber-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Anatomy Tint</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-7 border-0 rounded cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs rounded p-1"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Monster Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-2 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Combat Statistics Grid of Monster */}
          <div className="border-t border-slate-800/60 pt-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-3">
              Entity Battle stats
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800/60 p-3.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold font-mono uppercase mb-2">
                  <Heart className="w-3.5 h-3.5" />
                  Health (HP)
                </div>
                <input
                  type="number"
                  value={stats.hp}
                  onChange={(e) => setStats({ ...stats, hp: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="bg-slate-950 border border-slate-800/60 p-3.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold font-mono uppercase mb-2">
                  <Sword className="w-3.5 h-3.5" />
                  Mighty (ATK)
                </div>
                <input
                  type="number"
                  value={stats.attack}
                  onChange={(e) => setStats({ ...stats, attack: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="bg-slate-950 border border-slate-800/60 p-3.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-blue-500 text-xs font-bold font-mono uppercase mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  Plates (DEF)
                </div>
                <input
                  type="number"
                  value={stats.defense}
                  onChange={(e) => setStats({ ...stats, defense: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="bg-slate-950 border border-slate-800/60 p-3.5 rounded-lg">
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold font-mono uppercase mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  Agility (SPD)
                </div>
                <input
                  type="number"
                  value={stats.speed}
                  onChange={(e) => setStats({ ...stats, speed: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Tags (Comma Sep)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 font-mono rounded p-2 text-xs"
                placeholder="eg. desert, volcanic, fire"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full bg-slate-950/60 border border-slate-800/50 p-2.5 rounded-lg flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Sparkle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Synchronizing updates feeds automatically into XML loaders exports.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
