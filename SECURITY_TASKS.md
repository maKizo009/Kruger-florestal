# 🛡️ Plano de Segurança e Tarefas de Correção (OWASP Top 10)
**Projeto:** Krüger Florestal - Dashboard Operacional & Executivo  
**Data da Auditoria:** 15/09/2026  
**Status do Projeto:** Em Desenvolvimento / Pré-Produção  
**Dependências (npm audit):** 0 vulnerabilidades conhecidas  

---

## 📋 Sumário Executivo da Auditoria

Esta análise avaliou a base de código do sistema **Krüger Florestal** sob as diretrizes do **OWASP Top 10 (2021/2025)** para aplicações web. Foram mapeadas 8 tarefas de correção preventiva e defensiva, classificadas por nível de severidade e com receitas práticas de implementação prontas para execução.

---

## 🎯 Matriz de Conformidade OWASP Top 10

| Categoria OWASP | Item Auditado | Severidade | Status |
| :--- | :--- | :---: | :---: |
| **A01: Broken Access Control** | Controle de permissões por perfil (Diretoria vs Técnico) | Médio | 🟢 Implementado |
| **A02: Cryptographic Failures** | Exposição de dados sensíveis (LGPD: CPF/CNPJ mascarado com reveal) | Baixo / Médio | 🟢 Implementado |
| **A03: Injection (XSS)** | Sanitização de links externos e protocolos inseguros (`driveUrl`) | **Alto** | 🟢 Implementado |
| **A04: Insecure Design** | Limites de tamanho (maxLength), sanitização de inputs e numéricos | Médio | 🟢 Implementado |
| **A05: Security Misconfiguration** | Content Security Policy (CSP), headers de segurança e restrição de hosts | Médio | 🟡 Em Andamento (TASK-02 Concluída) |
| **A06: Vulnerable Components** | Varredura de dependências e monitoramento contínuo (CI/CD) | Informativo | 🟢 Implementado |
| **A07: Identification Failures** | Gerenciamento de sessão e autenticação de usuário | Médio | 🟡 A Fazer |
| **A08: Software & Data Integrity** | Integridade de pacotes e scripts externos | Baixo | 🟢 Aprovado |
| **A09: Logging & Monitoring** | Registro de logs de auditoria não-manipuláveis e com data real | Baixo | 🟢 Implementado |
| **A10: SSRF** | Requisições a serviços externos no frontend | Informativo | 🟢 Não aplicável |

---

## 📝 Checklist de Tarefas de Correção (Tasks)

### 🟢 [TASK-01] Sanitização de URLs Externas e Prevenção de XSS (Implementado)
- [x] **Categoria:** A03: Injection & Cross-Site Scripting (XSS)
- [x] **Severidade:** **Alta**
- [x] **Arquivo afetado:** [`src/components/DetailDrawer.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/DetailDrawer.tsx) e [`src/utils/security.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/utils/security.ts)
- [x] **Descrição do Risco:** Links externos dinâmicos (`demand.client.driveUrl` e `demand.protocolReceiptUrl`) são inseridos diretamente em elementos `<a href={...}>`. Se um registro receber uma URL com esquema `javascript:`, `data:` ou redirecionamento arbitrário, scripts maliciosos podem ser executados no contexto da aplicação ao clicar.
- [x] **Ação Requerida:**
  1. Criar uma função utilitária `sanitizeExternalUrl(url?: string): string | null` que valide estritamente protocolos seguros (`https://` ou `http://`).
  2. Adicionar `rel="noopener noreferrer"` em todas as tags `<a>` que usam `target="_blank"` para blindar contra *Reverse Tabnabbing*.

```tsx
// Exemplo de utilitário defensivo:
export function sanitizeExternalUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href;
    }
  } catch {
    return null;
  }
  return null;
}
```

---

### 🟢 [TASK-02] Adicionar Content Security Policy (CSP) e Headers de Segurança (Implementado)
- [x] **Categoria:** A05: Security Misconfiguration
- [x] **Severidade:** Média
- [x] **Arquivo afetado:** [`index.html`](file:///C:/Users/Acer/Dev/Kruger-florestal/index.html)
- [x] **Descrição do Risco:** O arquivo HTML base não definia nenhuma política de segurança de conteúdo. Em caso de injeção acidental em qualquer biblioteca, scripts remotos não autorizados poderiam ser carregados sem restrição.
- [x] **Ação Requerida:**
  1. Adicionar `<meta http-equiv="Content-Security-Policy" content="...">` restringindo fontes de scripts, estilos, conexões e objetos.
  2. Adicionar `<meta name="referrer" content="strict-origin-when-cross-origin" />`.
  3. Adicionar `<meta http-equiv="X-Content-Type-Options" content="nosniff" />`.

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self';" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
```

---

### 🟡 [TASK-03] Restrição de Hosts no Vite Dev Server
- [ ] **Categoria:** A05: Security Misconfiguration
- [ ] **Severidade:** Baixa / Média (Ambiente de desenvolvimento)
- [ ] **Arquivo afetado:** [`vite.config.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/vite.config.ts)
- [ ] **Descrição do Risco:** A propriedade `allowedHosts: true` desabilita completamente a proteção nativa do Vite contra ataques de *DNS Rebinding*, permitindo que qualquer site na rede local force requisições ao servidor de desenvolvimento.
- [ ] **Ação Requerida:** Substituir `allowedHosts: true` por uma lista explícita de domínios/IPs permitidos ou restringir a `localhost` quando não estiver em teste remoto.

```ts
// vite.config.ts
server: {
  host: true,
  // Limitar aos hosts confiáveis em vez de true irrestrito:
  // allowedHosts: ['localhost', '127.0.0.1']
}
```

---

### 🟢 [TASK-04] Validação Estrita, Limite de Caracteres e Sanitização em Formulários (Implementado)
- [x] **Categoria:** A04: Insecure Design & Input Validation
- [x] **Severidade:** Média
- [x] **Arquivo afetado:** [`src/components/NewDemandModal.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/NewDemandModal.tsx) e [`src/utils/security.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/utils/security.ts)
- [x] **Descrição do Risco:** Os campos de entrada (`folderNumber`, `document`, `clientName`, `farmName`, `notes`, `amounts`) não possuíam limites de tamanho (`maxLength`), máscaras estritas nem validação de integridade.
- [x] **Ação Requerida:**
  1. Adicionar `maxLength` em todos os inputs (ex: `folderNumber` max 10 dígitos, `clientName` max 120, `notes` max 1000 com contador visual, `farmName` max 120, `document` max 18).
  2. Forçar sanitização numérica em `amountEntrada`, `amountProtocolo`, `amountDevolucao` (impedir valores negativos ou `NaN`).
  3. Sanitizar `folderNumber` para aceitar apenas caracteres alfanuméricos (`/^[a-zA-Z0-9_-]+$/`), prevenindo manipulações de caminho no Google Drive.

---

### 🟢 [TASK-05] Proteção de Dados Pessoais (LGPD) e Anonimização de CPF/CNPJ (Implementado)
- [x] **Categoria:** A02: Cryptographic Failures & Sensitive Data Exposure
- [x] **Severidade:** Baixa / Média (Regulatório - LGPD)
- [x] **Arquivos afetados:**
  - [`src/components/DetailDrawer.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/DetailDrawer.tsx)
  - [`src/components/RadarPrazosView.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/RadarPrazosView.tsx)
  - [`src/utils/security.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/utils/security.ts)
- [x] **Descrição do Risco:** Documentos fiscais e pessoais (CPF de produtores rurais) eram exibidos integralmente em texto plano na interface sem opção de máscara ou controle de visibilidade.
- [x] **Ação Requerida:**
  1. Implementar função de máscara para CPF (ex: `***.456.789-**`) e CNPJ (ex: `12.***.*** / ****-**`).
  2. Disponibilizar botão "revelar documento" (com toggle de visualização/ícone de olho) apenas quando o operador solicitar ativamente.
  3. Apresentar dados anonimizados por padrão no Radar de Prazos.

```tsx
export function maskDocument(doc?: string | null): string {
  if (!doc || typeof doc !== 'string') return '';
  const clean = doc.replace(/\D/g, '');
  if (clean.length === 11) {
    return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
  }
  if (clean.length === 14) {
    return `${clean.substring(0, 2)}.***.***/${clean.substring(8, 12).replace(/./g, '*')}-${clean.substring(12)}`;
  }
  return doc.length > 5 ? `${doc.slice(0, 2)}***${doc.slice(-2)}` : '***';
}
```

---

### 🟢 [TASK-06] Integridade e Auditoria com Timestamps Dinâmicos (Implementado)
- [x] **Categoria:** A09: Security Logging & Monitoring Failures
- [x] **Severidade:** Baixa
- [x] **Arquivos afetados:**
  - [`src/App.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/App.tsx)
  - [`src/components/NewDemandModal.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/NewDemandModal.tsx)
  - [`src/components/DetailDrawer.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/DetailDrawer.tsx)
  - [`src/utils/security.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/utils/security.ts)
  - [`src/types/index.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/types/index.ts)
- [x] **Descrição do Risco:** Registros de auditoria (`auditLogs`) utilizavam strings estáticas pré-fixadas (ex: `'04/09 às 11:52'` e autor fixo `'Lucas Cenovicz'`) em vez de capturar o usuário autenticado atual e um timestamp ISO padrão internacional com formatação localizada.
- [x] **Ação Requerida:**
  1. Usar `currentUser.name` como autor de qualquer nova ação ou O.S.
  2. Gerar timestamps reais via `new Date().toISOString()` com apresentação formatada (`Intl.DateTimeFormat`).
  3. Prevenir injeção de texto nos logs de auditoria (`sanitizeAuditText`).

---

### 🟢 [TASK-07] Controle de Acesso Baseado em Perfis (RBAC) (Implementado)
- [x] **Categoria:** A01: Broken Access Control
- [x] **Severidade:** Média (Arquitetura)
- [x] **Arquivos afetados:**
  - [`src/components/Header.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/Header.tsx)
  - [`src/components/DetailDrawer.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/DetailDrawer.tsx)
  - [`src/App.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/App.tsx)
  - [`src/utils/security.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/utils/security.ts)
  - [`src/types/index.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/types/index.ts)
  - [`src/data/mockData.ts`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/data/mockData.ts)
- [x] **Descrição do Risco:** Ação de alternar status de pagamento financeiro (`handleToggleFinancialStatus`) estava acessível a qualquer perfil. Se um usuário com perfil puramente técnico acessasse a tela, ele não deve poder dar baixa em faturamento sem credencial de Diretoria/Financeiro.
- [x] **Ação Requerida:**
  1. Validar `canManageFinancials(user.role)` (`Diretoria` ou `Financeiro`) antes de liberar o toggle interativo de faturamento tanto na camada lógica (`App.tsx`) quanto defensiva de UI (`DetailDrawer.tsx`).
  2. Exibir estado somente leitura bloqueado para usuários técnicos (`Tecnico`).
  3. Prover seletor interativo de perfis no cabeçalho (`Header.tsx`) para testes rápidos e simulação de RBAC em tempo de execução.

---

### 🟢 [TASK-08] Monitoramento Contínuo de Dependências (Implementado)
- [x] **Categoria:** A06: Vulnerable and Outdated Components
- [x] **Severidade:** Informativo / Preventivo
- [x] **Status Atual:** ✅ **0 vulnerabilidades encontradas no `npm audit`**.
- [x] **Arquivos configurados:**
  - [`package.json`](file:///C:/Users/Acer/Dev/Kruger-florestal/package.json)
  - [`package-lock.json`](file:///C:/Users/Acer/Dev/Kruger-florestal/package-lock.json)
  - [`.github/workflows/security.yml`](file:///C:/Users/Acer/Dev/Kruger-florestal/.github/workflows/security.yml)
- [x] **Ação Requerida:**
  1. Manter rotina periódica de `npm audit` em CI/CD ou antes de cada release em produção (adicionados scripts `npm run audit`, `npm run audit:ci` e `npm run security:check`).
  2. Implementar pipeline de CI/CD automatizado via GitHub Actions ([`.github/workflows/security.yml`](file:///C:/Users/Acer/Dev/Kruger-florestal/.github/workflows/security.yml)) com disparo semanal (cron) e em pull requests/pushes.
  3. Manter `package-lock.json` versionado e revisado contra pacotes órfãos ou não auditados (instalação estrita com `npm ci`).

---

## 💡 Como Executar as Correções
Quando você quiser iniciar a correção, podemos executar as tasks em lote ou individualmente:
- **Lote 1 (Imediato / Crítico):** TASK-01 (Sanitização XSS de URLs) + TASK-02 (CSP e Headers).
- **Lote 2 (Qualidade & Robustez):** TASK-03 (Vite hosts) + TASK-04 (Validação de Formulário) + TASK-06 (Auditoria Real).
- **Lote 3 (Privacidade & Acesso):** TASK-05 (LGPD/Máscara) + TASK-07 (RBAC no Financeiro).
