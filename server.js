
import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';

// Убедитесь, что API_KEY установлен в переменных окружения на Render
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json({limit: '10mb'})); // Увеличиваем лимит для изображений
app.use(cors()); // Разрешаем запросы с вашего frontend

const baseModelConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
};

const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

// Endpoint для ИИ-советника
app.post('/api/advice', async (req, res) => {
  try {
    const { history, newPrompt } = req.body;
    const model = 'gemini-2.5-flash';
    const chat = ai.chats.create({ 
      model,
      history,
      config: { ...baseModelConfig, safetySettings },
    });
    const result = await chat.sendMessage({ message: newPrompt });
    res.json({ text: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get advice from Gemini API' });
  }
});

// Endpoint для анализа изображений
app.post('/api/analyze-plant', async (req, res) => {
    try {
        const { prompt, imageBase64, mimeType } = req.body;
        const model = 'gemini-2.5-flash';
        const imagePart = { inlineData: { data: imageBase64, mimeType } };
        const textPart = { text: prompt };
        
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart, imagePart] },
            config: { ...baseModelConfig, safetySettings },
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to analyze image with Gemini API' });
    }
});

// Endpoint для погоды
app.post('/api/weather', async (req, res) => {
    try {
        const { location } = req.body;
        const model = 'gemini-2.5-flash';
        const prompt = `Предоставь подробный 5-дневный агропрогноз погоды для ${location}. Включи максимальные/минимальные температуры, вероятность осадков, скорость ветра и влажность. На основе этого прогноза дай конкретные рекомендации по сельскохозяйственным работам, таким как посадка, опрыскивание, полив и сбор урожая. Отформатируй вывод с четкими заголовками.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { ...baseModelConfig, safetySettings },
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get weather from Gemini API' });
    }
});

// Endpoint для плана питания
app.post('/api/nutrition', async (req, res) => {
    try {
        const { crop, soil, symptoms } = req.body;
        const model = 'gemini-2.5-flash';
        const prompt = `Я агроном. Мне нужен план питания растений и внесения удобрений. - Культура: ${crop} - Описание почвы: ${soil} - Наблюдаемые симптомы дефицита: ${symptoms}. На основе этого предоставь подробную рекомендацию. Включи: 1. Вероятные дефициты питательных веществ. 2. Рекомендуемые удобрения (как органические, так и химические варианты, если возможно). 3. Нормы и сроки внесения. 4. Общие советы по улучшению здоровья почвы. Отформатируй ответ в виде четких, действенных шагов.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { ...baseModelConfig, safetySettings },
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get nutrition plan from Gemini API' });
    }
});

// Endpoint для экономики
app.post('/api/economics', async (req, res) => {
    try {
        const { data } = req.body;
        const model = 'gemini-2.5-flash';
        const prompt = `Проанализируй следующие экономические данные фермы и предоставь сводку. Данные: ${JSON.stringify(data, null, 2)}. Пожалуйста, верни объект JSON со следующей структурой: { "totalVariableCosts": number, "totalRevenue": number, "profit": number, "returnOnInvestment": number, "breakEvenYield": number, "analysis": "Краткий текстовый анализ ситуации с рекомендациями." }. Выполни расчеты на основе предоставленных данных.`;
        
        const response = await ai.models.generateContent({
            model,
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
        
        res.send(response.text); // Отправляем как текст, так как Gemini возвращает строку JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate economics with Gemini API' });
    }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
