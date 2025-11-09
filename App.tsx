import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { AiAdvisor } from './components/pages/AiAdvisor';
import { Diagnostics } from './components/pages/Diagnostics';
import { Weather } from './components/pages/Weather';
import { Nutrition } from './components/pages/Nutrition';
import { Economics } from './components/pages/Economics';
import { Page } from './types';
import { LogoIcon } from './components/common/Logo';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('advisor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderPage = useCallback(() => {
    switch (activePage) {
      case 'advisor':
        return <AiAdvisor />;
      case 'diagnostics':
        return <Diagnostics />;
      case 'weather':
        return <Weather />;
      case 'nutrition':
        return <Nutrition />;
      case 'economics':
        return <Economics />;
      default:
        return <AiAdvisor />;
    }
  }, [activePage]);
  
  const handlePageChange = (page: Page) => {
    setActivePage(page);
    setIsSidebarOpen(false); // Close sidebar on page change for mobile
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
      <Sidebar activePage={activePage} setActivePage={handlePageChange} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 bg-slate-800/50 shadow-md md:hidden flex items-center justify-between p-2">
            <div className="flex items-center">
                 <LogoIcon className="h-12 w-12" />
                <h1 className="text-xl font-bold ml-2 text-white">Агропомощник ИИ</h1>
            </div>
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-md text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-green-500"
                aria-label="Открыть меню"
            >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderPage()}
        </div>
      </main>
    </div>
  );
};

export default App;