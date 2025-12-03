import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, QuizConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuiz = async (config: QuizConfig): Promise<QuizQuestion[]> => {
  const modelId = "gemini-2.5-flash"; // Fast and efficient for logic

  const prompt = `Generate 5 multiple-choice questions about "${config.topic}" at ${config.difficulty} difficulty. 
  Each question should have 4 options. 
  Include a brief explanation for the correct answer.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswerIndex: { 
                type: Type.INTEGER, 
                description: "Zero-based index of the correct option (0-3)" 
              },
              explanation: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
            propertyOrdering: ["id", "question", "options", "correctAnswerIndex", "explanation"]
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion[];
    }
    throw new Error("No data returned from Gemini");
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    throw error;
  }
};