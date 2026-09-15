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
| **A01: Broken Access Control** | Controle de permissões por perfil (Diretoria vs Técnico) | Médio | 🟡 A Fazer |
| **A02: Cryptographic Failures** | Exposição de dados sensíveis (LGPD: CPF/CNPJ em texto plano) | Baixo / Médio | 🟡 A Fazer |
| **A03: Injection (XSS)** | Sanitização de links externos e protocolos inseguros (`driveUrl`) | **Alto** | 🔴 Prioritário |
| **A04: Insecure Design** | Ausência de limites de tamanho (`maxLength`) e validação de inputs | Médio | 🟡 A Fazer |
| **A05: Security Misconfiguration** | Ausência de Content Security Policy (CSP) e `allowedHosts: true` | Médio | 🟡 A Fazer |
| **A06: Vulnerable Components** | Varredura de dependências de terceiros (`npm audit`) | Informativo | 🟢 Aprovado |
| **A07: Identification Failures** | Gerenciamento de sessão e autenticação de usuário | Médio | 🟡 A Fazer |
| **A08: Software & Data Integrity** | Integridade de pacotes e scripts externos | Baixo | 🟢 Aprovado |
| **A09: Logging & Monitoring** | Registro de logs de auditoria não-manipuláveis e com data real | Baixo | 🟡 A Fazer |
| **A10: SSRF** | Requisições a serviços externos no frontend | Informativo | 🟢 Não aplicável |

---

## 📝 Checklist de Tarefas de Correção (Tasks)

### 🔴 [TASK-01] Sanitização de URLs Externas e Prevenção de XSS
- [ ] **Categoria:** A03: Injection & Cross-Site Scripting (XSS)
- [ ] **Severidade:** **Alta**
- [ ] **Arquivo afetado:** [`src/components/DetailDrawer.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/DetailDrawer.tsx)
- [ ] **Descrição do Risco:** Links externos dinâmicos (`demand.client.driveUrl` na linha 128 e `demand.protocolReceiptUrl` na linha 255) são inseridos diretamente em elementos `<a href={...}>`. Se um registro receber uma URL com esquema `javascript:`, `data:` ou redirecionamento arbitrário, scripts maliciosos podem ser executados no contexto da aplicação ao clicar.
- [ ] **Ação Requerida:**
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

### 🟡 [TASK-02] Adicionar Content Security Policy (CSP) e Headers de Segurança
- [ ] **Categoria:** A05: Security Misconfiguration
- [ ] **Severidade:** Média
- [ ] **Arquivo afetado:** [`index.html`](file:///C:/Users/Acer/Dev/Kruger-florestal/index.html)
- [ ] **Descrição do Risco:** O arquivo HTML base não define nenhuma política de segurança de conteúdo. Em caso de injeção acidental em qualquer biblioteca, scripts remotos não autorizados podem ser carregados sem restrição.
- [ ] **Ação Requerida:**
  1. Adicionar `<meta http-equiv="Content-Security-Policy" content="...">` restringindo fontes de scripts, estilos, conexões e objetos.
  2. Adicionar `<meta name="referrer" content="strict-origin-when-cross-origin" />`.
  3. Adicionar `<meta http-equiv="X-Content-Type-Options" content="nosniff" />`.

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none';" />
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

### 🟡 [TASK-04] Validação Estrita, Limite de Caracteres e Sanitização em Formulários
- [ ] **Categoria:** A04: Insecure Design & Input Validation
- [ ] **Severidade:** Média
- [ ] **Arquivo afetado:** [`src/components/NewDemandModal.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/NewDemandModal.tsx)
- [ ] **Descrição do Risco:** Os campos de entrada (`folderNumber`, `document`, `clientName`, `farmName`, `notes`, `amounts`) não possuem limites de tamanho (`maxLength`), máscaras estritas nem validação de integridade. É possível submeter strings de comprimento infinito (risco de DoS no client ou crash no layout), valores numéricos negativos ou caracteres de controle.
- [ ] **Ação Requerida:**
  1. Adicionar `maxLength` em todos os inputs (ex: `folderNumber` max 10 dígitos, `clientName` max 120, `notes` max 1000).
  2. Forçar sanitização numérica em `amountEntrada`, `amountProtocolo`, `amountDevolucao` (impedir valores negativos ou `NaN`).
  3. Sanitizar `folderNumber` para aceitar apenas caracteres alfanuméricos (`/^[a-zA-Z0-9_-]+$/`), prevenindo manipulações de caminho no Google Drive.

---

### 🟡 [TASK-05] Proteção de Dados Pessoais (LGPD) e Anonimização de CPF/CNPJ
- [ ] **Categoria:** A02: Cryptographic Failures & Sensitive Data Exposure
- [ ] **Severidade:** Baixa / Média (Regulatório - LGPD)
- [ ] **Arquivos afetados:**
  - [`src/components/DetailDrawer.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/DetailDrawer.tsx)
  - [`src/components/RadarPrazosView.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/RadarPrazosView.tsx)
- [ ] **Descrição do Risco:** Documentos fiscais e pessoais (CPF de produtores rurais) são exibidos integralmente em texto plano na interface sem opção de máscara ou controle de visibilidade.
- [ ] **Ação Requerida:**
  1. Implementar função de máscara para CPF (ex: `***.456.789-**`) e CNPJ (ex: `12.***.***/0001-**`).
  2. Disponibilizar botão "revelar documento" apenas quando o operador solicitar ativamente ou conforme permissão de perfil.

```tsx
export function maskDocument(doc: string): string {
  const clean = doc.replace(/\D/g, '');
  if (clean.length === 11) {
    return `***.${clean.substring(3, 6)}.${clean.substring(6, 9)}-**`;
  }
  if (clean.length === 14) {
    return `${clean.substring(0, 2)}.***.***/${clean.substring(8, 12)}-**`;
  }
  return doc;
}
```

---

### 🟡 [TASK-06] Integridade e Auditoria com Timestamps Dinâmicos
- [ ] **Categoria:** A09: Security Logging & Monitoring Failures
- [ ] **Severidade:** Baixa
- [ ] **Arquivos afetados:**
  - [`src/App.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/App.tsx)
  - [`src/components/NewDemandModal.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/NewDemandModal.tsx)
- [ ] **Descrição do Risco:** Registros de auditoria (`auditLogs`) utilizam strings estáticas pré-fixadas (ex: `'04/09 às 11:52'` e autor fixo `'Lucas Cenovicz'`) em vez de capturar o usuário autenticado atual e um timestamp ISO padrão internacional com formatação localizada.
- [ ] **Ação Requerida:**
  1. Usar `currentUser.name` como autor de qualquer nova ação ou O.S.
  2. Gerar timestamps reais via `new Date().toISOString()` com apresentação formatada (`Intl.DateTimeFormat`).
  3. Prevenir injeção de texto nos logs de auditoria.

---

### 🟡 [TASK-07] Controle de Acesso Baseado em Perfis (RBAC)
- [ ] **Categoria:** A01: Broken Access Control
- [ ] **Severidade:** Média (Arquitetura)
- [ ] **Arquivos afetados:**
  - [`src/components/Header.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/Header.tsx)
  - [`src/components/DetailDrawer.tsx`](file:///C:/Users/Acer/Dev/Kruger-florestal/src/components/DetailDrawer.tsx)
- [ ] **Descrição do Risco:** Ação de alternar status de pagamento financeiro (`handleToggleFinancialStatus`) está acessível a qualquer perfil. Se um usuário com perfil puramente técnico acessar a tela, ele não deve poder dar baixa em faturamento sem credencial de Diretoria/Financeiro.
- [ ] **Ação Requerida:**
  1. Validar `user.role === 'Diretoria'` ou `user.role === 'Financeiro'` antes de liberar o toggle interativo de faturamento.
  2. Exibir estado somente leitura para usuários técnicos.

---

### 🟢 [TASK-08] Monitoramento Contínuo de Dependências
- [ ] **Categoria:** A06: Vulnerable and Outdated Components
- [ ] **Severidade:** Informativo / Preventivo
- [ ] **Status Atual:** ✅ **0 vulnerabilidades encontradas no `npm audit`**.
- [ ] **Ação Requerida:**
  1. Manter rotina periódica de `npm audit` em CI/CD ou antes de cada release em produção.
  2. Manter `package-lock.json` versionado e revisado contra pacotes órfãos ou não auditados.

---

## 💡 Como Executar as Correções
Quando você quiser iniciar a correção, podemos executar as tasks em lote ou individualmente:
- **Lote 1 (Imediato / Crítico):** TASK-01 (Sanitização XSS de URLs) + TASK-02 (CSP e Headers).
- **Lote 2 (Qualidade & Robustez):** TASK-03 (Vite hosts) + TASK-04 (Validação de Formulário) + TASK-06 (Auditoria Real).
- **Lote 3 (Privacidade & Acesso):** TASK-05 (LGPD/Máscara) + TASK-07 (RBAC no Financeiro).
