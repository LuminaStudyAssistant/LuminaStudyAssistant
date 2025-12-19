import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Initialize GoogleGenAI using the named parameter 'apiKey' and strictly use process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const studyAssistant = {
  async chat(message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[]) {
    // Generate content using the recommended Gemini 3 model for basic text tasks
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are Lumina, a brilliant and friendly university study assistant. Your goal is to help students understand complex topics simply. Break down answers into logical steps, use bullet points, and always encourage the student. If asked to generate quizzes or flashcards, provide clear questions and answers.",
      }
    });
    // response.text is a property, ensuring we return a string or fallback
    return response.text?.trim() || "";
  },

  async summarizeNote(content: string) {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following study note into key takeaways and a short explanation: \n\n ${content}`,
      config: {
        systemInstruction: "Provide a student-friendly summary. Focus on clarity and core concepts.",
      }
    });
    // Property access .text instead of method call, with trim for clean formatting
    return response.text?.trim() || "";
  },

  async generateFlashcards(content: string) {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a set of 5 flashcards (question and answer) from this content: \n\n ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          }
        }
      }
    });
    // Safeguard against undefined response.text and ensure clean JSON parsing
    const jsonStr = response.text?.trim() || "[]";
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse AI flashcards:", error);
      return [];
    }
  },

  async createStudyPlan(examDate: string, topics: string[]) {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `I have an exam on ${examDate}. The topics are: ${topics.join(', ')}. Create a structured daily study plan to prepare efficiently.`,
      config: {
        systemInstruction: "Create a motivational and realistic study plan. Break topics into manageable daily chunks.",
      }
    });
    return response.text?.trim() || "";
  }
};