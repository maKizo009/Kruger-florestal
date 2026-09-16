/**
 * Utilitarios de seguranca, validacao defensiva e privacidade (LGPD)
 * Alinhado com as diretrizes OWASP Top 10:
 * - A02: Cryptographic Failures & Sensitive Data Exposure (LGPD)
 * - A03: Injection & XSS
 * - A04: Insecure Design & Input Validation
 */

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
