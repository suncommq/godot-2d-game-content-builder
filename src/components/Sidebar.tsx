/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  LayoutGrid,
  Users,
  Skull,
  Feather,
  Database,
  Map,
  Archive,
  BookOpen,
  FolderLock
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  projectName,
  setProjectName
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "char-builder", label: "Character Builder", icon: Users },
    { id: "monster-builder", label: "Monster Builder", icon: Skull },
    { id: "item-builder", label: "Item Builder", icon: Feather },
    { id: "data-editor", label: "Data Editor", icon: Database },
    { id: "world-builder", label: "World Builder", icon: Map },
    { id: "export-center", label: "Export Center", icon: Archive },
    { id: "documentation", label: "Documentation", icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between" id="sidebar-panel">
      {/* Upper Brand Info */}
      <div>
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <FolderLock className="text-amber-500 w-6 h-6 animate-pulse" />
            <h1 className="font-sans font-bold text-lg text-slate-100 tracking-tight">
              Godot 2D content
            </h1>
          </div>
          {/* Editable project indicator */}
          <div className="mt-2">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 w-full bg-slate-950 border border-slate-800 text-slate-300 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-amber-500 transition-all font-medium"
              placeholder="Godot Adventure"
              id="sidebar-project-input"
            />
          </div>
        </div>

        {/* Dynamic Nav link Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
                id={`sidebar-link-${item.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-500/80"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer credentials */}
      <div className="p-4 border-t border-slate-800 text-center bg-slate-950/40">
        <span className="text-[10px] font-mono text-slate-500">
          Godot 4.x Content Engine
        </span>
        <div className="flex justify-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold">
            Local Mode
          </span>
        </div>
      </div>
    </aside>
  );
}
