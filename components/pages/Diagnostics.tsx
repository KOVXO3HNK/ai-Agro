import React, { useState, useCallback } from 'react';
import { analyzePlantImage } from '../../services/geminiService';
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

export const Diagnostics: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('Определи любые болезни, вредителей или дефицит питательных веществ на этом изображении и предложи варианты лечения.');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!image || !imageBase64) {
      setError('Пожалуйста, сначала загрузите изображение.');
      return;
    }
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const analysisResult = await analyzePlantImage(prompt, imageBase64, image.type);
      setResult(analysisResult);
    } catch (err) {
      setError('Во время анализа произошла ошибка. Пожалуйста, попробуйте еще раз.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [image, imageBase64, prompt]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Диагностика здоровья растений</h1>
        <p className="text-slate-400 mt-2">Загрузите фото, чтобы определить проблемы и получить решения.</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <label htmlFor="file-upload" className="w-full h-64 border-2 border-dashed border-slate-600 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-brand-green-500 transition-colors bg-slate-700/50">
              {previewUrl ? (
                <img src={previewUrl} alt="Предпросмотр" className="h-full w-full object-contain rounded-lg p-1"/>
              ) : (
                <div className="text-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <p className="mt-2">Нажмите, чтобы загрузить изображение</p>
                    <p className="text-xs">PNG, JPG до 10МБ</p>
                </div>
              )}
            </label>
            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageChange} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="prompt" className="font-semibold text-slate-300 mb-2">Запрос для анализа (необязательно)</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:outline-none transition-shadow h-36"
              placeholder="например, Что это за желтые пятна на листьях моих томатов?"
            />
          </div>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !image}
            className="w-full sm:w-auto px-8 py-3 bg-brand-green-600 text-white font-bold rounded-lg hover:bg-brand-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Анализирую...' : 'Анализировать растение'}
          </button>
        </div>
      </Card>
      
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      {(isLoading || result) && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Результат анализа</h2>
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