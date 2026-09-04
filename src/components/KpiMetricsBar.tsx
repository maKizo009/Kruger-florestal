import React from 'react';
import { 
  AlertOctagon, 
  Send, 
  Coins, 
  PackageCheck, 
  ArrowUpRight,
  TrendingUp,
  ClockAlert
} from 'lucide-react';
import { Demand } from '../types';

interface KpiMetricsBarProps {
  demands: Demand[];
  onCardClick?: (filterType: string) => void;
}

export const KpiMetricsBar: React.FC<KpiMetricsBarProps> = ({ demands, onCardClick }) => {
  // Metric 1: Exigências com Prazo Aberto (Status: com_pendencia)
  const urgentDemands = demands.filter(d => d.status === 'com_pendencia');
  const urgentCount = urgentDemands.length;

  // Metric 2: Processos em Análise no Órgão (Status: protocolado)
  const protocoladoCount = demands.filter(d => d.status === 'protocolado').length;

  // Metric 3: Aguardando Cobrança (Marco Protocolo com status pendente onde foi protocolado ou em análise)
  // Demanda 2 tem R$ 2.500 e Demanda 1 tem R$ 1.500 = R$ 4.000,00
  const awaitingBillingTotal = demands.reduce((acc, demand) => {
    const protoMilestone = demand.financialMilestones.protocolo;
    // se o protocolo está pendente e a demanda já foi protocolada ou está com pendência
    if (protoMilestone && protoMilestone.status === 'pendente') {
      return acc + protoMilestone.amount;
    }
    return acc;
  }, 0);

  // Metric 4: Prontos para Devolução Física (Status: aprovado)
  const readyForReturnCount = demands.filter(d => d.status === 'aprovado').length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* KPI 1: Exigências com Prazo Aberto (Crítico / Alerta Vermelho) */}
      <div 
        onClick={() => onCardClick?.('com_pendencia')}
        className="relative overflow-hidden bg-white rounded-xl border border-rose-200/80 shadow-xs hover:shadow-md transition-all p-4 cursor-pointer group bg-gradient-to-br from-white to-rose-50/30"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Exigências com Prazo
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-rose-950 font-mono tracking-tight">
                {urgentCount}
              </span>
              <span className="text-xs text-rose-600 font-medium">
                {urgentCount === 1 ? 'processo em risco' : 'processos em risco'}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-rose-100/80 text-rose-700 rounded-lg group-hover:scale-105 transition-transform">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-rose-800">
          <span className="flex items-center gap-1 font-medium">
            <ClockAlert className="w-3.5 h-3.5" />
            IAT / CAR: Prazo fatal em 4 dias
          </span>
          <span className="text-rose-500 group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* KPI 2: Processos em Análise no Órgão */}
      <div 
        onClick={() => onCardClick?.('protocolado')}
        className="relative overflow-hidden bg-white rounded-xl border border-blue-200/80 shadow-xs hover:shadow-md transition-all p-4 cursor-pointer group bg-gradient-to-br from-white to-blue-50/20"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Em Análise no Órgão
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
                {protocoladoCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                tramitando no INCRA/IAT
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg group-hover:scale-105 transition-transform">
            <Send className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <span>SIGEF-BR-55420 (INCRA)</span>
          <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">Acompanhar →</span>
        </div>
      </div>

      {/* KPI 3: Aguardando Cobrança (Marco Protocolo Liberado) */}
      <div 
        onClick={() => onCardClick?.('financeiro')}
        className="relative overflow-hidden bg-white rounded-xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all p-4 cursor-pointer group bg-gradient-to-br from-white to-amber-50/20"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Aguardando Cobrança
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-amber-950 font-mono tracking-tight">
                {formatCurrency(awaitingBillingTotal)}
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-amber-100/80 text-amber-800 rounded-lg group-hover:scale-105 transition-transform">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-amber-100/60 flex items-center justify-between text-xs text-amber-900">
          <span className="font-medium">Marco Protocolo Liberado (2 O.S.)</span>
          <span className="text-amber-700 group-hover:translate-x-0.5 transition-transform">Faturar →</span>
        </div>
      </div>

      {/* KPI 4: Prontos para Devolução Física */}
      <div 
        onClick={() => onCardClick?.('aprovado')}
        className="relative overflow-hidden bg-white rounded-xl border border-[#65b32e]/30 shadow-xs hover:shadow-md transition-all p-4 cursor-pointer group bg-gradient-to-br from-white to-[#65b32e]/10"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2b3a24]">
              <span className="w-2 h-2 rounded-full bg-[#65b32e]" />
              Devolução Física
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#1e2e18] font-mono tracking-tight">
                {readyForReturnCount}
              </span>
              <span className="text-xs text-[#3a6b18] font-semibold">
                pasta pronta p/ entrega
              </span>
            </div>
          </div>
          <div className="p-2.5 bg-[#65b32e]/15 text-[#2b3a24] rounded-lg group-hover:scale-105 transition-transform border border-[#65b32e]/25">
            <PackageCheck className="w-5 h-5 text-[#3a6b18]" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-[#65b32e]/20 flex items-center justify-between text-xs text-[#2b3a24]">
          <span className="font-medium">Pasta 0215 (CCIR/ITR Homologado)</span>
          <span className="text-[#3a6b18] font-bold group-hover:translate-x-0.5 transition-transform">Expedir →</span>
        </div>
      </div>

    </div>
  );
};
