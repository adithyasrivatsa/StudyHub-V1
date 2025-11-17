
import { GoogleGenAI } from '@google/genai';
import type { Opportunity } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract JSON from a string that might contain other text
function extractJson(text: string): any[] | null {
  const match = text.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      console.error("Failed to parse JSON from response:", e);
      return null;
    }
  }
  return null;
}

export const fetchOpportunities = async (): Promise<{ opportunities: Opportunity[], sources: any[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // FIX: Improved prompt to fetch various opportunities and explicitly request the 'type' field.
      contents: "Find a list of currently open opportunities for students, such as scholarships, internships, and hackathons. For each, provide the title, company/organization, deadline, a direct application link, and the type of opportunity ('Scholarship', 'Internship', 'Hackathon', 'Job'). Format the response as a valid JSON array of objects with keys: 'title', 'company', 'deadline', 'link', and 'type'.",
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const opportunities = extractJson(response.text) || [];
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { opportunities, sources };

  } catch (error) {
      console.error("Failed to fetch opportunities:", error);
      throw new Error("Could not fetch opportunities from the Gemini API.");
  }
};