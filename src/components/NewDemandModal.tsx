import React, { useState } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import { Demand, DemandStatus } from '../types';
import { sanitizeFolderNumber, formatDocumentInput, parseSafeAmount } from '../utils/security';

interface NewDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDemand: (demand: Demand) => void;
}

export const NewDemandModal: React.FC<NewDemandModalProps> = ({ isOpen, onClose, onAddDemand }) => {
  const [folderNumber, setFolderNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [document, setDocument] = useState('');
  const [serviceName, setServiceName] = useState('Retificação de CAR');
  const [agency, setAgency] = useState('IAT');
  const [responsibleTech, setResponsibleTech] = useState('Lucas Cenovicz');
  const [amountEntrada, setAmountEntrada] = useState('1500');
  const [amountProtocolo, setAmountProtocolo] = useState('1500');
  const [amountDevolucao, setAmountDevolucao] = useState('1500');
  const [status, setStatus] = useState<DemandStatus>('em_producao');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeFolder = sanitizeFolderNumber(folderNumber);
    const safeClientName = clientName.trim().slice(0, 120);
    if (!safeFolder || !safeClientName) return;

    const newDemand: Demand = {
      id: `dem-${Date.now()}`,
      folderNumber: safeFolder.padStart(4, '0'),
      folderId: `f-${safeFolder}`,
      client: {
        id: `cli-${Date.now()}`,
        folderNumber: safeFolder.padStart(4, '0'),
        clientName: safeClientName,
        farmName: (farmName.trim() || 'Fazenda Principal').slice(0, 120),
        document: document.trim().slice(0, 18) || '000.000.000-00',
        documentType: document.replace(/\D/g, '').length > 11 ? 'CNPJ' : 'CPF',
        driveUrl: `https://drive.google.com/drive/folders/pasta-${safeFolder}`,
      },
      serviceName,
      serviceCode: serviceName.includes('CAR') ? 'CAR' : serviceName.includes('SIGEF') ? 'SIGEF' : serviceName.includes('GEO') ? 'GEO' : 'CCIR_ITR',
      status,
      agency,
      responsibleTech,
      financialMilestones: {
        entrada: {
          label: 'Entrada Inicial',
          amount: parseSafeAmount(amountEntrada),
          status: 'pago',
          paidAt: '04/09/2026',
        },
        protocolo: {
          label: `Protocolo ${agency}`,
          amount: parseSafeAmount(amountProtocolo),
          status: 'pendente',
        },
        devolucao: {
          label: 'Devolução / Homologação',
          amount: parseSafeAmount(amountDevolucao),
          status: 'pendente',
        },
      },
      notes: notes.trim().slice(0, 1000) || undefined,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          author: 'Lucas Cenovicz',
          action: `criou a Ordem de Serviço com status "${status}"`,
          timestamp: 'Hoje às 11:50',
        },
      ],
      createdAt: '04/09/2026',
      updatedAt: '04/09/2026 11:50',
    };

    onAddDemand(newDemand);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
          
          <div className="bg-[#1e2e18] px-6 py-4 flex items-center justify-between text-white border-b border-[#354a2d]">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#76c935]" />
              <h3 className="text-base font-bold">Nova Ordem de Serviço / Demanda</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nº Pasta Física *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Ex: 0310"
                  value={folderNumber}
                  onChange={(e) => setFolderNumber(sanitizeFolderNumber(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CPF / CNPJ do Cliente
                </label>
                <input
                  type="text"
                  maxLength={18}
                  placeholder="000.000.000-00"
                  value={document}
                  onChange={(e) => setDocument(formatDocumentInput(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Produtor / Empresa *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                placeholder="Ex: Carlos Eduardo de Souza"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Imóvel / Fazenda
              </label>
              <input
                type="text"
                maxLength={120}
                placeholder="Ex: Fazenda Boa Esperança"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Serviço
                </label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e]"
                >
                  <option>Retificação de CAR</option>
                  <option>Certificação SIGEF</option>
                  <option>Georreferenciamento Completo</option>
                  <option>Emissão de CCIR + ITR 2026</option>
                  <option>Outorga de Água</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Órgão Público
                </label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e]"
                >
                  <option>IAT</option>
                  <option>INCRA</option>
                  <option>RFB</option>
                  <option>IBAMA</option>
                  <option>SEAB</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status Inicial
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DemandStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e]"
                >
                  <option value="em_producao">Em Produção</option>
                  <option value="protocolado">Protocolado / Em Análise</option>
                  <option value="com_pendencia">Com Pendência</option>
                  <option value="aprovado">Aprovado (A Devolver)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Responsável Técnico
                </label>
                <select
                  value={responsibleTech}
                  onChange={(e) => setResponsibleTech(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e]"
                >
                  <option>Lucas Cenovicz</option>
                  <option>Pedro Santos</option>
                  <option>Mariana Costa</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Marcos Financeiros Previstos (R$)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500">1. Entrada</span>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="any"
                    value={amountEntrada}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || Number(v) >= 0) setAmountEntrada(v);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">2. Protocolo</span>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="any"
                    value={amountProtocolo}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || Number(v) >= 0) setAmountProtocolo(v);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">3. Devolução</span>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="any"
                    value={amountDevolucao}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || Number(v) >= 0) setAmountDevolucao(v);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Observações e Alerta de Prazos */}
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Observações Internas & Prazos
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {notes.length}/1000 caracteres
                </span>
              </div>

              {/* Aviso sobre prazos e acordos */}
              <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-amber-950">Aviso sobre prazos e acordos: </span>
                  Registre aqui prazos combinados com o produtor, datas de vistoria a campo, agendamentos com confrontantes ou urgências legais perante órgãos públicos (IAT, INCRA, etc.).
                </div>
              </div>

              <textarea
                rows={3}
                maxLength={1000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Prazo estimado com o produtor de 20 dias; aguardando certidão atualizada do cartório para validação de divisas..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#65b32e]/30 focus:border-[#65b32e] text-slate-800 placeholder-slate-400 resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#2b3a24] hover:bg-[#1e2e18] rounded-lg shadow-sm border border-[#3d5233]"
              >
                Criar Demanda
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
