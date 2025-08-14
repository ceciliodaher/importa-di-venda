/*
PRICING-UI.JS - Interface Visual do Módulo de Precificação
Interface profissional para cálculo de preços de venda
Expertzy Inteligência Tributária

Funcionalidades:
- Interface interativa para configuração de regimes tributários
- Comparação visual entre regimes (Real, Presumido, Simples)
- Simulador de cenários com diferentes margens
- Gráficos de análise de margem e markup
- Exportação de análises comparativas
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.pricingUI = {
        
        // Inicializar interface de precificação
        init: function() {
            ExpertzyDI.log('PRICING-UI', 'Inicializando interface de precificação');
            
            // Criar seção de precificação se não existir
            if (!document.getElementById('pricingSection')) {
                this.criarSecaoPrecificacao();
            }
            
            // Configurar event listeners
            this.configurarEventListeners();
        },
        
        // Criar seção HTML de precificação
        criarSecaoPrecificacao: function() {
            const mainElement = document.querySelector('.app-main');
            if (!mainElement) return;
            
            const pricingSection = document.createElement('section');
            pricingSection.id = 'pricingSection';
            pricingSection.className = 'pricing-section expertzy-hidden';
            pricingSection.innerHTML = `
                <div class="expertzy-card">
                    <div class="expertzy-card-header">
                        <h2 class="expertzy-card-title">
                            💰 Módulo de Precificação Avançado
                        </h2>
                        <div class="header-actions">
                            <button class="btn btn-secondary" onclick="ExpertzyDI.modules.pricingUI.toggleConfiguracao()">
                                ⚙️ Configurações
                            </button>
                        </div>
                    </div>
                    
                    <div class="expertzy-card-body">
                        <!-- Configuração de Regime Tributário -->
                        <div class="pricing-config-panel" id="pricingConfigPanel">
                            <h3 class="section-title">Configuração de Regime Tributário</h3>
                            
                            <div class="config-grid">
                                <!-- Seleção de Regime -->
                                <div class="config-group">
                                    <label class="config-label">Regime Tributário</label>
                                    <select id="regimeTributario" class="select-field">
                                        <option value="real">Lucro Real</option>
                                        <option value="presumido" selected>Lucro Presumido</option>
                                        <option value="simples">Simples Nacional</option>
                                    </select>
                                </div>
                                
                                <!-- Configurações Simples Nacional -->
                                <div class="config-group simples-config expertzy-hidden" id="simplesConfig">
                                    <label class="config-label">Anexo do Simples</label>
                                    <select id="anexoSimples" class="select-field">
                                        <option value="I">Anexo I - Comércio</option>
                                        <option value="II">Anexo II - Indústria</option>
                                        <option value="III">Anexo III - Serviços Gerais</option>
                                        <option value="IV">Anexo IV - Serviços Específicos</option>
                                        <option value="V">Anexo V - Serviços Profissionais</option>
                                    </select>
                                    
                                    <label class="config-label mt-3">Receita Bruta Anual</label>
                                    <input type="number" id="receitaAnual" class="input-field" 
                                           value="1000000" min="0" max="4800000"
                                           placeholder="Receita anual em R$">
                                </div>
                                
                                <!-- Margem Desejada -->
                                <div class="config-group">
                                    <label class="config-label">Margem Desejada (%)</label>
                                    <input type="range" id="margemDesejada" class="range-slider" 
                                           min="0" max="100" value="30" step="1">
                                    <span id="margemValue" class="range-value">30%</span>
                                </div>
                                
                                <!-- Tipo de Margem -->
                                <div class="config-group">
                                    <label class="config-label">Tipo de Margem</label>
                                    <div class="radio-group">
                                        <label class="radio-option">
                                            <input type="radio" name="tipoMargem" value="bruta" checked>
                                            <span>Margem Bruta</span>
                                        </label>
                                        <label class="radio-option">
                                            <input type="radio" name="tipoMargem" value="liquida">
                                            <span>Margem Líquida</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <!-- Configurações de Venda -->
                                <div class="config-group">
                                    <label class="config-label">Tipo de Operação</label>
                                    <select id="tipoOperacao" class="select-field">
                                        <option value="interestadual">Interestadual</option>
                                        <option value="interna">Operação Interna</option>
                                    </select>
                                </div>
                                
                                <div class="config-group">
                                    <label class="config-label">Estado de Destino</label>
                                    <select id="estadoDestino" class="select-field">
                                        <option value="SP">São Paulo</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="ES">Espírito Santo</option>
                                        <option value="PR">Paraná</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        <option value="GO">Goiás</option>
                                        <option value="MT">Mato Grosso</option>
                                        <option value="MS">Mato Grosso do Sul</option>
                                        <option value="BA">Bahia</option>
                                        <option value="PE">Pernambuco</option>
                                        <option value="CE">Ceará</option>
                                        <option value="PA">Pará</option>
                                        <option value="AM">Amazonas</option>
                                    </select>
                                </div>
                                
                                <!-- Despesas Operacionais -->
                                <div class="config-group">
                                    <label class="config-label">Despesas Operacionais (%)</label>
                                    <input type="number" id="despesasOperacionais" class="input-field" 
                                           value="5" min="0" max="100" step="0.1">
                                </div>
                                
                                <div class="config-group">
                                    <label class="config-label">Comissões (%)</label>
                                    <input type="number" id="comissoes" class="input-field" 
                                           value="2" min="0" max="100" step="0.1">
                                </div>
                                
                                <!-- Configurações Especiais -->
                                <div class="config-group span-2">
                                    <label class="config-label">Configurações Especiais</label>
                                    <div class="checkbox-group">
                                        <label class="checkbox-option">
                                            <input type="checkbox" id="impostoPorDentro" checked>
                                            <span>Impostos por Dentro do Preço</span>
                                        </label>
                                        <label class="checkbox-option">
                                            <input type="checkbox" id="produtoListaCAMEX">
                                            <span>Produto na Lista CAMEX (ICMS 12%)</span>
                                        </label>
                                        <label class="checkbox-option">
                                            <input type="checkbox" id="aplicarSTVenda">
                                            <span>Aplicar Substituição Tributária</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="config-actions">
                                <button class="btn btn-primary" onclick="ExpertzyDI.modules.pricingUI.calcularPrecificacao()">
                                    📊 Calcular Preço de Venda
                                </button>
                                <button class="btn btn-secondary" onclick="ExpertzyDI.modules.pricingUI.compararRegimes()">
                                    🔄 Comparar Regimes
                                </button>
                            </div>
                        </div>
                        
                        <!-- Resultados da Precificação -->
                        <div class="pricing-results expertzy-hidden" id="pricingResults">
                            <!-- Cards de Resultados -->
                            <div class="results-grid">
                                <!-- Card Custo -->
                                <div class="result-card">
                                    <div class="result-icon">💵</div>
                                    <div class="result-label">Custo Unitário</div>
                                    <div class="result-value" id="custoUnitarioResult">R$ 0,00</div>
                                    <div class="result-detail" id="custoDetail">Base + Impostos não creditáveis</div>
                                </div>
                                
                                <!-- Card Preço Venda -->
                                <div class="result-card highlight">
                                    <div class="result-icon">🏷️</div>
                                    <div class="result-label">Preço de Venda</div>
                                    <div class="result-value" id="precoVendaResult">R$ 0,00</div>
                                    <div class="result-detail" id="precoDetail">Formado com margem desejada</div>
                                </div>
                                
                                <!-- Card Margem Real -->
                                <div class="result-card">
                                    <div class="result-icon">📈</div>
                                    <div class="result-label">Margem Real</div>
                                    <div class="result-value" id="margemRealResult">0%</div>
                                    <div class="result-detail" id="margemDetail">Após impostos e despesas</div>
                                </div>
                                
                                <!-- Card Markup -->
                                <div class="result-card">
                                    <div class="result-icon">🔢</div>
                                    <div class="result-label">Markup</div>
                                    <div class="result-value" id="markupResult">0%</div>
                                    <div class="result-detail">Multiplicador sobre custo</div>
                                </div>
                            </div>
                            
                            <!-- Detalhamento de Impostos -->
                            <div class="impostos-detail mt-4">
                                <h4 class="detail-title">📋 Detalhamento de Impostos e Créditos</h4>
                                
                                <div class="detail-grid">
                                    <!-- Impostos sobre Vendas -->
                                    <div class="detail-section">
                                        <h5>Impostos sobre Vendas</h5>
                                        <table class="detail-table">
                                            <tbody>
                                                <tr>
                                                    <td>PIS:</td>
                                                    <td id="pisVenda">R$ 0,00</td>
                                                </tr>
                                                <tr>
                                                    <td>COFINS:</td>
                                                    <td id="cofinsVenda">R$ 0,00</td>
                                                </tr>
                                                <tr>
                                                    <td>ICMS:</td>
                                                    <td id="icmsVenda">R$ 0,00</td>
                                                </tr>
                                                <tr>
                                                    <td>IPI:</td>
                                                    <td id="ipiVenda">R$ 0,00</td>
                                                </tr>
                                                <tr class="total-row">
                                                    <td>Total Impostos:</td>
                                                    <td id="totalImpostos">R$ 0,00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <!-- Créditos Tributários -->
                                    <div class="detail-section">
                                        <h5>Créditos Tributários</h5>
                                        <table class="detail-table">
                                            <tbody>
                                                <tr>
                                                    <td>Crédito PIS:</td>
                                                    <td id="creditoPIS">R$ 0,00</td>
                                                </tr>
                                                <tr>
                                                    <td>Crédito COFINS:</td>
                                                    <td id="creditoCOFINS">R$ 0,00</td>
                                                </tr>
                                                <tr>
                                                    <td>Crédito IPI:</td>
                                                    <td id="creditoIPI">R$ 0,00</td>
                                                </tr>
                                                <tr>
                                                    <td>Crédito ICMS:</td>
                                                    <td id="creditoICMS">R$ 0,00</td>
                                                </tr>
                                                <tr class="total-row">
                                                    <td>Total Créditos:</td>
                                                    <td id="totalCreditos">R$ 0,00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Comparação de Regimes -->
                            <div class="regime-comparison expertzy-hidden" id="regimeComparison">
                                <h4 class="detail-title">🔄 Análise Comparativa de Regimes Tributários</h4>
                                
                                <div class="comparison-grid" id="comparisonGrid">
                                    <!-- Cards de comparação serão inseridos aqui -->
                                </div>
                                
                                <div class="comparison-chart mt-4">
                                    <canvas id="comparisonChart"></canvas>
                                </div>
                            </div>
                            
                            <!-- Ações de Exportação -->
                            <div class="export-actions mt-4">
                                <button class="btn btn-secondary" onclick="ExpertzyDI.modules.pricingUI.exportarAnalise('excel')">
                                    📊 Exportar Excel
                                </button>
                                <button class="btn btn-secondary" onclick="ExpertzyDI.modules.pricingUI.exportarAnalise('pdf')">
                                    📄 Exportar PDF
                                </button>
                                <button class="btn btn-secondary" onclick="ExpertzyDI.modules.pricingUI.simularCenarios()">
                                    🎯 Simular Cenários
                                </button>
                            </div>
                        </div>
                        
                        <!-- Simulador de Cenários -->
                        <div class="scenario-simulator expertzy-hidden" id="scenarioSimulator">
                            <h4 class="detail-title">🎯 Simulador de Cenários</h4>
                            
                            <div class="simulator-config">
                                <label>Variar Margem de:</label>
                                <input type="number" id="margemMin" value="10" min="0" max="100"> %
                                <label>até:</label>
                                <input type="number" id="margemMax" value="50" min="0" max="100"> %
                                <label>Incremento:</label>
                                <input type="number" id="margemStep" value="5" min="1" max="20"> %
                                <button class="btn btn-primary" onclick="ExpertzyDI.modules.pricingUI.executarSimulacao()">
                                    Simular
                                </button>
                            </div>
                            
                            <div class="simulation-results mt-4" id="simulationResults">
                                <!-- Resultados da simulação serão inseridos aqui -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            mainElement.appendChild(pricingSection);
        },
        
        // Configurar event listeners
        configurarEventListeners: function() {
            // Listener para mudança de regime
            const regimeSelect = document.getElementById('regimeTributario');
            if (regimeSelect) {
                regimeSelect.addEventListener('change', function(e) {
                    const simplesConfig = document.getElementById('simplesConfig');
                    if (e.target.value === 'simples') {
                        simplesConfig?.classList.remove('expertzy-hidden');
                    } else {
                        simplesConfig?.classList.add('expertzy-hidden');
                    }
                });
            }
            
            // Listener para slider de margem
            const margemSlider = document.getElementById('margemDesejada');
            const margemValue = document.getElementById('margemValue');
            if (margemSlider && margemValue) {
                margemSlider.addEventListener('input', function(e) {
                    margemValue.textContent = e.target.value + '%';
                });
            }
        },
        
        // Mostrar seção de precificação
        mostrar: function() {
            const section = document.getElementById('pricingSection');
            if (section) {
                section.classList.remove('expertzy-hidden');
            }
        },
        
        // Toggle configuração
        toggleConfiguracao: function() {
            const panel = document.getElementById('pricingConfigPanel');
            if (panel) {
                panel.classList.toggle('collapsed');
            }
        },
        
        // Calcular precificação
        calcularPrecificacao: function() {
            ExpertzyDI.log('PRICING-UI', 'Calculando precificação');
            
            // Obter dados da DI processada
            const dadosDI = ExpertzyDI.data.currentDI;
            if (!dadosDI || !dadosDI.custoUnitario) {
                alert('Por favor, processe um arquivo XML de DI primeiro.');
                return;
            }
            
            // Obter configuração da interface
            const config = this.obterConfiguracaoInterface();
            
            // Calcular preço usando o módulo de precificação
            const resultado = ExpertzyDI.modules.pricing.calcularPrecoVenda(dadosDI, config);
            
            // Exibir resultados
            this.exibirResultados(resultado);
            
            // Salvar resultado
            ExpertzyDI.data.precificacao = resultado;
            
            // Log de auditoria
            ExpertzyDI.audit('precificacao_calculada', {
                config: config,
                resultado: resultado
            });
        },
        
        // Obter configuração da interface
        obterConfiguracaoInterface: function() {
            return {
                regime: document.getElementById('regimeTributario')?.value || 'presumido',
                anexoSimples: document.getElementById('anexoSimples')?.value || 'I',
                receitaAnual: parseFloat(document.getElementById('receitaAnual')?.value) || 1000000,
                margemDesejada: parseFloat(document.getElementById('margemDesejada')?.value) / 100 || 0.30,
                tipoMargem: document.querySelector('input[name="tipoMargem"]:checked')?.value || 'bruta',
                tipoOperacao: document.getElementById('tipoOperacao')?.value || 'interestadual',
                estadoDestino: document.getElementById('estadoDestino')?.value || 'SP',
                despesasOperacionais: parseFloat(document.getElementById('despesasOperacionais')?.value) / 100 || 0.05,
                comissoes: parseFloat(document.getElementById('comissoes')?.value) / 100 || 0.02,
                impostoPorDentro: document.getElementById('impostoPorDentro')?.checked !== false,
                produtoListaCAMEX: document.getElementById('produtoListaCAMEX')?.checked || false,
                aplicarSTVenda: document.getElementById('aplicarSTVenda')?.checked || false
            };
        },
        
        // Exibir resultados
        exibirResultados: function(resultado) {
            // Mostrar seção de resultados
            const resultsDiv = document.getElementById('pricingResults');
            if (resultsDiv) {
                resultsDiv.classList.remove('expertzy-hidden');
            }
            
            // Formatar moeda
            const formatarMoeda = (valor) => {
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(valor || 0);
            };
            
            // Atualizar cards de resultado
            const updates = {
                'custoUnitarioResult': formatarMoeda(resultado.custoAjustado?.custoFinal),
                'precoVendaResult': formatarMoeda(resultado.precos?.precoVendaFinal),
                'margemRealResult': (resultado.margens?.margemRealPercentual || 0).toFixed(2) + '%',
                'markupResult': (resultado.margens?.markupPercentual || 0).toFixed(2) + '%'
            };
            
            Object.entries(updates).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            });
            
            // Atualizar detalhamento de impostos
            const impostos = resultado.impostos || {};
            document.getElementById('pisVenda').textContent = formatarMoeda(impostos.pis);
            document.getElementById('cofinsVenda').textContent = formatarMoeda(impostos.cofins);
            document.getElementById('icmsVenda').textContent = formatarMoeda(impostos.icms);
            document.getElementById('ipiVenda').textContent = formatarMoeda(impostos.ipi);
            document.getElementById('totalImpostos').textContent = formatarMoeda(impostos.total);
            
            // Atualizar créditos
            const creditos = resultado.creditos || {};
            document.getElementById('creditoPIS').textContent = formatarMoeda(creditos.creditoPIS);
            document.getElementById('creditoCOFINS').textContent = formatarMoeda(creditos.creditoCOFINS);
            document.getElementById('creditoIPI').textContent = formatarMoeda(creditos.creditoIPI);
            document.getElementById('creditoICMS').textContent = formatarMoeda(creditos.creditoICMS);
            document.getElementById('totalCreditos').textContent = formatarMoeda(creditos.total);
            
            // Adicionar classe de destaque se margem baixa
            const margemElement = document.getElementById('margemRealResult');
            if (margemElement) {
                margemElement.className = '';
                if (resultado.margens?.margemRealPercentual < 10) {
                    margemElement.classList.add('text-danger');
                } else if (resultado.margens?.margemRealPercentual < 20) {
                    margemElement.classList.add('text-warning');
                } else {
                    margemElement.classList.add('text-success');
                }
            }
        },
        
        // Comparar regimes tributários
        compararRegimes: function() {
            ExpertzyDI.log('PRICING-UI', 'Comparando regimes tributários');
            
            const dadosDI = ExpertzyDI.data.currentDI;
            if (!dadosDI || !dadosDI.custoUnitario) {
                alert('Por favor, processe um arquivo XML de DI primeiro.');
                return;
            }
            
            // Obter configuração base
            const configBase = this.obterConfiguracaoInterface();
            
            // Fazer análise comparativa
            const analise = ExpertzyDI.modules.pricing.analisarRegimesTributarios(dadosDI, configBase);
            
            // Exibir comparação
            this.exibirComparacao(analise);
        },
        
        // Exibir comparação de regimes
        exibirComparacao: function(analise) {
            const comparisonDiv = document.getElementById('regimeComparison');
            const gridDiv = document.getElementById('comparisonGrid');
            
            if (!comparisonDiv || !gridDiv) return;
            
            comparisonDiv.classList.remove('expertzy-hidden');
            
            // Limpar grid anterior
            gridDiv.innerHTML = '';
            
            // Criar cards de comparação
            const regimes = ['real', 'presumido', 'simples'];
            const nomes = {
                'real': 'Lucro Real',
                'presumido': 'Lucro Presumido',
                'simples': 'Simples Nacional'
            };
            
            regimes.forEach(regime => {
                const dados = analise.resultados[regime];
                const isRecomendado = analise.recomendacao.regime === regime;
                
                const card = document.createElement('div');
                card.className = 'comparison-card' + (isRecomendado ? ' recommended' : '');
                card.innerHTML = `
                    <div class="regime-name">${nomes[regime]}</div>
                    ${isRecomendado ? '<div class="recommended-badge">Recomendado</div>' : ''}
                    <div class="comparison-metrics">
                        <div class="metric">
                            <span class="metric-label">Preço Venda:</span>
                            <span class="metric-value">${this.formatarMoeda(dados.precoVenda)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Margem Real:</span>
                            <span class="metric-value ${dados.margemReal > 20 ? 'text-success' : dados.margemReal > 10 ? 'text-warning' : 'text-danger'}">
                                ${dados.margemReal.toFixed(2)}%
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Impostos:</span>
                            <span class="metric-value">${this.formatarMoeda(dados.impostos)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Créditos:</span>
                            <span class="metric-value">${this.formatarMoeda(dados.creditos)}</span>
                        </div>
                    </div>
                `;
                
                gridDiv.appendChild(card);
            });
        },
        
        // Simular cenários
        simularCenarios: function() {
            const simulator = document.getElementById('scenarioSimulator');
            if (simulator) {
                simulator.classList.toggle('expertzy-hidden');
            }
        },
        
        // Executar simulação
        executarSimulacao: function() {
            const dadosDI = ExpertzyDI.data.currentDI;
            if (!dadosDI) return;
            
            const margemMin = parseFloat(document.getElementById('margemMin')?.value) || 10;
            const margemMax = parseFloat(document.getElementById('margemMax')?.value) || 50;
            const margemStep = parseFloat(document.getElementById('margemStep')?.value) || 5;
            
            const configBase = this.obterConfiguracaoInterface();
            const resultados = [];
            
            for (let margem = margemMin; margem <= margemMax; margem += margemStep) {
                const config = { ...configBase, margemDesejada: margem / 100 };
                const resultado = ExpertzyDI.modules.pricing.calcularPrecoVenda(dadosDI, config);
                
                resultados.push({
                    margem: margem,
                    precoVenda: resultado.precos?.precoVendaFinal || 0,
                    margemReal: resultado.margens?.margemRealPercentual || 0,
                    markup: resultado.margens?.markupPercentual || 0
                });
            }
            
            this.exibirSimulacao(resultados);
        },
        
        // Exibir resultados da simulação
        exibirSimulacao: function(resultados) {
            const resultsDiv = document.getElementById('simulationResults');
            if (!resultsDiv) return;
            
            let html = `
                <table class="simulation-table">
                    <thead>
                        <tr>
                            <th>Margem Desejada</th>
                            <th>Preço de Venda</th>
                            <th>Margem Real</th>
                            <th>Markup</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            resultados.forEach(r => {
                const margemClass = r.margemReal > 20 ? 'text-success' : r.margemReal > 10 ? 'text-warning' : 'text-danger';
                html += `
                    <tr>
                        <td>${r.margem.toFixed(0)}%</td>
                        <td>${this.formatarMoeda(r.precoVenda)}</td>
                        <td class="${margemClass}">${r.margemReal.toFixed(2)}%</td>
                        <td>${r.markup.toFixed(2)}%</td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            resultsDiv.innerHTML = html;
        },
        
        // Exportar análise
        exportarAnalise: function(formato) {
            const precificacao = ExpertzyDI.data.precificacao;
            if (!precificacao) {
                alert('Nenhuma análise de precificação disponível para exportar.');
                return;
            }
            
            if (formato === 'excel') {
                this.exportarExcel(precificacao);
            } else if (formato === 'pdf') {
                this.exportarPDF(precificacao);
            }
        },
        
        // Exportar para Excel
        exportarExcel: function(dados) {
            // Implementação será feita usando a biblioteca XLSX
            ExpertzyDI.log('PRICING-UI', 'Exportando análise para Excel');
            alert('Exportação Excel será implementada com a biblioteca XLSX');
        },
        
        // Exportar para PDF
        exportarPDF: function(dados) {
            // Implementação será feita usando a biblioteca jsPDF
            ExpertzyDI.log('PRICING-UI', 'Exportando análise para PDF');
            alert('Exportação PDF será implementada com a biblioteca jsPDF');
        },
        
        // Formatar moeda
        formatarMoeda: function(valor) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor || 0);
        }
    };
    
})(window.ExpertzyDI);