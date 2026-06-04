/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Monster, Item, Biome, GeneratedWorld, GridTile } from "./types";

// SVG Render Helper Paths
export const HAIR_STYLES: Record<string, { name: string; paths: string[] }> = {
  spiky: {
    name: "Spiky Anime",
    paths: [
      "M 30,22 C 25,12 35,5 45,8 C 55,5 65,10 60,22 C 68,15 72,25 65,30 C 58,25 55,30 45,28 C 35,30 32,25 25,30 C 18,25 22,15 30,22 Z",
    ],
  },
  long: {
    name: "Ranger Mane",
    paths: [
      "M 25,30 C 22,15 32,10 45,10 C 58,10 68,15 65,30 C 68,45 62,60 60,65 C 55,60 55,50 45,52 C 35,50 35,60 30,65 C 28,60 22,45 25,30 Z",
    ],
  },
  helmet: {
    name: "Iron Kettle",
    paths: [
      "M 22,32 C 22,15 32,12 45,12 C 58,12 68,15 68,32 C 70,36 65,38 65,38 L 58,35 L 45,40 L 32,35 L 25,38 Z",
    ],
  },
  ninja: {
    name: "Shinobi Wrap",
    paths: [
      "M 26,24 C 26,16 34,14 45,14 C 56,14 64,16 64,24 L 64,36 L 26,36 Z",
      "M 62,32 L 72,28 L 74,34 L 64,38 Z", // tail 1
    ],
  },
};

export const FACE_STYLES: Record<string, { name: string; render: (color: string) => string }> = {
  scout: {
    name: "Scout Visor",
    render: (color) => `
      <rect x="36" y="38" width="18" height="6" rx="2" fill="${color}" stroke="#111827" stroke-width="2"/>
      <path d="M 45,46 L 45,49 M 41,50 Q 45,53 49,50" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  proud: {
    name: "Heroic Eyes",
    render: () => `
      <circle cx="38" cy="40" r="3" fill="#111827" />
      <circle cx="52" cy="40" r="3" fill="#111827" />
      <path d="M 34,36 L 42,38 M 56,36 L 48,38" stroke="#111827" stroke-width="2" stroke-linecap="round" />
      <path d="M 41,48 Q 45,52 49,48" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round" />
    `,
  },
  beast: {
    name: "Feral Scars",
    render: () => `
      <path d="M 36,36 L 40,42 M 54,36 L 50,42" stroke="#dc2626" stroke-width="2" />
      <polygon points="36,43 39,40 42,43" fill="#111827" />
      <polygon points="54,43 51,40 48,43" fill="#111827" />
      <path d="M 41,50 Q 45,46 49,50" stroke="#111827" stroke-width="2" fill="none" stroke-linecap="round" />
    `,
  },
};

export const CLOTHES_STYLES: Record<string, { name: string; paths: string[] }> = {
  ranger: {
    name: "Ranger Jerkin",
    paths: [
      "M 30,55 L 60,55 L 65,75 L 58,85 L 32,85 L 25,75 Z", // tunic
      "M 45,55 L 45,85 M 36,65 L 54,65" // leather straps
    ],
  },
  plate: {
    name: "Steel Plate",
    paths: [
      "M 28,55 L 62,55 L 64,80 L 55,90 L 35,90 L 26,80 Z", // metal breastplate
      "M 35,62 L 55,62 M 35,72 L 55,72" // steel ribs
    ],
  },
  robes: {
    name: "Mage Vestments",
    paths: [
      "M 28,55 L 62,55 L 68,92 L 22,92 Z", // long robes
      "M 45,55 L 38,92 M 45,55 L 52,92" // gold trim edges
    ],
  },
};

export const WEAPON_STYLES: Record<string, { name: string; paths: string[]; isTwoHanded?: boolean }> = {
  sword: {
    name: "Iron Broadsword",
    paths: [
      "M 66,55 L 85,30 L 90,35 L 71,60 Z", // Blade
      "M 62,59 L 71,50 L 74,53 L 65,62 Z", // Crossguard
      "M 64,61 L 58,67" // Hilt
    ],
  },
  bow: {
    name: "Composite Bow",
    paths: [
      "M 65,30 Q 82,48 65,80 M 65,33 L 64,77", // Bow string + stave
      "M 55,55 L 80,55" // Arrow ready
    ],
  },
  staff: {
    name: "Primal Staff",
    paths: [
      "M 58,78 L 84,28 M 80,31 L 82,25", // Wooden staff shaft
      "M 84,23 C 86,18 94,22 91,28 C 88,34 80,30 84,23 Z" // Magic gem top
    ],
  },
};

export const ACCESSORY_STYLES: Record<string, { name: string; paths: string[] }> = {
  cape: {
    name: "Crimson Cape",
    paths: [
      "M 28,58 L 18,90 L 45,95 L 72,90 L 62,58 C 50,52 40,52 28,58 Z",
    ],
  },
  shoulders: {
    name: "Spiked Pauldrons",
    paths: [
      "M 24,52 L 34,48 L 32,58 Z", // left pad
      "M 66,52 L 56,48 L 58,58 Z", // right pad
    ],
  },
  none: {
    name: "No Accessory",
    paths: [],
  },
};

// Default sample databases
export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: "char_001",
    name: "Desert Scout",
    race: "human",
    job: "scout",
    description: "Highly focused pathfinder trained to traverse the endless shifting sands of the Scorched Basin.",
    stats: { hp: 100, speed: 120, attack: 14, defense: 8, mana: 10 },
    tags: ["scout", "desert", "fast", "starter"],
    parts: {
      head: "default",
      hair: "spiky",
      face: "scout",
      body: "default",
      clothes: "ranger",
      weapon: "sword",
      accessory: "cape",
      shadow: "default",
    },
    colors: {
      hair: "#d97706", // sandy yellow
      skin: "#f59e0b", // bronze
      clothes: "#065f46", // deep hunter green
      weapon: "#9ca3af", // iron steel
      accessory: "#dc2626", // crimson
    },
  },
];

export const DEFAULT_MONSTERS: Monster[] = [
  {
    id: "mon_001",
    name: "Desert Beast",
    type: "beast",
    description: "A spiked reptile predator pulling itself through canyons with armored claws and toxic horns.",
    stats: { hp: 180, speed: 95, attack: 28, defense: 15 },
    tags: ["beast", "desert", "hostile", "midboss"],
    element: "earth",
    threatLevel: "B",
    visualType: "beast",
    color: "#ca8a04",
  },
  {
    id: "mon_002",
    name: "Cactus Slime",
    type: "slime",
    description: "A bouncy green substance of pure water that grew razor-sharp needles.",
    stats: { hp: 60, speed: 70, attack: 8, defense: 4 },
    tags: ["slime", "desert", "common"],
    element: "water",
    threatLevel: "E",
    visualType: "slime",
    color: "#22c55e",
  },
];

export const DEFAULT_ITEMS: Item[] = [
  {
    id: "item_001",
    name: "Iron Sword",
    type: "weapon",
    description: "Standard infantry arm forged of common iron ore. Reliable and holds a moderate edge.",
    stats: { value: 150, weight: 4.5, power: 18, durability: 100 },
    tags: ["sword", "iron", "melee", "weapon"],
    rarity: "common",
    iconShape: "sword",
    color: "#9ca3af",
  },
  {
    id: "item_002",
    name: "Scout Bandana",
    type: "armor",
    description: "Light cloth wrap covering the face. Provides defense against harsh winds and blazing solar heat.",
    stats: { value: 75, weight: 0.2, power: 4, durability: 50 },
    tags: ["cloth", "headwear", "scout"],
    rarity: "uncommon",
    iconShape: "shield",
    color: "#d97706",
  },
];

export const DEFAULT_BIOMES: Biome[] = [
  {
    id: "biome_001",
    name: "Scorched Basin",
    color: "#f59e0b",
    waterAmount: 10,
    vegetationAmount: 15,
    mountainAmount: 40,
    spawnMonsters: ["mon_001", "mon_002"],
    spawnItems: ["item_001", "item_002"],
    description: "An arid, sun-baked landscape structured with red sandstone towers, deep dust canyons, and high heat hazards.",
  },
];

// Helper to procedural generate high-quality map grids
// LCG Random Class for fully deterministic procedurals
export class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  // Returns number in range [0, 1)
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  // Returns float in [min, max)
  nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  // Returns integer in [min, max]
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }
}

// 2D Value / Perlin-like Noise implementation
function hash2D(x: number, y: number, seed: number): number {
  const h = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453123;
  return h - Math.floor(h);
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function smoothNoise2D(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const u = fade(xf);
  const v = fade(yf);

  const n00 = hash2D(xi, yi, seed);
  const n10 = hash2D(xi + 1, yi, seed);
  const n01 = hash2D(xi, yi + 1, seed);
  const n11 = hash2D(xi + 1, yi + 1, seed);

  const x1 = lerp(n00, n10, u);
  const x2 = lerp(n01, n11, u);

  return lerp(x1, x2, v);
}

export function perlinNoise2D(x: number, y: number, seed: number, octaves = 4, persistence = 0.55): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += smoothNoise2D(x * frequency, y * frequency, seed + i * 51) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

export function buildProceduralMap(options: {
  width: number;
  height: number;
  seed: number;
  waterAmount: number;
  forestAmount: number;
  mountainAmount: number;
  villageCount: number;
  resourceDensity: number;
  monsterDensity: number;
}): GeneratedWorld {
  const {
    width,
    height,
    seed,
    waterAmount,
    forestAmount,
    mountainAmount,
    villageCount,
    resourceDensity,
    monsterDensity,
  } = options;

  const prng = new SeededRandom(seed);
  const grid: GridTile[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill("grass"));

  // 1. Generate core elevation and moisture values with our 2D noise
  const elevations: number[][] = [];
  const moistures: number[][] = [];

  for (let y = 0; y < height; y++) {
    const rowE: number[] = [];
    const rowM: number[] = [];
    for (let x = 0; x < width; x++) {
      // Map grid space to noise scale
      const nx = x * 0.14;
      const ny = y * 0.14;
      
      const elevVal = perlinNoise2D(nx, ny, seed, 4, 0.55);
      const moistVal = perlinNoise2D(nx, ny, seed + 9999, 3, 0.5);
      rowE.push(elevVal);
      rowM.push(moistVal);
    }
    elevations.push(rowE);
    moistures.push(rowM);
  }

  // Define thresholds based on slider bounds [0, 100]
  const waterCutoff = (waterAmount / 100) * 0.65;
  const mountainCutoff = 1.0 - (mountainAmount / 100) * 0.55;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const e = elevations[y][x];
      const m = moistures[y][x];

      if (waterAmount > 0 && e < waterCutoff) {
        grid[y][x] = "water";
      } else if (mountainAmount > 0 && e > mountainCutoff) {
        grid[y][x] = "mountain";
      } else {
        // Decide between desert (sand), forest, and grass
        // Sand corresponds to very dry moisture
        if (m < 0.35) {
          grid[y][x] = "sand";
        } else if (forestAmount > 0 && m > (0.8 - (forestAmount / 100) * 0.65)) {
          grid[y][x] = "forest";
        } else {
          grid[y][x] = "grass";
        }
      }
    }
  }

  // 2. Put sand beaches next to water edges
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === "grass" || grid[y][x] === "forest") {
        let nearWater = false;
        const neighbors = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (grid[ny][nx] === "water") {
              nearWater = true;
            }
          }
        }
        if (nearWater && prng.next() < 0.7) {
          grid[y][x] = "sand";
        }
      }
    }
  }

  // 3. Setup Spawn Point outward from center of grass/sand
  let spawnPoint = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  let spawnPlaced = false;
  const maxRadius = Math.max(width, height);
  for (let r = 0; r < maxRadius && !spawnPlaced; r++) {
    for (let dx = -r; dx <= r && !spawnPlaced; dx++) {
      for (let dy = -r; dy <= r && !spawnPlaced; dy++) {
        const sx = spawnPoint.x + dx;
        const sy = spawnPoint.y + dy;
        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          if (grid[sy][sx] === "grass" || grid[sy][sx] === "sand") {
            spawnPoint = { x: sx, y: sy };
            grid[sy][sx] = "spawn";
            spawnPlaced = true;
          }
        }
      }
    }
  }
  if (!spawnPlaced) {
    grid[spawnPoint.y][spawnPoint.x] = "spawn";
  }

  // 4. Place Villages strictly based on villageCount
  const villageCandidates: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Do not replace spawn coordinates
      if (x === spawnPoint.x && y === spawnPoint.y) continue;
      if (grid[y][x] === "grass" || grid[y][x] === "sand") {
        villageCandidates.push({ x, y });
      }
    }
  }
  let villagesPlaced = 0;
  while (villagesPlaced < villageCount && villageCandidates.length > 0) {
    const rIdx = Math.floor(prng.next() * villageCandidates.length);
    const { x, y } = villageCandidates.splice(rIdx, 1)[0];
    grid[y][x] = "village";
    villagesPlaced++;
  }

  // 5. Spawn Chest / Mine Resource Points depending on resourceDensity
  const chestCount = Math.floor((width * height * resourceDensity) / 100);
  const resourceCandidates: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === spawnPoint.x && y === spawnPoint.y) continue;
      const t = grid[y][x];
      if (t === "grass" || t === "forest" || t === "sand" || t === "mountain") {
        resourceCandidates.push({ x, y });
      }
    }
  }

  const resourcePoints: { x: number; y: number; type: string }[] = [];
  let placedResources = 0;
  while (placedResources < chestCount && resourceCandidates.length > 0) {
    const rIdx = Math.floor(prng.next() * resourceCandidates.length);
    const { x, y } = resourceCandidates.splice(rIdx, 1)[0];
    const rType = prng.next() > 0.5 ? "chest_gold" : "mine_iron";
    resourcePoints.push({ x, y, type: rType });
    grid[y][x] = "chest";
    placedResources++;
  }

  // 6. Spawn Monsters points according to monsterDensity
  const monsterCount = Math.floor((width * height * monsterDensity) / 100);
  const monsterCandidates: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === spawnPoint.x && y === spawnPoint.y) continue;
      const t = grid[y][x];
      if (t !== "water" && t !== "spawn" && t !== "village") {
        monsterCandidates.push({ x, y });
      }
    }
  }

  const monsterSpawnPoints: { x: number; y: number }[] = [];
  let placedMonsters = 0;
  while (placedMonsters < monsterCount && monsterCandidates.length > 0) {
    const rIdx = Math.floor(prng.next() * monsterCandidates.length);
    const { x, y } = monsterCandidates.splice(rIdx, 1)[0];
    monsterSpawnPoints.push({ x, y });
    placedMonsters++;
  }

  return {
    id: `map_${seed || 42}`,
    name: "Procedural Haven Map",
    width,
    height,
    tileSize: 16,
    biomeId: "biome_001",
    seed,
    waterAmount,
    forestAmount,
    mountainAmount,
    villageCount,
    monsterDensity,
    resourceDensity,
    grid,
    spawnPoint,
    resourcePoints,
    monsterSpawnPoints,
  };
}

export const DEFAULT_WORLD: GeneratedWorld = buildProceduralMap({
  width: 16,
  height: 16,
  seed: 2026,
  waterAmount: 15,
  forestAmount: 20,
  mountainAmount: 30,
  villageCount: 1,
  resourceDensity: 8,
  monsterDensity: 12,
});
