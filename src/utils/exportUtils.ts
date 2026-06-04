/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Monster, Item, Biome, GeneratedWorld } from "../types";
import JSZip from "jszip";

// Convert Characters to pristine XML formats
export function convertCharactersToXml(characters: Character[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<characters>\n';
  characters.forEach((char) => {
    xml += `  <character id="${char.id}">\n`;
    xml += `    <name>${char.name}</name>\n`;
    xml += `    <race>${char.race}</race>\n`;
    xml += `    <job>${char.job}</job>\n`;
    xml += `    <description>${char.description}</description>\n`;
    xml += `    <hp>${char.stats.hp}</hp>\n`;
    xml += `    <speed>${char.stats.speed}</speed>\n`;
    xml += `    <attack>${char.stats.attack || 0}</attack>\n`;
    xml += `    <defense>${char.stats.defense || 0}</defense>\n`;
    xml += `    <sprite_set>${char.parts.clothes}_${char.parts.hair}_${char.id}</sprite_set>\n`;
    xml += `    <colors>\n`;
    xml += `      <hair>${char.colors.hair}</hair>\n`;
    xml += `      <skin>${char.colors.skin}</skin>\n`;
    xml += `      <clothes>${char.colors.clothes}</clothes>\n`;
    xml += `    </colors>\n`;
    xml += `    <tags>${char.tags.join(",")}</tags>\n`;
    xml += `  </character>\n`;
  });
  xml += "</characters>";
  return xml;
}

// Convert Monsters to precise XML formats
export function convertMonstersToXml(monsters: Monster[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<monsters>\n';
  monsters.forEach((mon) => {
    xml += `  <monster id="${mon.id}">\n`;
    xml += `    <name>${mon.name}</name>\n`;
    xml += `    <type>${mon.type}</type>\n`;
    xml += `    <description>${mon.description}</description>\n`;
    xml += `    <hp>${mon.stats.hp}</hp>\n`;
    xml += `    <speed>${mon.stats.speed}</speed>\n`;
    xml += `    <attack>${mon.stats.attack}</attack>\n`;
    xml += `    <defense>${mon.stats.defense}</defense>\n`;
    xml += `    <element>${mon.element}</element>\n`;
    xml += `    <threat_level>${mon.threatLevel}</threat_level>\n`;
    xml += `    <visual_type>${mon.visualType}</visual_type>\n`;
    xml += `    <color>${mon.color}</color>\n`;
    xml += `    <tags>${mon.tags.join(",")}</tags>\n`;
    xml += `  </monster>\n`;
  });
  xml += "</monsters>";
  return xml;
}

// Convert Items to standard XML database format
export function convertItemsToXml(items: Item[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<items>\n';
  items.forEach((item) => {
    xml += `  <item id="${item.id}">\n`;
    xml += `    <name>${item.name}</name>\n`;
    xml += `    <type>${item.type}</type>\n`;
    xml += `    <description>${item.description}</description>\n`;
    xml += `    <value>${item.stats.value}</value>\n`;
    xml += `    <weight>${item.stats.weight}</weight>\n`;
    if (item.stats.power !== undefined) {
      xml += `    <power>${item.stats.power}</power>\n`;
    }
    if (item.stats.durability !== undefined) {
      xml += `    <durability>${item.stats.durability}</durability>\n`;
    }
    xml += `    <rarity>${item.rarity}</rarity>\n`;
    xml += `    <icon_style shape="${item.iconShape}">${item.color}</icon_style>\n`;
    xml += `    <tags>${item.tags.join(",")}</tags>\n`;
    xml += `  </item>\n`;
  });
  xml += "</items>";
  return xml;
}

// Convert Biomes to database XML
export function convertBiomesToXml(biomes: Biome[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<biomes>\n';
  biomes.forEach((bio) => {
    xml += `  <biome id="${bio.id}">\n`;
    xml += `    <name>${bio.name}</name>\n`;
    xml += `    <color>${bio.color}</color>\n`;
    xml += `    <water_amount>${bio.waterAmount}</water_amount>\n`;
    xml += `    <vegetation_amount>${bio.vegetationAmount}</vegetation_amount>\n`;
    xml += `    <mountain_amount>${bio.mountainAmount}</mountain_amount>\n`;
    xml += `    <spawn_monsters>${bio.spawnMonsters.join(",")}</spawn_monsters>\n`;
    xml += `    <spawn_items>${bio.spawnItems.join(",")}</spawn_items>\n`;
    xml += `    <description>${bio.description}</description>\n`;
    xml += `  </biome>\n`;
  });
  xml += "</biomes>";
  return xml;
}

// Generate the DataLoader.gd script which standardizes XML feeding in Godot 4
export function generateDataLoaderScript(): string {
  return `# DataLoader.gd
# Autoload (Singleton) class for parsing XML components in Godot 4.x
# Place this script in res://scripts/DataLoader.gd and active it in Project Settings.

extends Node

var characters: Dictionary = {}
var monsters: Dictionary = {}
var items: Dictionary = {}

func _ready() -> void:
	print("[DataLoader] Initializing game databases...")
	load_characters("res://data/characters.xml")
	load_monsters("res://data/monsters.xml")
	load_items("res://data/items.xml")

func load_characters(path: String) -> void:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		push_error("Failed to load character database at " + path)
		return
	
	var current_id = ""
	var current_data = {}
	var current_node_name = ""
	
	while parser.read() == OK:
		var node_type = parser.get_node_type()
		if node_type == XMLParser.NODE_ELEMENT:
			var node_name = parser.get_node_name()
			current_node_name = node_name
			if node_name == "character":
				current_id = parser.get_named_attribute_value_safe("id")
				current_data = {}
		elif node_type == XMLParser.NODE_TEXT:
			var text_val = parser.get_node_data().strip_edges()
			if text_val != "" and current_id != "":
				if current_node_name in ["hp", "speed", "attack", "defense"]:
					current_data[current_node_name] = text_val.to_int()
				else:
					current_data[current_node_name] = text_val
		elif node_type == XMLParser.NODE_ELEMENT_END:
			if parser.get_node_name() == "character" and current_id != "":
				characters[current_id] = current_data
				current_id = ""
	
	print("[DataLoader] Loaded %d characters from XML." % characters.size())

func load_monsters(path: String) -> void:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		return
	var current_id = ""
	var current_data = {}
	var current_node_name = ""
	while parser.read() == OK:
		var node_type = parser.get_node_type()
		if node_type == XMLParser.NODE_ELEMENT:
			current_node_name = parser.get_node_name()
			if current_node_name == "monster":
				current_id = parser.get_named_attribute_value_safe("id")
				current_data = {}
		elif node_type == XMLParser.NODE_TEXT:
			var text = parser.get_node_data().strip_edges()
			if text != "" and current_id != "":
				if current_node_name in ["hp", "speed", "attack", "defense"]:
					current_data[current_node_name] = text.to_int()
				else:
					current_data[current_node_name] = text
		elif node_type == XMLParser.NODE_ELEMENT_END:
			if parser.get_node_name() == "monster" and current_id != "":
				monsters[current_id] = current_data
				current_id = ""
	print("[DataLoader] Loaded %d monsters from XML." % monsters.size())

func load_items(path: String) -> void:
	var parser := XMLParser.new()
	if parser.open(path) != OK:
		return
	var current_id = ""
	var current_data = {}
	var current_node_name = ""
	while parser.read() == OK:
		var node_type = parser.get_node_type()
		if node_type == XMLParser.NODE_ELEMENT:
			current_node_name = parser.get_node_name()
			if current_node_name == "item":
				current_id = parser.get_named_attribute_value_safe("id")
				current_data = {}
		elif node_type == XMLParser.NODE_TEXT:
			var text = parser.get_node_data().strip_edges()
			if text != "" and current_id != "":
				if current_node_name in ["value", "weight", "power", "durability"]:
					current_data[current_node_name] = text.to_float()
				else:
					current_data[current_node_name] = text
		elif node_type == XMLParser.NODE_ELEMENT_END:
			if parser.get_node_name() == "item" and current_id != "":
				items[current_id] = current_data
				current_id = ""
	print("[DataLoader] Loaded %d items." % items.size())
`;
}

// Generate Godot 4.x WorldLoader.gd that reads the generated JSON map representation
export function generateWorldLoaderScript(): string {
  return `# WorldLoader.gd
# Helper script to parse exported JSON matrix structures and inflate procedural tile grids
# Attach this script to a Node2D containing a TileMapLayer in Godot 4.x

extends Node2D

@onready var tile_map_layer: TileMapLayer = $TileMapLayer

# Tile mapping dictionary: map labels in the JSON file to specific tile atlas IDs
# (Customize these vector parameters for your target TileSet layout)
const ATLAS_MAPPINGS = {
	"water": Vector2i(0, 0),
	"sand": Vector2i(1, 0),
	"grass": Vector2i(2, 0),
	"forest": Vector2i(3, 0),
	"mountain": Vector2i(4, 0),
	"spawn": Vector2i(2, 1),
	"chest": Vector2i(5, 0),
	"village": Vector2i(6, 0)
}

func _ready() -> void:
	load_and_generate_map("res://data/maps.json")

func load_and_generate_map(file_path: String) -> void:
	if not FileAccess.file_exists(file_path):
		push_error("Map configurations missing: " + file_path)
		return
		
	var file = FileAccess.open(file_path, FileAccess.READ)
	var json_string = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var error = json.parse(json_string)
	if error != OK:
		push_error("Failed to parse map JSON configs.")
		return
		
	var map_data = json.get_data()
	inflate_map(map_data)

func inflate_map(map_data: Dictionary) -> void:
	var grid = map_data["grid"]
	var width = map_data["width"]
	var height = map_data["height"]
	print("[WorldLoader] Generating tile grid: %dx%d" % [width, height])
	
	for y in range(height):
		for x in range(width):
			var tile_label = grid[y][x]
			if tile_label in ATLAS_MAPPINGS:
				# tile_map_layer.set_cell(coords: Vector2i, source_id: int, atlas_coords: Vector2i)
				tile_map_layer.set_cell(Vector2i(x, y), 0, ATLAS_MAPPINGS[tile_label])
			else:
				# Default grass fill-in
				tile_map_layer.set_cell(Vector2i(x, y), 0, ATLAS_MAPPINGS["grass"])
				
	# Place game character at custom SpawnPoint
	var spawn = map_data.get("spawnPoint", {"x": 5, "y": 5})
	print("[WorldLoader] Dedicated spawn location resolved: (", spawn["x"], ",", spawn["y"], ")")
`;
}

// Generate TSCN (text scene file) that integrates scripts and TileMapLayer in Godot 4.x
export function generateTscn(map: GeneratedWorld): string {
  return `[gd_scene load_steps=2 format=3 uid="uid://c1v1wgodot2d"]

[ext_resource type="Script" path="res://scripts/WorldLoader.gd" id="1_world"]

[node name="World" type="Node2D"]
script = ExtResource("1_world")

[node name="TileMapLayer" type="TileMapLayer" parent="."]
tile_set = null
tile_map_data = PackedByteArray([])

[node name="Camera2D" type="Camera2D" parent="."]
position = Vector2(${map.spawnPoint.x * 16 + 8}, ${map.spawnPoint.y * 16 + 8})
zoom = Vector2(2, 2)
`;
}

// Bundle all of these files together into a highly polished structure res:// and download
export async function downloadGodotDataPackZip(
  characters: Character[],
  monsters: Monster[],
  items: Item[],
  biomes: Biome[],
  map: GeneratedWorld,
  characterSpriteBytes?: string // Optional base64 SVG data
): Promise<Blob> {
  const zip = new JSZip();

  // Create folder hierarchies
  const assetsFolder = zip.folder("assets");
  const dataFolder = zip.folder("data");
  const scenesFolder = zip.folder("scenes");
  const scriptsFolder = zip.folder("scripts");

  // Add characters, monsters, items, biomes XML data structures
  dataFolder?.file("characters.xml", convertCharactersToXml(characters));
  dataFolder?.file("monsters.xml", convertMonstersToXml(monsters));
  dataFolder?.file("items.xml", convertItemsToXml(items));
  dataFolder?.file("biomes.xml", convertBiomesToXml(biomes));
  dataFolder?.file("maps.json", JSON.stringify(map, null, 2));

  // Add code logic scripts
  scriptsFolder?.file("DataLoader.gd", generateDataLoaderScript());
  scriptsFolder?.file("WorldLoader.gd", generateWorldLoaderScript());

  // Add world loader TSCN scene descriptor
  scenesFolder?.file("generated_world.tscn", generateTscn(map));

  // If a custom visual sheet is submitted, package it up
  if (characterSpriteBytes) {
    const base64Data = characterSpriteBytes.replace(/^data:image\/(png|svg\+xml);base64,/, "");
    assetsFolder?.file("character_sheet.png", base64Data, { base64: true });
  }

  // Generate binary package blob stream
  return await zip.generateAsync({ type: "blob" });
}

// Generic XML utility to build specific tags automatically
export function objectToXmlString(nodeName: string, data: Record<string, any>): string {
  let xml = `  <${nodeName} id="${data.id || "gen_001"}">\n`;
  Object.entries(data).forEach(([key, value]) => {
    if (key === "id") return;
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        xml += `    <${key}>${value.join(",")}</${key}>\n`;
      } else {
        xml += `    <${key}>\n`;
        Object.entries(value).forEach(([subKey, subVal]) => {
          xml += `      <${subKey}>${subVal}</${subKey}>\n`;
        });
        xml += `    </${key}>\n`;
      }
    } else {
      xml += `    <${key}>${value}</${key}>\n`;
    }
  });
  xml += `  </${nodeName}>\n`;
  return xml;
}
