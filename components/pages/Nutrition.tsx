import React, { useState, useCallback } from 'react';
import { getNutritionPlan } from '../../services/geminiService';
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

export const Nutrition: React.FC = () => {
  const [crop, setCrop] = useState('');
  const [soil, setSoil] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = crop.trim() && soil.trim() && symptoms.trim();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }
    setIsLoading(true);
    setResult('');
    setError('');
    try {
      const plan = await getNutritionPlan(crop, soil, symptoms);
      setResult(plan);
    } catch (err) {
      setError('Не удалось создать план питания. Пожалуйста, попробуйте еще раз.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [crop, soil, symptoms, canSubmit]);

  const InputField = ({ id, label, value, onChange, placeholder, disabled }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, disabled: boolean }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:outline-none transition-shadow"
            disabled={disabled}
        />
    </div>
  );

  const TextareaField = ({ id, label, value, onChange, placeholder, disabled }: { id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string, disabled: boolean }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:outline-none transition-shadow"
            disabled={disabled}
        />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Планировщик питания растений</h1>
        <p className="text-slate-400 mt-2">Оптимизируйте использование удобрений в соответствии с вашими условиями.</p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField id="crop" label="Тип культуры" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="например, Томаты, Пшеница, Кукуруза" disabled={isLoading} />
            <TextareaField id="soil" label="Описание почвы" value={soil} onChange={(e) => setSoil(e.target.value)} placeholder="например, Глинистая почва, низкое содержание органики, pH 6.5" disabled={isLoading} />
            <TextareaField id="symptoms" label="Наблюдаемые симптомы дефицита" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="например, Пожелтевшие листья с зелеными прожилками, задержка роста" disabled={isLoading} />
            
            <div className="pt-2 text-center">
                <button
                    type="submit"
                    disabled={isLoading || !canSubmit}
                    className="w-full sm:w-auto px-8 py-3 bg-brand-green-600 text-white font-bold rounded-lg hover:bg-brand-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Генерация...' : 'Создать план'}
                </button>
            </div>
            {error && <p className="text-red-400 mt-3 text-center">{error}</p>}
        </form>
      </Card>

      {(isLoading || result) && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">План питания и внесения удобрений</h2>
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