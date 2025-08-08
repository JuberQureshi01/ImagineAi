
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { filters } from "fabric";
import { useCanvas } from "@/context/CanvasContext";

const FILTER_CONFIGS = [
  { key: "brightness", label: "Brightness", min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Brightness, valueKey: "brightness", transform: (v) => v / 100 },
  { key: "contrast", label: "Contrast", min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Contrast, valueKey: "contrast", transform: (v) => v / 100 },
  { key: "saturation", label: "Saturation", min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Saturation, valueKey: "saturation", transform: (v) => v / 100 },
  { key: "vibrance", label: "Vibrance", min: -100, max: 100, step: 1, defaultValue: 0, filterClass: filters.Vibrance, valueKey: "vibrance", transform: (v) => v / 100 },
  { key: "blur", label: "Blur", min: 0, max: 100, step: 1, defaultValue: 0, filterClass: filters.Blur, valueKey: "blur", transform: (v) => v / 100 },
  { key: "hue", label: "Hue", min: -180, max: 180, step: 1, defaultValue: 0, filterClass: filters.HueRotation, valueKey: "rotation", transform: (v) => v, suffix: "°" },
];

const DEFAULT_VALUES = FILTER_CONFIGS.reduce((acc, config) => ({ ...acc, [config.key]: config.defaultValue }), {});

export function AdjustControls() {
  const [filterValues, setFilterValues] = useState(DEFAULT_VALUES);
  const [isApplying, setIsApplying] = useState(false);
  const { canvasEditor } = useCanvas();

  const getActiveImage = () => {
    if (!canvasEditor) return null;
    const activeObject = canvasEditor.getActiveObject();
    if (activeObject?.type === "image") return activeObject;
    return canvasEditor.getObjects().find((obj) => obj.type === "image") || null;
  };

  const applyFilters = (newValues) => {
    const imageObject = getActiveImage();
    if (!imageObject || isApplying) return;
    setIsApplying(true);
    
    const filtersToApply = FILTER_CONFIGS.map(config => {
        const value = newValues[config.key];
        if (value !== config.defaultValue) {
            return new config.filterClass({ [config.valueKey]: config.transform(value) });
        }
        return null;
    }).filter(Boolean);

    imageObject.filters = filtersToApply;
    imageObject.applyFilters();
    canvasEditor.requestRenderAll();
    
    // Use a short timeout to give the UI time to update
    setTimeout(() => setIsApplying(false), 50);
  };

  const handleValueChange = (filterKey, value) => {
    const newValues = { ...filterValues, [filterKey]: value[0] };
    setFilterValues(newValues);
    applyFilters(newValues);
  };

  const resetFilters = () => {
    setFilterValues(DEFAULT_VALUES);
    applyFilters(DEFAULT_VALUES);
  };


  const extractFilterValues = (imageObject) => {
    if (!imageObject?.filters?.length) return DEFAULT_VALUES;

    const extractedValues = { ...DEFAULT_VALUES };

    imageObject.filters.forEach((filter) => {
      const config = FILTER_CONFIGS.find(
        (c) => c.filterClass.name === filter.constructor.name
      );
      if (config) {
        const filterValue = filter[config.valueKey];
        if (config.key === "hue") {
          extractedValues[config.key] = Math.round(
            filterValue * (180 / Math.PI)
          );
        } else {
          extractedValues[config.key] = Math.round(filterValue * 100);
        }
      }
    });

    return extractedValues;
  };

  useEffect(() => {
    const imageObject = getActiveImage();
    if (imageObject?.filters) {
      const existingValues = extractFilterValues(imageObject);
      setFilterValues(existingValues);
    }
  }, [canvasEditor]);

  if (!canvasEditor) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">
          Load an image to start adjusting
        </p>
      </div>
    );
  }

  const activeImage = getActiveImage();
  if (!activeImage) {
    return (
      <div className="p-4">
        <p className="text-white/70 text-sm">
          Select an image to adjust filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reset Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-white">Image Adjustments</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-white/70 hover:text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Filter Controls */}
      {FILTER_CONFIGS.map((config) => (
        <div key={config.key} className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-white">{config.label}</label>
            <span className="text-xs text-white/70">
              {filterValues[config.key]}
              {config.suffix || ""}
            </span>
          </div>
          <Slider
            value={[filterValues[config.key]]}
            onValueChange={(value) => handleValueChange(config.key, value)}
            min={config.min}
            max={config.max}
            step={config.step}
            className="w-full"
          />
        </div>
      ))}

      {/* Info */}
      <div className="mt-6 p-3 bg-slate-700/50 rounded-lg">
        <p className="text-xs text-white/70">
          Adjustments are applied in real-time. Use the Reset button to restore
          original values.
        </p>
      </div>
    </div>
  );
}
