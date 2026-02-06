export enum PhotoStyle {
  RUSTIC = 'Rustic/Dark',
  MODERN = 'Bright/Modern',
  SOCIAL = 'Social Media (Flat Lay)',
}

export enum ImageResolution {
  RES_1K = '1K',
  RES_2K = '2K',
  RES_4K = '4K',
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'generating' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
}

// Augment the global AIStudio interface
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}