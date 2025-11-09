import React from 'react';
import { Page } from '../types';
import { AdvisorIcon, DiagnosticsIcon, WeatherIcon, NutritionIcon, EconomicsIcon } from './common/Icons';
import { LogoIcon } from './common/Logo';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

interface NavItemProps {
  page: Page;
  label: string;
  // Fix: Changed JSX.Element to React.ReactElement to resolve namespace error.
  icon: React.ReactElement;
  activePage: Page;
  onClick: (page: Page) => void;
}

const NavItem: React.FC<NavItemProps> = ({ page, label, icon, activePage, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(page);
      }}
      className={`flex items-center p-3 my-1 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors duration-200 ${
        activePage === page ? 'bg-brand-green-700 text-white shadow-inner' : ''
      }`}
    >
      {React.cloneElement(icon, { 'aria-hidden': 'true' })}
      <span className="ml-3 font-medium">{label}</span>
    </a>
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen }) => {
    const navItems = [
        { page: 'advisor' as Page, label: 'ИИ-советник', icon: <AdvisorIcon /> },
        { page: 'diagnostics' as Page, label: 'Диагностика', icon: <DiagnosticsIcon /> },
        { page: 'weather' as Page, label: 'Погода', icon: <WeatherIcon /> },
        { page: 'nutrition' as Page, label: 'Питание', icon: <NutritionIcon /> },
        { page: 'economics' as Page, label: 'Экономика', icon: <EconomicsIcon /> },
    ];
    
  return (
    <>
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
        <aside className={`absolute md:relative z-40 flex flex-col w-64 h-full bg-slate-800 shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-center h-20 border-b border-slate-700">
             <LogoIcon className="h-14 w-14" />
            <h1 className="text-2xl font-bold ml-2 text-white">Агро ИИ</h1>
        </div>
        <nav className="flex-1 px-4 py-4">
            <ul>
                {navItems.map(item => (
                    <NavItem key={item.page} {...item} activePage={activePage} onClick={setActivePage} />
                ))}
            </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">&copy; 2024 Агропомощник ИИ. Цифровой агроном.</p>
        </div>
        </aside>
    </>
  );
};