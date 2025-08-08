
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Monitor } from "lucide-react";
import { EditorTopBar } from "@/components/editor/EditorTopBar";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { CanvasEditor } from "@/components/editor/CanvasEditor";
import { CanvasContext } from "@/context/CanvasContext";
import { RingLoader } from "react-spinners";
import { MobileToolbar } from "@/components/editor/MobileToolbar";
import api from "@/services/api";
import { toast } from "sonner";

export default function EditorPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canvasEditor, setCanvasEditor] = useState(null);
  const [processingMessage, setProcessingMessage] = useState(null);
  const [activeTool, setActiveTool] = useState("resize");

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        toast.error("Failed to load project.");
        console.error(error);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-white/70">Loading Project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Project Not Found</h1>
          <p className="text-white/70">The project you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <CanvasContext.Provider
      value={{
        canvasEditor,
        setCanvasEditor,
        activeTool,
        onToolChange: setActiveTool,
        processingMessage,
        setProcessingMessage,
      }}
    >
      <div className="min-h-screen bg-slate-900">
        <div className="flex flex-col h-screen">
          {processingMessage && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center">
              <div className="rounded-lg p-6 flex flex-col items-center gap-4">
                <RingLoader color="#fff" />
                <div className="text-center">
                  <p className="text-white font-medium">{processingMessage}</p>
                  <p className="text-white/70 text-sm mt-1">Please wait, do not switch tabs or navigate away</p>
                </div>
              </div>
            </div>
          )}
          
          <EditorTopBar project={project} />

          <div className="flex flex-1 overflow-hidden">
            <EditorSidebar project={project} />
            
            <div className="flex-1 bg-slate-800">
              <CanvasEditor project={project} />
            </div>
          </div>
          
          <MobileToolbar />
        </div>
      </div>
    </CanvasContext.Provider>
  );
}