# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema web modular para análise de Declarações de Importação (DI) baseado no código Python existente. O sistema funciona com protocolo file:// e integra arquitetura legada com componentes modulares modernos, mantendo total compatibilidade e branding profissional Expertzy.

## Development Commands

### Sistema Principal
```bash
# Landing Page Institucional
open index.html

# Sistema de Análise DI (PRINCIPAL)
open analise-di.html

# Sistema Legado (histórico)
open legacy/sistema-di-legado.html

# Para desenvolvimento com live server (opcional)
python -m http.server 8080
```

### Testes Automatizados
```bash
# Executar todos os testes E2E
npx playwright test

# Testes com interface visual
npx playwright test --headed

# Testar apenas Chrome
npx playwright test --project=chromium

# Relatório dos testes
npx playwright show-report
```

## Technical Constraints

### File Protocol Compatibility
- **EVITAR ES6+ modules** - usar scripts convencionais por compatibilidade file://
- Todos os scripts devem ser carregados via tags `<script src="">`
- Usar padrão IIFE (Immediately Invoked Function Expression) para modularização
- Namespace global para evitar conflitos: `window.ExpertzyDI`

### File Handling
- **Drag & Drop obrigatório** para upload de XML
- FileReader API para leitura local de arquivos
- Validação de tipo MIME e extensão
- Preview do conteúdo antes do processamento

## Brand Standards (Expertzy)

### Cores Corporativas
- **Vermelho Expertzy**: #FF002D (elementos principais, botões, destaques)
- **Azul Naval**: #091A30 (textos, navegação, backgrounds secundários)  
- **Branco**: #FFFFFF (backgrounds principais, contraste)

### Tipografia
- **Principal**: gadeg thin (títulos, elementos de destaque)
- **Secundária**: BRFirma Medium (textos corridos, elementos informativos)

### CSS Variables (obrigatório)
```css
:root {
    --expertzy-red: #FF002D;
    --expertzy-blue: #091A30;
    --expertzy-light: #FFFFFF;
    --font-primary: 'gadeg thin', sans-serif;
    --font-secondary: 'BRFirma Medium', sans-serif;
}
```

## Arquitetura CSS (CRÍTICO)

### ⚠️ Ordem de Carregamento CSS no analise-di.html
**OBRIGATÓRIA - NÃO ALTERAR sem testes extensivos:**

```html
<!-- CSS - Sistema Expertzy DI (Legado + Modular) -->
<!-- Base: Marca e variáveis CSS -->
<link rel="stylesheet" href="css/expertzy-brand.css">
<!-- Layout principal (classes app-*) -->
<link rel="stylesheet" href="css/main.css">
<!-- Componentes (drag-drop, cards) -->
<link rel="stylesheet" href="css/components.css">
<!-- Módulos específicos -->
<link rel="stylesheet" href="assets/css/pricing.css">
```

### 🎯 Compatibilidade de Classes CSS
- **HTML usa:** `.app-container`, `.app-header`, `.app-main`, `.expertzy-card`, `.drag-drop-zone`
- **Definidas em:** `/css/main.css`, `/css/components.css`, `/css/expertzy-brand.css`
- **❌ NÃO usar:** `/assets/css/layout.css` (classes diferentes: `.expertzy-header`, `.main-content`)
- **✅ CSS modular compatível:** Apenas `/assets/css/pricing.css` (módulo adicional)

### 🚨 Problemas Conhecidos
- **Carregar apenas `/assets/css/`** → Background vermelho total, layout quebrado
- **Misturar classes incompatíveis** → Conflitos visuais e funcionalidade perdida
- **Variáveis CSS diferentes** → `--expertzy-white` vs `--expertzy-light`

## Architecture Overview

Sistema modular com namespace global para compatibilidade file://

### Estrutura de Arquivos Atualizada
```
/importa-di-venda
├── index.html                      # 🏠 Landing Page Institucional Expertzy
├── analise-di.html                 # 🎯 Sistema Principal de Análise DI
├── /css                            # 🎨 CSS Sistema Principal (LEGADO FUNCIONAL)
│   ├── expertzy-brand.css          # ✅ Variáveis CSS e marca Expertzy
│   ├── main.css                    # ✅ Layout principal (classes app-*)
│   ├── components.css              # ✅ Componentes (drag-drop, cards)
│   ├── reset.css                   # Reset CSS básico
│   └── invoice-sketch.css          # Estilos para croqui NF
├── /assets                         # Sistema Modular Adicional
│   ├── css/
│   │   ├── expertzy-brand.css      # Variáveis modernas (não usado no principal)
│   │   ├── layout.css              # Layout modular (não usado no principal)
│   │   ├── components.css          # Componentes modulares (não usado no principal)
│   │   ├── modules.css             # Módulos específicos (não usado no principal)
│   │   └── pricing.css             # ✅ USADO: Estilos do módulo de precificação
│   ├── js/
│   │   ├── app.js                  # Aplicação principal e namespace
│   │   ├── modules/
│   │   │   ├── xml-processor.js    # ✅ Processamento de XML
│   │   │   ├── cost-calculator.js  # ✅ Cálculos de custo
│   │   │   ├── incentives.js       # ✅ Incentivos fiscais
│   │   │   ├── pricing.js          # ✅ Módulo de precificação
│   │   │   ├── pricing-ui.js       # ✅ Interface de precificação
│   │   │   ├── reports.js          # ✅ Geração de relatórios
│   │   │   └── validation.js       # ✅ Sistema de validação
│   │   ├── utils/
│   │   │   ├── dom-utils.js        # ✅ Utilitários DOM
│   │   │   ├── file-utils.js       # ✅ Manipulação de arquivos
│   │   │   ├── data-utils.js       # ✅ Processamento de dados
│   │   │   └── audit-logger.js     # ✅ Sistema de auditoria
│   │   └── libs/                   # Bibliotecas locais
│   │       ├── xlsx.full.min.js    # ✅ Para export Excel
│   │       ├── jspdf.min.js        # ✅ Para export PDF
│   │       └── jspdf-autotable.min.js  # ✅ Tabelas PDF
│   └── fonts/                      # Fontes Expertzy
├── /images                         # 🖼️ Assets Originais
│   └── logo-expertzy.png          # ✅ Logo PNG oficial (USADO)
├── /legacy                         # 📁 Sistema Legado Isolado
│   ├── sistema-di-legado.html      # Sistema anterior completo
│   ├── js/                         # ✅ Scripts legados INTEGRADOS ao sistema principal
│   │   ├── importa-di-complete.js  # ✅ Sistema principal funcional
│   │   ├── pricing-module.js       # ✅ Módulo precificação integrado
│   │   ├── professional-reports.js # ✅ Relatórios profissionais
│   │   └── invoiceSketch.js        # ✅ Croqui NF
│   └── css/                        # CSS legado (backup)
├── /orientacoes                    # Documentação e XMLs de teste
├── /tests                          # Testes automatizados Playwright
├── package.json                    # Configuração NPM
├── playwright.config.js            # Configuração testes E2E
└── CLAUDE.md                       # ✅ Este arquivo
```

### Fluxo de Navegação

#### 🏠 Landing Page (index.html)
- **Propósito**: Página institucional da Expertzy
- **Conteúdo**: Apresentação dos produtos e soluções
- **Navegação**:
  - `🚀 Acessar Sistema` → `analise-di.html`
  - `📁 Versão Anterior` → `legacy/sistema-legado.html`

#### 🎯 Sistema Principal (analise-di.html)
- **Propósito**: Sistema moderno de análise DI
- **Funcionalidades**:
  - Upload e processamento de XML
  - **Módulo de precificação integrado** (aparece automaticamente após processamento)
  - Cálculos avançados com sistema modular
  - Interface profissional com marca Expertzy
- **Integração**: Sistema legado + módulos novos

#### 📁 Sistema Legado (legacy/sistema-legado.html)
- **Propósito**: Versão anterior preservada
- **Uso**: Comparação e backup de funcionalidades
- **Status**: Mantido para referência, sem atualizações

### URLs de Acesso
```
Landing Page:     file:///.../index.html
Sistema DI:       file:///.../analise-di.html
Sistema Legado:   file:///.../legacy/sistema-legado.html
```

### Namespace Structure
```javascript
window.ExpertzyDI = {
    modules: {
        xmlProcessor: {},     // ✅ IMPLEMENTADO E TESTADO
        costCalculator: {},   // ✅ IMPLEMENTADO
        incentives: {},       // ✅ IMPLEMENTADO
        pricing: {},          // ✅ IMPLEMENTADO
        reports: {},          // ✅ IMPLEMENTADO
        validation: {}        // ✅ IMPLEMENTADO
    },
    utils: {
        dom: {},              // ✅ IMPLEMENTADO
        file: {},             // ✅ IMPLEMENTADO
        data: {},             // ✅ IMPLEMENTADO
        audit: {}             // ✅ IMPLEMENTADO
    },
    data: {
        currentFile: null,    // Cache do arquivo carregado
        currentDI: null,      // Dados da DI processada
        calculations: {},     // Resultados de cálculos
        validationResults: {},// Resultados de validação
        auditLog: []          // Log de auditoria
    }
};
```

## Core Modules

### 1. XML Processor (xml-processor.js) - ✅ IMPLEMENTADO E TESTADO
- **Baseado no código funcional** (importa-di-complete.js)
- **Seletores XML corretos** para DI brasileira (`numeroDI`, `localEmbarqueTotalReais`, etc.)
- Extração completa de dados estruturados (DI, adições, impostos)
- Detecção automática de INCOTERM por valores de frete/seguro
- Parsing robusto com tratamento de erros
- **Função principal**: `ExpertzyDI.modules.xmlProcessor.process()`
- **Validação integrada**: Verifica número da DI e adições obrigatórias

### 2. Cost Calculator (cost-calculator.js) - ✅ IMPLEMENTADO
- Cálculo de custos unitários com rateio proporcional
- **Despesas extra-DI** classificadas (base ICMS vs não-base ICMS)
- Aplicação de incentivos fiscais estaduais integrada
- Configurações especiais (redução de base, dólar diferenciado)
- **Memória de cálculo detalhada** para auditoria
- Função principal: `ExpertzyDI.modules.costCalculator.calcularCustosUnitarios(dados, config)`

### 3. Validation System (validation.js) - ✅ IMPLEMENTADO
- **Comparação condicional**: valores calculados vs valores da DI
- **Tratamento especial ICMS**: só valida se declarado na DI
- Tolerância configurável com semáforo visual (Verde/Amarelo/Vermelho)
- Identificação de divergências por tributo com sugestões
- Log detalhado de todas as validações
- Modal de detalhes com memória de cálculo

### 4. Incentives (incentives.js) - ✅ IMPLEMENTADO
Estados suportados com **cálculos transparentes**:
- **Goiás (COMEXPRODUZIR)**: 65% crédito outorgado + contrapartidas
- **Santa Catarina (TTD 409)**: Alíquotas efetivas progressivas
- **Espírito Santo (INVEST-ES)**: Diferimento + redução 75%
- **Minas Gerais (Corredor MG)**: Crédito presumido por similar nacional
- **Alíquotas interestaduais corretas**: 4% geral, 12% lista CAMEX

### 5. Pricing (pricing.js) - ✅ IMPLEMENTADO
- **Detecção automática adicional 1% COFINS** por alíquotas PIS/COFINS
- Cálculo de créditos tributários (Lucro Real, Presumido, Simples 2025)
- Formação de preços com impostos por dentro/fora
- **Simples Nacional 2025**: Todos os 5 anexos com faixas atualizadas
- Análise comparativa de regimes tributários
- Verificação de margem real obtida

### 6. Reports (reports.js) - ✅ IMPLEMENTADO
**Formatos de exportação profissionais:**
- **Excel (.xlsx)**: 12 abas com formatação Expertzy corporativa
- **PDF**: Resumo executivo com gráficos e memória de cálculo
- **CSV**: Para integração com ERPs (SAP, TOTVS, Oracle)
- **JSON**: Para APIs e integrações técnicas
- **Formatação profissional**: Cores corporativas, autofilter, fórmulas

### 7. Utils - ✅ IMPLEMENTADO
- **file-utils.js**: Drag & drop funcional, validação de arquivos
- **audit-logger.js**: Sistema de logging integrado ao namespace
- **dom-utils.js**: Utilitários para manipulação do DOM  
- **data-utils.js**: Processamento e formatação de dados brasileiros

## Data Structures

### Estado Configuration
```javascript
const ALIQ_ICMS_ESTADOS = {
    "GO": { "nome": "Goiás", "aliquota": 0.19, "codigo": "GO" },
    // ... outros estados
};

const INCENTIVOS_FISCAIS = {
    "GO": {
        "nome": "COMEXPRODUZIR",
        "parametros": {
            "aliquota_interestadual": 0.04,
            "credito_outorgado_pct": 0.65,
            // ...
        }
    }
    // ... outros estados
};
```

### Audit Trail Structure
```javascript
const auditRecord = {
    timestamp: Date.now(),
    operation: 'calcular_icms',
    input: { /* dados de entrada */ },
    output: { /* resultado */ },
    formula: 'base * aliquota * reducao',
    intermediateSteps: [
        { step: 1, description: 'Cálculo da base', value: 1000.00 },
        { step: 2, description: 'Aplicação da alíquota', value: 180.00 },
        // ...
    ]
};
```

## UI/UX Guidelines

### Módulos de Interface
1. **Upload DI**: Drag & drop obrigatório para arquivos XML
2. **Configuração**: INCOTERM, estado, despesas adicionais
3. **Incentivos**: Seleção e configuração por estado
4. **Validação**: Comparação valores calculados vs DI
5. **Precificação**: Cálculo de preços de venda
6. **Relatórios**: Geração e export (Excel/PDF/CSV)
7. **Auditoria**: Visualização da memória de cálculo

### Design Principles
- **KEEP IT SIMPLE**: Interface limpa e intuitiva
- **Modular**: Cada funcionalidade em módulo separado
- **Responsivo**: Funciona em desktop e mobile
- **Acessível**: Contraste adequado, navegação por teclado
- **Transparente**: Todos os cálculos visíveis e auditáveis

### Component Standards
- Botões primários: background #FF002D, texto #FFFFFF
- Botões secundários: borda #FF002D, texto #FF002D
- Headers: background #091A30, texto #FFFFFF
- Cards: background #FFFFFF, borda sutil
- Alertas de validação: cores específicas para OK/ERRO/AVISO

## File Processing

### XML Structure Expected
- Declaração de Importação com adições e itens
- Campos numéricos com tratamento de zeros à esquerda
- Extração automática de AFRMM/SISCOMEX
- Detecção automática de INCOTERM

### Drag & Drop Implementation
```javascript
// Área de drop deve aceitar:
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0].type === 'text/xml' || files[0].name.endsWith('.xml')) {
        ExpertzyDI.modules.xmlProcessor.loadFile(files[0]);
    }
});
```

## Validation System

### Comparação por Tributo
- **II (Imposto de Importação)**: calculado vs DI (sempre)
- **IPI**: calculado vs DI (sempre)
- **PIS**: calculado vs DI (sempre)
- **COFINS**: calculado vs DI (sempre)
- **ICMS**: calculado vs DI (SOMENTE se declarado na DI)
- **Valor Total**: soma vs valor da DI (sempre)

### Tratamento Especial do ICMS
- **ICMS não declarado na DI**: Não validado (normal para diferimento/destino)
- **ICMS declarado = 0, calculado > 0**: Warning "ICMS calculado mas não declarado"
- **ICMS declarado > 0**: Validação normal com incentivos aplicados
- **Observação**: Nem toda DI declara ICMS - comum em importações com recolhimento no destino

### Tolerância e Alertas
- Verde: diferença ≤ 0.01%
- Amarelo: diferença ≤ 1.00%
- Vermelho: diferença > 1.00%
- Cinza: Não aplicável (N/A)

## Export Capabilities

### Excel Generation (biblioteca XLSX)
- Múltiplas abas organizadas
- Formatação com cores Expertzy
- Tabelas com autofilter
- Fórmulas para validação
- **Aba específica**: Memória de cálculo completa

### PDF Generation (biblioteca jsPDF)
- Resumo executivo
- Gráficos e tabelas
- Memória de cálculo sumarizada

### **CSV Export para ERPs**
```csv
NCM,Descricao,QtdComercial,ValorUnitario,CustoTotalBRL,II,IPI,PIS,COFINS,ICMS
85011000,Motor elétrico,10,1500.00,15000.00,2250.00,2400.00,245.25,1128.75,2550.00
```

### JSON Export (para integrações)
- Estrutura completa dos dados
- Metadados de processamento
- Auditoria inclusa

## Current Implementation Status

### ✅ SISTEMA COMPLETO E FUNCIONAL - DEZEMBRO 2025
**Core System:**
- **✅ Estrutura HTML**: `analise-di.html` com layout responsivo e branding Expertzy
- **✅ CSS Integrado**: Sistema legado funcional (`/css/`) + módulos adicionais (`/assets/css/pricing.css`)
- **✅ Visual Corrigido**: Background vermelho corrigido, layout profissional funcionando
- **✅ Logo Funcionando**: `images/logo-expertzy.png` carregando corretamente no header
- **✅ Namespace JavaScript**: `window.ExpertzyDI` com estrutura modular completa
- **✅ Integração Total**: Sistema legado + sistema modular funcionando juntos
- **✅ Testes E2E**: Playwright configurado com protocolo `file://`

**Módulos Principais:**
- **XML Processor**: ✅ Baseado no código testado (importa-di-complete.js)
- **Cost Calculator**: ✅ Cálculos de custo com despesas extra-DI
- **Incentives**: ✅ Sistema completo de incentivos fiscais (GO, SC, ES, MG)
- **Pricing**: ✅ Precificação com Simples Nacional 2025
- **Reports**: ✅ Relatórios profissionais (Excel, PDF, CSV, JSON)
- **Validation**: ✅ Sistema de validação com tolerâncias configuráveis

**Módulos Utilitários:**
- **file-utils.js**: ✅ Drag & drop funcional com validação
- **audit-logger.js**: ✅ Sistema de logging e auditoria
- **dom-utils.js**: ✅ Utilitários DOM básicos
- **data-utils.js**: ✅ Processamento de dados brasileiros

### 🎯 CORREÇÕES CRÍTICAS IMPLEMENTADAS - DEZEMBRO 2025
1. **✅ CSS Architecture Fixed**: Integração correta entre sistema legado e modular
2. **✅ Visual Layout Restored**: Background vermelho corrigido, layout profissional
3. **✅ Logo Integration**: `images/logo-expertzy.png` funcionando corretamente
4. **✅ File Protocol Tests**: Playwright configurado para `file://` protocol
5. **✅ Sequential Thinking**: Depuração sistemática implementada
6. **✅ Class Compatibility**: Mapeamento correto entre HTML e CSS
7. **✅ Seletores XML corretos**: Baseados no código funcional testado
8. **✅ Parsing robusto**: Extração de `numeroDI` e todos os campos
9. **✅ Sincronização arquivo**: Drag & drop integrado com processamento
10. **✅ Módulos faltantes**: Todos os utils implementados e funcionais

### 📋 SISTEMA 100% FUNCIONAL
✅ **Todas as funcionalidades principais implementadas e testadas:**
1. ✅ **XML Processing** - Importação e processamento de DI
2. ✅ **Cost Calculator** - Cálculos de custos unitários 
3. ✅ **Fiscal Incentives** - Incentivos fiscais por estado
4. ✅ **Pricing Module** - Precificação com Simples Nacional 2025
5. ✅ **Professional Reports** - Excel, PDF, CSV export
6. ✅ **CSS Architecture** - Layout profissional Expertzy
7. ✅ **E2E Testing** - Playwright com file:// protocol
8. ✅ **Visual Interface** - Sistema completamente funcional

## Development Notes

### ✅ IMPLEMENTADOS
- **IIFE pattern**: Todos os módulos seguem padrão de modularização
- **Error handling robusto**: Try-catch em operações críticas
- **Logs informativos**: Sistema de logging completo com cores
- **ICMS condicional**: Validação só se declarado na DI
- **Auditabilidade**: Memória de cálculo completa em todos os módulos

### 🎯 REGRAS CRÍTICAS
- **NÃO usar ES6+ modules** - compatibilidade file://
- **Seletores XML**: Use sempre os baseados no código funcional
- **COFINS 1% adicional**: Detectar por alíquotas, não por NCM
- **Alíquotas interestaduais**: 4% geral, 12% só lista CAMEX
- **Simples Nacional**: Usar tabelas 2025 atualizadas

## Maintenance Guidelines

- Código documentado em português
- Funções pequenas e específicas
- Separação clara entre lógica e apresentação
- **Testes de validação** para cálculos críticos
- Versionamento de configurações de incentivos
- **Logs extensos** para debugging e auditoria

## Security Considerations

- Processamento local de arquivos (sem upload para servidor)
- Validação de entrada rigorosa
- Sanitização de dados XML
- Não exposição de informações sensíveis
- Auditoria completa para compliance