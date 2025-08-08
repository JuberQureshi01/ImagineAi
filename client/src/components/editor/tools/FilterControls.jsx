
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCanvas } from '@/context/CanvasContext';
import { filters } from 'fabric';
import { toast } from 'sonner';
import { Zap, RotateCcw } from 'lucide-react';

const FILTER_LIST = [
  { name: 'None', filter: null },
  { name: 'Sepia', filter: new filters.Sepia() },
  { name: 'Grayscale', filter: new filters.Grayscale() },
  { name: 'Invert', filter: new filters.Invert() },
  { name: 'Black & White', filter: new filters.BlackWhite() },
  { name: 'Brownie', filter: new filters.Brownie() },
  { name: 'Vintage', filter: new filters.Vintage() },
  { name: 'Kodachrome', filter: new filters.Kodachrome() },
  { name: 'Technicolor', filter: new filters.Technicolor() },
  { name: 'Polaroid', filter: new filters.Polaroid() },
  { name: 'Sharpen', filter: new filters.Convolute({ matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0] }) },
  { name: 'Emboss', filter: new filters.Convolute({ matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1] }) },
  { name: 'Pixelate', filter: new filters.Pixelate({ blocksize: 8 }) },
  { name: 'Noise', filter: new filters.Noise({ noise: 100 }) },
  { name: 'Cool Tint', filter: new filters.BlendColor({ color: '#00c3ff', mode: 'tint', alpha: 0.5 }) },
];

export function FilterControls() {
  const { canvasEditor } = useCanvas();

  const getActiveImage = () => {
    if (!canvasEditor) return null;
    const activeObject = canvasEditor.getActiveObject();
    if (activeObject?.type === 'image') return activeObject;
    return canvasEditor.getObjects().find((obj) => obj.type === 'image') || null;
  };

  const applyFilter = (filter) => {
    const image = getActiveImage();
    if (!image) {
      toast.error("Please select an image on the canvas to apply a filter.");
      return;
    }

    image.filters = [];
    if (filter) {
      image.filters.push(filter);
    }
    
    image.applyFilters();
    canvasEditor.requestRenderAll();
    toast.success(`Applied ${filter ? filter.type : 'No'} filter. Auto-saving...`);
  };

  const removeAllFilters = () => {
    applyFilter(null);
  };

  if (!canvasEditor || !getActiveImage()) {
    return (
      <div className="p-4 text-center">
        <p className="text-white/70 text-sm">
          Please add or select an image on the canvas to see available filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-2">Preset Filters</h3>
        <p className="text-xs text-white/70 mb-4">
          Click a filter to apply it to the selected image.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {FILTER_LIST.map(({ name, filter }) => (
          <Button
            key={name}
            variant="outline"
            className="h-auto py-3"
            onClick={() => applyFilter(filter)}
          >
            {name}
          </Button>
        ))}
      </div>
      <div className="border-t border-white/10 pt-6">
        <Button
          variant="ghost"
          className="w-full text-white/70 hover:text-white"
          onClick={removeAllFilters}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Remove All Filters
        </Button>
      </div>
    </div>
  );
}