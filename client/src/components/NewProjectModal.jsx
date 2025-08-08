import React, { useState, useCallback } from "react";
import { X, Upload, Loader2, Crown, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";
import { useDropzone } from "react-dropzone";
import ImageKit from "imagekit-javascript";
import { UpgradeModal } from "./UpgradeModal";
import { Badge } from "@/components/ui/badge";

const imagekit = new ImageKit({
  publicKey: "public_Dj9Kjz0o+6b7akxCBscolEK136A=",
  urlEndpoint: "https://ik.imagekit.io/2xtnf2dlg",
});

export function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
  currentProjectCount,
}) {
  const [projectTitle, setProjectTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { canCreateProject, isFree } = usePlanAccess();
  const navigate = useNavigate();
  const canCreate = canCreateProject(currentProjectCount);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    const nameWithoutExt =
      file.name.replace(/\.[^/.]+$/, "") || "Untitled Project";
    setProjectTitle(nameWithoutExt);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg", ".webp"] },
    multiple: false,
    disabled: !canCreate,
  });

  const handleCreateProject = async () => {
    if (!canCreate) {
      setShowUpgradeModal(true);
      return;
    }
    if (!uploadedFile || !projectTitle.trim()) {
      toast.error("Please select an image and enter a project title");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const authRes = await api.get("/api/imagekit/auth");
      const { token, expire, signature } = authRes.data;

      const uploadRes = await imagekit.upload({
        file: uploadedFile,
        fileName: uploadedFile.name,
        token,
        expire,
        signature,
        folder: "/ai-photo-editor/",
      });
      toast.success("Upload complete! Creating project...", { id: toastId });

      const projectResponse = await api.post("/api/projects", {
        title: projectTitle.trim(),
        originalImageUrl: uploadRes.url,
        currentImageUrl: uploadRes.url,
        thumbnailUrl: uploadRes.thumbnailUrl,
        width: uploadRes.width || 800,
        height: uploadRes.height || 600,
        imagekitId: uploadRes.fileId,
      });

      const newProject = projectResponse.data;
      toast.success("Project created successfully!", { id: toastId });
      onProjectCreated(newProject);
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      // Check if the error is the specific ImageKit error
      if (error.message === "Missing public key for upload") {
        toast.error(
          "ImageKit is not configured correctly. Public key is missing.",
          { id: toastId }
        );
      } else {
        toast.error(error.response?.data?.msg || "Failed to create project.", {
          id: toastId,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setProjectTitle("");
    setPreviewUrl(null);
    setUploadedFile(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl bg-slate-800 border-white/10">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-white">
                Create New Project
              </DialogTitle>
              {isFree && (
                <Badge
                  variant="secondary"
                  className="bg-slate-700 text-white/70"
                >
                  {currentProjectCount}/3 projects
                </Badge>
              )}
            </div>
            <DialogDescription className="text-left text-white/60 pt-1">
              Upload an image to start a new editing project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {isFree && currentProjectCount >= 2 && (
              <Alert className="bg-amber-500/10 border-amber-500/20">
                <Crown className="h-5 w-5 text-amber-400" />
                <AlertDescription className="text-amber-300/80">
                  <div className="font-semibold text-amber-400 mb-1">
                    {currentProjectCount === 2
                      ? "Last Free Project"
                      : "Project Limit Reached"}
                  </div>
                  {currentProjectCount === 2
                    ? "This will be your last free project. Upgrade to Pro for unlimited projects."
                    : "Free plan is limited to 3 projects. Upgrade to Pro to create more projects."}
                </AlertDescription>
              </Alert>
            )}

            {!previewUrl ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? "border-cyan-400 bg-cyan-400/5"
                    : "border-white/20 hover:border-white/40"
                } ${!canCreate ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? "Drop your image here" : "Upload an Image"}
                </h3>
                <p className="text-white/70 mb-4">
                  {canCreate
                    ? "Drag and drop your image, or click to browse"
                    : "Upgrade to Pro to create more projects"}
                </p>
                <p className="text-sm text-white/50">
                  Supports PNG, JPG, WEBP up to 20MB
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl border border-white/10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setPreviewUrl(null);
                      setUploadedFile(null);
                    }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-title" className="text-white">
                    Project Title
                  </Label>
                  <Input
                    id="project-title"
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project name..."
                    className="bg-slate-700 border-white/20 text-white placeholder-white/50 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
                {uploadedFile && (
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-cyan-400" />
                      <div>
                        <p className="text-white font-medium">
                          {uploadedFile.name}
                        </p>
                        <p className="text-white/70 text-sm">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isProcessing}
              className="text-white/70 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={!uploadedFile || !projectTitle.trim() || isProcessing}
              variant="primary"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        restrictedTool="projects"
        reason="Free plan is limited to 3 projects. Upgrade to Pro for unlimited projects."
      />
    </>
  );
}
