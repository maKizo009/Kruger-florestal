/**
 * Utilitarios de seguranca, validacao defensiva e privacidade (LGPD)
 * Alinhado com as diretrizes OWASP Top 10:
 * - A01: Broken Access Control (RBAC - Perfis e Autorizacao)
 * - A02: Cryptographic Failures & Sensitive Data Exposure (LGPD)
 * - A03: Injection & XSS
 * - A04: Insecure Design & Input Validation
 * - A09: Security Logging & Monitoring Failures (Auditoria e Timestamps Dinâmicos)
 */

import { AuditLog } from '../types';

/**
 * Sanitiza URLs externas garantindo que usem estritamente protocolos seguros (http: ou https:).
 * Previne ataques de XSS e injecao de scripts arbitrarios via esquemas como `javascript:`, `data:`, etc.
 *
 * @param url URL a ser validada
 * @returns A URL higienizada e segura ou null se a URL for invalida ou usar protocolo inseguro
 */
export function sanitizeExternalUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Mascara CPF ou CNPJ para conformidade com a LGPD e minimizacao de dados sensiveis em tela.
 * - CPF: `***.456.789-**`
 * - CNPJ: `12.***.***-0001-**`
 *
 * @param doc Documento a ser mascarado
 * @returns Documento anonimizado
 */
export function maskDocument(doc?: string | null): string {
  if (!doc || typeof doc !== 'string') {
    return '';
  }

  const clean = doc.replace(/\D/g, '');
  if (clean.length === 11) {
    return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
  }
  if (clean.length === 14) {
    return `${clean.substring(0, 2)}.***.***/${clean.substring(8, 12).replace(/./g, '*')}-${clean.substring(12)}`;
  }

  if (doc.length > 5) {
    return `${doc.slice(0, 2)}***${doc.slice(-2)}`;
  }

  return '***';
}

/**
 * Sanitiza o identificador de pasta fisica para prevenir manipulacoes de caminho (Path Traversal)
 * e injecao de caracteres invalidos em URLs do Google Drive e diretorios.
 * Aceita exclusivamente caracteres alfanumericos, hifen e sublinhado (max 10 caracteres).
 *
 * @param val Valor bruto digitado
 * @returns String alfanumerica segura de ate 10 caracteres
 */
export function sanitizeFolderNumber(val: string): string {
  if (!val || typeof val !== 'string') return '';
  return val.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 10);
}

/**
 * Formata a digitacao dinamica de CPF ou CNPJ com mascara automatica.
 *
 * @param val Valor bruto
 * @returns Valor com mascara de CPF ou CNPJ
 */
export function formatDocumentInput(val: string): string {
  if (!val || typeof val !== 'string') return '';
  const clean = val.replace(/\D/g, '').slice(0, 14);

  if (clean.length <= 11) {
    // CPF
    return clean
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  // CNPJ
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/**
 * Converte e sanitiza montantes financeiros em formato numerico seguro.
 * Previne valores negativos, NaN e numeros astronomicos (DoS/overflow).
 *
 * @param val Valor bruto numerico ou texto
 * @param max Valor maximo permitido (padrao 10.000.000)
 * @returns Numero seguro e delimitado
 */
export function parseSafeAmount(val: string | number, max = 10_000_000): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num) || !isFinite(num) || num < 0) {
    return 0;
  }
  return Math.min(num, max);
}

/**
 * Sanitiza textos destinados a trilhas de auditoria para prevenir Log Injection / Log Forging (CRLF)
 * e injecao de tags HTML/scripts (OWASP A09).
 * Remove quebras de linha (\r, \n), caracteres de controle, delimita tamanho maximo e colapsa espacos.
 *
 * @param text Texto a ser sanitizado
 * @param maxLength Limite maximo de caracteres (padrao 300)
 * @returns Texto seguro e limpo
 */
export function sanitizeAuditText(text: string, maxLength = 300): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\r\n\t\0]/g, ' ')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Formata um timestamp ISO ou Date para o padrao amigavel brasileiro utilizado no dashboard:
 * Ex: "16/09 as 13:05".
 * Caso receba uma string legada nao-ISO (ex: "04/09 as 11:52"), higieniza o texto contra injecao e retorna com seguranca.
 *
 * @param dateInput Instancia de Date ou string ISO/legada
 * @returns String formatada e segura
 */
export function formatAuditTimestamp(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return sanitizeAuditText(String(dateInput));
  }

  const dayMonth = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);

  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${dayMonth} às ${time}`;
}

/**
 * Retorna a data formatada para pt-BR (ex: "16/09/2026").
 *
 * @param dateInput Instancia de Date ou string
 * @returns Data formatada em DD/MM/AAAA
 */
export function formatDateBR(dateInput: string | Date = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return sanitizeAuditText(String(dateInput), 20);
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Retorna data e hora formatadas para pt-BR (ex: "16/09/2026 13:05").
 *
 * @param dateInput Instancia de Date ou string
 * @returns Data e hora formatadas em DD/MM/AAAA HH:mm
 */
export function formatDateTimeBR(dateInput: string | Date = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    return sanitizeAuditText(String(dateInput), 30);
  }

  const datePart = formatDateBR(date);
  const timePart = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${datePart} ${timePart}`;
}

/**
 * Cria uma entrada de auditoria integra, dinamica e sanitizada (OWASP A09).
 * - Captura timestamp ISO real via `new Date().toISOString()`
 * - Sanitiza o autor e o texto da acao contra log injection
 * - Gera identificador unico seguro
 *
 * @param author Nome do autor da acao
 * @param action Descricao da acao executada
 * @param date Instancia de Date (padrao `new Date()`)
 * @returns Objeto AuditLog pronto para persistencia e exibicao
 */
export function createAuditLog(
  author: string,
  action: string,
  date: Date = new Date()
): AuditLog {
  const safeAuthor = sanitizeAuditText(author, 80) || 'Sistema';
  const safeAction = sanitizeAuditText(action, 300);
  const isoTimestamp = date.toISOString();

  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author: safeAuthor,
    action: safeAction,
    timestamp: formatAuditTimestamp(date),
    rawTimestamp: isoTimestamp,
  };
}

/**
 * Valida se o papel (role) do usuario possui autorizacao para alterar ou dar baixa
 * em parcelas e status financeiros (OWASP A01: Broken Access Control).
 * Regra RBAC: Apenas perfis 'Diretoria' ou 'Financeiro' possuem permissao de escrita financeira.
 * Perfis tecnicos ('Tecnico') possuem acesso estritamente somente leitura.
 *
 * @param role Papel ou funcao do usuario
 * @returns true se tiver permissao financeira, false caso contrario
 */
export function canManageFinancials(role?: string): boolean {
  if (!role || typeof role !== 'string') return false;
  const clean = role.trim().toLowerCase();
  return (
    clean === 'diretoria' ||
    clean === 'financeiro' ||
    clean.includes('diretor') ||
    clean.includes('financeiro')
  );
}
