export type DemandStatus = 
  | 'em_producao'
  | 'protocolado'
  | 'com_pendencia'
  | 'aprovado'
  | 'finalizado';

export type PaymentStatus = 'pago' | 'pendente' | 'a_faturar';

export interface FinancialMilestone {
  label: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export interface ClientPhysicalFolder {
  id: string;
  folderNumber: string; // Ex: '0104'
  clientName: string;
  farmName: string;
  document: string; // CPF or CNPJ
  documentType: 'CPF' | 'CNPJ';
  cityState?: string;
  driveUrl: string;
}

export interface AuditLog {
  id: string;
  author: string;
  action: string;
  timestamp: string;
}

export interface Demand {
  id: string;
  folderNumber: string;
  folderId: string;
  client: ClientPhysicalFolder;
  serviceName: string;
  serviceCode: 'CAR' | 'SIGEF' | 'CCIR_ITR' | 'GEO' | 'OUTORGA' | 'OUTROS';
  status: DemandStatus;
  agency?: string; // Ex: INCRA, IAT, MAPA, IBAMA
  protocolNumber?: string;
  protocolDate?: string;
  protocolReceiptUrl?: string;
  requirementDetail?: string;
  daysRemaining?: number; // For fatal deadlines
  deadlineDate?: string;
  responsibleTech: string;
  financialMilestones: {
    entrada: FinancialMilestone;
    protocolo: FinancialMilestone;
    devolucao: FinancialMilestone;
  };
  auditLogs: AuditLog[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}
