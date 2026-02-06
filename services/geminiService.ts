import { GoogleGenAI } from "@google/genai";
import { PhotoStyle, ImageResolution } from "../types";

// Helper to ensure API key is selected
export const ensureApiKey = async (): Promise<void> => {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
};

const getClient = () => {
  // Always create a new client to pick up the potentially newly selected key
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateDishImage = async (
  dishName: string,
  dishDescription: string,
  style: PhotoStyle,
  resolution: ImageResolution
): Promise<string> => {
  const ai = getClient();
  
  let stylePrompt = "";
  let aspectRatio = "1:1";

  switch (style) {
    case PhotoStyle.RUSTIC:
      stylePrompt = "Rustic style, dark moody lighting, wooden table texture, professional food photography, 85mm lens, f/1.8, cinematic lighting, rich details.";
      aspectRatio = "4:3";
      break;
    case PhotoStyle.MODERN:
      stylePrompt = "Bright and modern style, clean white marble background, soft natural daylight, high key photography, minimalist plating, sharp focus.";
      aspectRatio = "4:3";
      break;
    case PhotoStyle.SOCIAL:
      stylePrompt = "Social media aesthetic, top-down flat lay view, vibrant pop colors, trendy cafe composition, smartphone photography style, sharp and shareable.";
      aspectRatio = "1:1"; // Square for social
      break;
  }

  // Combine to form the final prompt
  const fullPrompt = `Professional food photography of ${dishName}: ${dishDescription}. ${stylePrompt} Make it look appetizing and high-end.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: resolution,
        },
      },
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Generation failed", error);
    throw error;
  }
};

export const editDishImage = async (
  base64Image: string,
  instruction: string
): Promise<string> => {
  const ai = getClient();
  
  // Clean the base64 string to get raw data
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';'));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: instruction,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ],
      },
      // Note: responseMimeType/Schema not supported for this model
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Editing failed", error);
    throw error;
  }
};