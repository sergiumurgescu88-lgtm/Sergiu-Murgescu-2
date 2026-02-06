import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera, UtensilsCrossed } from 'lucide-react';
import { Dish, PhotoStyle, ImageResolution } from './types';
import { generateDishImage, ensureApiKey } from './services/geminiService';
import { MenuInput } from './components/MenuInput';
import { Controls } from './components/Controls';
import { DishCard } from './components/DishCard';
import { EditModal } from './components/EditModal';

const App: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<PhotoStyle>(PhotoStyle.MODERN);
  const [selectedResolution, setSelectedResolution] = useState<ImageResolution>(ImageResolution.RES_1K);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Editing state
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const handleAddDishes = (newDishes: Dish[]) => {
    setDishes(prev => [...prev, ...newDishes]);
  };

  const handleDeleteDish = (id: string) => {
    setDishes(prev => prev.filter(d => d.id !== id));
  };

  const handleUpdateDish = (id: string, updates: Partial<Dish>) => {
    setDishes(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const processQueue = async () => {
    const pendingDishes = dishes.filter(d => d.status === 'idle' || d.status === 'failed');
    if (pendingDishes.length === 0) return;

    try {
      setIsProcessing(true);
      await ensureApiKey();
      
      // We process one by one to avoid rate limits, or maybe parallelize slightly?
      // Let's do parallel for better UX but with a limit if needed. 
      // For now, simple Promise.all is fine for a demo, but let's do sequential or batched to be safe with rate limits on the preview model.
      // Sequential is safer for reliability.
      
      for (const dish of pendingDishes) {
        handleUpdateDish(dish.id, { status: 'generating', error: undefined });
        
        try {
          const imageUrl = await generateDishImage(
            dish.name,
            dish.description,
            selectedStyle,
            selectedResolution
          );
          handleUpdateDish(dish.id, { status: 'completed', imageUrl });
        } catch (error: any) {
          handleUpdateDish(dish.id, { status: 'failed', error: error.message || "Unknown error" });
        }
      }
    } catch (e) {
      console.error("Queue processing stopped", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryDish = async (dish: Dish) => {
    try {
      await ensureApiKey();
      handleUpdateDish(dish.id, { status: 'generating', error: undefined });
      const imageUrl = await generateDishImage(
        dish.name,
        dish.description,
        selectedStyle,
        selectedResolution
      );
      handleUpdateDish(dish.id, { status: 'completed', imageUrl });
    } catch (error: any) {
      handleUpdateDish(dish.id, { status: 'failed', error: error.message });
    }
  };

  const handleSaveEdit = (newImageUrl: string) => {
    if (editingDish) {
      handleUpdateDish(editingDish.id, { imageUrl: newImageUrl });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Camera className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Virtual Food Photographer <span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
             <span className="hidden sm:inline">Powered by Gemini 3.0 Pro Image</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Controls & Input */}
          <div className="lg:col-span-4 space-y-6">
            <MenuInput onAddDishes={handleAddDishes} />
            
            <Controls
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              selectedResolution={selectedResolution}
              onResolutionChange={setSelectedResolution}
              isGenerating={isProcessing}
              onGenerateAll={processQueue}
              queueLength={dishes.filter(d => d.status === 'idle' || d.status === 'failed').length}
            />

            {/* Stats/Info */}
            <div className="bg-indigo-900 rounded-xl p-6 text-white overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-semibold text-lg mb-1">Pro Tip</h3>
                <p className="text-indigo-100 text-sm">
                  Use the "Edit" button on any generated photo to refine details like steam, lighting, or garnish using natural language.
                </p>
              </div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
            </div>
          </div>

          {/* Right Area: Gallery */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-slate-400" />
                Gallery
                <span className="text-sm font-normal text-slate-400 ml-2 bg-slate-100 px-2 py-0.5 rounded-full">
                  {dishes.length} items
                </span>
              </h2>
              {dishes.length > 0 && (
                <button 
                  onClick={() => setDishes([])}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {dishes.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Your portfolio is empty</h3>
                <p className="text-slate-500 max-w-sm">
                  Add menu items on the left and click "Generate" to create your virtual photoshoot.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {dishes.map(dish => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onEdit={(d) => setEditingDish(d)}
                    onDelete={handleDeleteDish}
                    onRetry={handleRetryDish}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingDish && editingDish.imageUrl && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingDish(null)}
          imageUrl={editingDish.imageUrl}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default App;