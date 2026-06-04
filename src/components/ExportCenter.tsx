/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ProjectDb } from "../types";
import {
  convertCharactersToXml,
  convertMonstersToXml,
  convertItemsToXml,
  convertBiomesToXml,
  generateDataLoaderScript,
  generateWorldLoaderScript,
  generateTscn,
  downloadGodotDataPackZip
} from "../utils/exportUtils";
import {
  Archive,
  Download,
  FolderOpen,
  Folder,
  FileCode,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface ExportCenterProps {
  db: ProjectDb;
  projectName: string;
}

export default function ExportCenter({ db, projectName }: ExportCenterProps) {
  const [selectedFile, setSelectedFile] = useState<string>("data/characters.xml");
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  // File system map mapping paths to their formatted code structures
  const fileMap: Record<string, { type: "xml" | "json" | "gd" | "tscn"; loader: () => string }> = {
    "data/characters.xml": { type: "xml", loader: () => convertCharactersToXml(db.characters) },
    "data/monsters.xml": { type: "xml", loader: () => convertMonstersToXml(db.monsters) },
    "data/items.xml": { type: "xml", loader: () => convertItemsToXml(db.items) },
    "data/biomes.xml": { type: "xml", loader: () => convertBiomesToXml(db.biomes) },
    "data/maps.json": { type: "json", loader: () => JSON.stringify(db.maps[0] || {}, null, 2) },
    "scripts/DataLoader.gd": { type: "gd", loader: () => generateDataLoaderScript() },
    "scripts/WorldLoader.gd": { type: "gd", loader: () => generateWorldLoaderScript() },
    "scenes/generated_world.tscn": { type: "tscn", loader: () => generateTscn(db.maps[0] || {} as any) }
  };

  const getActiveCode = () => {
    return fileMap[selectedFile]?.loader() || "";
  };

  // Download a single file individually
  const handleDownloadSingle = () => {
    const code = getActiveCode();
    const isJson = fileMap[selectedFile]?.type === "json";
    const mime = isJson ? "application/json" : "text/plain";
    const dataStr = `data:${mime};charset=utf-8,` + encodeURIComponent(code);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    
    // Extract filename from chosen pathway
    const fileName = selectedFile.split("/")[1];
    downloadAnchor.setAttribute("download", fileName);
    downloadAnchor.click();
  };

  // Compile full Data structure into single ZIP pack
  const handleDownloadFullZip = async () => {
    setLoading(true);
    try {
      const zipBlob = await downloadGodotDataPackZip(
        db.characters,
        db.monsters,
        db.items,
        db.biomes,
        db.maps[0] || ({} as any)
      );
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${projectName.toLowerCase().replace(/\s+/g, "_")}_godot_pack.zip`;
      link.click();
      
      setNotif("ZIP Godot Data Pack compiled & downloaded successfully!");
      setTimeout(() => setNotif(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {notif && (
        <div className="bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2 animate-bounce shadow" id="export-notif">
          <CheckCircle2 className="w-4 h-4 text-slate-950" />
          <span>{notif}</span>
        </div>
      )}

      {/* Intro box */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex justify-between items-center" id="export-banner">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest block">
            Central Pipeline
          </span>
          <h2 className="text-xl font-bold text-slate-100">
            Godot 4.x Content Package Compiler
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Compile characters, XML maps, and scene layers instantly. We automatically form the exact resource hierarchy expected by your Godot Editor directories.
          </p>
        </div>
        <div>
          <button
            onClick={handleDownloadFullZip}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 px-4 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-md shadow-amber-500/15 transition-all"
            id="export-btn-full-zip"
          >
            <Archive className="w-4 h-4 text-slate-950" />
            {loading ? "Zipping Assets..." : "Export Godot Data Pack (.zip)"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
        {/* Left Tree system panel */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4" id="export-tree-panel">
          <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest font-bold block">
            res:// Directory Tree
          </span>

          <div className="space-y-4 font-mono text-xs select-none">
            {/* Root res:// */}
            <div>
              <div className="flex items-center gap-1.5 text-slate-350 font-semibold mb-1">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span>res://</span>
              </div>
              
              {/* Folder: assets */}
              <div className="pl-4 border-l border-slate-800 ml-2 py-1 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Folder className="w-3.5 h-3.5" />
                  <span>assets/</span>
                </div>
                <div className="pl-4 text-[11px] text-slate-600 italic">
                  <div>└─ characters/ (Custom Spritesheets list)</div>
                  <div>└─ monsters/ (Anatomy composites png)</div>
                </div>
              </div>

              {/* Folder: data */}
              <div className="pl-4 border-l border-slate-800 ml-2 py-1 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500/80" />
                  <span>data/</span>
                </div>
                <div className="pl-4 space-y-1 text-slate-450 text-[11px]">
                  {["data/characters.xml", "data/monsters.xml", "data/items.xml", "data/biomes.xml", "data/maps.json"].map((fPath) => {
                    const isSel = selectedFile === fPath;
                    const isJson = fPath.endsWith(".json");
                    return (
                      <button
                        key={fPath}
                        onClick={() => setSelectedFile(fPath)}
                        className={`w-full text-left flex items-center gap-1.5 py-0.5 px-1.5 rounded transition-all ${
                          isSel ? "bg-amber-500/10 text-amber-500 font-bold" : "text-slate-450 hover:text-slate-200"
                        }`}
                      >
                        {isJson ? <FileJson className="w-3 h-3 text-emerald-400" /> : <FileCode className="w-3 h-3 text-sky-400" />}
                        <span>{fPath.split("/")[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Folder: scenes */}
              <div className="pl-4 border-l border-slate-800 ml-2 py-1 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500/80" />
                  <span>scenes/</span>
                </div>
                <div className="pl-4 text-[11px]">
                  <button
                    onClick={() => setSelectedFile("scenes/generated_world.tscn")}
                    className={`text-left flex items-center gap-1.5 py-0.5 px-1.5 rounded transition-all ${
                      selectedFile === "scenes/generated_world.tscn"
                        ? "bg-amber-500/10 text-amber-500 font-bold"
                        : "text-slate-450 hover:text-slate-200"
                    }`}
                  >
                    <FileCode className="w-3 h-3 text-purple-400" />
                    <span>generated_world.tscn</span>
                  </button>
                </div>
              </div>

              {/* Folder: scripts */}
              <div className="pl-4 border-l border-slate-800 ml-2 py-1 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-450">
                  <FolderOpen className="w-3.5 h-3.5 text-amber-500/80" />
                  <span>scripts/</span>
                </div>
                <div className="pl-4 space-y-1 text-slate-450 text-[11px]">
                  {["scripts/DataLoader.gd", "scripts/WorldLoader.gd"].map((fPath) => {
                    const isSel = selectedFile === fPath;
                    return (
                      <button
                        key={fPath}
                        onClick={() => setSelectedFile(fPath)}
                        className={`w-full text-left flex items-center gap-1.5 py-0.5 px-1.5 rounded transition-all ${
                          isSel ? "bg-amber-500/10 text-amber-500 font-bold" : "text-slate-450 hover:text-slate-200"
                        }`}
                      >
                        <FileCode className="w-3 h-3 text-emerald-400" />
                        <span>{fPath.split("/")[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Code preview pane */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="export-preview-panel">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">
                  Active Asset Inspection
                </span>
                <span className="font-mono text-xs text-amber-500 font-bold block mt-0.5">
                  res://{selectedFile}
                </span>
              </div>
              <button
                onClick={handleDownloadSingle}
                className="bg-slate-850 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded font-mono text-[11px] text-slate-200 flex items-center gap-1.5 transition-all"
                id="export-btn-download-single"
              >
                <Download className="w-3.5 h-3.5 text-amber-500" />
                Download Single Code
              </button>
            </div>

            {/* Display compiled output strings */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 font-mono text-[10.5px] text-emerald-400 overflow-auto max-h-[380px] whitespace-pre sm:leading-relaxed">
              {getActiveCode()}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-850 flex gap-2.5 items-start text-xs text-slate-400 leading-normal bg-slate-955 p-1 rounded">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="font-sans">
              Exporting the full <span className="text-slate-200 font-mono">res://</span> ZIP pack configures standard Godot folder trees instantly. Unzip it and map it recursively into your active Godot 4 directory!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
