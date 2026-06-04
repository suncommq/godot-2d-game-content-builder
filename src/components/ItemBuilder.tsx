/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Item } from "../types";
import {
  Feather,
  Coins,
  Shield,
  Briefcase,
  Layers,
  Save,
  RotateCcw,
  Sparkles,
  Trophy,
  Hammer,
  Scale,
  Compass,
  CheckCircle2,
  Bookmark
} from "lucide-react";

interface ItemBuilderProps {
  items: Item[];
  onSave: (item: Item) => void;
}

export default function ItemBuilder({ items, onSave }: ItemBuilderProps) {
  const [id, setId] = useState("item_new");
  const [name, setName] = useState("Iron Greatsword");
  const [type, setType] = useState<"weapon" | "armor" | "consumable" | "material" | "quest">("weapon");
  const [description, setDescription] = useState("A heavy steel sword designed for breaking defensive lines.");
  const [rarity, setRarity] = useState<"common" | "uncommon" | "rare" | "epic" | "legendary">("common");
  const [iconShape, setIconShape] = useState<"sword" | "shield" | "potion" | "ring" | "gem">("sword");
  const [color, setColor] = useState("#9ca3af");
  const [tags, setTags] = useState<string>("iron,sword,heavy,melee");

  // Stats
  const [value, setValue] = useState(150);
  const [weight, setWeight] = useState(6.5);
  const [power, setPower] = useState(25); // damage for weapons, protection for armors
  const [durability, setDurability] = useState(120);

  const [notif, setNotif] = useState<string | null>(null);

  const rarityStyles = {
    common: "border-slate-700 hover:border-slate-500 text-slate-350 bg-slate-900/60",
    uncommon: "border-emerald-800 hover:border-emerald-600 text-emerald-400 bg-emerald-950/20",
    rare: "border-sky-850 hover:border-sky-600 text-sky-450 bg-sky-950/20",
    epic: "border-purple-850 hover:border-purple-600 text-purple-400 bg-purple-950/20",
    legendary: "border-amber-700 hover:border-amber-500 text-amber-500 bg-amber-950/20 animate-pulse font-semibold"
  };

  const handleLoad = (it: Item) => {
    setId(it.id);
    setName(it.name);
    setType(it.type);
    setDescription(it.description);
    setRarity(it.rarity);
    setIconShape(it.iconShape);
    setColor(it.color);
    setTags(it.tags.join(","));
    setValue(it.stats.value);
    setWeight(it.stats.weight);
    setPower(it.stats.power || 0);
    setDurability(it.stats.durability || 100);
    setNotif(`Loaded gear profile: ${it.name}`);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleReset = () => {
    setId("item_new");
    setName("Gold Ruby Ring");
    setType("material");
    setDescription("An ornate finger band holding a warm glowing gem.");
    setRarity("rare");
    setIconShape("ring");
    setColor("#dc2626");
    setTags("gold,ring,accessory,luck");
    setValue(450);
    setWeight(0.1);
    setPower(5);
    setDurability(100);
  };

  const handleSave = () => {
    const freshItem: Item = {
      id: id === "item_new" ? `item_${Date.now()}` : id,
      name,
      type,
      description,
      stats: {
        value,
        weight,
        power,
        durability,
      },
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      rarity,
      iconShape,
      color,
    };
    onSave(freshItem);
    setNotif(`Saved gear database entry for "${name}"!`);
    setTimeout(() => setNotif(null), 3000);
  };

  // Inline SVG procedural builder for different icon shapes
  const renderIconSvg = () => {
    let iconContent = "";
    switch (iconShape) {
      case "shield":
        iconContent = `
          <!-- Shield Vector -->
          <path d="M 25,20 L 75,20 C 75,20 75,60 50,85 C 25,60 25,20 25,20 Z" fill="${color}" stroke="#111827" stroke-width="4"/>
          <path d="M 50,20 L 50,85" stroke="#111827" stroke-width="2.5"/>
          <polygon points="50,32 58,45 42,45" fill="#f59e0b" stroke="#111827" stroke-width="1.5"/>
        `;
        break;
      case "potion":
        iconContent = `
          <!-- Flask Vector -->
          <rect x="42" y="15" width="16" height="15" rx="1" fill="#e2e8f0" stroke="#111827" stroke-width="4"/>
          <path d="M 30,42 C 30,30 40,30 42,30 L 58,30 C 60,30 70,30 70,42 L 66,75 C 66,80 58,85 50,85 C 42,85 34,80 34,75 Z" fill="${color}" stroke="#111827" stroke-width="4"/>
          <ellipse cx="50" cy="55" rx="14" ry="4" fill="#ffffff" opacity="0.4"/>
          <rect x="44" y="24" width="12" height="4" fill="#d97706" rx="0.5"/>
        `;
        break;
      case "ring":
        iconContent = `
          <!-- Ring Vector -->
          <circle cx="50" cy="55" r="22" fill="none" stroke="${color}" stroke-width="8"/>
          <circle cx="50" cy="55" r="22" fill="none" stroke="#111827" stroke-width="2"/>
          <polygon points="42,30 50,15 58,30" fill="#38bdf8" stroke="#111827" stroke-width="2.5"/>
          <circle cx="50" cy="24" r="3.5" fill="#ffffff"/>
        `;
        break;
      case "gem":
        iconContent = `
          <!-- Gem Diamond Vector -->
          <polygon points="50,15 75,35 50,85 25,35" fill="${color}" stroke="#111827" stroke-width="4"/>
          <polygon points="50,15 62,35 50,85 38,35" fill="none" stroke="#111827" stroke-width="2"/>
          <line x1="25" y1="35" x2="75" y2="35" stroke="#111827" stroke-width="2"/>
        `;
        break;
      case "sword":
      default:
        iconContent = `
          <!-- Sword Vector -->
          <path d="M 68,22 L 80,34 L 50,64 L 44,58 Z" fill="${color}" stroke="#111827" stroke-width="3"/>
          <polygon points="76,16 84,24 80,28 72,20" fill="#f8fafc" stroke="#111827" stroke-width="2"/>
          <line x1="32" y1="70" x2="46" y2="56" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
          <circle cx="28" cy="74" r="5" fill="#f59e0b" stroke="#111827" stroke-width="2"/>
        `;
        break;
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="10" y="10" width="80" height="80" rx="8" fill="#020617" stroke="#111827" stroke-width="3"/>
        <g>
          ${iconContent}
        </g>
      </svg>
    `;
  };

  const textRarityColors = {
    common: "text-slate-400 capitalize",
    uncommon: "text-emerald-400 capitalize font-medium",
    rare: "text-sky-400 capitalize font-medium",
    epic: "text-purple-400 capitalize font-medium",
    legendary: "text-amber-500 capitalize font-bold"
  };

  return (
    <div className="space-y-6">
      {notif && (
        <div className="bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 animate-bounce shadow" id="item-notif">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col - Graphic visual tool */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="item-visual-box">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">
              Item Shader Icon Preview
            </span>

            <div className="w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:20px_20px] opacity-25"></div>

              <div
                className="w-40 h-40 relative z-10 transition-transform duration-200"
                dangerouslySetInnerHTML={{ __html: renderIconSvg() }}
              />

              {/* Rarity absolute badging */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-mono tracking-wider">
                Rarity: <span className={textRarityColors[rarity]}>{rarity}</span>
              </div>
            </div>

            {/* Icon shape selection */}
            <div className="mt-4">
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
                Icon Template Shape
              </label>
              <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                {(["sword", "shield", "potion", "ring", "gem"] as const).map((sh) => (
                  <button
                    key={sh}
                    onClick={() => setIconShape(sh)}
                    className={`py-1 rounded text-center border capitalize transition-all ${
                      iconShape === sh
                        ? "bg-amber-500/15 border-amber-500 text-amber-500 font-bold"
                        : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick presets loaders */}
          <div className="mt-6 pt-5 border-t border-slate-800/60 font-mono">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
              Item DB Presets
            </span>
            <div className="flex flex-col gap-1">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => handleLoad(it)}
                  className="w-full text-left bg-slate-950/40 hover:bg-slate-800 border border-slate-800/50 px-3 py-1.5 rounded text-xs text-slate-300 transition-all flex justify-between items-center"
                >
                  <span className="truncate">{it.name}</span>
                  <span className={`text-[9px] uppercase px-1 rounded bg-slate-800 ` + textRarityColors[it.rarity]}>
                    {it.rarity.substring(0, 4)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col - Settings panel */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-sans font-bold text-slate-200 text-sm flex items-center gap-2">
              <Hammer className="w-4 h-4 text-amber-500" />
              Item Metallurgy Specs
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
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Item Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">General Class Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded p-2 text-xs"
              >
                <option value="weapon">Weapon ⚔️</option>
                <option value="armor">Armor 🛡️</option>
                <option value="consumable">Consumable 🧪</option>
                <option value="material">Crafting Material 🪵</option>
                <option value="quest">Quest Item 📜</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Grade Rarity Tier</label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-250 rounded p-2 text-xs"
              >
                <option value="common">Common (Grey)</option>
                <option value="uncommon">Uncommon (Green)</option>
                <option value="rare">Rare (Blue)</option>
                <option value="epic">Epic (Purple)</option>
                <option value="legendary">Legendary (Amber)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Visual Tint Shader</label>
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
            <div>
              <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Item tags description</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-350 font-mono rounded p-2 text-xs"
                placeholder="eg. iron, sword, weapon"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Item lore description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-2 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Numerical Attributes sliders/fields */}
          <div className="border-t border-slate-800/60 pt-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-3">
              Item Weight & Power Properties
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-slate-950 border border-slate-800/50 p-3.5 rounded-lg">
                <div className="flex items-center gap-1 text-amber-500 mb-2">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Value (Gold)</span>
                </div>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="bg-slate-950 border border-slate-800/50 p-3.5 rounded-lg">
                <div className="flex items-center gap-1 text-slate-400 mb-2">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Weight (KG)</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="bg-slate-950 border border-slate-800/50 p-3.5 rounded-lg">
                <div className="flex items-center gap-1 text-red-400 mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Power (ATK/DEF)</span>
                </div>
                <input
                  type="number"
                  value={power}
                  onChange={(e) => setPower(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="bg-slate-950 border border-slate-800/50 p-3.5 rounded-lg">
                <div className="flex items-center gap-1 text-emerald-400 mb-2">
                  <Hammer className="w-3.5 h-3.5" />
                  <span>Durability</span>
                </div>
                <input
                  type="number"
                  value={durability}
                  onChange={(e) => setDurability(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 font-mono text-sm py-1 px-2.5 rounded focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-lg flex items-center gap-3 text-xs text-slate-400">
            <Bookmark className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="font-mono leading-relaxed">
              These weapons/items will compile directly inside <span className="text-slate-200">items.xml</span> files. 
              The auto loader in Godot is pre-configured to process value & damage/power metrics dynamically.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
