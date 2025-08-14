import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eraser, Wand2, Info, Brush, XCircle } from "lucide-react";
import { useCanvas } from "@/context/CanvasContext";
import { FabricImage, Canvas } from "fabric";
import api from "@/services/api";
import { toast } from "sonner";

export function CleanupControls() {
  const { canvasEditor, setProcessingMessage } = useCanvas();
  const [isCleaning, setIsCleaning] = useState(false);
  const [isInDrawingMode, setIsInDrawingMode] = useState(false);

  const getMainImage = () =>
    canvasEditor?.getObjects().find((obj) => obj.type === "image") || null;

  const startCleanupMode = () => {
    if (!canvasEditor) return;
    const image = getMainImage();
    if (image) {
      image.set({ selectable: false, evented: false });
    }

    // --- DEFINITIVE FIX ---
    // Globally disable object selection on the canvas to prioritize the brush.
    canvasEditor.selection = false;
    canvasEditor.discardActiveObject();
    canvasEditor.isDrawingMode = true;

    const brush = canvasEditor.freeDrawingBrush;
    if (brush) {
      brush.width = 30;
      brush.color = "rgba(255,0,0,0.5)";
    }

    canvasEditor.requestRenderAll();
    setIsInDrawingMode(true);
    toast.info("Paint over the object you want to remove.");
  };

  const stopCleanupMode = () => {
    if (!canvasEditor) return;
    const image = getMainImage();
    if (image) {
      // Restore interactivity to the main image
      image.set({ selectable: true, evented: true });
    }

    // Re-enable object selection for normal editing
    canvasEditor.selection = true;
    canvasEditor.isDrawingMode = false;
    setIsInDrawingMode(false);
    canvasEditor.requestRenderAll();
  };

  const clearMask = () => {
    if (!canvasEditor) return;
    // Find and remove all drawn paths (the mask)
    canvasEditor
      .getObjects("path")
      .forEach((path) => canvasEditor.remove(path));
    canvasEditor.requestRenderAll();
    toast.success("Mask cleared.");
  };

  const applyCleanup = async () => {
    if (!canvasEditor) return;
    const mainImage = getMainImage();
    if (!mainImage) {
      toast.error("No image found on the canvas.");
      return;
    }
    if (canvasEditor.getObjects("path").length === 0) {
      toast.error("Please draw a mask over the area you want to remove first.");
      return;
    }

    setProcessingMessage("Cleaning up image with AI...");
    setIsCleaning(true);
    stopCleanupMode();

    try {
      const maskCanvas = new Canvas(null, {
        width: mainImage.getScaledWidth(),
        height: mainImage.getScaledHeight(),
      });

      const image_data_url = mainImage.toDataURL();

      // Clone paths relative to the image
      canvasEditor.getObjects("path").forEach((path) => {
        const clonedPath = path.clone();
        clonedPath.set({
          left: path.left - mainImage.left,
          top: path.top - mainImage.top,
        });
        maskCanvas.add(clonedPath);
      });

      const mask_data_url = maskCanvas.toDataURL();

      canvasEditor
        .getObjects("path")
        .forEach((path) => canvasEditor.remove(path));

      const response = await api.post("/api/clipdrop/cleanup", {
        image_data_url,
        mask_data_url,
      });

      const { newImageUrl } = response.data;
      const cleanedImage = await FabricImage.fromURL(newImageUrl, {
        crossOrigin: "anonymous",
      });

      const props = {
        left: mainImage.left,
        top: mainImage.top,
        angle: mainImage.angle,
        scaleX: mainImage.scaleX,
        scaleY: mainImage.scaleY,
        originX: mainImage.originX,
        originY: mainImage.originY,
      };

      canvasEditor.remove(mainImage);
      cleanedImage.set(props);
      canvasEditor.add(cleanedImage);
      canvasEditor.setActiveObject(cleanedImage);
      canvasEditor.requestRenderAll();

      toast.success("Cleanup successful!");
    } catch (error) {
      console.error("Cleanup failed:", error);
      toast.error(error.response?.data || "Failed to apply cleanup.");
    } finally {
      setProcessingMessage(null);
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-2">AI Cleanup</h3>
        <p className="text-xs text-white/70 mb-4">
          Remove unwanted objects, people, or text from your images.
        </p>
      </div>

      {!isInDrawingMode ? (
        <Button
          onClick={startCleanupMode}
          disabled={isCleaning}
          className="w-full"
          variant="outline"
        >
          <Brush className="h-4 w-4 mr-2" />
          Start Cleanup
        </Button>
      ) : (
        <div className="space-y-3 p-3 bg-slate-700/50 rounded-lg">
          <p className="text-xs text-center text-cyan-400 mb-2">
            Cleanup Mode Active
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={clearMask}
              disabled={isCleaning}
              className="w-full"
              variant="secondary"
            >
              <Eraser className="h-4 w-4 mr-2" />
              Clear Mask
            </Button>
            <Button
              onClick={stopCleanupMode}
              disabled={isCleaning}
              className="w-full"
              variant="secondary"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>
          <Button
            onClick={applyCleanup}
            disabled={isCleaning}
            className="w-full !mt-3"
            variant="primary"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Apply Cleanup
          </Button>
        </div>
      )}

      <div className="bg-slate-700/30 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
          <Info className="h-4 w-4" />
          How it Works
        </h4>
        <p className="text-xs text-white/70">
          1. Click "Start Cleanup".
          <br />
          2. Paint over the area you want to remove.
          <br />
          3. Click "Apply Cleanup" to finish.
        </p>
      </div>
    </div>
  );
}
