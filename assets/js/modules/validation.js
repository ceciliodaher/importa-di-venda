/*
VALIDATION.JS - Sistema de Validação Comparativa
Compara valores calculados vs declarados na DI
Expertzy Inteligência Tributária
*/

(function(ExpertzyDI) {
    'use strict';
    
    // Módulo de Validação
    ExpertzyDI.modules.validation = {
        
        // Executar validação completa
        executeValidation: function() {
            if (!ExpertzyDI.data.currentDI) {
                ExpertzyDI.showError('Nenhuma DI carregada para validação');
                return;
            }
            
            if (!ExpertzyDI.data.calculations || Object.keys(ExpertzyDI.data.calculations).length === 0) {
                ExpertzyDI.showError('Cálculos não executados. Execute primeiro o processamento de custos.');
                return;
            }
            
            ExpertzyDI.log('VALIDATION', 'Iniciando validação comparativa');
            
            const validationResults = this.performComparison();
            ExpertzyDI.data.validationResults = validationResults;
            
            this.displayValidationResults(validationResults);
            this.generateValidationSummary(validationResults);
            this.populateResultsTable(); // Popular tabela detalhada
            
            ExpertzyDI.log('VALIDATION', 'Validação concluída', validationResults.summary);
        },
        
        // Realizar comparação tributo por tributo
        performComparison: function() {
            const diData = ExpertzyDI.data.currentDI;
            const calculations = ExpertzyDI.data.calculations;
            
            const results = {
                timestamp: new Date().toISOString(),
                comparisons: [],
                summary: {
                    total: 0,
                    ok: 0,
                    warning: 0,
                    error: 0,
                    skipped: 0
                }
            };
            
            // Calcular totais dos tributos da DI (somados de todas as adições)
            const totalsDI = this.calcularTotaisDI(diData);
            
            // Tributos a serem comparados (sempre presentes)
            const tributosObrigatorios = [
                {
                    key: 'II',
                    name: 'Imposto de Importação',
                    calculated: calculations.totais?.impostos?.II || 0,
                    declared: totalsDI.II,
                    icon: '🏛️',
                    required: true
                },
                {
                    key: 'IPI',
                    name: 'IPI',
                    calculated: calculations.totais?.impostos?.IPI || 0,
                    declared: totalsDI.IPI,
                    icon: '🏭',
                    required: true
                },
                {
                    key: 'PIS',
                    name: 'PIS',
                    calculated: calculations.totais?.impostos?.PIS || 0,
                    declared: totalsDI.PIS,
                    icon: '📊',
                    required: true
                },
                {
                    key: 'COFINS',
                    name: 'COFINS',
                    calculated: calculations.totais?.impostos?.COFINS || 0,
                    declared: totalsDI.COFINS,
                    icon: '📈',
                    required: true
                }
            ];
            
            // ICMS - validação condicional
            const icmsDeclarado = totalsDI.ICMS || 0;
            const icmsCalculado = calculations.totais?.impostos?.ICMS || 0;
            
            const tributosCondicionais = [];
            
            // Só validar ICMS se estiver declarado na DI OU se foi calculado
            if (icmsDeclarado > 0 || icmsCalculado > 0) {
                tributosCondicionais.push({
                    key: 'ICMS',
                    name: 'ICMS',
                    calculated: icmsCalculado,
                    declared: icmsDeclarado,
                    icon: '🏢',
                    required: false,
                    note: icmsDeclarado === 0 ? 'ICMS não declarado na DI' : null
                });
            }
            
            // Comparar tributos obrigatórios
            tributosObrigatorios.forEach(tributo => {
                const comparison = this.compareTributo(tributo);
                results.comparisons.push(comparison);
                
                // Atualizar sumário
                results.summary.total++;
                results.summary[comparison.status]++;
            });
            
            // Comparar tributos condicionais
            tributosCondicionais.forEach(tributo => {
                const comparison = this.compareTributo(tributo);
                results.comparisons.push(comparison);
                
                // Atualizar sumário
                results.summary.total++;
                results.summary[comparison.status]++;
            });
            
            // Se ICMS não foi incluído, logar o motivo
            if (tributosCondicionais.length === 0) {
                ExpertzyDI.log('VALIDATION', 'ICMS não validado - não declarado na DI e não calculado');
                results.summary.skipped = 1;
            }
            
            // Comparação do valor total (sempre incluir)
            const valorTotalCalculado = calculations.custoTotal || calculations.totais?.valorTotal || 0;
            const valorTotalDeclarado = this.calculateTotalDeclared(diData);
            
            const totalComparison = this.compareTributo({
                key: 'TOTAL',
                name: 'Valor Total',
                calculated: valorTotalCalculado,
                declared: valorTotalDeclarado,
                icon: '💰',
                required: true
            });
            
            results.comparisons.push(totalComparison);
            results.summary.total++;
            results.summary[totalComparison.status]++;
            
            return results;
        },
        
        // Comparar um tributo específico
        compareTributo: function(tributo) {
            const calculated = tributo.calculated || 0;
            const declared = tributo.declared || 0;
            
            // Se ambos são zero, considerar OK
            if (calculated === 0 && declared === 0) {
                return {
                    key: tributo.key,
                    name: tributo.name,
                    icon: tributo.icon,
                    calculated: calculated,
                    declared: declared,
                    difference: 0,
                    percentageDiff: 0,
                    status: 'ok',
                    message: 'Valores conferem (ambos zero)',
                    suggestions: [],
                    note: tributo.note
                };
            }
            
            // Calcular diferença percentual
            let percentageDiff = 0;
            if (declared !== 0) {
                percentageDiff = Math.abs((calculated - declared) / declared);
            } else if (calculated !== 0) {
                // Se declarado é 0 mas calculado não é
                percentageDiff = 1; // 100% de diferença
            }
            
            // Determinar status baseado na tolerância
            let status = 'ok';
            let message = 'Valores conferem';
            
            if (percentageDiff > ExpertzyDI.constants.VALIDATION_TOLERANCE.YELLOW) {
                status = 'error';
                message = `Divergência significativa (${(percentageDiff * 100).toFixed(2)}%)`;
            } else if (percentageDiff > ExpertzyDI.constants.VALIDATION_TOLERANCE.GREEN) {
                status = 'warning';
                message = `Pequena divergência (${(percentageDiff * 100).toFixed(2)}%)`;
            }
            
            // Caso especial: ICMS não declarado mas calculado
            if (tributo.key === 'ICMS' && declared === 0 && calculated > 0) {
                status = 'warning';
                message = 'ICMS calculado mas não declarado na DI';
            }
            
            const comparison = {
                key: tributo.key,
                name: tributo.name,
                icon: tributo.icon,
                calculated: calculated,
                declared: declared,
                difference: calculated - declared,
                percentageDiff: percentageDiff,
                status: status,
                message: message,
                suggestions: this.getSuggestions(tributo.key, status, percentageDiff, declared === 0),
                note: tributo.note
            };
            
            // Log da comparação
            ExpertzyDI.log('VALIDATION', `${tributo.name}: ${status.toUpperCase()}`, {
                calculated: calculated,
                declared: declared,
                difference: comparison.difference,
                percentage: (percentageDiff * 100).toFixed(4) + '%',
                note: tributo.note
            });
            
            return comparison;
        },
        
        // Calcular totais da DI somando todas as adições
        calcularTotaisDI: function(diData) {
            if (!diData.adicoes || diData.adicoes.length === 0) {
                return { II: 0, IPI: 0, PIS: 0, COFINS: 0, ICMS: 0 };
            }
            
            const totals = {
                II: 0,
                IPI: 0,
                PIS: 0,
                COFINS: 0,
                ICMS: 0
            };
            
            diData.adicoes.forEach(adicao => {
                if (adicao.impostos) {
                    totals.II += adicao.impostos.II?.valor || 0;
                    totals.IPI += adicao.impostos.IPI?.valor || 0;
                    totals.PIS += adicao.impostos.PIS?.valor || 0;
                    totals.COFINS += adicao.impostos.COFINS?.valor || 0;
                    totals.ICMS += adicao.impostos.ICMS?.valor || 0;
                }
            });
            
            return totals;
        },
        
        // Calcular total declarado na DI
        calculateTotalDeclared: function(diData) {
            const totals = this.calcularTotaisDI(diData);
            return diData.valores.fobBRL +
                   (diData.valores.freteBRL || 0) +
                   (diData.valores.seguroBRL || 0) +
                   totals.II + totals.IPI + totals.PIS + totals.COFINS + totals.ICMS;
        },
        
        // Obter sugestões baseadas no status
        getSuggestions: function(tributoKey, status, percentageDiff, isNotDeclared = false) {
            const suggestions = [];
            
            if (status === 'warning' || status === 'error') {
                switch (tributoKey) {
                    case 'II':
                        suggestions.push('Verificar alíquotas de II por NCM');
                        suggestions.push('Conferir base de cálculo (valor aduaneiro)');
                        break;
                    case 'IPI':
                        suggestions.push('Verificar alíquotas de IPI por NCM');
                        suggestions.push('Conferir enquadramento tributário');
                        break;
                    case 'PIS':
                    case 'COFINS':
                        suggestions.push('Verificar regime tributário (real vs presumido)');
                        suggestions.push('Conferir alíquotas aplicadas');
                        break;
                    case 'ICMS':
                        if (isNotDeclared) {
                            suggestions.push('ICMS pode ser recolhido no destino');
                            suggestions.push('Verificar se há diferimento ou não incidência');
                            suggestions.push('Conferir regime de importação aplicável');
                        } else {
                            suggestions.push('Verificar aplicação de incentivos fiscais');
                            suggestions.push('Conferir alíquota interestadual/interna');
                            suggestions.push('Verificar base de cálculo do ICMS');
                        }
                        break;
                    case 'TOTAL':
                        suggestions.push('Revisar configurações gerais');
                        suggestions.push('Verificar despesas complementares (AFRMM, SISCOMEX)');
                        break;
                }
                
                if (percentageDiff > 0.1) { // > 10%
                    suggestions.push('Divergência muito alta - revisar dados fundamentais');
                }
            }
            
            return suggestions;
        },
        
        // Exibir resultados da validação
        displayValidationResults: function(validationResults) {
            const validationGrid = document.getElementById('validation-grid');
            if (!validationGrid) return;
            
            validationGrid.innerHTML = '';
            
            validationResults.comparisons.forEach(comparison => {
                const card = this.createValidationCard(comparison);
                validationGrid.appendChild(card);
            });
            
            // Adicionar nota sobre ICMS se foi pulado
            if (validationResults.summary.skipped > 0) {
                const infoCard = document.createElement('div');
                infoCard.className = 'alert alert-info';
                infoCard.innerHTML = `
                    <strong>ℹ️ Informação:</strong> ICMS não foi validado pois não está declarado na DI. 
                    Isso é normal para importações onde o ICMS é recolhido no destino ou há diferimento.
                `;
                validationGrid.appendChild(infoCard);
            }
        },
        
        // Criar card de validação
        createValidationCard: function(comparison) {
            const card = document.createElement('div');
            card.className = `validation-card status-${comparison.status}`;
            
            const statusIcons = {
                ok: '✓',
                warning: '⚠',
                error: '✗'
            };
            
            card.innerHTML = `
                <div class="validation-header">
                    <div class="validation-icon ${comparison.status}">
                        ${statusIcons[comparison.status]}
                    </div>
                    <div class="validation-title">
                        <h4>${comparison.icon} ${comparison.name}</h4>
                        <div class="validation-status">${comparison.message}</div>
                        ${comparison.note ? `<small class="text-muted">${comparison.note}</small>` : ''}
                    </div>
                </div>
                
                <div class="validation-values">
                    <div class="validation-item">
                        <label>Calculado</label>
                        <div class="value">${ExpertzyDI.formatCurrency(comparison.calculated)}</div>
                    </div>
                    <div class="validation-item">
                        <label>DI</label>
                        <div class="value">${ExpertzyDI.formatCurrency(comparison.declared)}</div>
                    </div>
                </div>
                
                <div class="validation-difference">
                    Diferença: ${ExpertzyDI.formatCurrency(comparison.difference)} 
                    (${ExpertzyDI.formatPercentage(comparison.percentageDiff)})
                </div>
                
                ${comparison.suggestions.length > 0 ? `
                    <div class="validation-suggestions">
                        <strong>Sugestões:</strong>
                        <ul>
                            ${comparison.suggestions.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="validation-actions">
                    <button class="btn-sm btn-secondary" onclick="ExpertzyDI.modules.validation.showDetails('${comparison.key}')">
                        Ver Detalhes
                    </button>
                    ${comparison.status !== 'ok' ? `
                        <button class="btn-sm btn-primary" onclick="ExpertzyDI.modules.validation.adjustParameters('${comparison.key}')">
                            Ajustar
                        </button>
                    ` : ''}
                </div>
            `;
            
            return card;
        },
        
        // Gerar resumo da validação
        generateValidationSummary: function(validationResults) {
            const summary = validationResults.summary;
            
            // Atualizar status global baseado no resumo
            let globalStatus = 'success';
            let globalMessage = `Validação: ${summary.ok}/${summary.total} OK`;
            
            if (summary.skipped > 0) {
                globalMessage += ` (${summary.skipped} não aplicável)`;
            }
            
            if (summary.error > 0) {
                globalStatus = 'error';
                globalMessage = `Validação: ${summary.error} erro(s), ${summary.warning} aviso(s)`;
            } else if (summary.warning > 0) {
                globalStatus = 'warning';
                globalMessage = `Validação: ${summary.warning} aviso(s)`;
            }
            
            ExpertzyDI.updateStatus(globalStatus, globalMessage);
            
            // Atualizar indicadores de status
            this.updateStatusIndicators(summary);
        },
        
        // Atualizar indicadores de status
        updateStatusIndicators: function(summary) {
            let statusGrid = document.querySelector('.status-indicator-grid');
            if (!statusGrid) {
                statusGrid = document.createElement('div');
                statusGrid.className = 'status-indicator-grid';
                
                const validationModule = document.getElementById('validation-module');
                if (validationModule) {
                    const moduleHeader = validationModule.querySelector('.module-header');
                    if (moduleHeader) {
                        moduleHeader.insertAdjacentElement('afterend', statusGrid);
                    }
                }
            }
            
            statusGrid.innerHTML = `
                <div class="status-indicator-item success">
                    <div class="status-icon">✓</div>
                    <span class="status-count">${summary.ok}</span>
                    <span class="status-label">OK</span>
                </div>
                <div class="status-indicator-item warning">
                    <div class="status-icon">⚠</div>
                    <span class="status-count">${summary.warning}</span>
                    <span class="status-label">Avisos</span>
                </div>
                <div class="status-indicator-item error">
                    <div class="status-icon">✗</div>
                    <span class="status-count">${summary.error}</span>
                    <span class="status-label">Erros</span>
                </div>
                ${summary.skipped > 0 ? `
                    <div class="status-indicator-item">
                        <div class="status-icon">ℹ️</div>
                        <span class="status-count">${summary.skipped}</span>
                        <span class="status-label">N/A</span>
                    </div>
                ` : ''}
            `;
        },
        
        // Mostrar detalhes de um tributo
        showDetails: function(tributoKey) {
            const comparison = ExpertzyDI.data.validationResults.comparisons.find(c => c.key === tributoKey);
            if (!comparison) return;
            
            // Buscar dados de auditoria para este tributo
            const auditData = this.getAuditDataForTributo(tributoKey);
            
            const detailsHTML = `
                <div class="audit-container">
                    <div class="audit-header">
                        <h3>${comparison.icon} ${comparison.name} - Detalhes</h3>
                        <div class="audit-timestamp">${new Date().toLocaleString('pt-BR')}</div>
                    </div>
                    <div class="audit-body">
                        <div class="validation-summary-detail">
                            <h4>Comparação</h4>
                            <table class="data-table">
                                <tr>
                                    <td><strong>Valor Calculado:</strong></td>
                                    <td class="numeric">${ExpertzyDI.formatCurrency(comparison.calculated)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Valor Declarado (DI):</strong></td>
                                    <td class="numeric">${ExpertzyDI.formatCurrency(comparison.declared)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Diferença:</strong></td>
                                    <td class="numeric ${comparison.difference >= 0 ? 'text-danger' : 'text-success'}">
                                        ${ExpertzyDI.formatCurrency(comparison.difference)}
                                    </td>
                                </tr>
                                <tr>
                                    <td><strong>Diferença %:</strong></td>
                                    <td class="numeric">${ExpertzyDI.formatPercentage(comparison.percentageDiff)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Status:</strong></td>
                                    <td class="status-${comparison.status}">${comparison.message}</td>
                                </tr>
                                ${comparison.note ? `
                                    <tr>
                                        <td><strong>Observação:</strong></td>
                                        <td>${comparison.note}</td>
                                    </tr>
                                ` : ''}
                            </table>
                        </div>
                        
                        ${auditData ? `
                            <div class="calculation-details">
                                <h4>Memória de Cálculo</h4>
                                ${auditData}
                            </div>
                        ` : ''}
                        
                        ${comparison.suggestions.length > 0 ? `
                            <div class="suggestions-detail">
                                <h4>Ações Recomendadas</h4>
                                <ul>
                                    ${comparison.suggestions.map(s => `<li>${s}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            this.showModal('Detalhes da Validação', detailsHTML);
        },
        
        // Obter dados de auditoria para um tributo
        getAuditDataForTributo: function(tributoKey) {
            if (!ExpertzyDI.data.auditLog) return null;
            
            const relatedLogs = ExpertzyDI.data.auditLog.filter(log => 
                log.category === 'CALCULATION' && 
                log.message.toLowerCase().includes(tributoKey.toLowerCase())
            );
            
            if (relatedLogs.length === 0) return null;
            
            let auditHTML = '<div class="audit-steps">';
            relatedLogs.forEach((log, index) => {
                auditHTML += `
                    <div class="audit-step" data-step="${index + 1}">
                        <div class="audit-step-title">${log.message}</div>
                        <div class="audit-step-formula">${log.data?.formula || 'N/A'}</div>
                        <div class="audit-step-result">
                            <span>Resultado:</span>
                            <span class="audit-result-value">
                                ${log.data?.result ? ExpertzyDI.formatCurrency(log.data.result) : 'N/A'}
                            </span>
                        </div>
                    </div>
                `;
            });
            auditHTML += '</div>';
            
            return auditHTML;
        },
        
        // Ajustar parâmetros de um tributo
        adjustParameters: function(tributoKey) {
            ExpertzyDI.log('VALIDATION', `Solicitado ajuste para: ${tributoKey}`);
            
            switch (tributoKey) {
                case 'ICMS':
                    this.switchToModule('incentivos');
                    break;
                case 'PIS':
                case 'COFINS':
                    this.switchToModule('precificacao');
                    break;
                default:
                    this.switchToModule('config');
            }
        },
        
        // Trocar para um módulo específico
        switchToModule: function(moduleId) {
            const tab = document.querySelector(`[data-module="${moduleId}"]`);
            if (tab) {
                tab.click();
            }
        },
        
        // Alias para compatibilidade com app.js
        exibirResultados: function(validationResults) {
            return this.displayValidationResults(validationResults);
        },
        
        // Mostrar modal
        showModal: function(title, content) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(9, 26, 48, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                border-radius: 8px;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            `;
            
            modalContent.innerHTML = `
                <div style="padding: 20px; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: var(--expertzy-blue);">${title}</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--expertzy-gray-medium);">×</button>
                </div>
                <div style="padding: 20px;">
                    ${content}
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                }
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        },
        
        // Popular tabela de resultados detalhados
        populateResultsTable: function() {
            const diData = ExpertzyDI.data.currentDI;
            const calculations = ExpertzyDI.data.calculations;
            
            if (!diData || !diData.adicoes || !calculations) return;
            
            const tableBody = document.getElementById('resultsTableBody');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            diData.adicoes.forEach((adicao, index) => {
                const row = this.createTableRow(adicao, calculations.adicoes[index], index);
                tableBody.appendChild(row);
            });
        },
        
        // Criar linha da tabela para uma adição
        createTableRow: function(adicao, calculoAdicao, index) {
            const row = document.createElement('tr');
            row.className = 'table-row-expandable';
            row.dataset.index = index;
            
            const custoTotal = calculoAdicao?.custoTotal || 0;
            const participacao = calculoAdicao?.participacao || 0;
            const iiValor = calculoAdicao?.impostos?.II?.valor || 0;
            
            // Valores para CFOP e ICMS (usar configuração padrão)
            const cfopPadrao = '3102'; // Comercialização
            const aliquotaICMSPadrao = 19; // Goiás padrão
            
            row.innerHTML = `
                <td>
                    <span class="table-expand-icon">▶</span>
                </td>
                <td>${adicao.numeroAdicao || index + 1}</td>
                <td>${adicao.codigoNCM}</td>
                <td title="${adicao.descricaoMercadoria}">
                    ${this.truncateText(adicao.descricaoMercadoria, 40)}
                </td>
                <td>${adicao.incoterm}</td>
                <td>
                    <select class="cfop-select" data-adicao="${index}" style="width:100px;font-size:0.8rem;">
                        ${this.generateCFOPOptions(cfopPadrao)}
                    </select>
                </td>
                <td>
                    <input type="number" class="icms-input" data-adicao="${index}" 
                           value="${aliquotaICMSPadrao}" min="0" max="100" step="0.01"
                           style="width:60px;font-size:0.8rem;">
                </td>
                <td>${ExpertzyDI.formatCurrency(adicao.vcmvBRL)}</td>
                <td>${ExpertzyDI.formatCurrency(custoTotal)}</td>
                <td>${ExpertzyDI.formatCurrency(iiValor)}</td>
                <td>${this.formatNumber(participacao, 2)}%</td>
            `;
            
            return row;
        },
        
        // Truncar texto
        truncateText: function(text, maxLength) {
            if (!text) return 'N/A';
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        },
        
        // Gerar opções de CFOP
        generateCFOPOptions: function(selectedCFOP) {
            const cfopOptions = {
                '3101': 'Compra para industrialização',
                '3102': 'Compra para comercialização',
                '3126': 'Compra para utilização na prestação de serviço',
                '3127': 'Compra para ativo imobilizado',
                '3128': 'Compra para consumo'
            };
            
            let options = '';
            Object.keys(cfopOptions).forEach(cfop => {
                const selected = cfop === selectedCFOP ? 'selected' : '';
                options += `<option value="${cfop}" ${selected}>${cfop}</option>`;
            });
            
            return options;
        },
        
        // Formatar número
        formatNumber: function(value, decimals = 2) {
            if (typeof value !== 'number') return '0,00';
            return value.toFixed(decimals).replace('.', ',');
        }
        
    };
    
})(window.ExpertzyDI);