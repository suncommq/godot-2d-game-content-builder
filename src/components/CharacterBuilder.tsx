/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Character, Stats } from "../types";
import {
  HAIR_STYLES,
  FACE_STYLES,
  CLOTHES_STYLES,
  WEAPON_STYLES,
  ACCESSORY_STYLES,
} from "../data";
import {
  Download,
  FileCode,
  Save,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Sliders,
  Tv,
  CheckCircle2,
  Sword,
  Shield,
  Zap,
  TrendingUp,
  Play,
  Pause,
  SkipForward,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Copy,
  Check,
  Grid,
  Info
} from "lucide-react";

interface CharacterBuilderProps {
  characters: Character[];
  onSave: (char: Character) => void;
}

export default function CharacterBuilder({ characters, onSave }: CharacterBuilderProps) {
  // Enhanced Character State Attributes
  const [id, setId] = useState("char_new");
  const [name, setName] = useState("Desert Ranger");
  const [race, setRace] = useState("human");
  const [job, setJob] = useState("ranger");
  const [description, setDescription] = useState("A seasoned scout of the sandy valleys equipped with wind gear.");
  
  const [stats, setStats] = useState<Stats>({
    hp: 120,
    speed: 110,
    attack: 22,
    defense: 12,
    mana: 15,
    luck: 8
  });

  const [tags, setTags] = useState<string>("desert,scout,range");

  // Selected Parts
  const [selectedHair, setSelectedHair] = useState("spiky");
  const [selectedFace, setSelectedFace] = useState("scout");
  const [selectedClothes, setSelectedClothes] = useState("ranger");
  const [selectedWeapon, setSelectedWeapon] = useState("sword");
  const [selectedAccessory, setSelectedAccessory] = useState("cape");

  // Custom Colors
  const [colorHair, setColorHair] = useState("#d97706");
  const [colorSkin, setColorSkin] = useState("#f59e0b");
  const [colorClothes, setColorClothes] = useState("#065f46");
  const [colorWeapon, setColorWeapon] = useState("#9ca3af");
  const [colorAccessory, setColorAccessory] = useState("#dc2626");

  // Advanced Setup State Slices
  const [spriteSize, setSpriteSize] = useState<number>(64); // 32, 48, 64
  const [fps, setFps] = useState<number>(10); // Real-time play speed
  const [flipH, setFlipH] = useState<boolean>(false); // manual horizontal flip
  const [onionSkinning, setOnionSkinning] = useState<boolean>(false); // Render previous trace frame

  // Frame counts per animation sequence (User adjustable)
  const [animationFrames, setAnimationFrames] = useState<Record<string, number>>({
    idle: 4,
    walk: 6,
    run: 6,
    attack: 4
  });

  // Layer Rendering Order (shadow is always forced absolute lowest, handled outside)
  const [layerOrder, setLayerOrder] = useState<string[]>([
    "accessory_back",
    "body",
    "clothes",
    "head",
    "face",
    "hair",
    "accessory_front",
    "weapon"
  ]);

  // Player Core Timeline Indicators
  const [activeDirection, setActiveDirection] = useState<"down" | "up" | "left" | "right">("down");
  const [activeAnimation, setActiveAnimation] = useState<"idle" | "walk" | "run" | "attack">("walk");
  const [frame, setFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Inspector tabs: "json" | "tres" | "visuals"
  const [activeInspectorTab, setActiveInspectorTab] = useState<"json" | "tres" | "visuals">("json");
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [notif, setNotif] = useState<string | null>(null);

  // Adjust layer safety constraint solver instantly
  const enforceLayerConstraints = (currentOrder: string[]): string[] => {
    const list = [...currentOrder];
    const bodyIdx = list.indexOf("body");
    const weaponIdx = list.indexOf("weapon");
    const headIdx = list.indexOf("head");
    const hairIdx = list.indexOf("hair");

    // "weapon은 body 위에 표시" -> weapon must draw AFTER body (higher index)
    if (weaponIdx !== -1 && bodyIdx !== -1 && weaponIdx < bodyIdx) {
      list.splice(weaponIdx, 1);
      const newBodyIdx = list.indexOf("body");
      list.splice(newBodyIdx + 1, 0, "weapon");
    }

    // "hair는 head 위에 표시" -> hair must draw AFTER head (higher index)
    if (hairIdx !== -1 && headIdx !== -1 && hairIdx < headIdx) {
      list.splice(hairIdx, 1);
      const newHeadIdx = list.indexOf("head");
      list.splice(newHeadIdx + 1, 0, "hair");
    }

    return list;
  };

  // Move layers in rendering list
  const handleMoveLayer = (idx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= layerOrder.length) return;
    
    const freshList = [...layerOrder];
    const temp = freshList[idx];
    freshList[idx] = freshList[targetIdx];
    freshList[targetIdx] = temp;

    // Enforce requirements programmatically
    const solvedList = enforceLayerConstraints(freshList);
    setLayerOrder(solvedList);

    setNotif("Layers modified & safe bounds validated");
    setTimeout(() => setNotif(null), 2500);
  };

  // Sync animation loops on frame range shifts
  useEffect(() => {
    const max = animationFrames[activeAnimation] || 4;
    if (frame >= max) {
      setFrame(0);
    }
  }, [activeAnimation, animationFrames]);

  // Timed loop triggers
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = Math.round(1000 / fps);
    const interval = setInterval(() => {
      const max = animationFrames[activeAnimation] || 4;
      setFrame((prev) => (prev + 1) % max);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [isPlaying, activeAnimation, fps, animationFrames]);

  const loadCharacterPreset = (char: Character) => {
    setId(char.id);
    setName(char.name);
    setRace(char.race);
    setJob(char.job);
    setDescription(char.description);
    setStats({ ...char.stats });
    setTags(char.tags.join(","));
    setSelectedHair(char.parts.hair || "spiky");
    setSelectedFace(char.parts.face || "scout");
    setSelectedClothes(char.parts.clothes || "ranger");
    setSelectedWeapon(char.parts.weapon || "sword");
    setSelectedAccessory(char.parts.accessory || "cape");
    setColorHair(char.colors.hair || "#d97706");
    setColorSkin(char.colors.skin || "#f59e0b");
    setColorClothes(char.colors.clothes || "#065f46");
    setColorWeapon(char.colors.weapon || "#9ca3af");
    setColorAccessory(char.colors.accessory || "#dc2626");
    setNotif(`Loaded profile: ${char.name}`);
    setTimeout(() => setNotif(null), 3000);
  };

  const handleSaveLocal = () => {
    const freshChar: Character = {
      id: id === "char_new" ? `char_${Date.now()}` : id,
      name,
      race,
      job,
      description,
      stats,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      parts: {
        head: "default",
        hair: selectedHair,
        face: selectedFace,
        body: "default",
        clothes: selectedClothes,
        weapon: selectedWeapon,
        accessory: selectedAccessory,
        shadow: "default"
      },
      colors: {
        hair: colorHair,
        skin: colorSkin,
        clothes: colorClothes,
        weapon: colorWeapon,
        accessory: colorAccessory
      }
    };
    onSave(freshChar);
    setNotif(`Saved profile "${name}" successfully!`);
    setTimeout(() => setNotif(null), 3500);
  };

  const handleReset = () => {
    setId("char_new");
    setName("New Hero");
    setRace("human");
    setJob("warrior");
    setDescription("A newly recruited combatant with custom attributes.");
    setStats({ hp: 100, speed: 100, attack: 15, defense: 10, mana: 10, luck: 5 });
    setTags("custom,hero");
    setSelectedHair("spiky");
    setSelectedFace("proud");
    setSelectedClothes("plate");
    setSelectedWeapon("sword");
    setSelectedAccessory("none");
    setColorHair("#b45309");
    setColorSkin("#f3f4f6");
    setColorClothes("#3b82f6");
    setColorWeapon("#475569");
    setColorAccessory("#ef4444");
    setSpriteSize(64);
    setFps(10);
    setFlipH(false);
    setAnimationFrames({
      idle: 4,
      walk: 6,
      run: 6,
      attack: 4
    });
    setLayerOrder([
      "accessory_back",
      "body",
      "clothes",
      "head",
      "face",
      "hair",
      "accessory_front",
      "weapon"
    ]);
  };

  // Core visual SVG markup render engine
  const formatCharacterSvg = (
    frameVal: number,
    directionVal: "down" | "up" | "left" | "right",
    animationType: "idle" | "walk" | "run" | "attack",
    customSpriteSize?: number
  ) => {
    let mappedDir: "down" | "up" | "side" = "down";
    if (directionVal === "up") mappedDir = "up";
    else if (directionVal === "left" || directionVal === "right") mappedDir = "side";

    const isUp = mappedDir === "up";

    const isW = animationType === "walk";
    const isR = animationType === "run";
    const isA = animationType === "attack";
    const isI = animationType === "idle";

    const maxFrames = animationFrames[animationType] || 4;
    const angleRadian = (frameVal / maxFrames) * Math.PI * 2;

    let bobY = 0;
    let bodyAngle = 0;
    let weaponAngle = 0;
    let weaponX = 0;
    let weaponY = 0;
    let scaleX = 1;

    // Apply combined flip state logical rule
    const isMirrored = directionVal === "left" ? !flipH : flipH;
    scaleX = isMirrored ? -1 : 1;

    if (isW) {
      bobY = Math.sin(angleRadian * 2) * 2.5;
      bodyAngle = Math.sin(angleRadian) * 2.5;
      weaponAngle = Math.cos(angleRadian) * 8;
    } else if (isR) {
      bobY = Math.sin(angleRadian * 2) * 4.4;
      bodyAngle = Math.sin(angleRadian) * 4.5 + 4.5;
      weaponAngle = Math.cos(angleRadian) * 15;
    } else if (isA) {
      const strikeProgress = (frameVal % maxFrames) / maxFrames;
      weaponAngle = -50 + strikeProgress * 120;
      weaponX = strikeProgress * 14;
      weaponY = -strikeProgress * 4;
      bodyAngle = strikeProgress * 8;
    } else if (isI) {
      bobY = Math.sin(angleRadian) * 1.5;
      weaponAngle = Math.sin(angleRadian) * 2.2;
    }

    const shadowScale = 1 - bobY / 45;

    const hairPaths = HAIR_STYLES[selectedHair]?.paths || [];
    const faceRenderer = FACE_STYLES[selectedFace]?.render || (() => "");
    const clothesPaths = CLOTHES_STYLES[selectedClothes]?.paths || [];
    const weaponPaths = WEAPON_STYLES[selectedWeapon]?.paths || [];
    const accessoryPaths = ACCESSORY_STYLES[selectedAccessory]?.paths || [];

    const layerRenderers: Record<string, () => string> = {
      accessory_back: () => (selectedAccessory === "cape" ? accessoryPaths.map(p => `<path d="${p}" fill="${colorAccessory}" stroke="#111827" stroke-width="2"/>`).join("") : ""),
      body: () => `
        <rect x="35" y="75" width="8" height="10" fill="${colorSkin}" stroke="#111827" stroke-width="2" rx="2"/>
        <rect x="47" y="75" width="8" height="10" fill="${colorSkin}" stroke="#111827" stroke-width="2" rx="2"/>
        <rect x="28" y="55" width="34" height="22" fill="${colorSkin}" stroke="#111827" stroke-width="2" rx="4"/>
      `,
      clothes: () => clothesPaths.map(p => `<path d="${p}" fill="${colorClothes}" stroke="#111827" stroke-width="2" />`).join(""),
      head: () => `<circle cx="45" cy="38" r="18" fill="${colorSkin}" stroke="#111827" stroke-width="2"/>`,
      face: () => (!isUp ? faceRenderer(colorHair) : ""),
      hair: () => hairPaths.map(p => `<path d="${p}" fill="${colorHair}" stroke="#111827" stroke-width="2" />`).join(""),
      accessory_front: () => (selectedAccessory === "shoulders" ? accessoryPaths.map(p => `<path d="${p}" fill="${colorAccessory}" stroke="#111827" stroke-width="2"/>`).join("") : ""),
      weapon: () => `
        <g style="transform-origin: 55px 65px; transform: translate(${weaponX}px, ${weaponY}px) rotate(${weaponAngle}deg);">
          <circle cx="58" cy="65" r="4.5" fill="${colorSkin}" stroke="#111827" stroke-width="1.5"/>
          ${weaponPaths.map(p => `<path d="${p}" fill="${colorWeapon}" stroke="#111827" stroke-width="2" stroke-linejoin="round"/>`).join("")}
        </g>
      `,
    };

    const layersHtml = layerOrder
      .map(layer => layerRenderers[layer]?.() || "")
      .join("\n");

    const activeSize = customSpriteSize || spriteSize;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${activeSize}" height="${activeSize}">
         <!-- Shadow: LOCKED absolute bottom-most element inside SVG -->
         <ellipse cx="45" cy="88" rx="${20 * shadowScale}" ry="${5 * shadowScale}" fill="#111827" opacity="0.45"/>
         <g style="transform-origin: 45px 85px; transform: translate(0px, ${bobY}px) rotate(${bodyAngle}deg) scale(${scaleX}, 1);">
           ${layersHtml}
         </g>
      </svg>
    `;
  };

  // Master spritesheet image rendering (multi-grid 16 rows)
  const triggerSpritesheetCompile = () => {
    const directions: ("down" | "up" | "left" | "right")[] = ["down", "up", "left", "right"];
    const animations: ("idle" | "walk" | "run" | "attack")[] = ["idle", "walk", "run", "attack"];
    
    const maxColumns = Math.max(
      animationFrames.idle,
      animationFrames.walk,
      animationFrames.run,
      animationFrames.attack
    );

    const canvas = document.createElement("canvas");
    canvas.width = maxColumns * spriteSize;
    canvas.height = 16 * spriteSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let rowIdx = 0;
    let totalFramesDrawn = 0;
    let totalExpectedFrames = 0;

    animations.forEach((anim) => {
      totalExpectedFrames += (animationFrames[anim] || 4) * directions.length;
    });

    setNotif("Compiling multi-directional PNG grid...");

    animations.forEach((anim) => {
      const maxF = animationFrames[anim] || 4;
      directions.forEach((dir) => {
        const currentRow = rowIdx;
        rowIdx++;

        for (let f = 0; f < maxF; f++) {
          const svgCode = formatCharacterSvg(f, dir, anim, spriteSize);
          const img = new Image();
          img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgCode);
          
          img.onload = () => {
            ctx.drawImage(img, f * spriteSize, currentRow * spriteSize, spriteSize, spriteSize);
            totalFramesDrawn++;

            if (totalFramesDrawn === totalExpectedFrames) {
              const link = document.createElement("a");
              link.download = `${name.toLowerCase().replace(/\s+/g, "_")}_${spriteSize}x${spriteSize}_sheet.png`;
              link.href = canvas.toDataURL("image/png");
              link.click();
              setNotif(`PNG Spritesheet (${canvas.width}x${canvas.height}) exported!`);
              setTimeout(() => setNotif(null), 3000);
            }
          };
        }
      });
    });
  };

  // Spritesheet mapping coordinates JSON generator
  const generateCoordinatesJson = () => {
    const directions: ("down" | "up" | "left" | "right")[] = ["down", "up", "left", "right"];
    const animations: ("idle" | "walk" | "run" | "attack")[] = ["idle", "walk", "run", "attack"];
    
    const texture = `res://assets/characters/${name.toLowerCase().replace(/\s+/g, "_")}_spritesheet.png`;
    const coordinates: Record<string, any> = {};
    let rowIdx = 0;

    animations.forEach((anim) => {
      const maxF = animationFrames[anim] || 4;
      directions.forEach((dir) => {
        const key = `${anim}_${dir}`;
        coordinates[key] = Array.from({ length: maxF }).map((_, fIdx) => {
          return {
            frame: fIdx,
            x: fIdx * spriteSize,
            y: rowIdx * spriteSize,
            w: spriteSize,
            h: spriteSize
          };
        });
        rowIdx++;
      });
    });

    const output = {
      generator: "Godot 2D content builder (V2)",
      character_id: id,
      character_name: name,
      sprite_size: `${spriteSize}x${spriteSize}`,
      fps,
      spritesheet: {
        texture,
        total_rows: rowIdx,
        columns: Math.max(
          animationFrames.idle,
          animationFrames.walk,
          animationFrames.run,
          animationFrames.attack
        ),
        width: Math.max(animationFrames.idle, animationFrames.walk, animationFrames.run, animationFrames.attack) * spriteSize,
        height: rowIdx * spriteSize
      },
      coordinates
    };

    return JSON.stringify(output, null, 2);
  };

  // Godot AnimatedSprite2D native SpriteFrames .tres text file generator
  const generateTresConfig = () => {
    const directions: ("down" | "up" | "left" | "right")[] = ["down", "up", "left", "right"];
    const animations: ("idle" | "walk" | "run" | "attack")[] = ["idle", "walk", "run", "attack"];
    
    let subResources = "";
    let animationBlocks = "";
    let rowIdx = 0;

    animations.forEach((anim) => {
      const maxF = animationFrames[anim] || 4;
      directions.forEach((dir) => {
        const animKey = `${anim}_${dir}`;
        const frameTextureList: string[] = [];

        for (let fIdx = 0; fIdx < maxF; fIdx++) {
          const resId = `AtlasTexture_${animKey}_f${fIdx}`;
          subResources += `[sub_resource type="AtlasTexture" id="${resId}"]\n`;
          subResources += `atlas = ExtResource("1_tex")\n`;
          subResources += `region = Rect2(${fIdx * spriteSize}, ${rowIdx * spriteSize}, ${spriteSize}, ${spriteSize})\n\n`;
          
          frameTextureList.push(`SubResource("${resId}")`);
        }

        const loopStr = anim !== "attack" ? "true" : "false";
        animationBlocks += `  {\n`;
        animationBlocks += `    "frames": [\n`;
        animationBlocks += frameTextureList.map(item => `      {\n        "duration": 1.0,\n        "texture": ${item}\n      }`).join(",\n") + `\n`;
        animationBlocks += `    ],\n`;
        animationBlocks += `    "loop": ${loopStr},\n`;
        animationBlocks += `    "name": &"${animKey}",\n`;
        animationBlocks += `    "speed": ${fps}.0\n`;
        animationBlocks += `  }`;
        
        rowIdx++;
        if (rowIdx < animations.length * directions.length) {
          animationBlocks += ",\n";
        }
      });
    });

    return `[gd_resource type="SpriteFrames" load_steps=3 format=3]

[ext_resource type="Texture2D" uid="uid://char_sprite_${id}" path="res://assets/characters/${name.toLowerCase().replace(/\s+/g, "_")}_spritesheet.png" id="1_tex"]

${subResources}
[resource]
animations = [
${animationBlocks}
]
`;
  };

  const handleCopyText = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleDownloadSingleFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setNotif(`Downloaded ${filename}!`);
    setTimeout(() => setNotif(null), 3000);
  };

  // Onion skin calculations
  const prevFrameIdx = (frame - 1 + (animationFrames[activeAnimation] || 4)) % (animationFrames[activeAnimation] || 4);

  return (
    <div className="space-y-6">
      {/* Upper Status Notifications */}
      {notif && (
        <div className="bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 animate-bounce shadow-lg shadow-emerald-500/20" id="char-notif">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{notif}</span>
        </div>
      )}

      {/* Main interactive layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Preview & Live Timeline Panel */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-500" />
                <h3 className="font-sans font-bold text-slate-100 text-sm">Real-time Scene Canvas</h3>
              </div>
              <div className="flex bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[10px] font-mono text-slate-400 gap-1.5 align-middle">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse self-center"></span>
                <span>{spriteSize}x{spriteSize} PX</span>
              </div>
            </div>

            {/* Simulated Live Canvas Container */}
            <div className="w-full aspect-square bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative shadow-inner overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1.5px,transparent_1.5px),linear-gradient(to_bottom,#1e293b_1.5px,transparent_1.5px)] bg-[size:24px_24px] opacity-25"></div>
              
              {/* Onion Skin Trace Frame (Prev) */}
              {onionSkinning && (
                <div 
                  className="w-48 h-48 absolute z-5 opacity-25 pointer-events-none filter sepia select-none"
                  style={{ imageRendering: "pixelated" }}
                  dangerouslySetInnerHTML={{ __html: formatCharacterSvg(prevFrameIdx, activeDirection, activeAnimation) }}
                />
              )}

              {/* Main Active Frame */}
              <div
                className="w-48 h-48 relative z-10 transition-transform duration-100 ease-out select-none"
                style={{ imageRendering: "pixelated" }}
                dangerouslySetInnerHTML={{ __html: formatCharacterSvg(frame, activeDirection, activeAnimation) }}
              />

              {/* Float settings */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`px-2 py-1 text-[10px] font-mono border rounded flex items-center gap-1 shadow transition-all ${
                    flipH 
                      ? "bg-amber-500 border-amber-600 text-slate-950 font-bold" 
                      : "bg-slate-900/95 border-slate-850 text-slate-400 hover:text-slate-100"
                  }`}
                >
                  flip_h: {flipH ? "ON" : "OFF"}
                </button>
                <button
                  onClick={() => setOnionSkinning(!onionSkinning)}
                  className={`px-2 py-1 text-[10px] font-mono border rounded flex items-center gap-1 shadow transition-all ${
                    onionSkinning 
                      ? "bg-indigo-650 bg-indigo-600 border-indigo-700 text-slate-100 font-bold" 
                      : "bg-slate-900/95 border-slate-850 text-slate-400 hover:text-slate-100"
                  }`}
                >
                  Onion Skin
                </button>
              </div>

              {/* Active direction Selector overlays */}
              <div className="absolute bottom-3 left-3 right-3 flex justify-between bg-slate-900/95 border border-slate-850 rounded-lg p-1.5 z-20">
                <span className="text-[10px] font-mono text-slate-500 self-center pl-1.5 uppercase font-bold">Direction:</span>
                <div className="flex gap-1">
                  {(["down", "up", "left", "right"] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => {
                        setActiveDirection(dir);
                        setFrame(0);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold capitalize rounded transition-all ${
                        activeDirection === dir
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-450 hover:text-slate-100 bg-slate-950/60"
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Animation state toggler slots */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-850">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold block mb-2">
                Core Animation Loops
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                {(["idle", "walk", "run", "attack"] as const).map((cycle) => {
                  const isSel = activeAnimation === cycle;
                  return (
                    <button
                      key={cycle}
                      onClick={() => {
                        setActiveAnimation(cycle);
                        setFrame(0);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-center border transition-all capitalize font-bold ${
                        isSel
                          ? "bg-amber-500/15 border-amber-500 text-amber-500"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cycle}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick exporter handles */}
          <div className="space-y-2 border-t border-slate-800 pt-5">
            <button
              onClick={triggerSpritesheetCompile}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/10"
            >
              <Download className="w-3.5 h-3.5" /> Compile & Download Sprite Sheet (.png)
            </button>
          </div>

        </div>

        {/* Right column: Configurator Panels */}
        <div className="lg:col-span-7 space-y-6">

          {/* Preset Profiles switcher */}
          {characters.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <span className="text-[10px] font-mono text-slate-550 uppercase tracking-wide block mb-2.5 font-bold">
                Available Database Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {characters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => loadCharacterPreset(ch)}
                    className="bg-slate-950 hover:bg-slate-850 border border-slate-850 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{ch.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Attributes Panel */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-sans font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                Character Specs & Anatomy
              </h3>
              <div className="flex gap-1.5">
                <button
                  onClick={handleReset}
                  className="bg-slate-800 text-slate-350 hover:bg-slate-750 border border-slate-700 px-2 py-1 text-[11px] font-mono rounded flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                <button
                  onClick={handleSaveLocal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-50 px-3 py-1 text-[11px] font-mono font-bold rounded flex items-center gap-1 transition-all shadow"
                >
                  <Save className="w-3 h-3" /> Sync to Database
                </button>
              </div>
            </div>

            {/* Size Resolution, Flip & State Speed row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
              
              {/* Grid Size selection */}
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
                  Sprite Framerate Size
                </label>
                <div className="grid grid-cols-3 gap-1 shadow-inner">
                  {[32, 48, 64].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSpriteSize(size)}
                      className={`py-1 text-center font-mono text-[11px] font-bold rounded border transition-all ${
                        spriteSize === size
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/40"
                          : "bg-slate-900 border-slate-850 text-slate-450 hover:text-slate-300"
                      }`}
                    >
                      {size}²
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline FPS adjustment */}
              <div className="col-span-2">
                <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-500 uppercase tracking-wider font-bold">
                  <span>Playback Rate Speed</span>
                  <span className="text-amber-500 font-bold">{fps} FPS</span>
                </div>
                <div className="flex gap-3 mt-1.5">
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-900"
                  />
                </div>
              </div>

            </div>

            {/* Metadata edits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Character Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 font-sans rounded p-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Saga Race</label>
                <select
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 font-sans rounded p-2 text-xs focus:outline-none focus:border-amber-500 text-slate-350"
                >
                  <option value="human">Human</option>
                  <option value="elf">Elf</option>
                  <option value="dwarf">Dwarf</option>
                  <option value="orc">Orc</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Job Class</label>
                <select
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-200 font-sans rounded p-2 text-xs focus:outline-none focus:border-amber-500 text-slate-350"
                >
                  <option value="scout">Scout Pathfinder</option>
                  <option value="ranger">Forest Ranger</option>
                  <option value="knight">Iron Crusader</option>
                  <option value="mage">Primal Wizard</option>
                </select>
              </div>
            </div>

            {/* Custom parts drawers */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Hair Style</label>
                <select
                  value={selectedHair}
                  onChange={(e) => setSelectedHair(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 text-xs font-mono"
                >
                  {Object.entries(HAIR_STYLES).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Face Expression</label>
                <select
                  value={selectedFace}
                  onChange={(e) => setSelectedFace(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 text-xs font-mono"
                >
                  {Object.entries(FACE_STYLES).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Body Vestments</label>
                <select
                  value={selectedClothes}
                  onChange={(e) => setSelectedClothes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 text-xs font-mono"
                >
                  {Object.entries(CLOTHES_STYLES).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Weapon Type</label>
                <select
                  value={selectedWeapon}
                  onChange={(e) => setSelectedWeapon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 text-xs font-mono"
                >
                  {Object.entries(WEAPON_STYLES).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Accessory Part</label>
                <select
                  value={selectedAccessory}
                  onChange={(e) => setSelectedAccessory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded p-1.5 text-xs font-mono"
                >
                  {Object.entries(ACCESSORY_STYLES).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Color Palette Accessory</label>
                <input
                  type="color"
                  value={colorAccessory}
                  onChange={(e) => setColorAccessory(e.target.value)}
                  className="w-full h-8 bg-transparent rounded border border-slate-800 cursor-pointer"
                />
              </div>
            </div>

            {/* Color editors */}
            <div className="grid grid-cols-4 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
              <div className="text-center">
                <span className="text-[9.5px] font-mono text-slate-500 block mb-1">Hair Dye</span>
                <input
                  type="color"
                  value={colorHair}
                  onChange={(e) => setColorHair(e.target.value)}
                  className="w-7 h-7 mx-auto block bg-transparent cursor-pointer"
                />
              </div>
              <div className="text-center">
                <span className="text-[9.5px] font-mono text-slate-500 block mb-1">Skin Tone</span>
                <input
                  type="color"
                  value={colorSkin}
                  onChange={(e) => setColorSkin(e.target.value)}
                  className="w-7 h-7 mx-auto block bg-transparent cursor-pointer"
                />
              </div>
              <div className="text-center">
                <span className="text-[9.5px] font-mono text-slate-500 block mb-1">Garments</span>
                <input
                  type="color"
                  value={colorClothes}
                  onChange={(e) => setColorClothes(e.target.value)}
                  className="w-7 h-7 mx-auto block bg-transparent cursor-pointer"
                />
              </div>
              <div className="text-center">
                <span className="text-[9.5px] font-mono text-slate-500 block mb-1">Weapon Steel</span>
                <input
                  type="color"
                  value={colorWeapon}
                  onChange={(e) => setColorWeapon(e.target.value)}
                  className="w-7 h-7 mx-auto block bg-transparent cursor-pointer"
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Dynamic Layer Manager & Constraints Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Layer list order manager */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h3 className="font-sans font-bold text-slate-100 text-sm">Layer Vector Manager</h3>
          </div>

          <p className="text-[11px] font-sans text-slate-400">
            Reorder body rendering layers. Our safety solver programmatically enforces specific rules (e.g. hair rests on head, weapons rest above torso body).
          </p>

          <div className="space-y-1.5 font-mono text-xs">
            {/* Pinned bottom-most visual indicator */}
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-emerald-500/20 text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>shadow (always lowest)</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-500/10 rounded">Locked</span>
            </div>

            {layerOrder.map((layer, index) => {
              const isWeapon = layer === "weapon";
              const isHair = layer === "hair";
              
              return (
                <div 
                  key={layer}
                  className="flex justify-between items-center bg-slate-950/80 p-2 rounded border border-slate-850 hover:border-slate-700 hover:bg-slate-950 text-slate-300 transition-all font-mono"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-650 font-bold">#{index + 1}</span>
                    <span className="capitalize">{layer.replace("_", " ")}</span>
                    {isWeapon && (
                      <span className="text-[9px] text-amber-500 bg-amber-500/5 px-1 rounded uppercase">Above Body</span>
                    )}
                    {isHair && (
                      <span className="text-[9px] text-indigo-400 bg-indigo-500/5 px-1 rounded uppercase">Above Head</span>
                    )}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMoveLayer(index, "up")}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-slate-450 hover:text-slate-200 transition-all"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === layerOrder.length - 1}
                      onClick={() => handleMoveLayer(index, "down")}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-slate-450 hover:text-slate-200 transition-all"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[10.5px] font-sans text-slate-450 flex items-start gap-1.5 leading-relaxed">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-350 block">Programmatic Rules Enforced:</span>
              <span>- Shadow is layered lowest before canvas drawings.</span><br/>
              <span>- Hair index is always kept higher than Head index layout.</span><br/>
              <span>- Weapon index is kept higher than Torso body bounds.</span>
            </div>
          </div>

        </div>

        {/* Dynamic Interactive Animation Timeline Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between space-y-6 flex-1">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-500" />
                <h3 className="font-sans font-bold text-slate-100 text-sm">Interactive Action Timeline</h3>
              </div>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded flex items-center gap-1.5 transition-all ${
                    isPlaying 
                      ? "bg-amber-500 text-slate-950 font-bold" 
                      : "bg-slate-900 text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isPlaying ? "Playing" : "Paused"}</span>
                </button>
                <button
                  disabled={isPlaying}
                  onClick={() => {
                    const max = animationFrames[activeAnimation] || 4;
                    setFrame((prev) => (prev + 1) % max);
                  }}
                  className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-100 disabled:opacity-30 transition-all flex items-center gap-1"
                >
                  <SkipForward className="w-3 h-3" /> Step
                </button>
              </div>
            </div>

            {/* Animation custom frame controllers form */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
              {(["idle", "walk", "run", "attack"] as const).map((cycle) => (
                <div key={cycle} className="text-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1 font-semibold">{cycle} Limit</span>
                  <div className="flex justify-center items-center gap-2 mt-1">
                    <button
                      onClick={() => {
                        const cur = animationFrames[cycle] || 4;
                        if (cur > 1) setAnimationFrames({ ...animationFrames, [cycle]: cur - 1 });
                      }}
                      className="w-5 h-5 bg-slate-950 text-slate-350 border border-slate-800 font-mono text-xs text-center rounded hover:bg-slate-800"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono text-amber-500 font-bold">{animationFrames[cycle]}f</span>
                    <button
                      onClick={() => {
                        const cur = animationFrames[cycle] || 4;
                        if (cur < 12) setAnimationFrames({ ...animationFrames, [cycle]: cur + 1 });
                      }}
                      className="w-5 h-5 bg-slate-950 text-slate-350 border border-slate-800 font-mono text-xs text-center rounded hover:bg-slate-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* The Horizontal Timeline track layout */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-slate-450 block uppercase tracking-wider font-bold">
                Active Frames ({activeAnimation} cycle - {animationFrames[activeAnimation]} frames)
              </span>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {Array.from({ length: animationFrames[activeAnimation] || 4 }).map((_, fIdx) => {
                  const isActive = frame === fIdx;
                  return (
                    <button
                      key={fIdx}
                      onClick={() => {
                        setIsPlaying(false);
                        setFrame(fIdx);
                      }}
                      className={`flex-1 min-w-[54px] aspect-square rounded-xl border relative flex flex-col justify-between p-1.5 transition-all outline-none ${
                        isActive
                          ? "bg-amber-500/10 border-amber-500/90 shadow-md ring-1 ring-amber-500/20"
                          : "bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-450 hover:text-slate-300"
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold block">F{fIdx}</span>
                      
                      {/* Scaled Mini Avatar frame visualization on absolute context */}
                      <div 
                        className="w-6 h-6 absolute inset-x-0 mx-auto bottom-2 scale-[0.65] pointer-events-none opacity-80"
                        dangerouslySetInnerHTML={{ __html: formatCharacterSvg(fIdx, activeDirection, activeAnimation, 32) }}
                      />

                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-auto block mb-0.5"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Combined Code & Asset Inspector panel */}
          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5 text-xs font-mono">
                <button
                  onClick={() => setActiveInspectorTab("json")}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    activeInspectorTab === "json"
                      ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-bold"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Region Coordinates .json
                </button>
                <button
                  onClick={() => setActiveInspectorTab("tres")}
                  className={`px-3 py-1.5 rounded-lg border transition-all ${
                    activeInspectorTab === "tres"
                      ? "bg-violet-500/10 border-violet-500/40 text-violet-400 font-bold"
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Godot SpriteFrames .tres
                </button>
              </div>

              <div className="flex gap-1 font-mono text-[11px]">
                <button
                  onClick={() => handleCopyText(activeInspectorTab === "json" ? generateCoordinatesJson() : generateTresConfig())}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 px-3 py-1 rounded flex items-center gap-1 transition-all"
                >
                  {copiedNotification ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-500" />}
                  <span>{copiedNotification ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => {
                    const fn = activeInspectorTab === "json" 
                      ? `${name.toLowerCase().replace(/\s+/g, "_")}_coords.json`
                      : `${name.toLowerCase().replace(/\s+/g, "_")}.tres`;
                    const content = activeInspectorTab === "json" ? generateCoordinatesJson() : generateTresConfig();
                    handleDownloadSingleFile(fn, content);
                  }}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 px-3 py-1 rounded flex items-center gap-1 transition-all"
                >
                  <Download className="w-3 h-3 text-amber-500" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Displaying raw, editable-styled preview */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 font-mono text-[10.5px] text-emerald-400 overflow-y-auto max-h-[180px] whitespace-pre select-all shadow-inner leading-normal">
              {activeInspectorTab === "json" ? generateCoordinatesJson() : generateTresConfig()}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
