import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Building2, 
  FolderGit2, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Demand } from '../types';
import { maskDocument } from '../utils/security';

interface RadarPrazosViewProps {
  demands: Demand[];
  onSelectDemand: (demand: Demand) => void;
}

export const RadarPrazosView: React.FC<RadarPrazosViewProps> = ({ demands, onSelectDemand }) => {
  // Demandas que sofreram exigências de órgãos públicos (INCRA, IAT, etc.)
  const notifiedDemands = demands.filter(d => d.status === 'com_pendencia' || (d.daysRemaining !== undefined && d.daysRemaining !== null));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* Table Header / Context Banner */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-rose-50/40 via-white to-[#f4f8f1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2b3a24] tracking-tight flex items-center gap-2">
              Radar de Prazos próximos e Notificações Oficiais
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                Foco Diretoria
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Processos com exigências formais abertas por órgãos públicos (IAT, INCRA, IBAMA). Risco de cancelamento do protocolo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            1 Notificação Crítica Ativa
          </span>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#f8faf6] border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 w-32">Pasta Física</th>
              <th className="py-3 px-4">Cliente / Imóvel</th>
              <th className="py-3 px-4">Serviço & Protocolo</th>
              <th className="py-3 px-4 w-28">Órgão</th>
              <th className="py-3 px-4 min-w-[240px]">Notificação / Motivo da Exigência</th>
              <th className="py-3 px-4 w-36 text-center">Dias Restantes</th>
              <th className="py-3 px-4">Técnico Resp.</th>
              <th className="py-3 px-4 text-right">Ação Rápida</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notifiedDemands.map((demand) => {
              const isUrgent = (demand.daysRemaining ?? 99) < 5;

              return (
                <tr 
                  key={demand.id}
                  onClick={() => onSelectDemand(demand)}
                  className="hover:bg-[#f6fbf2] cursor-pointer transition-colors group"
                >
                  {/* Pasta Física */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2b3a24] text-white font-mono font-bold text-xs tracking-wider shadow-2xs group-hover:bg-[#1e2e18] transition-colors border border-[#3d5233]">
                      <FolderGit2 className="w-3.5 h-3.5 text-[#76c935]" />
                      Pasta {demand.folderNumber}
                    </div>
                  </td>

                  {/* Cliente / Imóvel */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-[#2b3a24] transition-colors">
                      {demand.client.clientName}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-semibold text-slate-700">{demand.client.farmName}</span>
                      <span>•</span>
                      <span>{demand.client.cityState}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded border border-slate-200/60" title="Documento protegido (LGPD)">
                        {maskDocument(demand.client.document)}
                      </span>
                    </div>
                  </td>

                  {/* Serviço & Protocolo */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                        {demand.serviceCode}
                      </span>
                      {demand.serviceName}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      Prot: {demand.protocolNumber || 'Sem protocolo'}
                    </div>
                  </td>

                  {/* Órgão */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                      <Building2 className="w-3 h-3 text-amber-600" />
                      {demand.agency}
                    </span>
                  </td>

                  {/* Notificação / Motivo */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs font-medium text-rose-950 bg-rose-50/80 p-2 rounded-lg border border-rose-200/60 leading-relaxed">
                      {demand.requirementDetail}
                    </div>
                  </td>

                  {/* Dias Restantes */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {isUrgent ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Faltam {demand.daysRemaining} dias
                        </span>
                        <span className="text-[10px] text-rose-600 font-semibold mt-1">
                          Fatal: {demand.deadlineDate}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <Clock className="w-3.5 h-3.5" />
                        {demand.daysRemaining} dias restantes
                      </span>
                    )}
                  </td>

                  {/* Técnico Responsável */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {demand.responsibleTech.split(' ').map(n => n[0]).join('')}
                      </div>
                      {demand.responsibleTech}
                    </div>
                  </td>

                  {/* Ação Rápida */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDemand(demand);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-xs hover:shadow transition-all ring-1 ring-slate-900/10 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <span>Tratar Exigência</span>
                      <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Status operacional do sistema ativo | Última checagem manual: Hoje às 08:30
        </span>
        <span className="text-slate-400 font-mono text-[11px]">Mostrando 1 de 1 exigência aberta</span>
      </div>

    </div>
  );
};
