/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Stats {
  hp: number;
  speed: number;
  attack?: number;
  defense?: number;
  mana?: number;
  luck?: number;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  job: string;
  description: string;
  stats: Stats;
  tags: string[];
  parts: {
    head: string;
    hair: string;
    face: string;
    body: string;
    clothes: string;
    weapon: string;
    accessory: string;
    shadow: string;
  };
  colors: {
    hair: string;
    skin: string;
    clothes: string;
    weapon: string;
    accessory: string;
  };
}

export interface Monster {
  id: string;
  name: string;
  type: string; // e.g. "beast", "slime", "undead", "dragon"
  description: string;
  stats: {
    hp: number;
    speed: number;
    attack: number;
    defense: number;
  };
  tags: string[];
  element: "fire" | "water" | "earth" | "wind" | "dark" | "light" | "none";
  threatLevel: "E" | "D" | "C" | "B" | "A" | "S";
  visualType: "beast" | "slime" | "golem" | "demon";
  color: string;
}

export interface Item {
  id: string;
  name: string;
  type: "weapon" | "armor" | "consumable" | "material" | "quest";
  description: string;
  stats: {
    value: number;
    weight: number;
    power?: number;     // damage for weapons, protection for armor
    durability?: number;
  };
  tags: string[];
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  iconShape: "sword" | "shield" | "potion" | "ring" | "gem";
  color: string;
}

export interface Biome {
  id: string;
  name: string;
  color: string;
  waterAmount: number;
  vegetationAmount: number;
  mountainAmount: number;
  spawnMonsters: string[]; // Monster IDs
  spawnItems: string[];    // Item IDs
  description: string;
}

export type GridTile = "void" | "grass" | "sand" | "water" | "forest" | "mountain" | "spawn" | "chest" | "village";

export interface GeneratedWorld {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  biomeId: string;
  seed: number;
  waterAmount: number;
  forestAmount: number;
  mountainAmount: number;
  villageCount: number;
  monsterDensity: number;
  resourceDensity: number;
  grid: GridTile[][];
  spawnPoint: { x: number; y: number };
  resourcePoints: { x: number; y: number; type: string }[];
  monsterSpawnPoints: { x: number; y: number }[];
}

export interface ProjectDb {
  characters: Character[];
  monsters: Monster[];
  items: Item[];
  weapons: any[];
  armors: any[];
  plants: any[];
  animals: any[];
  biomes: Biome[];
  maps: GeneratedWorld[];
  quests: any[];
  dialogues: any[];
}
