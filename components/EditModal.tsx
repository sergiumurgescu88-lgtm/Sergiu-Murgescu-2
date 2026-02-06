import React, { useState } from 'react';
import { X, Wand2, ArrowRight } from 'lucide-react';
import { editDishImage } from '../services/geminiService';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (newImageUrl: string) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, imageUrl, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsEditing(true);
    setError(null);

    try {
      const newImage = await editDishImage(imageUrl, prompt);
      onSave(newImage);
      setPrompt(''); // Reset prompt on success
      onClose(); // Close after success - or we could stay open to show result? Let's close for now to keep flow simple.
    } catch (err) {
      setError("Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-600" />
            AI Magic Editor
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col items-center">
          <div className="relative rounded-lg overflow-hidden shadow-md bg-white border border-slate-200">
            <img 
              src={imageUrl} 
              alt="To be edited" 
              className="max-h-[50vh] w-auto object-contain"
            />
          </div>

          <div className="w-full mt-6 space-y-3">
             <label className="block text-sm font-medium text-slate-700">
              What would you like to change?
            </label>
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add steam rising from the dish' or 'Make the lighting warmer'"
                className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
              <button
                onClick={handleEdit}
                disabled={isEditing || !prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
              >
                {isEditing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <p className="text-xs text-slate-500 text-center">
              Powered by Gemini 2.5 Flash Image. Describe the change naturally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};