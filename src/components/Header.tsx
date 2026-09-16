import React, { useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Bell 
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewDemandClick: () => void;
  openUrgentBadgeCount?: number;
  onLogoClick?: () => void;
  onAlertsClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  searchQuery,
  onSearchChange,
  onNewDemandClick,
  openUrgentBadgeCount = 1,
  onLogoClick,
  onAlertsClick,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Identity: Krüger Florestal */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onLogoClick?.();
            }}
            className="flex items-center gap-3 shrink-0 group cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#65b32e] rounded-lg p-1 -m-1 transition-all"
            title="Voltar ao início do sistema"
            aria-label="Krüger Florestal - Voltar ao início"
          >
            <div className="h-10 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-center group-hover:border-[#65b32e]/60 group-hover:shadow-sm transition-all">
              <img 
                src="/kruger-logo.jpeg" 
                alt="Krüger Florestal" 
                className="h-7 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-[#2b3a24] text-base leading-none group-hover:text-[#1e2e18] transition-colors">krüger</span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#65b32e]/15 text-[#3a6b18] border border-[#65b32e]/30 tracking-wider group-hover:bg-[#65b32e]/25 transition-colors">
                  FLORESTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5 group-hover:text-slate-700 transition-colors">Operações & Consultoria Ambiental</p>
            </div>
          </a>

          {/* Central Global Search Input */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#65b32e] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por Pasta (ex: 0142), Produtor, Fazenda ou CPF/CNPJ..."
                className="w-full pl-10 pr-20 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e] shadow-2xs"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1 pointer-events-none">
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                  Ctrl
                </kbd>
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                  K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section: Actions & User Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick alert badge */}
            <button 
              onClick={onAlertsClick}
              title="Notificações e Exigências Críticas"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {openUrgentBadgeCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>

            {/* Primary Action Button - Kruger brand styling */}
            <button
              onClick={onNewDemandClick}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#2b3a24] hover:bg-[#1e2e18] active:bg-[#152210] text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all border border-[#3a4e32] focus:outline-none focus:ring-2 focus:ring-[#65b32e] focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-[#65b32e]" />
              <span className="hidden sm:inline">Nova O.S. / Demanda</span>
              <span className="sm:hidden">Nova O.S.</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* User Profile Info */}
            <div className="flex items-center gap-3 pl-1">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2b3a24] to-[#405736] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#65b32e]/40 shadow-xs">
                  {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#65b32e] ring-2 ring-white" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.2 rounded-full bg-[#65b32e]/10 text-[#2b3a24] font-bold border border-[#65b32e]/20">
                    Diretoria
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-mono tracking-tight">{user.email}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
