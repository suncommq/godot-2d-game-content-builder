/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ProjectDb, Character, Monster, Item, GeneratedWorld } from "./types";
import {
  DEFAULT_CHARACTERS,
  DEFAULT_MONSTERS,
  DEFAULT_ITEMS,
  DEFAULT_BIOMES,
  DEFAULT_WORLD
} from "./data";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CharacterBuilder from "./components/CharacterBuilder";
import MonsterBuilder from "./components/MonsterBuilder";
import ItemBuilder from "./components/ItemBuilder";
import DataEditor from "./components/DataEditor";
import WorldBuilder from "./components/WorldBuilder";
import ExportCenter from "./components/ExportCenter";
import Documentation from "./components/Documentation";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Load project name from LocalStorage or default
  const [projectName, setProjectName] = useState<string>(() => {
    return localStorage.getItem("godot_content_project_name") || "Sandbox Kingdom";
  });

  // Track full Project Database state with initial values
  const [db, setDb] = useState<ProjectDb>(() => {
    const backup = localStorage.getItem("godot2d_master_db");
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        // Ensure all required collections exist
        return {
          characters: parsed.characters || DEFAULT_CHARACTERS,
          monsters: parsed.monsters || DEFAULT_MONSTERS,
          items: parsed.items || DEFAULT_ITEMS,
          weapons: parsed.weapons || [],
          armors: parsed.armors || [],
          plants: parsed.plants || [],
          animals: parsed.animals || [],
          biomes: parsed.biomes || DEFAULT_BIOMES,
          maps: parsed.maps || [DEFAULT_WORLD],
          quests: parsed.quests || [],
          dialogues: parsed.dialogues || [],
        };
      } catch (err) {
        console.error("Local records corrupt; bootstrapping initial layout.", err);
      }
    }
    return {
      characters: DEFAULT_CHARACTERS,
      monsters: DEFAULT_MONSTERS,
      items: DEFAULT_ITEMS,
      weapons: [],
      armors: [],
      plants: [],
      animals: [],
      biomes: DEFAULT_BIOMES,
      maps: [DEFAULT_WORLD],
      quests: [],
      dialogues: [],
    };
  });

  // Local storage synchronization effects
  useEffect(() => {
    localStorage.setItem("godot2d_master_db", JSON.stringify(db));
  }, [db]);

  useEffect(() => {
    localStorage.setItem("godot_content_project_name", projectName);
  }, [projectName]);

  // Saving handoffs
  const saveCharacter = (char: Character) => {
    setDb((prev) => {
      const idx = prev.characters.findIndex((c) => c.id === char.id);
      const update = [...prev.characters];
      if (idx !== -1) {
        update[idx] = char;
      } else {
        update.push(char);
      }
      return { ...prev, characters: update };
    });
  };

  const saveMonster = (monster: Monster) => {
    setDb((prev) => {
      const idx = prev.monsters.findIndex((m) => m.id === monster.id);
      const update = [...prev.monsters];
      if (idx !== -1) {
        update[idx] = monster;
      } else {
        update.push(monster);
      }
      return { ...prev, monsters: update };
    });
  };

  const saveItem = (itemObj: Item) => {
    setDb((prev) => {
      const idx = prev.items.findIndex((i) => i.id === itemObj.id);
      const update = [...prev.items];
      if (idx !== -1) {
        update[idx] = itemObj;
      } else {
        update.push(itemObj);
      }
      return { ...prev, items: update };
    });
  };

  const saveMap = (mapObj: GeneratedWorld) => {
    setDb((prev) => {
      const update = [mapObj]; // For MVP, we preserve 1 primary active grid map
      return { ...prev, maps: update };
    });
  };

  // Render chosen tab view
  const renderActiveView = () => {
    switch (activeTab) {
      case "char-builder":
        return <CharacterBuilder characters={db.characters} onSave={saveCharacter} />;
      case "monster-builder":
        return <MonsterBuilder monsters={db.monsters} onSave={saveMonster} />;
      case "item-builder":
        return <ItemBuilder items={db.items} onSave={saveItem} />;
      case "data-editor":
        return <DataEditor db={db} setDb={setDb} />;
      case "world-builder":
        return <WorldBuilder map={db.maps[0] || DEFAULT_WORLD} onSave={saveMap} db={db} />;
      case "export-center":
        return <ExportCenter db={db} projectName={projectName} />;
      case "documentation":
        return <Documentation />;
      case "dashboard":
      default:
        return <Dashboard db={db} projectName={projectName} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none" id="master-app-grid">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectName={projectName}
        setProjectName={setProjectName}
      />

      {/* Main Core display container */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-8 flex flex-col justify-between" id="app-main-pane">
        <div className="space-y-6">
          {/* Header context trail */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-rose-950/20 border-slate-800 pb-3">
            <span className="text-slate-500 uppercase tracking-widest font-bold">
              Project Root / <span className="text-slate-350">{activeTab.replace("-", " ")}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Workspace status:</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                In Sync
              </span>
            </div>
          </div>

          {/* Dynamic Route views */}
          <div className="transition-all duration-300">
            {renderActiveView()}
          </div>
        </div>

        {/* Outer credit frame */}
        <div className="pt-8 text-center text-[10px] font-mono text-slate-600 border-t border-slate-900 mt-12 flex justify-between">
          <span>Godot 2D Game Content Builder v1.1.0 (PRO)</span>
          <span>Crafted for actual engine workflows</span>
        </div>
      </main>
    </div>
  );
}
