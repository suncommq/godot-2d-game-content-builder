/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  BookOpen,
  FileText,
  PlayCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  Sparkle
} from "lucide-react";

export default function Documentation() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Q1. How do I install the exported files in Godot 4.x?",
      a: "Unzip the downloaded export file in your computer directory, select the folder segments inside it (assets/, data/, scenes/, scripts/), and drag them directly into the root directory (res://) of your Godot project. Godot 4 will automatically import the files, including setting up resources configurations."
    },
    {
      q: "Q2. How do I setup Autoload for DataLoader inside Godot?",
      a: "Go to Project -> Project Settings -> Globals (or Autoload tab). Find the scripts folder, select DataLoader.gd, set Node Name to 'DataLoader', and click 'Add'. Now, DataLoader becomes a globally accessible Singleton class available anywhere inside any GDscripts!"
    },
    {
      q: "Q3. I see high-friction characters XML, how do I access specific parameters inside a script?",
      a: "Because DataLoader acts as an autoload Singleton, you can fetch parameters instantly using key references like: \n var hero_hp = DataLoader.characters[\"char_001\"][\"hp\"]. \n This automatically parses integers and returns fully typed values!"
    },
    {
      q: "Q4. How can I assign visual SVG frames to Godot animated frames?",
      a: "In our Exporter, we pack custom SpriteSheets of 3 directions with 5 frames each. Inside Godot, create an AnimatedSprite2D node, click SpriteFrames -> New SpriteFrames, and selection 'Add frames from Sprite Sheet' and point to your characters sheet. Select slice coordinates grid as 3 vertical x 5 horizontal!"
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex justify-between items-center" id="docs-banner">
        <div className="space-y-1">
          <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest block">
            Information Center
          </span>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-amber-500" /> Godot 4.x Integration guide
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Read parameters, map layers, coordinates, and integrate XML datasets securely inside Godot.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Getting Started steps */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6" id="docs-guide-steps">
          <h3 className="font-sans font-bold text-slate-200 text-sm flex items-center gap-1.5 border-b border-slate-855 pb-3">
            <PlayCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
            Core Integration Steps
          </h3>

          <div className="space-y-5">
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-mono text-xs font-bold leading-none shrink-0 mt-0.5">
                1
              </span>
              <div className="space-y-1">
                <span className="font-sans font-bold text-slate-200 text-sm">Download Godot Pack</span>
                <p className="text-xs text-slate-400 leading-normal">
                  Go to the <span className="text-slate-200 font-semibold text-[11px] bg-slate-950 px-1 py-0.5 rounded">Export Center</span> and download the full `.zip` packet representing your active sandbox.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-mono text-xs font-bold leading-none shrink-0 mt-0.5">
                2
              </span>
              <div className="space-y-1">
                <span className="font-sans font-bold text-slate-200 text-sm">Unpack in Projects root</span>
                <p className="text-xs text-slate-400 leading-normal">
                  Extract folders recursively. It sets up files inside folders <code className="text-[11px] text-slate-100 px-1 px-0.5 bg-slate-950 rounded">data/</code>, 
                  <code className="text-[11px] text-slate-100 px-1 px-0.5 bg-slate-950 rounded">scripts/</code>, and <code className="text-[11px] text-slate-100 px-1 px-0.5 bg-slate-950 rounded">scenes/</code>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-mono text-xs font-bold leading-none shrink-0 mt-0.5">
                3
              </span>
              <div className="space-y-1">
                <span className="font-sans font-bold text-slate-200 text-sm">Autoload Settings</span>
                <p className="text-xs text-slate-400 leading-normal">
                  Register <code className="text-[11px] text-slate-200 bg-slate-950 px-1 rounded">DataLoader.gd</code> as a global Singleton. This starts up automatically parsing stats configs to memory.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-emerald-650 bg-emerald-500 text-slate-950 flex items-center justify-center font-mono text-xs font-bold leading-none shrink-0 mt-0.5">
                4
              </span>
              <div className="space-y-1">
                <span className="font-sans font-bold text-slate-100 text-sm">Instantiate World Scene</span>
                <p className="text-xs text-slate-400 leading-normal">
                  Instantiate <code className="text-[11px] text-slate-200 bg-slate-950 px-1 rounded">generated_world.tscn</code> in your scene hierarchy. On launch, it loops through the indices array loading tile maps on standard layers!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Collapsible FAQs */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4" id="docs-faqs">
          <h3 className="font-sans font-bold text-slate-200 text-sm flex items-center gap-1.5 border-b border-slate-855 pb-3">
            <HelpCircle className="w-4 h-4 text-amber-500" />
            Troubleshooting FAQ
          </h3>

          <div className="space-y-2">
            {faqs.map((f, idx) => {
              const isAct = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-850/60 rounded-lg overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isAct ? null : idx)}
                    className="w-full flex justify-between items-center p-3 text-left hover:bg-slate-900/50 transition-all font-sans font-semibold text-xs text-slate-200 leading-snug"
                  >
                    <span>{f.q}</span>
                    {isAct ? (
                      <ChevronUp className="w-4 h-4 text-amber-500 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                    )}
                  </button>
                  {isAct && (
                    <div className="px-4 pb-4 pt-1 font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap border-t border-slate-900">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-start gap-2 text-xs text-slate-500 font-mono mt-4 leading-normal">
            <Settings className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              Need personalized logic additions? You can tweak vector maps inside <code className="text-slate-100">res://scripts/WorldLoader.gd</code> to match other custom tile sizes.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
