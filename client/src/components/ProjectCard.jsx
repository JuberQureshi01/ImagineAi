
import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import api from "@/services/api"; 
import { toast } from "sonner";

export default function ProjectCard({ project, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/projects/${project.id}`);
      toast.success("Project deleted successfully");
      onDelete(); 
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <Card className="py-0 group relative bg-slate-800/50 overflow-hidden hover:border-white/20 transition-all hover:transform hover:scale-[1.02]">
      <div className="aspect-video bg-slate-700 relative overflow-hidden">
        {project.thumbnailUrl && (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}

        <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
          <Button variant="glass" size="sm" onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={handleDelete}
            className="gap-2 text-red-400 hover:text-red-300"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <CardContent className="pb-6">
        <h3 className="font-semibold text-white mb-1 truncate">
          {project.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-white/70 mb-4">
          <span>Updated {lastUpdated}</span>
          <Badge
            variant="secondary"
            className="text-xs bg-slate-700 text-white/70"
          >
            {project.width} × {project.height}
          </Badge>
        </div>
        
        <div className="flex md:hidden items-center justify-center gap-2 mt-2">
          <Button variant="glass" size="sm" onClick={onEdit}>
            <Edit className="h-0 w-0" />
            Edit
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}