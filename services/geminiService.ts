import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Fix: Renamed `generationConfig` to avoid using deprecated term. This is a collection of valid model parameters.
const baseModelConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
};

const safetySettings = [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
];

export async function getGeneralAdvice(history: { role: string; parts: { text: string }[] }[], newPrompt: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    // Fix: Moved `safetySettings` into `config` object and spread model config properties to conform to API guidelines.
    const chat = ai.chats.create({ 
      model,
      history,
      config: {
        ...baseModelConfig,
        safetySettings,
      },
    });
    const result = await chat.sendMessage({ message: newPrompt });
    return result.text;
}


export async function analyzePlantImage(prompt: string, imageBase64: string, mimeType: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const imagePart = {
        inlineData: {
            data: imageBase64,
            mimeType,
        },
    };
    const textPart = { text: prompt };

    try {
        // Fix: Moved `safetySettings` into `config` object and spread model config properties to conform to API guidelines.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, imagePart] },
            config: {
              ...baseModelConfig,
              safetySettings,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing plant image:", error);
        return "Извините, при анализе изображения произошла ошибка. Пожалуйста, попробуйте еще раз.";
    }
}

export async function getWeatherRecommendations(location: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `Предоставь подробный 5-дневный агропрогноз погоды для ${location}. Включи максимальные/минимальные температуры, вероятность осадков, скорость ветра и влажность. На основе этого прогноза дай конкретные рекомендации по сельскохозяйственным работам, таким как посадка, опрыскивание, полив и сбор урожая. Отформатируй вывод с четкими заголовками.`;

    try {
        // Fix: Moved `safetySettings` into `config` object and spread model config properties to conform to API guidelines.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              ...baseModelConfig,
              safetySettings,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting weather recommendations:", error);
        return "Извините, не удалось получить погодные рекомендации. Пожалуйста, попробуйте еще раз.";
    }
}

export async function getNutritionPlan(crop: string, soil: string, symptoms: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `Я агроном. Мне нужен план питания растений и внесения удобрений.
    - Культура: ${crop}
    - Описание почвы: ${soil}
    - Наблюдаемые симптомы дефицита: ${symptoms}
    
    На основе этого предоставь подробную рекомендацию. Включи:
    1.  Вероятные дефициты питательных веществ.
    2.  Рекомендуемые удобрения (как органические, так и химические варианты, если возможно).
    3.  Нормы и сроки внесения.
    4.  Общие советы по улучшению здоровья почвы.
    Отформатируй ответ в виде четких, действенных шагов.`;

    try {
        // Fix: Moved `safetySettings` into `config` object and spread model config properties to conform to API guidelines.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
              ...baseModelConfig,
              safetySettings,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error getting nutrition plan:", error);
        return "Извините, не удалось создать план питания. Пожалуйста, попробуйте еще раз.";
    }
}


export async function calculateEconomics(data: { [key: string]: string }): Promise<string> {
    const model = 'gemini-2.5-flash';
    const prompt = `Проанализируй следующие экономические данные фермы и предоставь сводку.
    Данные: ${JSON.stringify(data, null, 2)}
    
    Пожалуйста, верни объект JSON со следующей структурой:
    {
      "totalVariableCosts": number,
      "totalRevenue": number,
      "profit": number,
      "returnOnInvestment": number, // в процентах
      "breakEvenYield": number, // в тех же единицах, что и expectedYield
      "analysis": "Краткий текстовый анализ ситуации с рекомендациями."
    }
    
    Выполни расчеты на основе предоставленных данных.
    - Total Variable Costs = сумма всех затрат.
    - Total Revenue = expectedYield * marketPrice.
    - Profit = Total Revenue - Total Variable Costs.
    - Return on Investment (%) = (Profit / Total Variable Costs) * 100.
    - Break-Even Yield = Total Variable Costs / marketPrice.
    `;

    try {
        // Fix: Moved `safetySettings` into `config` object and spread model config properties to conform to API guidelines.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                ...baseModelConfig,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        totalVariableCosts: { type: Type.NUMBER },
                        totalRevenue: { type: Type.NUMBER },
                        profit: { type: Type.NUMBER },
                        returnOnInvestment: { type: Type.NUMBER },
                        breakEvenYield: { type: Type.NUMBER },
                        analysis: { type: Type.STRING }
                    }
                },
                safetySettings,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error calculating economics:", error);
        return "{\"error\": \"Не удалось создать экономический анализ. Пожалуйста, проверьте введенные данные.\"}";
    }
}