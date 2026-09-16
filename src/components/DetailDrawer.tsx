import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  FolderGit2, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  History, 
  Calendar, 
  FileCheck,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { Demand, UserProfile } from '../types';
import { 
  sanitizeExternalUrl, 
  maskDocument, 
  formatAuditTimestamp,
  canManageFinancials 
} from '../utils/security';

interface DetailDrawerProps {
  isOpen: boolean;
  demand: Demand | null;
  onClose: () => void;
  onToggleFinancialStatus: (milestoneKey: 'entrada' | 'protocolo' | 'devolucao') => void;
  currentUser?: UserProfile;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  isOpen,
  demand,
  onClose,
  onToggleFinancialStatus,
  currentUser,
}) => {
  const [showFullDocument, setShowFullDocument] = useState(false);
  const [prevDemandId, setPrevDemandId] = useState<string | null>(null);

  const currentDemandId = demand ? demand.id : null;
  if (currentDemandId !== prevDemandId) {
    setPrevDemandId(currentDemandId);
    setShowFullDocument(false);
  }

  if (!isOpen || !demand) return null;

  const fin = demand.financialMilestones;
  const hasFinancialAccess = canManageFinancials(currentUser?.role);
  const sanitizedDriveUrl = sanitizeExternalUrl(demand.client.driveUrl);
  const sanitizedReceiptUrl = sanitizeExternalUrl(demand.protocolReceiptUrl);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const renderStatusBadge = () => {
    switch (demand.status) {
      case 'com_pendencia':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Com Pendência / Notificado
          </span>
        );
      case 'protocolado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Protocolado / Em Análise
          </span>
        );
      case 'aprovado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aprovado / A Devolver
          </span>
        );
      case 'em_producao':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            Em Produção Interna
          </span>
        );
      case 'finalizado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Finalizado e Arquivado
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col transform transition ease-in-out duration-300 animate-in slide-in-from-right">
          
          {/* Header - Krüger Theme */}
          <div className="px-6 py-5 border-b border-[#354a2d] bg-[#1e2e18] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#65b32e] text-[#142010] font-mono font-extrabold text-sm tracking-wider shadow-sm">
                  <FolderGit2 className="w-4 h-4" />
                  Pasta {demand.folderNumber}
                </span>
                <span className="text-xs text-slate-300 font-mono">ID: {demand.id}</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  {demand.client.clientName}
                </h2>
                <p className="text-xs text-emerald-100/80 flex items-center gap-2 mt-0.5">
                  <span className="font-medium text-emerald-200">{demand.client.farmName}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 font-mono">
                    <span>
                      Doc: {showFullDocument ? demand.client.document : maskDocument(demand.client.document)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFullDocument(!showFullDocument)}
                      className="p-1 rounded text-emerald-200/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title={showFullDocument ? "Ocultar documento (LGPD)" : "Revelar documento completo (LGPD)"}
                      aria-label={showFullDocument ? "Ocultar documento" : "Revelar documento completo"}
                    >
                      {showFullDocument ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </span>
                </p>
              </div>

              {/* Direct Link: Open in Drive */}
              {sanitizedDriveUrl ? (
                <a
                  href={sanitizedDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#65b32e] hover:bg-[#76c935] text-[#142010] text-xs font-bold shadow-sm transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir Pasta no Drive
                </a>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 text-xs font-medium shrink-0 cursor-not-allowed"
                  title="Link do Google Drive não configurado ou protocolo inseguro"
                >
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  Sem link do Drive
                </span>
              )}
            </div>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            
            {/* Status & Service Banner */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Serviço Contratado
                </div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {demand.serviceName}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span>Técnico Responsável:</span>
                  <span className="font-semibold text-slate-800">{demand.responsibleTech}</span>
                </div>
              </div>
              <div>
                {renderStatusBadge()}
              </div>
            </div>

            {/* Requirement / Fatal Alert Box if exists */}
            {demand.requirementDetail && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-rose-950">
                        Exigência Formal do Órgão ({demand.agency})
                      </h4>
                      {demand.daysRemaining && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                          Faltam {demand.daysRemaining} dias
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                      {demand.requirementDetail}
                    </p>
                    {demand.deadlineDate && (
                      <div className="mt-2 text-xs font-semibold text-rose-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Data Limite Improrrogável: {demand.deadlineDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Observações da Demanda / O.S. */}
            {demand.notes && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Observações & Prazos Registrados
                    </h4>
                    <p className="text-xs text-amber-950 mt-1 leading-relaxed font-medium">
                      {demand.notes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Protocolo */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dados do Protocolo Oficial
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {demand.agency || 'Órgão não definido'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Número do Protocolo
                  </label>
                  <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                    {demand.protocolNumber || 'Aguardando Geração'}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Data de Envio
                  </label>
                  <div className="text-sm font-medium text-slate-800 mt-0.5">
                    {demand.protocolDate || 'Não protocolado'}
                  </div>
                </div>
              </div>

              {/* Botão Ver Comprovante */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Comprovante digital autenticado pelo órgão
                </span>
                {sanitizedReceiptUrl ? (
                  <a
                    href={sanitizedReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Ver Comprovante
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Sem comprovante anexo
                  </span>
                )}
              </div>
            </div>

            {/* Seção de Marcos Financeiros */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Marcos Financeiros da O.S.
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      {hasFinancialAccess
                        ? 'Clique no botão para alternar entre Pago e Pendente'
                        : 'Visualização somente leitura para perfil Técnico'}
                    </span>
                  </div>
                </div>
                {!hasFinancialAccess ? (
                  <span
                    title="Apenas usuários com perfil Diretoria ou Financeiro podem alterar faturamento."
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md"
                  >
                    <Lock className="w-3 h-3 text-amber-600" />
                    Somente Leitura (Técnico)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2b3a24] bg-[#65b32e]/10 border border-[#65b32e]/20 px-2 py-0.5 rounded-md">
                    <Coins className="w-3 h-3 text-[#65b32e]" />
                    {currentUser?.role || 'Diretoria'}
                  </span>
                )}
              </div>

              <div className="space-y-3 mt-4">
                
                {/* 1. Entrada */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{fin.entrada.label}</span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatCurrency(fin.entrada.amount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {fin.entrada.paidAt ? `Liquidado em ${fin.entrada.paidAt}` : 'Pagamento inicial de mobilização'}
                    </div>
                  </div>
                  {hasFinancialAccess ? (
                    <button
                      onClick={() => onToggleFinancialStatus('entrada')}
                      className={`px-3 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                        fin.entrada.status === 'pago'
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {fin.entrada.status === 'pago' ? '✓ Pago' : 'Pendente'}
                    </button>
                  ) : (
                    <span
                      title="Alteração restrita aos perfis Diretoria e Financeiro (Acesso Somente Leitura)"
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md border cursor-not-allowed select-none ${
                        fin.entrada.status === 'pago'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      {fin.entrada.status === 'pago' ? '✓ Pago' : 'Pendente'}
                    </span>
                  )}
                </div>

                {/* 2. Protocolo */}
                <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  fin.protocolo.status === 'pendente' && (demand.status === 'protocolado' || demand.status === 'com_pendencia')
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{fin.protocolo.label}</span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatCurrency(fin.protocolo.amount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {fin.protocolo.status === 'pendente' ? 'Faturamento liberado com o envio do protocolo' : 'Etapa de protocolo faturada'}
                    </div>
                  </div>
                  {hasFinancialAccess ? (
                    <button
                      onClick={() => onToggleFinancialStatus('protocolo')}
                      className={`px-3 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                        fin.protocolo.status === 'pago'
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          : 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-xs'
                      }`}
                    >
                      {fin.protocolo.status === 'pago' ? '✓ Pago' : 'Cobrar (Pendente)'}
                    </button>
                  ) : (
                    <span
                      title="Alteração restrita aos perfis Diretoria e Financeiro (Acesso Somente Leitura)"
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md border cursor-not-allowed select-none ${
                        fin.protocolo.status === 'pago'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <Lock className="w-3 h-3 text-amber-500" />
                      {fin.protocolo.status === 'pago' ? '✓ Pago' : 'Pendente'}
                    </span>
                  )}
                </div>

                {/* 3. Devolução / Final */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{fin.devolucao.label}</span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatCurrency(fin.devolucao.amount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Saldo residual para entrega da pasta física e certidão
                    </div>
                  </div>
                  {hasFinancialAccess ? (
                    <button
                      onClick={() => onToggleFinancialStatus('devolucao')}
                      className={`px-3 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                        fin.devolucao.status === 'pago'
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {fin.devolucao.status === 'pago' ? '✓ Pago' : 'Pendente'}
                    </button>
                  ) : (
                    <span
                      title="Alteração restrita aos perfis Diretoria e Financeiro (Acesso Somente Leitura)"
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md border cursor-not-allowed select-none ${
                        fin.devolucao.status === 'pago'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      {fin.devolucao.status === 'pago' ? '✓ Pago' : 'Pendente'}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Trilha de Auditoria no Rodapé */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Trilha de Auditoria e Alterações
                </h3>
              </div>

              <div className="mt-3 space-y-3">
                {demand.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <div className="text-slate-600">
                      <span className="font-semibold text-slate-900">{log.author}</span>
                      {' '}{log.action}{' '}
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({formatAuditTimestamp(log.rawTimestamp || log.timestamp)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Actions Footer */}
          <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Última atualização: {demand.updatedAt}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Fechar Painel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
