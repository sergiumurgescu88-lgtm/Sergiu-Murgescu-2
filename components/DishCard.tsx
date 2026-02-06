import React from 'react';
import { Loader2, AlertCircle, Edit2, Maximize2, Trash2 } from 'lucide-react';
import { Dish } from '../types';

interface DishCardProps {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (id: string) => void;
  onRetry: (dish: Dish) => void;
}

export const DishCard: React.FC<DishCardProps> = ({ dish, onEdit, onDelete, onRetry }) => {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image Area */}
      <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
        {dish.status === 'completed' && dish.imageUrl ? (
          <>
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
              <button 
                onClick={() => onEdit(dish)}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
          </>
        ) : dish.status === 'generating' ? (
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-sm font-medium text-slate-500 animate-pulse">Developing photo...</span>
          </div>
        ) : dish.status === 'failed' ? (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="text-xs text-red-500 px-2">{dish.error || 'Generation failed'}</span>
            <button 
              onClick={() => onRetry(dish)}
              className="mt-2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1 rounded-full transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
               <span className="font-serif italic text-xl text-slate-400/50">?</span>
            </div>
            <span className="text-xs text-slate-400">Waiting to generate</span>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-slate-900 leading-tight">{dish.name}</h3>
          <button 
            onClick={() => onDelete(dish.id)}
            className="text-slate-400 hover:text-red-500 transition-colors -mt-1 -mr-1 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        {dish.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dish.description}</p>
        )}
      </div>
    </div>
  );
};