import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getGeneralAdvice } from '../../services/geminiService';
import { Spinner } from '../common/Spinner';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

// Renders basic Markdown to HTML
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

export const AiAdvisor: React.FC = () => {
  const [history, setHistory] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [history]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', parts: [{ text: prompt }] };
    setHistory(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
        const aiResponse = await getGeneralAdvice(history, prompt);
        const modelMessage: Message = { role: 'model', parts: [{ text: aiResponse }] };
        setHistory(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Failed to get advice:", error);
        const errorMessage: Message = { role: 'model', parts: [{ text: 'Извините, что-то пошло не так. Пожалуйста, попробуйте еще раз.' }] };
        setHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [prompt, isLoading, history]);


  const prebuiltPrompts = [
    "Какой севооборот лучше всего подходит для моего региона?",
    "Как бороться с колорадским жуком органическими методами?",
    "Когда оптимальное время для посадки кукурузы в этом сезоне?",
    "Дайте несколько советов по сбережению воды для моей фермы."
  ];

  const handlePrebuiltPrompt = (p: string) => {
    setPrompt(p);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">ИИ-Агроном Советник</h1>
        <p className="text-slate-400 mt-2">Ваш цифровой помощник по всем вопросам фермерства.</p>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto bg-slate-800/50 rounded-lg p-4 space-y-4 mb-4">
        {history.length === 0 && (
          <div className="text-center text-slate-400 p-8">
            <h2 className="font-semibold text-lg mb-4 text-slate-300">Добро пожаловать! Чем я могу вам помочь сегодня?</h2>
            <p className="mb-6">Вы можете спросить меня о чем угодно, касающемся сельского хозяйства, или начать с одного из этих примеров:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {prebuiltPrompts.map(p => (
                    <button key={p} onClick={() => handlePrebuiltPrompt(p)} className="bg-slate-700 hover:bg-slate-600 text-left text-sm text-slate-300 p-3 rounded-md transition-colors">
                        {p}
                    </button>
                ))}
            </div>
          </div>
        )}
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-brand-green-600 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">ИИ</div>
            )}
             <div className={`max-w-xl p-3 rounded-lg prose prose-invert ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
              dangerouslySetInnerHTML={{ __html: parseSimpleMarkdown(msg.parts[0].text) }}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-green-600 flex-shrink-0 flex items-center justify-center font-bold text-white text-sm">ИИ</div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <Spinner size="sm" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Задайте свой вопрос по сельскому хозяйству..."
          className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-green-500 focus:outline-none transition-shadow"
          disabled={isLoading}
        />
        <button type="submit" className="p-3 bg-brand-green-600 text-white rounded-lg hover:bg-brand-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors" disabled={isLoading || !prompt.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 0010 16h.002a1 1 0 00.725-.317l5-5a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 0l-1.172 1.171a1 1 0 000 1.414l.879.879a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-3.293-3.293a1 1 0 010-1.414l1.172-1.171a1 1 0 000-1.414l-2-2a1 1 0 00-1.414 0l-3.172 3.172a1 1 0 000 1.414l5 5a1 1 0 001.414 0l1.172-1.171a1 1 0 000-1.414l-.879-.879a1 1 0 010-1.414l4-4a1 1 0 011.414 0l1.293 1.293a1 1 0 010 1.414l-1.172 1.171a1 1 0 000 1.414l2 2a1 1 0 001.414 0l7-14a1 1 0 00-.724-1.683z" />
            </svg>
        </button>
      </form>
    </div>
  );
};