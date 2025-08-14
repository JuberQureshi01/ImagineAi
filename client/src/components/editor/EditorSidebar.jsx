import React from "react";
import { Button } from "@/components/ui/button";
import {
  Crop,
  Expand,
  Sliders,
  Palette,
  Maximize2,
  Text,
  Eye,
  Zap,
  Wand2,
  X,
  Eraser,
} from "lucide-react";
import { useCanvas } from "@/context/CanvasContext";
import { AdjustControls } from "./tools/AdjustControls";
import { AIEdit } from "./tools/AIEdit";
import { AIExtenderControls } from "./tools/AIExtenderControls";
import { BackgroundControls } from "./tools/BackgroundControls";
import { CropControls } from "./tools/CropControls";
import { ResizeControls } from "./tools/ResizeControls";
import { TextControls } from "./tools/TextControls";
import { FilterControls } from "./tools/FilterControls";
import { ImageGeneratorModal } from "../ImageGeneratorModal";
import { CleanupControls } from "./CleanupControls";

const TOOL_CONFIGS = {
  resize: {
    title: "Resize",
    icon: Expand,
    description: "Change project dimensions",
  },
  crop: { title: "Crop", icon: Crop, description: "Crop and trim your image" },
  filters: {
    title: "Filters",
    icon: Zap,
    description: "Apply pre-made filters",
  },
  adjust: {
    title: "Adjust",
    icon: Sliders,
    description: "Brightness, contrast, and more",
  },
  text: {
    title: "Add Text",
    icon: Text,
    description: "Customize in various fonts",
  },
  background: {
    title: "Background",
    icon: Palette,
    description: "Remove or change background",
    proOnly: true,
  },
  ai_extender: {
    title: "AI Image Extender",
    icon: Maximize2,
    description: "Extend image boundaries with AI",
    proOnly: true,
  },
  ai_edit: {
    title: "AI Retouch",
    icon: Eye,
    description: "Enhance image quality with AI",
    proOnly: true,
  },
  cleanup: {
    title: "AI Cleanup",
    icon: Eraser,
    description: "Remove unwanted objects",
    proOnly: true,
  },
  generative_edit: {
    title: "Generative Edit",
    icon: Wand2,
    description: "Describe your desired edit",
    proOnly: true,
  },
};

export function EditorSidebar({ project }) {
  const { activeTool, onToolChange } = useCanvas();
  const toolConfig = TOOL_CONFIGS[activeTool];

  // On mobile, if no tool is active, the sidebar should be hidden.
  if (!activeTool) return null;

  const Icon = toolConfig.icon;

  return (
    // On mobile, this is a full-screen overlay. On desktop, it's a fixed-width sidebar.
    <div className="absolute lg:relative z-30 h-full w-full lg:w-96 lg:min-w-96 border-r border-slate-700 flex flex-col bg-slate-800 text-white">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">{toolConfig.title}</h2>
        </div>
        {/* Add a close button for mobile to hide the sidebar */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => onToolChange(null)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {renderToolContent(activeTool, project)}
      </div>
    </div>
  );
}

function renderToolContent(activeTool, project) {
  switch (activeTool) {
    case "adjust":
      return <AdjustControls />;
    case "ai_edit":
      return <AIEdit project={project} />;
    case "ai_extender":
      return <AIExtenderControls project={project} />;
    case "background":
      return <BackgroundControls project={project} />;
    case "cleanup":
      return <CleanupControls />;
    case "crop":
      return <CropControls />;
    case "resize":
      return <ResizeControls project={project} />;
    case "text":
      return <TextControls />;
    case "generative_edit":
      return <ImageGeneratorModal project={project} />;
    case "filters":
      return <FilterControls />;
    default:
      return <div className="text-white/70">Select a tool to get started.</div>;
  }
}
