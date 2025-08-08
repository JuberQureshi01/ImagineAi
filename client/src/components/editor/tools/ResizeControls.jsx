
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Expand, Lock, Unlock, Monitor, Loader2 } from "lucide-react";
import { useCanvas } from "@/context/CanvasContext";
import api from "@/services/api";
import { toast } from "sonner";

const ASPECT_RATIOS = [
  { name: "Instagram Story", ratio: [9, 16], label: "9:16" },
  { name: "Instagram Post", ratio: [1, 1], label: "1:1" },
  { name: "Youtube Thumbnail", ratio: [16, 9], label: "16:9" },
  { name: "Portrait", ratio: [2, 3], label: "2:3" },
  { name: "Facebook Cover", ratio: [851, 315], label: "2.7:1" },
  { name: "Twitter Header", ratio: [3, 1], label: "3:1" },
];

export function ResizeControls({ project }) {
  const { canvasEditor, setProcessingMessage } = useCanvas();
  const [newWidth, setNewWidth] = useState(project?.width || 800);
  const [newHeight, setNewHeight] = useState(project?.height || 600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setNewWidth(project.width);
    setNewHeight(project.height);
  }, [project]);

  const calculateAspectRatioDimensions = (ratio) => {
    if (!project) return { width: 0, height: 0 };
    const [ratioW, ratioH] = ratio;
    const originalArea = project.width * project.height;
    const aspectRatio = ratioW / ratioH;
    const newHeight = Math.sqrt(originalArea / aspectRatio);
    const newWidth = newHeight * aspectRatio;
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  };

  const handleWidthChange = (value) => {
    const width = parseInt(value, 10) || 0;
    setNewWidth(width);
    if (lockAspectRatio && project && project.width > 0) {
      const ratio = project.height / project.width;
      setNewHeight(Math.round(width * ratio));
    }
    setSelectedPreset(null);
  };

  const handleHeightChange = (value) => {
    const height = parseInt(value, 10) || 0;
    setNewHeight(height);
    if (lockAspectRatio && project && project.height > 0) {
      const ratio = project.width / project.height;
      setNewWidth(Math.round(height / ratio));
    }
    setSelectedPreset(null);
  };

  const applyAspectRatio = (aspectRatio) => {
    const dimensions = calculateAspectRatioDimensions(aspectRatio.ratio);
    setNewWidth(dimensions.width);
    setNewHeight(dimensions.height);
    setSelectedPreset(aspectRatio.name);
  };

  const handleApplyResize = async () => {
    if (!canvasEditor || !project || (newWidth === project.width && newHeight === project.height)) {
      return;
    }
    setIsResizing(true);
    setProcessingMessage("Resizing canvas...");
    try {
      // Calculate scale factors
      const scaleX = newWidth / project.width;
      const scaleY = newHeight / project.height;

      // Resize the canvas itself
      canvasEditor.setWidth(newWidth);
      canvasEditor.setHeight(newHeight);

      // Scale and reposition each object on the canvas
      canvasEditor.getObjects().forEach(obj => {
        obj.set({
          left: obj.left * scaleX,
          top: obj.top * scaleY,
          scaleX: obj.scaleX * scaleX,
          scaleY: obj.scaleY * scaleY,
        });
        obj.setCoords();
      });

      canvasEditor.requestRenderAll();
      
      await api.patch(`/api/projects/${project.id}`, {
        width: newWidth,
        height: newHeight,
        canvasState: canvasEditor.toJSON(),
      });
      toast.success("Canvas resized! Reloading project...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error resizing canvas:", error);
      toast.error("Failed to resize canvas. Please try again.");
      setIsResizing(false);
      setProcessingMessage(null);
    }
  };

  if (!canvasEditor || !project) {
    return <div className="p-4"><p className="text-white/70 text-sm">Canvas not ready</p></div>;
  }

  const hasChanges = newWidth !== project.width || newHeight !== project.height;

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">Current Size</h4>
        <div className="text-xs text-white/70">{project.width} × {project.height} pixels</div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Custom Size</h3>
          <Button variant="ghost" size="sm" onClick={() => setLockAspectRatio(!lockAspectRatio)} className="text-white/70 hover:text-white p-1">
            {lockAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/70 mb-1 block">Width</label>
            <Input type="number" value={newWidth} onChange={(e) => handleWidthChange(e.target.value)} min="100" max="5000" className="bg-slate-700 border-white/20 text-white" />
          </div>
          <div>
            <label className="text-xs text-white/70 mb-1 block">Height</label>
            <Input type="number" value={newHeight} onChange={(e) => handleHeightChange(e.target.value)} min="100" max="5000" className="bg-slate-700 border-white/20 text-white" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white">Aspect Ratios</h3>
        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
          {ASPECT_RATIOS.map((aspectRatio) => {
            const dimensions = calculateAspectRatioDimensions(aspectRatio.ratio);
            return (
              <Button key={aspectRatio.name} variant={selectedPreset === aspectRatio.name ? "default" : "outline"} size="sm" onClick={() => applyAspectRatio(aspectRatio)} className={`justify-between h-auto py-2 ${selectedPreset === aspectRatio.name ? "bg-cyan-500 hover:bg-cyan-600" : "text-left"}`}>
                <div>
                  <div className="font-medium">{aspectRatio.name}</div>
                  <div className="text-xs opacity-70">{dimensions.width} × {dimensions.height} ({aspectRatio.label})</div>
                </div>
                <Monitor className="h-4 w-4" />
              </Button>
            );
          })}
        </div>
      </div>
      <Button onClick={handleApplyResize} disabled={!hasChanges || isResizing} className="w-full" variant="primary">
        {isResizing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Applying...</> : <><Expand className="h-4 w-4 mr-2" /> Apply Resize</>}
      </Button>
    </div>
  );
}
