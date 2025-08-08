
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCanvas } from '@/context/CanvasContext';
import { Crop, Expand, Sliders, Palette, Maximize2, Text, Eye, Wand2, Zap, Lock } from 'lucide-react';
import { usePlanAccess } from '@/hooks/use-plan-access';
import { UpgradeModal } from '@/components/UpgradeModal';

const TOOLS = [
  { id: "resize", label: "Resize", icon: Expand, proOnly: false },
  { id: "crop", label: "Crop", icon: Crop, proOnly: false },
  { id: "filters", label: "Filters", icon: Zap, proOnly: false },
  { id: "adjust", label: "Adjust", icon: Sliders, proOnly: false },
  { id: "text", label: "Text", icon: Text, proOnly: false },
  { id: "background", label: "Background", icon: Palette, proOnly: true },
  { id: "ai_extender", label: "AI Extender", icon: Maximize2, proOnly: true },
  { id: "ai_edit", label: "AI Retouch", icon: Eye, proOnly: true },
];

export function MobileToolbar() {
  const { activeTool, onToolChange } = useCanvas();
  const { hasAccess } = usePlanAccess();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedTool, setRestrictedTool] = useState(null);

  const handleToolChange = (tool) => {
    if (tool.proOnly && !hasAccess(tool.id)) {
      setRestrictedTool(tool.id);
      setShowUpgradeModal(true);
      return;
    }
    onToolChange(tool.id);
  };

  return (
    <>
      <style>
        {`
          .mobile-toolbar-scroll::-webkit-scrollbar { display: none; }
          .mobile-toolbar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-800 border-t border-slate-700 z-40 overflow-x-auto mobile-toolbar-scroll">
        <div className="flex items-center justify-start h-full px-2 gap-1">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            const hasToolAccess = hasAccess(tool.id);
            return (
              <Button
                key={tool.id}
                variant={isActive ? "default" : "ghost"}
                size="icon"
                className={`relative flex flex-col items-center justify-center h-14 w-16 rounded-md ${isActive ? 'bg-blue-600 text-white' : 'text-white/70'} ${!hasToolAccess ? 'opacity-60' : ''}`}
                onClick={() => handleToolChange(tool)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-1">{tool.label}</span>
                {tool.proOnly && !hasToolAccess && (
                  <Lock className="absolute top-1 right-1 h-3 w-3 text-amber-400" />
                )}
              </Button>
            );
          })}
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