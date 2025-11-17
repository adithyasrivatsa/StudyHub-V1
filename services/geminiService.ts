
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
        },
        required: ['question', 'options', 'answer']
    }
};

const flashcardSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
        },
        required: ['front', 'back']
    }
};

const practiceSetSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            type: { type: Type.STRING },
        },
        required: ['question', 'type']
    }
};

export const generateQuiz = async (topic: string, numQuestions: number): Promise<any[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a ${numQuestions}-question multiple-choice quiz on the topic: "${topic}". Provide 4 options for each question.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz. Please check the topic and try again.");
    }
};

export const generateFlashcards = async (content: string): Promise<any[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create flashcards from the following content. Each flashcard should have a 'front' (a question or term) and a 'back' (the answer or definition).\n\nContent:\n${content}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: flashcardSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating flashcards:", error);
        throw new Error("Failed to generate flashcards. Please check your content and try again.");
    }
};

export const generatePracticeSet = async (subject: string): Promise<any[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a practice set of 5 questions for the subject: "${subject}". Include a mix of short-answer and essay questions.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: practiceSetSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating practice set:", error);
        throw new Error("Failed to generate practice set. Please check the subject and try again.");
    }
};

export const getStudyPlan = async (goals: string, topics: string[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a personalized study plan. My goals are: "${goals}". The topics I need to cover are: ${topics.join(', ')}. Format the response as markdown.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating study plan:", error);
        throw new Error("Failed to generate study plan. Please check your goals and topics.");
    }
};
