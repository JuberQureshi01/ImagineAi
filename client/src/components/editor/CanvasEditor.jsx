import React, { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage } from "fabric";
import { useCanvas } from "@/context/CanvasContext";
import api from "@/services/api";

export function CanvasEditor({ project }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const canvasInstanceRef = useRef(null);
  const { setCanvasEditor, activeTool, onToolChange } = useCanvas();
  const [isLoading, setIsLoading] = useState(true);

  // --- Auto-Save Function ---
  const saveCanvasState = async (canvasInstance) => {
    if (!canvasInstance || !project) return;
    try {
      const canvasJSON = canvasInstance.toJSON();
      await api.patch(`/api/projects/${project.id}`, {
        canvasState: canvasJSON,
      });
    } catch (error) {
      console.error("Error auto-saving canvas state:", error);
    }
  };

  const calculateViewportScale = () => {
    if (!containerRef.current || !project) return 1;
    const container = containerRef.current;
    const padding = 20; // smaller padding for responsiveness
    const containerWidth = container.clientWidth - padding;
    const containerHeight = container.clientHeight - padding;
    const scaleX = containerWidth / project.width;
    const scaleY = containerHeight / project.height;
    return Math.min(scaleX, scaleY, 1);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: project.width,
      height: project.height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    canvasInstanceRef.current = canvas;
    setCanvasEditor(canvas);

    const initializeContent = async () => {
      setIsLoading(true);
      const viewportScale = calculateViewportScale();
      canvas.setDimensions({
        width: project.width * viewportScale,
        height: project.height * viewportScale,
      });
      canvas.setZoom(viewportScale);

      if (project.canvasState && typeof project.canvasState === "object") {
        try {
          await canvas.loadFromJSON(project.canvasState);
        } catch (error) {
          console.error("Error loading canvas state:", error);
        }
      } else if (project.currentImageUrl || project.originalImageUrl) {
        try {
          const imageUrl = project.currentImageUrl || project.originalImageUrl;
          const fabricImage = await FabricImage.fromURL(imageUrl, {
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
          canvas.add(fabricImage);
          canvas.centerObject(fabricImage);
        } catch (error) {
          console.error("Error loading project image:", error);
        }
      }

      canvas.requestRenderAll();
      setIsLoading(false);
    };

    initializeContent();

    return () => {
      setCanvasEditor(null);
      if (canvasInstanceRef.current) {
        canvasInstanceRef.current.dispose();
        canvasInstanceRef.current = null;
      }
    };
  }, [project.id]);

  const canvasEditor = canvasInstanceRef.current;

  useEffect(() => {
    if (!canvasEditor) return;
    let saveTimeout;
    const handleCanvasChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => saveCanvasState(canvasEditor), 2000);
    };
    canvasEditor.on({
      "object:modified": handleCanvasChange,
      "object:added": handleCanvasChange,
      "object:removed": handleCanvasChange,
    });
    return () => {
      if (canvasEditor) {
        clearTimeout(saveTimeout);
        canvasEditor.off({
          "object:modified": handleCanvasChange,
          "object:added": handleCanvasChange,
          "object:removed": handleCanvasChange,
        });
      }
    };
  }, [canvasEditor]);

  useEffect(() => {
    if (!canvasEditor) return;
    const cursor = activeTool === "crop" ? "crosshair" : "default";
    canvasEditor.defaultCursor = cursor;
    canvasEditor.hoverCursor =
      activeTool === "crop" ? "crosshair" : "move";
  }, [canvasEditor, activeTool]);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasEditor || !project) return;
      const newScale = calculateViewportScale();
      canvasEditor.setDimensions({
        width: project.width * newScale,
        height: project.height * newScale,
      });
      canvasEditor.setZoom(newScale);
      canvasEditor.requestRenderAll();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [canvasEditor, project]);

  useEffect(() => {
    if (!canvasEditor || !onToolChange) return;
    const handleSelection = (e) => {
      if (e.selected?.[0]?.type === "i-text") {
        onToolChange("text");
      }
    };
    canvasEditor.on({
      "selection:created": handleSelection,
      "selection:updated": handleSelection,
    });
    return () => {
      if (canvasEditor) {
        canvasEditor.off({
          "selection:created": handleSelection,
          "selection:updated": handleSelection,
        });
      }
    };
  }, [canvasEditor, onToolChange]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center bg-slate-800 w-full h-full overflow-hidden"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(45deg, #475569 25%, transparent 25%), 
                            linear-gradient(-45deg, #475569 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #475569 75%), 
                            linear-gradient(-45deg, transparent 75%, #475569 75%)`,
          backgroundSize: "20px 20px",
          backgroundPosition:
            "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="text-white/70 text-sm">Loading canvas...</p>
          </div>
        </div>
      )}

      {/* Responsive canvas wrapper */}
      <div className="flex w-full h-full items-center justify-center">
        <div
          className="
            shadow-lg rounded-md overflow-hidden 
            w-[90vw] h-[60vh]       
            sm:w-[80vw] sm:h-[70vh] 
            lg:w-[70vw] lg:h-[80vh] 
            2xl:w-[60vw] 2xl:h-[85vh] 
            flex items-center justify-center
          "
        >
          <canvas
            key={project.id}
            id="canvas"
            className="w-full h-full"
            ref={canvasRef}
          />
        </div>
      </div>
    </div>
  );
}
