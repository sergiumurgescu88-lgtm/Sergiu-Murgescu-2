import React from 'react';
import { Settings, Image as ImageIcon, Sparkles } from 'lucide-react';
import { PhotoStyle, ImageResolution } from '../types';

interface ControlsProps {
  selectedStyle: PhotoStyle;
  onStyleChange: (style: PhotoStyle) => void;
  selectedResolution: ImageResolution;
  onResolutionChange: (res: ImageResolution) => void;
  isGenerating: boolean;
  onGenerateAll: () => void;
  queueLength: number;
}

export const Controls: React.FC<ControlsProps> = ({
  selectedStyle,
  onStyleChange,
  selectedResolution,
  onResolutionChange,
  isGenerating,
  onGenerateAll,
  queueLength,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-800">Studio Settings</h2>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Aesthetic Style
        </label>
        <div className="grid grid-cols-1 gap-2">
          {Object.values(PhotoStyle).map((style) => (
            <button
              key={style}
              onClick={() => onStyleChange(style)}
              className={`text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                selectedStyle === style
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Output Resolution
        </label>
        <div className="flex gap-2">
          {Object.values(ImageResolution).map((res) => (
            <button
              key={res}
              onClick={() => onResolutionChange(res)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                selectedResolution === res
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={onGenerateAll}
          disabled={isGenerating || queueLength === 0}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-indigo-500/10 transition-all active:scale-[0.98]"
        >
          {isGenerating ? 'Processing Studio Queue...' : `Generate ${queueLength} Photo${queueLength !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};