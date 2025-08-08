import React from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";

export function ProjectGrid({ projects, onProjectDeleted }) {
  const navigate = useNavigate();

  const handleEditProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={() => handleEditProject(project.id)}
          onDelete={() => onProjectDeleted(project.id)}
        />
      ))}
    </div>
  );
}
