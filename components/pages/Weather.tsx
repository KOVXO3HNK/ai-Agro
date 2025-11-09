import React, { useState, useCallback } from 'react';
import { getWeatherRecommendations } from '../../services/geminiService';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

const parseSimpleMarkdown = (text: string): string => {
    if (!text) return '';

    const lines = text.split('\n');
    let html = '';
    let inList = false;

    const formatInline = (str: string) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('* ')) {
            if (!inList) {
                html += '<ul class="list-disc list-inside my-2 pl-4 space-y-1">';
                inList = true;
            }
            html += `<li>${formatInline(trimmedLine.substring(2))}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            if (trimmedLine.startsWith('### ')) {
                html += `<h3 class="text-xl font-semibold mt-4 mb-2">${formatInline(trimmedLine.substring(4))}</h3>`;
            } else if (trimmedLine.startsWith('## ')) {
                html += `<h2 class="text-2xl font-bold mt-5 mb-3">${formatInline(trimmedLine.substring(3))}</h2>`;
            } else if (trimmedLine) {
                html += `<p class="my-2">${formatInline(trimmedLine)}</p>`;
            }
        }
    }

    if (inList) {
        html += '</ul>';
    }

    return html;
};

export const Weather: React.FC = () => {
  const [location, setLocation] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      setError('Пожалуйста, введите местоположение.');
      return;
    }
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const recommendations = await getWeatherRecommendations(location);
      setResult(recommendations);
    } catch (err) {
      setError('Не удалось получить погодные рекомендации. Пожалуйста, попробуйте еще раз.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [location]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Агропрогноз погоды</h1>
        <p className="text-slate-400 mt-2">Получите рекомендации для полевых работ на основе погоды.</p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Введите ваш город или регион..."
            className="flex-1 w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:outline-none transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !location.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-brand-green-600 text-white font-bold rounded-lg hover:bg-brand-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Загрузка...' : 'Получить прогноз'}
          </button>
        </form>
         {error && <p className="text-red-400 mt-3 text-center sm:text-left">{error}</p>}
      </Card>

      {(isLoading || result) && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Прогноз и рекомендации</h2>
            <Card className="min-h-[200px]">
            {isLoading ? (
                <div className="flex justify-center items-center h-full pt-10">
                    <Spinner />
                </div>
            ) : (
                <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(result) }} />
            )}
            </Card>
        </div>
      )}
    </div>
  );
};