import React, { useState, useCallback } from 'react';
import { calculateEconomics } from '../../services/geminiService';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

interface FormData {
    [key: string]: string;
}

interface ResultData {
    totalVariableCosts: number;
    totalRevenue: number;
    profit: number;
    returnOnInvestment: number;
    breakEvenYield: number;
    analysis: string;
    error?: string;
}

const initialFormData: FormData = {
    cropName: '',
    area: '', // in hectares or acres
    areaUnit: 'га',
    seedCost: '',
    fertilizerCost: '',
    pesticideCost: '',
    laborCost: '',
    machineryCost: '',
    otherCosts: '',
    expectedYield: '', // per unit of area
    yieldUnit: 'тонн',
    marketPrice: '', // per unit of yield
};

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

const InputField = ({ name, label, value, onChange, placeholder, type = 'number', disabled, unit }: { name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, type?: string, disabled: boolean, unit?: React.ReactNode }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="relative">
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min="0"
                className={`w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:outline-none transition-shadow ${unit ? 'pr-20' : ''}`}
                disabled={disabled}
            />
            {unit && <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">{unit}</div>}
        </div>
    </div>
);

export const Economics: React.FC = () => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [result, setResult] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fix: Added a type guard to ensure `val` is a string before calling .trim().
    const canSubmit = Object.values(formData).every(val => typeof val === 'string' && val.trim() !== '');

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) {
            setError('Пожалуйста, заполните все поля.');
            return;
        }
        setIsLoading(true);
        setResult(null);
        setError('');
        try {
            const response = await calculateEconomics(formData);
            const parsedResult: ResultData = JSON.parse(response);
            if(parsedResult.error){
                setError(parsedResult.error);
            } else {
                setResult(parsedResult);
            }
        } catch (err) {
            setError('Не удалось обработать экономический анализ. ИИ вернул неверный формат.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [formData, canSubmit]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Экономический анализатор</h1>
                <p className="text-slate-400 mt-2">Рассчитайте рентабельность и оптимизируйте свои финансовые решения.</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField name="cropName" label="Название культуры" value={formData.cropName} onChange={handleChange} placeholder="например, Пшеница" type="text" disabled={isLoading} />
                    <InputField name="area" label="Площадь" value={formData.area} onChange={handleChange} placeholder="например, 50" disabled={isLoading} unit={formData.areaUnit} />
                    
                    <h3 className="sm:col-span-2 text-lg font-semibold text-brand-green-400 mt-4 border-b border-slate-700 pb-2">Затраты (Общие на всю площадь)</h3>
                    <InputField name="seedCost" label="Стоимость семян" value={formData.seedCost} onChange={handleChange} placeholder="например, 100000" disabled={isLoading} unit="₽" />
                    <InputField name="fertilizerCost" label="Стоимость удобрений" value={formData.fertilizerCost} onChange={handleChange} placeholder="например, 250000" disabled={isLoading} unit="₽" />
                    <InputField name="pesticideCost" label="Стоимость СЗР" value={formData.pesticideCost} onChange={handleChange} placeholder="например, 75000" disabled={isLoading} unit="₽" />
                    <InputField name="laborCost" label="Затраты на рабочую силу" value={formData.laborCost} onChange={handleChange} placeholder="например, 150000" disabled={isLoading} unit="₽" />
                    <InputField name="machineryCost" label="Затраты на технику (топливо, ГСМ)" value={formData.machineryCost} onChange={handleChange} placeholder="например, 125000" disabled={isLoading} unit="₽" />
                    <InputField name="otherCosts" label="Прочие затраты" value={formData.otherCosts} onChange={handleChange} placeholder="например, 50000" disabled={isLoading} unit="₽" />

                    <h3 className="sm:col-span-2 text-lg font-semibold text-brand-green-400 mt-4 border-b border-slate-700 pb-2">Выручка</h3>
                    <InputField name="expectedYield" label="Ожидаемый урожай (общий)" value={formData.expectedYield} onChange={handleChange} placeholder="например, 250" disabled={isLoading} unit={formData.yieldUnit} />
                    <InputField name="marketPrice" label={`Рыночная цена (за ${formData.yieldUnit})`} value={formData.marketPrice} onChange={handleChange} placeholder="например, 10000" disabled={isLoading} unit="₽" />
                    
                    <div className="sm:col-span-2 pt-2 text-center">
                        <button type="submit" disabled={isLoading || !canSubmit} className="w-full sm:w-auto px-8 py-3 bg-brand-green-600 text-white font-bold rounded-lg hover:bg-brand-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
                            {isLoading ? 'Расчет...' : 'Рассчитать рентабельность'}
                        </button>
                    </div>
                    {error && <p className="text-red-400 mt-3 text-center sm:col-span-2">{error}</p>}
                </form>
            </Card>

            {isLoading && <div className="mt-8 flex justify-center"><Spinner /></div>}
            
            {result && !isLoading && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Финансовый отчет</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Card className={result.profit >= 0 ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}>
                            <h3 className="text-sm font-medium text-slate-400">Прибыль</h3>
                            <p className="text-3xl font-bold">{formatCurrency(result.profit)}</p>
                        </Card>
                         <Card>
                            <h3 className="text-sm font-medium text-slate-400">Общая выручка</h3>
                            <p className="text-3xl font-bold">{formatCurrency(result.totalRevenue)}</p>
                        </Card>
                        <Card>
                            <h3 className="text-sm font-medium text-slate-400">Общие затраты</h3>
                            <p className="text-3xl font-bold">{formatCurrency(result.totalVariableCosts)}</p>
                        </Card>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                         <Card>
                            <h3 className="text-sm font-medium text-slate-400">Рентабельность (ROI)</h3>
                            <p className="text-2xl font-bold">{formatPercent(result.returnOnInvestment)}</p>
                        </Card>
                         <Card>
                            <h3 className="text-sm font-medium text-slate-400">Точка безубыточности (урожай)</h3>
                            <p className="text-2xl font-bold">{result.breakEvenYield.toFixed(2)} {formData.yieldUnit}</p>
                        </Card>
                     </div>
                    <Card>
                        <h3 className="text-lg font-semibold text-brand-green-400 mb-2">Анализ и рекомендации от ИИ</h3>
                        <div className="prose prose-invert max-w-none text-slate-300" dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(result.analysis) }} />
                    </Card>
                </div>
            )}
        </div>
    );
};