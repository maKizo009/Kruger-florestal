import React from 'react';
import { 
  Demand, 
  DemandStatus 
} from '../types';
import { 
  FolderGit2, 
  Clock, 
  FileCheck2, 
  AlertCircle, 
  Hammer, 
  Send, 
  CheckCircle2, 
  Archive, 
  ExternalLink,
  ChevronRight,
  User,
  DollarSign
} from 'lucide-react';

interface PipelineViewProps {
  demands: Demand[];
  onSelectDemand: (demand: Demand) => void;
}

interface ColumnConfig {
  status: DemandStatus;
  label: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: 'em_producao',
    label: 'Em Produção',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Hammer,
    description: 'Elaboração técnica interna',
  },
  {
    status: 'protocolado',
    label: 'Protocolado / Em Análise',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Send,
    description: 'Tramitação no órgão público',
  },
  {
    status: 'com_pendencia',
    label: 'Com Pendência',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertCircle,
    description: 'Exigência formal com prazo',
  },
  {
    status: 'aprovado',
    label: 'Aprovado (A Devolver)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    description: 'Pronto p/ entrega ao cliente',
  },
  {
    status: 'finalizado',
    label: 'Finalizado / Arquivado',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Archive,
    description: 'Entregue e arquivado',
  },
];

export const PipelineView: React.FC<PipelineViewProps> = ({ demands, onSelectDemand }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
      {COLUMNS.map((column) => {
        const columnDemands = demands.filter(d => d.status === column.status);
        const IconComponent = column.icon;

        return (
          <div 
            key={column.status}
            className="flex flex-col bg-slate-100/75 rounded-xl border border-slate-200/80 min-h-[460px]"
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200 bg-white/70 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {column.label}
                  </h3>
                </div>
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                  {columnDemands.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                {column.description}
              </p>
            </div>

            {/* Cards Container */}
            <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[720px]">
              {columnDemands.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-lg text-slate-400">
                  <span className="text-xs">Nenhum processo nesta etapa</span>
                </div>
              ) : (
                columnDemands.map((demand) => {
                  const fin = demand.financialMilestones;

                  return (
                    <div
                      key={demand.id}
                      onClick={() => onSelectDemand(demand)}
                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#65b32e]/50 transition-all cursor-pointer group relative"
                    >
                      {/* Top row: Folder number & Agency */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#2b3a24] text-white font-mono font-bold text-xs tracking-wider border border-[#3d5233]">
                          <FolderGit2 className="w-3 h-3 text-[#76c935]" />
                          {demand.folderNumber}
                        </div>

                        {demand.agency && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {demand.agency}
                          </span>
                        )}
                      </div>

                      {/* Client and Farm */}
                      <div className="mb-2">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#2b3a24] line-clamp-1 transition-colors">
                          {demand.client.clientName}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          {demand.client.farmName}
                        </p>
                      </div>

                      {/* Service & Protocol */}
                      <div className="p-2 rounded bg-slate-50 border border-slate-100 mb-2.5">
                        <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {demand.serviceName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between mt-0.5">
                          <span>Prot: {demand.protocolNumber || 'Em elaboração'}</span>
                        </div>
                      </div>

                      {/* Pending alert if com_pendencia */}
                      {demand.status === 'com_pendencia' && demand.daysRemaining && (
                        <div className="mb-2.5 p-1.5 bg-rose-50 border border-rose-200 rounded text-[11px] font-bold text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Exigência: Faltam {demand.daysRemaining} dias!</span>
                        </div>
                      )}

                      {/* Financial Milestones Simplified Indicator */}
                      {/* (Entrada: OK | Protocolo: Pendente | Final: Pendente) */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Marcos Financeiros:
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px] font-medium text-center">
                          {/* Entrada */}
                          <div 
                            className={`py-1 rounded border ${
                              fin.entrada.status === 'pago' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                            title={`Entrada: R$ ${fin.entrada.amount} (${fin.entrada.status})`}
                          >
                            Ent: {fin.entrada.status === 'pago' ? 'OK' : 'Pend.'}
                          </div>

                          {/* Protocolo */}
                          <div 
                            className={`py-1 rounded border ${
                              fin.protocolo.status === 'pago' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                                : fin.protocolo.status === 'pendente'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                                  : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                            title={`Protocolo: R$ ${fin.protocolo.amount} (${fin.protocolo.status})`}
                          >
                            Prot: {fin.protocolo.status === 'pago' ? 'OK' : fin.protocolo.status === 'pendente' ? 'Aguard.' : 'Futuro'}
                          </div>

                          {/* Devolução / Final */}
                          <div 
                            className={`py-1 rounded border ${
                              fin.devolucao.status === 'pago' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                            title={`Final: R$ ${fin.devolucao.amount} (${fin.devolucao.status})`}
                          >
                            Fin: {fin.devolucao.status === 'pago' ? 'OK' : 'Pend.'}
                          </div>
                        </div>
                      </div>

                      {/* Footer: Tech & Slide indicator */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-slate-400" />
                          {demand.responsibleTech}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
