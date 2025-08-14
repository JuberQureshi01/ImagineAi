import React, { useState, useEffect } from "react";
import { Plus, Image, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewProjectModal } from "@/components/NewProjectModal";
import { ProjectGrid } from "@/components/ProjectGrid";
import api from "@/services/api";
import { toast } from "sonner";
import { ImageGeneratorModal } from "@/components/ImageGeneratorModal";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setIsFetching(false);
        setProjects([]);
        return;
      }
      setIsFetching(true);
      try {
        const response = await api.get("/api/projects");
        setProjects(response.data);
      } catch (error) {
        toast.error("Failed to load your projects.");
        console.error("AxiosError on fetchProjects:", error);
      } finally {
        setIsFetching(false);
      }
    };
    if (!authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
    setShowNewProjectModal(false);
    setShowGeneratorModal(false); // Also close the generator modal
  };

  const handleProjectDeleted = (deletedProjectId) => {
    setProjects(projects.filter((p) => p.id !== deletedProjectId));
  };

  const isLoading = authLoading || isFetching;

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-white mb-2">
              Your Projects
            </h1>
            <p className="text-white/70">
              Create and manage your AI-powered image designs
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowGeneratorModal(true)}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Wand2 className="h-5 w-5" />
              Generate Image
            </Button>
            <Button
              onClick={() => setShowNewProjectModal(true)}
              variant="primary"
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              New Project
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        ) : projects && projects.length > 0 ? (
          <ProjectGrid
            projects={projects}
            onProjectDeleted={handleProjectDeleted}
          />
        ) : (
          <EmptyState onCreateProject={() => setShowNewProjectModal(true)} />
        )}
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={handleProjectCreated}
          currentProjectCount={projects.length}
        />
        <ImageGeneratorModal
          isOpen={showGeneratorModal}
          onClose={() => setShowGeneratorModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </div>
  );
}

function EmptyState({ onCreateProject }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 flex items-center justify-center mb-6">
        <Image className="h-12 w-12 text-cyan-400" />
      </div>
      <h3 className="text-2xl font-semibold text-white mb-3">
        Create Your First Project
      </h3>
      <p className="text-white/70 mb-8 max-w-md">
        Upload an image to start editing with our powerful AI tools, or create a
        blank canvas to design from scratch.
      </p>
      <Button
        onClick={onCreateProject}
        variant="primary"
        size="xl"
        className="gap-2"
      >
        <Sparkles className="h-5 w-5" />
        Start Creating
      </Button>
    </div>
  );
}
