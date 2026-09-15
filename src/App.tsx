import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { KpiMetricsBar } from './components/KpiMetricsBar';
import { RadarPrazosView } from './components/RadarPrazosView';
import { PipelineView } from './components/PipelineView';
import { DetailDrawer } from './components/DetailDrawer';
import { NewDemandModal } from './components/NewDemandModal';
import { currentUser, initialDemands } from './data/mockData';
import { Demand, DemandStatus } from './types';
import { 
  AlertTriangle, 
  Kanban, 
  Filter, 
  Layers, 
  Search, 
  RefreshCw,
  Clock,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export function App() {
  const [demands, setDemands] = useState<Demand[]>(initialDemands);
  const [activeTab, setActiveTab] = useState<'radar' | 'pipeline'>('radar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter logic: Search input + optional quick status filter
  const filteredDemands = useMemo(() => {
    let result = demands;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d => 
        d.folderNumber.toLowerCase().includes(q) ||
        d.client.clientName.toLowerCase().includes(q) ||
        d.client.farmName.toLowerCase().includes(q) ||
        d.client.document.toLowerCase().includes(q) ||
        d.serviceName.toLowerCase().includes(q) ||
        (d.protocolNumber && d.protocolNumber.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(d => d.status === statusFilter);
    }

    return result;
  }, [demands, searchQuery, statusFilter]);

  // Open detail drawer for a demand
  const handleSelectDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setIsDrawerOpen(true);
  };

  // Close drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Toggle milestone payment status (1-clique interativo)
  const handleToggleFinancialStatus = (milestoneKey: 'entrada' | 'protocolo' | 'devolucao') => {
    if (!selectedDemand) return;

    const currentStatus = selectedDemand.financialMilestones[milestoneKey].status;
    const newStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
    const nowStr = '04/09 às 11:52';

    const updatedDemand: Demand = {
      ...selectedDemand,
      financialMilestones: {
        ...selectedDemand.financialMilestones,
        [milestoneKey]: {
          ...selectedDemand.financialMilestones[milestoneKey],
          status: newStatus,
          paidAt: newStatus === 'pago' ? '04/09/2026' : undefined,
        },
      },
      updatedAt: '04/09/2026 11:52',
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          author: currentUser.name,
          action: `marcou parcela "${selectedDemand.financialMilestones[milestoneKey].label}" como ${newStatus.toUpperCase()}`,
          timestamp: nowStr,
        },
        ...selectedDemand.auditLogs,
      ],
    };

    // Update in local state list
    setDemands(prev => prev.map(d => d.id === updatedDemand.id ? updatedDemand : d));
    setSelectedDemand(updatedDemand);
  };

  // Add new demand from modal
  const handleAddDemand = (newDemand: Demand) => {
    setDemands(prev => [newDemand, ...prev]);
  };

  // Handle clicking on KPI card to quickly focus or switch tab
  const handleKpiCardClick = (filterType: string) => {
    if (filterType === 'com_pendencia') {
      setActiveTab('radar');
      setStatusFilter('all');
    } else {
      setActiveTab('pipeline');
      if (filterType === 'protocolado' || filterType === 'aprovado') {
        setStatusFilter(filterType);
      } else {
        setStatusFilter('all');
      }
    }
  };

  const urgentCount = demands.filter(d => d.status === 'com_pendencia').length;

  return (
    <div className="min-h-screen bg-[#f5f8f3] text-slate-900 flex flex-col antialiased selection:bg-[#65b32e] selection:text-white">
      
      {/* Global Navigation Header */}
      <Header
        user={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewDemandClick={() => setIsNewModalOpen(true)}
        openUrgentBadgeCount={urgentCount}
      />

      {/* Main Operational Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3.5">
        
        {/* Top Context Compact */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#2b3a24] tracking-tight leading-tight flex items-center gap-2">
              <span>Controle Operacional & Executivo</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#65b32e]/15 text-[#2b3a24] border border-[#65b32e]/30">
                Krüger Florestal
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão integrada de pastas físicas, prazos de exigências (INCRA/IAT) e marcos de faturamento.
            </p>
          </div>
        </div>

        {/* Executive KPI Metrics Bar (4 Cards) */}
        <KpiMetricsBar 
          demands={demands} 
          onCardClick={handleKpiCardClick} 
        />

        {/* View Switcher & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          
          {/* Navigation Tabs */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300/60 shadow-inner">
            
            {/* Tab 1: Radar de Prazos Próximos */}
            <button
              onClick={() => {
                setActiveTab('radar');
                setStatusFilter('all');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'radar'
                  ? 'bg-white text-rose-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${activeTab === 'radar' ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>Aba 1: Radar de Prazos próximos e Notificações</span>
              {urgentCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[11px] font-black bg-rose-600 text-white animate-pulse">
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Tab 2: Pipeline Geral de Demandas */}
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-white text-[#2b3a24] shadow-xs ring-1 ring-[#65b32e]/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Kanban className={`w-4 h-4 ${activeTab === 'pipeline' ? 'text-[#65b32e]' : 'text-slate-500'}`} />
              <span>Aba 2: Pipeline Geral de Demandas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[#65b32e]/15 text-[#2b3a24] border border-[#65b32e]/30">
                {demands.length}
              </span>
            </button>

          </div>

          {/* Quick Filter indicators when searching or filtered */}
          <div className="flex items-center gap-2">
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Filtro: {statusFilter}
                <button 
                  onClick={() => setStatusFilter('all')} 
                  className="hover:text-amber-950 font-black ml-1"
                >
                  ×
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#65b32e]/15 text-[#2b3a24] border border-[#65b32e]/30">
                Busca: "{searchQuery}" ({filteredDemands.length} encontrados)
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="hover:text-emerald-950 font-black ml-1"
                >
                  ×
                </button>
              </span>
            )}
          </div>

        </div>

        {/* Active Tab View Rendering */}
        <div className="transition-all duration-200">
          {activeTab === 'radar' ? (
            <RadarPrazosView 
              demands={filteredDemands} 
              onSelectDemand={handleSelectDemand} 
            />
          ) : (
            <PipelineView 
              demands={filteredDemands} 
              onSelectDemand={handleSelectDemand} 
            />
          )}
        </div>

      </main>

      {/* Slide-over Drawer for Demand Details */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        demand={selectedDemand}
        onClose={handleCloseDrawer}
        onToggleFinancialStatus={handleToggleFinancialStatus}
      />

      {/* Modal to Create New Demand */}
      <NewDemandModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddDemand={handleAddDemand}
      />

    </div>
  );
}

export default App;
