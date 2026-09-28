
import { GoogleGenAI, Type } from "@google/genai";
import { DrinkRecipe } from "../types";

/**
 * Serviço de IA para geração de receitas.
 * Utiliza o modelo gemini-3-flash-preview para alta velocidade e baixo custo.
 */
export const generateRecipeAI = async (prompt: string): Promise<Partial<DrinkRecipe> | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Crie uma receita de drink criativa para: "${prompt}". Retorne apenas o JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  measure: { type: Type.STRING }
                }
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            garnish: { type: Type.STRING },
            method: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["title", "description", "ingredients", "instructions", "method", "category", "garnish"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) return null;

    return JSON.parse(resultText);
  } catch (error) {
    console.error("Erro na geração de receita via Gemini:", error);
    return null;
  }
};
