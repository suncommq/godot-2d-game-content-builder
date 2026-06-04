/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ProjectDb, Character, Monster, Item, Biome } from "../types";
import {
  convertCharactersToXml,
  convertMonstersToXml,
  convertItemsToXml,
  convertBiomesToXml
} from "../utils/exportUtils";
import {
  Database,
  Plus,
  Trash2,
  Copy,
  Folder,
  FileCode,
  Search,
  CheckCircle,
  HelpCircle,
  Undo,
  Redo,
  AlertTriangle,
  FileText,
  Check,
  FileSpreadsheet,
  Upload,
  Play,
  ArrowUpRight,
  Settings,
  Layers,
  Filter,
  Info,
  RefreshCw
} from "lucide-react";

interface DataEditorProps {
  db: ProjectDb;
  setDb: React.Dispatch<React.SetStateAction<ProjectDb>>;
}

type CategoryType =
  | "characters"
  | "monsters"
  | "items"
  | "weapons"
  | "armors"
  | "plants"
  | "animals"
  | "biomes"
  | "maps"
  | "quests"
  | "dialogues";

interface SchemaField {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "tags" | "nested_number";
  required: boolean;
  defaultValue: any;
  description: string;
}

export default function DataEditor({ db, setDb }: DataEditorProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("characters");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Tab selector for output formats: XML vs JSON
  const [previewTab, setPreviewTab] = useState<"xml" | "json">("xml");
  
  // Tab selector for editing: Records Editor vs Schema Configuration vs Import Pipeline
  const [editorTab, setEditorTab] = useState<"records" | "schema" | "import">("records");

  // Multi-format Import panel states
  const [importText, setImportText] = useState("");
  const [importType, setImportType] = useState<"csv" | "xml">("csv");
  const [importLog, setImportLog] = useState<{ status: "success" | "error"; message: string } | null>(null);

  // Schema state overrides for custom fields
  const [customSchemas, setCustomSchemas] = useState<Record<CategoryType, SchemaField[]>>({
    characters: [
      { key: "id", label: "ID", type: "string", required: true, defaultValue: "", description: "Unique database key" },
      { key: "name", label: "Display Name", type: "string", required: true, defaultValue: "New Character", description: "In-game display label" },
      { key: "race", label: "Race / Breed", type: "string", required: true, defaultValue: "human", description: "Species or origins classification" },
      { key: "job", label: "Job Class", type: "string", required: true, defaultValue: "warrior", description: "Combat class/specialization" },
      { key: "description", label: "Saga lore", type: "string", required: false, defaultValue: "", description: "Narrative character context" },
      { key: "stats.hp", label: "Base HP", type: "nested_number", required: true, defaultValue: 100, description: "Starting hit points" },
      { key: "stats.speed", label: "Base Speed", type: "nested_number", required: true, defaultValue: 100, description: "Movement quickness value" },
    ],
    monsters: [
      { key: "id", label: "ID", type: "string", required: true, defaultValue: "", description: "Unique database key" },
      { key: "name", label: "Monster Name", type: "string", required: true, defaultValue: "Green Slime", description: "In-game identifier" },
      { key: "type", label: "Creature Type", type: "string", required: true, defaultValue: "slime", description: "Beast, slime, undead, dragon" },
      { key: "element", label: "Elemental Type", type: "string", required: true, defaultValue: "none", description: "Earth, water, fire, wind, none" },
      { key: "threatLevel", label: "Threat Rating", type: "string", required: true, defaultValue: "D", description: "Standard risk rank index E-S" },
      { key: "stats.hp", label: "Hit Points", type: "nested_number", required: true, defaultValue: 100, description: "Creature health" },
      { key: "stats.speed", label: "Speed Ratio", type: "nested_number", required: true, defaultValue: 80, description: "Movement velocity index" },
    ],
    items: [
      { key: "id", label: "ID", type: "string", required: true, defaultValue: "", description: "Unique database key" },
      { key: "name", label: "Item Name", type: "string", required: true, defaultValue: "Iron Shield", description: "Catalog inventory header" },
      { key: "type", label: "Category Type", type: "string", required: true, defaultValue: "weapon", description: "Weapon, armor, consumable, material, quest" },
      { key: "rarity", label: "Rarity Factor", type: "string", required: true, defaultValue: "common", description: "Common, uncommon, rare, legendary" },
      { key: "description", label: "Item lore description", type: "string", required: false, defaultValue: "", description: "Flavor descriptions" }
    ],
    weapons: [],
    armors: [],
    plants: [],
    animals: [],
    biomes: [
      { key: "id", label: "ID", type: "string", required: true, defaultValue: "", description: "Biome identifier" },
      { key: "name", label: "Biome Name", type: "string", required: true, defaultValue: "Desert", description: "Region name on map" },
      { key: "waterAmount", label: "Water Humidity %", type: "number", required: true, defaultValue: 15, description: "Tile chance generation ratio" }
    ],
    maps: [],
    quests: [],
    dialogues: []
  });

  // Schema additions inputs form
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<"string" | "number" | "boolean" | "tags">("string");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldDesc, setNewFieldDesc] = useState("");

  // Undo / Redo timeline state tracking
  const [dbHistory, setDbHistory] = useState<ProjectDb[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [historyInitialized, setHistoryInitialized] = useState(false);

  // Initialize history pointers once
  useEffect(() => {
    if (!historyInitialized && db) {
      setDbHistory([db]);
      setHistoryPointer(0);
      setHistoryInitialized(true);
    }
  }, [db, historyInitialized]);

  // Command to commit modifications safely to global storage and timeline logs
  const commitDbState = (newDb: ProjectDb, recordHistory = true) => {
    if (recordHistory) {
      const trimmedStack = dbHistory.slice(0, historyPointer + 1);
      const updatedHistory = [...trimmedStack, newDb];
      
      // Limit timeline stack to last 20 operations to save DOM frames memory
      if (updatedHistory.length > 20) {
        updatedHistory.shift();
      }
      
      setDbHistory(updatedHistory);
      setHistoryPointer(updatedHistory.length - 1);
    }
    setDb(newDb);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevIdx = historyPointer - 1;
      setHistoryPointer(prevIdx);
      // Disable direct state recording during navigation triggers
      setDb(dbHistory[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyPointer < dbHistory.length - 1) {
      const nextIdx = historyPointer + 1;
      setHistoryPointer(nextIdx);
      setDb(dbHistory[nextIdx]);
    }
  };

  const categories: { id: CategoryType; label: string; count: number }[] = [
    { id: "characters", label: "Characters DB", count: db.characters?.length || 0 },
    { id: "monsters", label: "Monsters DB", count: db.monsters?.length || 0 },
    { id: "items", label: "Items DB", count: db.items?.length || 0 },
    { id: "weapons", label: "Weapons config", count: db.weapons?.length || 0 },
    { id: "armors", label: "Armors config", count: db.armors?.length || 0 },
    { id: "plants", label: "Resource: Plants", count: db.plants?.length || 0 },
    { id: "animals", label: "Fauna: Animals", count: db.animals?.length || 0 },
    { id: "biomes", label: "Biomes config", count: db.biomes?.length || 0 },
    { id: "maps", label: "Generative Maps", count: db.maps?.length || 0 },
    { id: "quests", label: "Quests DB", count: db.quests?.length || 0 },
    { id: "dialogues", label: "Dialogues config", count: db.dialogues?.length || 0 },
  ];

  // Helper selector to retrieve lists in the active category
  const getCategoryItems = () => {
    return db[activeCategory] || [];
  };

  // Automated Godot pathway generation resolver
  const getGodotRelativeResourcePath = (itemId: string, name: string) => {
    const slugName = name.toLowerCase().replace(/\s+/g, "_");
    switch (activeCategory) {
      case "characters":
        return `res://scenes/characters/${itemId}_${slugName}.tscn`;
      case "monsters":
        return `res://scenes/monsters/${itemId}_${slugName}.tres`;
      case "items":
        return `res://resources/items/${itemId}_${slugName}.tres`;
      default:
        return `res://data/${activeCategory}/${itemId}_${slugName}.tres`;
    }
  };

  // Add Item conforming to dynamic categories schemas
  const handleAddItem = () => {
    const freshId = `${activeCategory.substring(0, 4)}_${Date.now()}`;
    const schemaFields = customSchemas[activeCategory];
    
    // Auto-generate item payload matching the dynamic fields defined in schemas
    const newObj: any = { id: freshId };
    
    schemaFields.forEach(f => {
      if (f.key.includes(".")) {
        const [parent, child] = f.key.split(".");
        if (!newObj[parent]) newObj[parent] = {};
        newObj[parent][child] = f.defaultValue;
      } else {
        newObj[f.key] = f.defaultValue;
      }
    });

    // Provide default fallback tags array if not already configured in active schemas
    if (!newObj.tags) {
      newObj.tags = ["sandbox"];
    }
    if (!newObj.name) {
      newObj.name = `New ${activeCategory.slice(0, -1)}`;
    }
    if (!newObj.description) {
      newObj.description = "A customized entry compiled inside the database editor.";
    }

    const updatedDb = {
      ...db,
      [activeCategory]: [...(db[activeCategory] || []), newObj]
    };
    commitDbState(updatedDb);
  };

  const handleDeleteItem = (id: string) => {
    const updatedDb = {
      ...db,
      [activeCategory]: (db[activeCategory] || []).filter((item: any) => item.id !== id)
    };
    commitDbState(updatedDb);
  };

  const handleCloneItem = (itemObj: any) => {
    const clone = {
      ...itemObj,
      id: `${activeCategory.substring(0, 4)}_${Date.now()}`,
      name: `${itemObj.name} (Clone)`
    };
    const updatedDb = {
      ...db,
      [activeCategory]: [...(db[activeCategory] || []), clone]
    };
    commitDbState(updatedDb);
  };

  const handleUpdateItemField = (id: string, field: string, value: any) => {
    const updatedDb = {
      ...db,
      [activeCategory]: (db[activeCategory] || []).map((itm: any) => {
        if (itm.id === id) {
          if (field.includes(".")) {
            const [parent, child] = field.split(".");
            return {
              ...itm,
              [parent]: {
                ...(itm[parent] || {}),
                [child]: value
              }
            };
          }
          return { ...itm, [field]: value };
        }
        return itm;
      })
    };
    commitDbState(updatedDb);
  };

  // Interactive dynamic XML Schema attribute appender
  const handleAddSchemaField = () => {
    if (!newFieldKey.trim() || !newFieldLabel.trim()) return;

    const normalKey = newFieldKey.trim().toLowerCase().replace(/\s+/g, "_");
    const newField: SchemaField = {
      key: normalKey,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      defaultValue: newFieldType === "number" ? 0 : newFieldType === "boolean" ? false : newFieldType === "tags" ? [] : "",
      description: newFieldDesc.trim() || "Custom field attribute"
    };

    setCustomSchemas(prev => {
      const activeList = prev[activeCategory] || [];
      // Do not duplicate internal keys mapping
      if (activeList.some(f => f.key === normalKey)) return prev;
      return {
        ...prev,
        [activeCategory]: [...activeList, newField]
      };
    });

    // Retroactively add default values to all existing database records to maintain validation safety
    const updatedDb = {
      ...db,
      [activeCategory]: (db[activeCategory] || []).map((itm: any) => {
        if (itm[normalKey] === undefined) {
          return { ...itm, [normalKey]: newField.defaultValue };
        }
        return itm;
      })
    };
    commitDbState(updatedDb, true);

    // Clear Schema input states
    setNewFieldKey("");
    setNewFieldLabel("");
    setNewFieldRequired(false);
    setNewFieldDesc("");
  };

  const handleRemoveSchemaField = (keyToRemove: string) => {
    setCustomSchemas(prev => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).filter(f => f.key !== keyToRemove)
    }));
  };

  // Diagnostic Analyzer: Required Fields Validation
  const validateItemRequirements = (item: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const fields = customSchemas[activeCategory] || [];

    // Core ID & Name are always strictly required
    if (!item.id?.trim()) {
      errors.push("Missing core identifier [id]");
    }
    if (!item.name?.trim()) {
      errors.push("Display [name] must be configured");
    }

    fields.forEach(f => {
      if (f.required) {
        if (f.key.includes(".")) {
          const [parent, child] = f.key.split(".");
          const parentVal = item[parent];
          const val = parentVal ? parentVal[child] : undefined;
          if (val === undefined || val === null || val === "") {
            errors.push(`Required field [${f.label}] is unconfigured`);
          }
        } else {
          const val = item[f.key];
          if (val === undefined || val === null || val === "") {
            errors.push(`Required field [${f.label}] is unconfigured`);
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  };

  // Diagnostic Analyzer: Unique ID collision detector
  const findIdCollisions = (): Set<string> => {
    const ids = getCategoryItems().map((itm: any) => itm.id);
    const collisions = new Set<string>();
    const seen = new Set<string>();
    ids.forEach(id => {
      if (seen.has(id)) {
        collisions.add(id);
      }
      seen.add(id);
    });
    return collisions;
  };

  const idCollisions = findIdCollisions();

  // Multi-format Import handling (XML & CSV parsed inline)
  const handlePasteImport = () => {
    setImportLog(null);
    if (!importText.trim()) return;

    try {
      if (importType === "csv") {
        // Simple client-side quick CSV parser
        const lines = importText.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          throw new Error("CSV payload must contain a headers line and at least 1 record entry row");
        }

        const headers = lines[0].split(",").map(h => h.trim());
        const importedList: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cells = lines[i].split(",").map(c => c.trim());
          const obj: any = {};
          
          headers.forEach((h, hIdx) => {
            const rawVal = cells[hIdx] || "";
            // Parse common values dynamically
            if (rawVal.toLowerCase() === "true") obj[h] = true;
            else if (rawVal.toLowerCase() === "false") obj[h] = false;
            else if (!isNaN(Number(rawVal)) && rawVal !== "") obj[h] = Number(rawVal);
            else if (h === "tags") obj[h] = rawVal.split(";").filter(Boolean);
            else obj[h] = rawVal;
          });

          // Ensure standard ID exists
          if (!obj.id) {
            obj.id = `${activeCategory.substring(0, 4)}_${Date.now()}_${i}`;
          }
          if (!obj.name) {
            obj.name = `CSV Import #${i}`;
          }
          importedList.push(obj);
        }

        const updatedDb = {
          ...db,
          [activeCategory]: [...(db[activeCategory] || []), ...importedList]
        };
        commitDbState(updatedDb);
        setImportLog({
          status: "success",
          message: `Successfully appended ${importedList.length} rows loaded from CSV!`
        });
        setImportText("");
      } else {
        // XML parsing using build-in DOMParser
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(importText, "text/xml");
        
        // Handle potential parser error elements
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
          throw new Error(`XML validation error: ${parseError[0].textContent}`);
        }

        const entries = xmlDoc.getElementsByTagName("entry");
        if (entries.length === 0) {
          throw new Error("No <entry> tags identified in provided XML document");
        }

        const importedList: any[] = [];

        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const idAttr = entry.getAttribute("id");
          const obj: any = {
            id: idAttr || `${activeCategory.substring(0, 4)}_xml_${Date.now()}_${i}`
          };

          // Map children tags to keys
          const children = entry.children;
          for (let j = 0; j < children.length; j++) {
            const child = children[j];
            const nodeName = child.nodeName;
            const textVal = child.textContent || "";

            if (nodeName === "tags") {
              obj.tags = textVal.split(",").map(t => t.trim()).filter(Boolean);
            } else if (nodeName === "stats") {
              // Parse basic stats layout recursively
              obj.stats = {};
              const statsChildren = child.children;
              if (statsChildren.length > 0) {
                for (let k = 0; k < statsChildren.length; k++) {
                  const statNode = statsChildren[k];
                  obj.stats[statNode.nodeName] = Number(statNode.textContent) || 100;
                }
              } else {
                obj.stats = { hp: 100, speed: 100 };
              }
            } else if (!isNaN(Number(textVal)) && textVal !== "") {
              obj[nodeName] = Number(textVal);
            } else {
              obj[nodeName] = textVal;
            }
          }

          if (!obj.name) {
            obj.name = `XML Import #${i}`;
          }
          importedList.push(obj);
        }

        const updatedDb = {
          ...db,
          [activeCategory]: [...(db[activeCategory] || []), ...importedList]
        };
        commitDbState(updatedDb);
        setImportLog({
          status: "success",
          message: `Successfully loaded ${importedList.length} records parsed from static XML!`
        });
        setImportText("");
      }
    } catch (err: any) {
      setImportLog({
        status: "error",
        message: err.message || "Parsing pipeline failure code."
      });
    }
  };

  // Compile XML representations beautifully
  const generateXmlPreview = () => {
    switch (activeCategory) {
      case "characters":
        return convertCharactersToXml(db.characters || []);
      case "monsters":
        return convertMonstersToXml(db.monsters || []);
      case "items":
        return convertItemsToXml(db.items || []);
      case "biomes":
        return convertBiomesToXml(db.biomes || []);
      default:
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Godot 2D custom resources XML -->\n<${activeCategory}>\n`;
        (db[activeCategory] || []).forEach((item: any) => {
          xml += `  <entry id="${item.id}">\n`;
          xml += `    <name>${item.name}</name>\n`;
          xml += `    <description>${item.description || "N/A"}</description>\n`;
          xml += `    <type>${item.type || "N/A"}</type>\n`;
          if (item.tags && item.tags.length > 0) {
            xml += `    <tags>${item.tags.join(",")}</tags>\n`;
          }
          xml += `  </entry>\n`;
        });
        xml += `</${activeCategory}>`;
        return xml;
    }
  };

  // Generate interactive, readable JSON outputs
  const generateJsonPreview = () => {
    return JSON.stringify(db[activeCategory] || [], null, 2);
  };

  const handleCopyCode = () => {
    const activeText = previewTab === "xml" ? generateXmlPreview() : generateJsonPreview();
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract unique tags out of current category list for filters mapping
  const getAllUniqueTags = (): string[] => {
    const list = getCategoryItems();
    const tagsSet = new Set<string>();
    list.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((t: string) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  };

  const availableTags = getAllUniqueTags();

  // Search, collision, and tagging filter matrices
  const filteredItems = getCategoryItems().filter((item: any) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = activeFilterTag
      ? item.tags && Array.isArray(item.tags) && item.tags.includes(activeFilterTag)
      : true;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-6">
      
      {/* Top action context panel with central Undo / Redo timeline controller */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4" id="editor-banner">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest block">
            MASTER ENVIRONMENT TOOLKIT
          </span>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" /> Commercial-Grade Game Data Editor
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Design static structures, configure XML/JSON field type schemas, validate required field completeness, resolve Key ID collisions, and test CSV imports dynamically.
          </p>
        </div>

        {/* History Timeline Buttons */}
        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold shrink-0">
            Timeline Actions:
          </span>
          <div className="flex gap-1">
            <button
              onClick={handleUndo}
              disabled={historyPointer <= 0}
              title="Undo Last Action"
              className="p-1 px-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 disabled:opacity-30 rounded text-slate-350 text-xs font-mono flex items-center gap-1 transition-all"
            >
              <Undo className="w-3.5 h-3.5 text-amber-500" /> Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyPointer >= dbHistory.length - 1}
              title="Redo Next Action"
              className="p-1 px-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 disabled:opacity-30 rounded text-slate-350 text-xs font-mono flex items-center gap-1 transition-all"
            >
              <Redo className="w-3.5 h-3.5 text-amber-500" /> Redo
            </button>
          </div>
          <span className="text-[10px] font-mono text-slate-600 pl-2 border-l border-slate-800">
            State {historyPointer + 1}/{dbHistory.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
        
        {/* Left column: Categories Navigation Segment */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-550 uppercase tracking-widest font-bold block mb-2">
              Database Catalog
            </span>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery("");
                    setActiveFilterTag(null);
                    setEditorTab("records");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono rounded-lg border transition-all ${
                    activeCategory === cat.id
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold shadow-sm"
                      : "bg-slate-955 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                  id={`editor-folder-${cat.id}`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className={`w-3.5 h-3.5 ${activeCategory === cat.id ? "text-amber-500" : "text-slate-505 text-slate-500"}`} />
                    <span className="capitalize">{cat.id}</span>
                  </div>
                  <span className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 font-bold border border-slate-900">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Engine Environment Diagnostics block */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block font-bold">
              Database Health Monitor
            </span>
            <div className="space-y-2 font-mono text-[11px]">
              
              {/* Unique ID Collisions diagnostics check */}
              {idCollisions.size > 0 ? (
                <div className="flex items-start gap-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block">ID Collisions!</span>
                    <span>Duplicates identified: <code className="text-white font-bold">{Array.from(idCollisions).join(", ")}</code>. Update IDs immediately.</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>All identifiers [id] are unique.</span>
                </div>
              )}

              {/* Blank required field checking indicators */}
              {getCategoryItems().some((itm: any) => !validateItemRequirements(itm).valid) ? (
                <div className="flex items-start gap-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block">Null Fields Check</span>
                    <span>Certain cells deviate from schema validation rules. See warnings below.</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Required items validation: Ready</span>
                </div>
              )}

              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Diagnose relational keys and duplicate indices automatically. Godot loaders expect strict key alignments.
              </p>
            </div>
          </div>

        </div>

        {/* Central Records Form, Custom Schemas Composer, and XML/CSV Loader */}
        <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Workspace Frame */}
          <div className="xl:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="editor-sheets-board">
            <div>
              
              {/* Tab Selector layout */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3.5 mb-4 gap-2">
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                  <button
                    onClick={() => setEditorTab("records")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                      editorTab === "records"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Records Table ({filteredItems.length})
                  </button>
                  <button
                    onClick={() => setEditorTab("schema")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                      editorTab === "schema"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Schema Setup
                  </button>
                  <button
                    onClick={() => setEditorTab("import")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                      editorTab === "import"
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    CSV/XML Import Parser
                  </button>
                </div>

                {editorTab === "records" && (
                  <button
                    onClick={handleAddItem}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold px-3.5 py-1.5 text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
                    id="editor-btn-add"
                  >
                    <Plus className="w-4 h-4 shrink-0" /> Add Record
                  </button>
                )}
              </div>

              {/* VIEW 1: RECORDS GRID EDITOR TABLE */}
              {editorTab === "records" && (
                <div className="space-y-4">
                  
                  {/* Detailed Searches & Tag filter rails */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute top-3 left-3" />
                      <input
                        type="text"
                        placeholder="Search current category by Name, ID keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-amber-500 font-mono focus:ring-1 focus:ring-amber-500/25"
                      />
                    </div>

                    {/* Tags filters chips layout */}
                    {availableTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold px-1 flex items-center gap-1">
                          <Filter className="w-3 h-3 text-slate-500" /> Tags:
                        </span>
                        <button
                          onClick={() => setActiveFilterTag(null)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                            activeFilterTag === null
                              ? "bg-amber-500/10 border-amber-500 text-amber-500"
                              : "bg-slate-950 border-slate-855 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          Show All
                        </button>
                        {availableTags.slice(0, 10).map((tg) => (
                          <button
                            key={tg}
                            onClick={() => setActiveFilterTag(tg)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                              activeFilterTag === tg
                                ? "bg-amber-500/20 border border-amber-500/60 text-amber-400 font-bold"
                                : "bg-slate-950 border border-slate-850 text-slate-450 hover:text-slate-300"
                            }`}
                          >
                            #{tg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Entries card list rendering with detailed field mappings */}
                  <div className="space-y-4 max-h-[510px] overflow-y-auto pr-1">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((itemObj: any) => {
                        const verification = validateItemRequirements(itemObj);
                        const isDuplicate = idCollisions.has(itemObj.id);

                        return (
                          <div
                            key={itemObj.id}
                            className={`p-4 border rounded-xl space-y-3 relative group transition-all ${
                              isDuplicate
                                ? "bg-red-500/5 border-red-500/40"
                                : !verification.valid
                                ? "bg-amber-505/5 bg-amber-500/5 border-amber-500/30"
                                : "bg-slate-950/80 border-slate-850 hover:border-slate-750"
                            }`}
                          >
                            
                            {/* Duplicate & Required warning notification headers */}
                            {isDuplicate && (
                              <div className="p-1 px-2.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-mono text-red-400 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Collision alert: ID is not unique!</span>
                              </div>
                            )}

                            {!verification.valid && (
                              <div className="p-1.5 px-2 bg-amber-500/10 border border-amber-505/20 border-amber-500/20 rounded text-[10px] font-mono text-amber-400 space-y-0.5">
                                <span className="font-bold uppercase tracking-wider block">Warning: Missing schema fields</span>
                                <div className="pl-2 list-disc list-inside">
                                  {verification.errors.map((err, idx) => (
                                    <div key={idx}>• {err}</div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Floating Duplicate/Clone and delete anchors */}
                            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleCloneItem(itemObj)}
                                title="Replicate Data Row"
                                className="p-1 hover:bg-slate-900 rounded text-slate-450 hover:text-amber-500 transition-all"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(itemObj.id)}
                                title="Delete Data Row"
                                className="p-1 hover:bg-slate-950 rounded text-slate-450 hover:text-rose-500 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Row ID & Name headers edits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
                              <div>
                                <label className="text-[9px] text-slate-500 uppercase block mb-1 font-bold">
                                  ID Index
                                </label>
                                <input
                                  type="text"
                                  value={itemObj.id}
                                  onChange={(e) => handleUpdateItemField(itemObj.id, "id", e.target.value)}
                                  className="bg-slate-950/80 text-amber-400 px-2.5 py-1.5 rounded-md w-full border border-slate-850 focus:border-amber-500 focus:outline-none font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 uppercase block mb-1 font-bold">
                                  Display Name
                                </label>
                                <input
                                  type="text"
                                  value={itemObj.name}
                                  onChange={(e) => handleUpdateItemField(itemObj.id, "name", e.target.value)}
                                  className="bg-slate-950/80 text-slate-200 px-2.5 py-1.5 rounded-md w-full border border-slate-850 focus:border-amber-500 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Dynamic Schema Fields Rendering */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {(customSchemas[activeCategory] || []).map((schemaF) => {
                                // Ignore ID or Name which are rendered above
                                if (schemaF.key === "id" || schemaF.key === "name") return null;

                                let activeVal = "";
                                if (schemaF.key.includes(".")) {
                                  const [parent, child] = schemaF.key.split(".");
                                  activeVal = itemObj[parent] ? itemObj[parent][child] : "";
                                } else {
                                  activeVal = itemObj[schemaF.key] !== undefined ? itemObj[schemaF.key] : "";
                                }

                                return (
                                  <div key={schemaF.key}>
                                    <label className="text-[9.5px] font-mono text-slate-500 block mb-0.5 capitalize">
                                      {schemaF.label} {schemaF.required && <span className="text-amber-500">*</span>}
                                    </label>
                                    
                                    {schemaF.type === "boolean" ? (
                                      <select
                                        value={String(activeVal)}
                                        onChange={(e) => handleUpdateItemField(itemObj.id, schemaF.key, e.target.value === "true")}
                                        className="w-full bg-slate-950 text-slate-300 font-mono text-[11px] rounded p-1.5 border border-slate-800"
                                      >
                                        <option value="true">True / Yes</option>
                                        <option value="false">False / No</option>
                                      </select>
                                    ) : (
                                      <input
                                        type={schemaF.type === "number" || schemaF.type === "nested_number" ? "number" : "text"}
                                        value={activeVal}
                                        onChange={(e) => {
                                          const v = schemaF.type === "number" || schemaF.type === "nested_number" ? Number(e.target.value) : e.target.value;
                                          handleUpdateItemField(itemObj.id, schemaF.key, v);
                                        }}
                                        className="w-full bg-slate-950/80 text-slate-300 font-mono text-[11px] rounded p-1.5 border border-slate-800 focus:border-amber-500 focus:outline-none"
                                        placeholder={String(schemaF.defaultValue)}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Relative Godot Resource automatic address output mapping */}
                            <div className="mt-2.5 pt-2 border-t border-slate-850/60 flex items-center justify-between text-[10.5px] font-mono text-slate-500 bg-slate-955 px-2 py-1.5 rounded">
                              <span className="flex items-center gap-1 shrink-0">
                                <ArrowUpRight className="w-3 h-3 text-slate-500" />
                                <span>Engine Resource Map:</span>
                              </span>
                              <span className="text-emerald-555 text-emerald-500 truncate pl-2 select-all hover:text-emerald-400 cursor-copy" title="Click to copy resource pathway">
                                {getGodotRelativeResourcePath(itemObj.id, itemObj.name)}
                              </span>
                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl">
                        <Search className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-slate-400 font-sans text-xs">
                          No records match search parameters.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* VIEW 2: DYNAMIC CUSTOM SCHEMA MODIFIER */}
              {editorTab === "schema" && (
                <div className="space-y-6">
                  
                  {/* Explanation card */}
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1.5">
                    <span className="text-xs font-mono text-amber-550 text-amber-500 font-bold flex items-center gap-1.5">
                      <Settings className="w-4 h-4" /> Customized XML Fields Designer
                    </span>
                    <p className="text-xs text-slate-400 leading-normal">
                      Configure dynamic parameters schema for <span className="text-white capitalize font-semibold font-mono">{activeCategory}</span> template. You may append customized items attributes so that every entry gains matching fields in editing modes.
                    </p>
                  </div>

                  {/* Active schema fields list rendering */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Current Template Schema Attributes
                    </span>

                    <div className="space-y-1.5 font-mono text-xs">
                      {/* Pinned ID Header */}
                      <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded border border-slate-800">
                        <span className="flex items-center gap-2">
                          <span className="font-bold text-amber-500">id</span>
                          <span className="text-[10px] text-slate-500">String • Mandatory primary key identifier</span>
                        </span>
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase">Core Pin</span>
                      </div>

                      {customSchemas[activeCategory]?.map((f) => {
                        if (f.key === "id") return null;
                        return (
                          <div
                            key={f.key}
                            className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded border border-slate-850"
                          >
                            <span className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{f.key}</span>
                                <span className="text-[9.5px] px-1 py-0.2 bg-slate-950 border border-slate-850 text-slate-500 rounded uppercase">
                                  {f.type}
                                </span>
                                {f.required && (
                                  <span className="text-[9px] px-1 bg-red-500/10 text-red-400 border border-red-500/15 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 leading-normal">{f.description}</span>
                            </span>

                            {/* Remove schemas attribute button safely */}
                            <button
                              onClick={() => handleRemoveSchemaField(f.key)}
                              className="text-slate-500 hover:text-rose-500 p-1 bg-slate-950 rounded hover:bg-slate-900 transition-all border border-slate-850/45"
                              title="Delete attribute fields from schema template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Schema Attribute adder compiler form */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4">
                    <span className="text-[10.5px] font-mono text-amber-500 font-bold uppercase tracking-wide block">
                      + Append Custom Parameter Attribute
                    </span>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-400">
                      <div>
                        <label className="text-[9.5px] block mb-1">Param Key ID (e.g. defense, weight)</label>
                        <input
                          type="text"
                          value={newFieldKey}
                          onChange={(e) => setNewFieldKey(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white font-mono focus:border-amber-500 focus:outline-none"
                          placeholder="armor_cooldown"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] block mb-1">Display Label</label>
                        <input
                          type="text"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white focus:border-amber-500 focus:outline-none"
                          placeholder="Armor Cooldown"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-400">
                      <div>
                        <label className="text-[9.5px] block mb-1">Data Type</label>
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 focus:border-amber-500 focus:outline-none"
                        >
                          <option value="string">String (Text)</option>
                          <option value="number">Number (Integer/Float)</option>
                          <option value="boolean">Boolean (True/False)</option>
                          <option value="tags">Tags Array (List)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9.5px] block mb-1">Strict Validation</label>
                        <select
                          value={newFieldRequired ? "true" : "false"}
                          onChange={(e) => setNewFieldRequired(e.target.value === "true")}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 focus:border-amber-500"
                        >
                          <option value="false">Optional Field (Nullable)</option>
                          <option value="true">Mandatory Field (Required)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9.5px] font-mono text-slate-500 block mb-1">Short parameter purpose</label>
                      <input
                        type="text"
                        value={newFieldDesc}
                        onChange={(e) => setNewFieldDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 text-xs focus:border-amber-500 focus:outline-none"
                        placeholder="Recharge delay parameters for skills in seconds..."
                      />
                    </div>

                    <button
                      onClick={handleAddSchemaField}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition-all"
                    >
                      Process & Compile Schema Property
                    </button>
                  </div>

                </div>
              )}

              {/* VIEW 3: CSV & XML BATCH IMPORT PASTE PIPELINE */}
              {editorTab === "import" && (
                <div className="space-y-4">
                  
                  {/* Mode Selector */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setImportType("csv")}
                      className={`flex-1 py-2 font-mono text-xs rounded-lg border font-bold transition-all flex items-center justify-center gap-1.5 ${
                        importType === "csv"
                          ? "bg-amber-50 burn-amber border-amber-500/10 ring-1 ring-amber-500 text-amber-500"
                          : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Integrate CSV Format
                    </button>
                    <button
                      onClick={() => setImportType("xml")}
                      className={`flex-1 py-2 font-mono text-xs rounded-lg border font-bold transition-all flex items-center justify-center gap-1.5 ${
                        importType === "xml"
                          ? "bg-amber-50 border-amber-500/10 ring-1 ring-amber-500 text-amber-500"
                          : "bg-slate-955 border-slate-850 text-slate-500 hover:text-slate-350"
                      }`}
                    >
                      <FileCode className="w-4 h-4" /> Load Native XML Entry tags
                    </button>
                  </div>

                  {/* CSV Template and payload instructions info boxes */}
                  {importType === "csv" ? (
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-xs font-sans text-slate-400 space-y-2">
                      <span className="font-mono text-xs text-white block uppercase">Expected CSV Format:</span>
                      <p>Ensure the first header line matches your properties exactly. Use commas to separate columns. Use semi-colons (;) for tags lists arrays.</p>
                      <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10.5px] text-emerald-400">
                        id,name,description,type,tags{"\n"}
                        inv_char_1,Elf Ranger,Long range scout,scout,magic;fast{"\n"}
                        inv_char_2,Dwarf Miner,Tunnel tracker,miner,shield;hard
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 border border-slate-855 rounded-xl text-xs font-sans text-slate-400 space-y-2">
                      <span className="font-mono text-xs text-white block uppercase">Expected XML Tags list:</span>
                      <p>Embed record rows in <code>&lt;entry id="..."&gt;</code> layers. We will map children tags into category parameters automatically.</p>
                      <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10.5px] text-emerald-400 overflow-x-auto">
                        {`<entries>
  <entry id="xml_char_01">
    <name>Mage Wizard</name>
    <description>Primal fire user</description>
    <tags>spellcaster,fire,godot</tags>
  </entry>
</entries>`}
                      </pre>
                    </div>
                  )}

                  {/* Text pasting field */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block mb-1 font-bold">
                      Raw batch payload input
                    </label>
                    <textarea
                      rows={7}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder={importType === "csv" ? "Paste CSV rows..." : "Paste XML document..."}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-amber-500 leading-normal"
                    />
                  </div>

                  {/* Diagnostics status and logging messages */}
                  {importLog && (
                    <div className={`p-3 rounded-lg border font-mono text-[11px] flex gap-2 ${
                      importLog.status === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {importLog.status === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                      <span>{importLog.message}</span>
                    </div>
                  )}

                  <button
                    onClick={handlePasteImport}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    <Upload className="w-4 h-4 text-slate-950" /> Integrate and Batch Append Records
                  </button>

                </div>
              )}

            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-slate-500 font-mono text-[9.5px] leading-relaxed flex gap-2 mt-6">
              <span className="text-amber-500 font-bold shrink-0">WIDGET PIPELINE STATUS:</span>
              <span>All changes instantly validate relational key schemas and are automatically written directly to local dev server session memory.</span>
            </div>

          </div>

          {/* Right column: Previews Inspector (XML / JSON Tabs switcher) */}
          <div className="xl:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between" id="editor-xml-preview">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <button
                    onClick={() => setPreviewTab("xml")}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                      previewTab === "xml"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm"
                        : "bg-slate-950 border-slate-850 text-slate-450 hover:text-slate-300"
                    }`}
                  >
                    Raw XML
                  </button>
                  <button
                    onClick={() => setPreviewTab("json")}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                      previewTab === "json"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm"
                        : "bg-slate-950 border-slate-850 text-slate-450 hover:text-slate-300"
                    }`}
                  >
                    JSON Schema Output
                  </button>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={handleCopyCode}
                    className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-mono text-[10px] px-2.5 py-1.5 rounded-md border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Format
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* High-quality styled dynamic text box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 font-mono text-[10px] text-emerald-400 overflow-auto max-h-[460px] select-all leading-normal whitespace-pre scrollbar-thin">
                {previewTab === "xml" ? generateXmlPreview() : generateJsonPreview()}
              </div>

            </div>

            {/* Quick Engine Loading Snippet Tip Card */}
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400 leading-relaxed space-y-1.5 p-1 bg-slate-950/40 p-3.5 rounded-lg border border-slate-850">
              <span className="font-bold text-amber-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Godot 4 GDScript Integration Tip:
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Load this {previewTab.toUpperCase()} resource using Godot Autoload, then reference entries seamlessly by key indices inside <code className="text-slate-200 px-1 py-0.5 bg-slate-950 rounded">DataLoader.gd</code> in milliseconds.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
