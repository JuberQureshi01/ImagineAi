import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  RotateCw,
  Crop,
  Expand,
  Sliders,
  Palette,
  Maximize2,
  ChevronDown,
  Text,
  RefreshCcw,
  Loader2,
  Eye,
  Save,
  Download,
  FileImage,
  Lock,
  Wand2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useCanvas } from "@/context/CanvasContext";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { useAuth } from "@/context/AuthContext";
import { UpgradeModal } from "@/components/UpgradeModal";
import { FabricImage } from "fabric";
import api from "@/services/api";
import { toast } from "sonner";

const TOOLS = [
  { id: "resize", label: "Resize", icon: Expand },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "filters", label: "Filters", icon: Zap },
  { id: "adjust", label: "Adjust", icon: Sliders },
  { id: "text", label: "Text", icon: Text },
  { id: "background", label: "Background", icon: Palette, proOnly: true },
  { id: "ai_extender", label: "AI Extender", icon: Maximize2, proOnly: true },
  { id: "ai_edit", label: "AI Retouch", icon: Eye, proOnly: true },
];

const EXPORT_FORMATS = [
  {
    format: "PNG",
    quality: 1.0,
    label: "PNG (High Quality)",
    extension: "png",
  },
  {
    format: "JPEG",
    quality: 0.9,
    label: "JPEG (90% Quality)",
    extension: "jpg",
  },
  {
    format: "WEBP",
    quality: 0.9,
    label: "WebP (90% Quality)",
    extension: "webp",
  },
];

export function EditorTopBar({ project }) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedTool, setRestrictedTool] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);

  const { activeTool, onToolChange, canvasEditor } = useCanvas();
  const { hasAccess, canExport, isFree } = usePlanAccess();
  const { user } = useAuth();

  const saveToUndoStack = () => {
    if (!canvasEditor || isUndoRedoOperation) return;
    const canvasState = JSON.stringify(canvasEditor.toJSON());
    setUndoStack((prev) => {
      const newStack = [...prev, canvasState];
      if (newStack.length > 20) newStack.shift();
      return newStack;
    });
    setRedoStack([]);
  };

  useEffect(() => {
    if (!canvasEditor) return;
    setTimeout(() => {
      if (canvasEditor && !isUndoRedoOperation) {
        const initialState = JSON.stringify(canvasEditor.toJSON());
        setUndoStack([initialState]);
      }
    }, 1000);

    const handleCanvasModified = () => {
      if (!isUndoRedoOperation) {
        setTimeout(() => {
          if (!isUndoRedoOperation) saveToUndoStack();
        }, 500);
      }
    };

    canvasEditor.on({
      "object:modified": handleCanvasModified,
      "object:added": handleCanvasModified,
      "object:removed": handleCanvasModified,
      "path:created": handleCanvasModified,
    });

    return () => {
      if (canvasEditor) {
        canvasEditor.off({
          "object:modified": handleCanvasModified,
          "object:added": handleCanvasModified,
          "object:removed": handleCanvasModified,
          "path:created": handleCanvasModified,
        });
      }
    };
  }, [canvasEditor, isUndoRedoOperation]);

  const handleUndo = async () => {
    if (!canvasEditor || undoStack.length <= 1) return;
    setIsUndoRedoOperation(true);
    try {
      const currentState = JSON.stringify(canvasEditor.toJSON());
      setRedoStack((prev) => [...prev, currentState]);
      const newUndoStack = [...undoStack];
      newUndoStack.pop();
      const previousState = newUndoStack[newUndoStack.length - 1];
      if (previousState) {
        await canvasEditor.loadFromJSON(JSON.parse(previousState));
        canvasEditor.requestRenderAll();
        setUndoStack(newUndoStack);
        toast.success("Undid last action");
      }
    } catch (error) {
      console.error("Error during undo:", error);
      toast.error("Failed to undo action");
    } finally {
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  const handleRedo = async () => {
    if (!canvasEditor || redoStack.length === 0) return;
    setIsUndoRedoOperation(true);
    try {
      const newRedoStack = [...redoStack];
      const nextState = newRedoStack.pop();
      if (nextState) {
        const currentState = JSON.stringify(canvasEditor.toJSON());
        setUndoStack((prev) => [...prev, currentState]);
        await canvasEditor.loadFromJSON(JSON.parse(nextState));
        canvasEditor.requestRenderAll();
        setRedoStack(newRedoStack);
        toast.success("Redid last action");
      }
    } catch (error) {
      console.error("Error during redo:", error);
      toast.error("Failed to redo action");
    } finally {
      setTimeout(() => setIsUndoRedoOperation(false), 100);
    }
  };

  const handleBackToDashboard = () => navigate("/dashboard");

  const handleToolChange = (toolId) => {
    if (!hasAccess(toolId)) {
      setRestrictedTool(toolId);
      setShowUpgradeModal(true);
      return;
    }
    onToolChange(toolId);
  };

  const handleManualSave = async () => {
    if (!canvasEditor || !project) return;
    setIsSaving(true);
    try {
      const canvasJSON = canvasEditor.toJSON();
      await api.patch(`/api/projects/${project.id}`, {
        canvasState: canvasJSON,
      });
      toast.success("Project saved successfully!");
    } catch (error) {
      toast.error("Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (exportConfig) => {
    if (!canvasEditor || !project) return;
    if (!canExport(user?.exportsThisMonth || 0)) {
      setRestrictedTool("export");
      setShowUpgradeModal(true);
      return;
    }
    setIsExporting(true);
    setExportFormat(exportConfig.format);
    try {
      const currentZoom = canvasEditor.getZoom();
      const currentViewportTransform = [...canvasEditor.viewportTransform];
      canvasEditor.setZoom(1);
      canvasEditor.setViewportTransform([1, 0, 0, 1, 0, 0]);
      canvasEditor.setDimensions({
        width: project.width,
        height: project.height,
      });
      const dataURL = canvasEditor.toDataURL({
        format: exportConfig.format.toLowerCase(),
        quality: exportConfig.quality,
        multiplier: 1,
      });
      canvasEditor.setZoom(currentZoom);
      canvasEditor.setViewportTransform(currentViewportTransform);
      canvasEditor.setDimensions({
        width: project.width * currentZoom,
        height: project.height * currentZoom,
      });
      const link = document.createElement("a");
      link.download = `${project.title}.${exportConfig.extension}`;
      link.href = dataURL;
      link.click();
      toast.success(`Image exported as ${exportConfig.format}!`);
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image.");
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const handleResetToOriginal = async () => {
    if (!canvasEditor || !project || !project.originalImageUrl) {
      toast.error("No original image found to reset to");
      return;
    }
    saveToUndoStack();
    try {
      canvasEditor.clear();
      const fabricImage = await FabricImage.fromURL(project.originalImageUrl, {
        crossOrigin: "anonymous",
      });
      const scale = Math.min(
        project.width / fabricImage.width,
        project.height / fabricImage.height
      );
      fabricImage.set({
        left: project.width / 2,
        top: project.height / 2,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
      });
      canvasEditor.add(fabricImage);
      canvasEditor.centerObject(fabricImage);
      canvasEditor.requestRenderAll();
      const canvasJSON = canvasEditor.toJSON();
      await api.patch(`/api/projects/${project.id}`, {
        canvasState: canvasJSON,
        currentImageUrl: project.originalImageUrl,
        activeTransformations: null,
        backgroundRemoved: false,
      });
      toast.success("Canvas reset to original image");
    } catch (error) {
      console.error("Error resetting canvas:", error);
      toast.error("Failed to reset canvas.");
    }
  };

  const canUndo = undoStack.length > 1;
  const canRedo = redoStack.length > 0;

  return (
    <>
      <div className="border-b px-4 py-2 bg-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">All Projects</span>
            </Button>
          </div>
          <h1 className="text-sm sm:text-lg font-semibold capitalize truncate px-2">
            {project.title}
          </h1>
          <div className="flex items-center gap-2">
             <Button
              variant="outline"
              size="sm"
              onClick={handleResetToOriginal}
              disabled={isSaving || !project.originalImageUrl}
              className="gap-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" /> <span className="hidden lg:block">Reset</span>
                </>
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || !canvasEditor}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="glass"
                  size="sm"
                  disabled={isExporting || !canvasEditor}
                  className="gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Exporting{" "}
                      {exportFormat}...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />{" "}
                      <span className="hidden sm:inline">Export</span>{" "}
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-800 border-slate-700 text-white"
              >
                <div className="px-3 py-2 text-sm text-white/70">
                  Export Resolution: {project.width} × {project.height}px
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                {EXPORT_FORMATS.map((config) => (
                  <DropdownMenuItem
                    key={config.label}
                    onClick={() => handleExport(config)}
                    className="hover:bg-slate-700 cursor-pointer flex items-center gap-2"
                  >
                    <FileImage className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-white/50">
                        {config.format} • {Math.round(config.quality * 100)}%
                        quality
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-slate-700" />
                {isFree && (
                  <div className="px-3 py-2 text-xs text-white/50">
                    Free Plan: {user?.exportsThisMonth || 0}/20 exports this
                    month
                    {(user?.exportsThisMonth || 0) >= 20 && (
                      <div className="text-amber-400 mt-1">
                        Upgrade to Pro for unlimited exports
                      </div>
                    )}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="hidden lg:flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              const hasToolAccess = hasAccess(tool.id);
              return (
                <Button
                  key={tool.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleToolChange(tool.id)}
                  className={`gap-2 ${
                    isActive ? "bg-blue-600" : "hover:bg-slate-700"
                  } ${!hasToolAccess ? "opacity-60" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {tool.label}
                  {tool.proOnly && !hasToolAccess && (
                    <Lock className="h-3 w-3 text-amber-400 ml-1" />
                  )}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-slate-700"
              disabled={!canUndo}
              onClick={handleUndo}
              title={`Undo (${undoStack.length - 1} actions)`}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-slate-700"
              disabled={!canRedo}
              onClick={handleRedo}
              title={`Redo (${redoStack.length} actions)`}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        restrictedTool={restrictedTool}
      />
    </>
  );
}
