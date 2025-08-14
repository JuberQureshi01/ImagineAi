import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Loader2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import ImageKit from "imagekit-javascript";

// Helper to convert base64 to a File object for uploading
function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const IMAGE_STYLES = [
  { value: "photographic", label: "Photographic" },
  { value: "anime", label: "Anime" },
  { value: "3d-model", label: "3D Model" },
  { value: "digital-art", label: "Digital Art" },
  { value: "comic-book", label: "Comic Book" },
  { value: "fantasy-art", label: "Fantasy Art" },
];

export function ImageGeneratorModal({ isOpen, onClose, onProjectCreated }) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photographic");
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const imagekit = new ImageKit({
    publicKey: "public_Dj9Kjz0o+6b7akxCBscolEK136A=", 
    urlEndpoint: "https://ik.imagekit.io/2xtnf2dlg",
  });

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    try {
      const response = await api.post("/api/clipdrop/text-to-image", {
        prompt,
        style,
      });
      setGeneratedImageUrl(response.data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!generatedImageUrl) return;
    const toastId = toast.loading(
      "Uploading new image and creating project..."
    );
    try {
      const imageFile = dataURLtoFile(
        generatedImageUrl,
        `${prompt.slice(0, 20)}.png`
      );

      const authRes = await api.get("/api/imagekit/auth");
      const { token, expire, signature } = authRes.data;
      const uploadRes = await imagekit.upload({
        file: imageFile,
        fileName: imageFile.name,
        token,
        expire,
        signature,
        folder: "/ai-generated/",
      });

      const projectResponse = await api.post("/api/projects", {
        title: prompt,
        originalImageUrl: uploadRes.url,
        currentImageUrl: uploadRes.url,
        thumbnailUrl: uploadRes.thumbnailUrl,
        width: uploadRes.width || 1024,
        height: uploadRes.height || 1024,
        imagekitId: uploadRes.fileId,
      });

      const newProject = projectResponse.data;
      toast.success("Project created successfully!", { id: toastId });
      onProjectCreated(newProject);
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project from generated image.", {
        id: toastId,
      });
    }
  };

  const handleClose = () => {
    setPrompt("");
    setStyle("photographic");
    setGeneratedImageUrl(null);
    setIsGenerating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            AI Image Generator
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'A majestic lion wearing a crown, cinematic lighting...'"
            className="bg-slate-700 border-white/20 text-white"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-full bg-slate-700 border-white/20 text-white">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20 text-white">
                {IMAGE_STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="w-full"
              variant="primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
          <div className="w-full aspect-square bg-slate-700/50 rounded-lg flex items-center justify-center mt-4">
            {isGenerating && (
              <Loader2 className="h-12 w-12 animate-spin text-white/50" />
            )}
            {generatedImageUrl && (
              <div className="relative w-full h-full">
                <img
                  src={generatedImageUrl}
                  alt="Generated by AI"
                  className="w-full h-full object-contain rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGeneratedImageUrl(null)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateProject}
            disabled={!generatedImageUrl || isGenerating}
            className="w-full"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Create Project with this Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
