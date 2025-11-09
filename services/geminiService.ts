// URL вашего backend-сервиса на Render. Замените на реальный URL после деплоя.
// Для локальной разработки можно использовать 'http://localhost:3001'
const API_URL = 'https://agro-helper-backend.onrender.com'; // Пример

async function postRequest(endpoint: string, body: object): Promise<any> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Произошла сетевая ошибка.' }));
            throw new Error(errorData.error || 'Ошибка сервера');
        }

        // Для экономического анализа ожидаем JSON
        if (endpoint === '/api/economics') {
            const textResponse = await response.text();
            // Возвращаем как строку, чтобы компонент мог ее распарсить
            return textResponse;
        }

        return await response.json();

    } catch (error) {
        console.error(`Error calling endpoint ${endpoint}:`, error);
        throw error;
    }
}


export async function getGeneralAdvice(history: { role: string; parts: { text: string }[] }[], newPrompt: string): Promise<string> {
    const data = await postRequest('/api/advice', { history, newPrompt });
    return data.text;
}


export async function analyzePlantImage(prompt: string, imageBase64: string, mimeType: string): Promise<string> {
    const data = await postRequest('/api/analyze-plant', { prompt, imageBase64, mimeType });
    return data.text;
}

export async function getWeatherRecommendations(location: string): Promise<string> {
    const data = await postRequest('/api/weather', { location });
    return data.text;
}

export async function getNutritionPlan(crop: string, soil: string, symptoms: string): Promise<string> {
    const data = await postRequest('/api/nutrition', { crop, soil, symptoms });
    return data.text;
}


export async function calculateEconomics(data: { [key: string]: string }): Promise<string> {
    // Эта функция теперь ожидает строку JSON от нашего бэкенда
    const responseString = await postRequest('/api/economics', { data });
    return responseString;
}
