/*
COST-CALCULATOR.JS - Cálculos de Custos Unitários com Despesas Extra-DI
Baseado no código Python original
Expertzy Inteligência Tributária

Funcionalidades:
- Cálculo de custos unitários com rateio proporcional
- Aplicação de incentivos fiscais estaduais
- Despesas extra-DI (despachante, armazenagem, etc.)
- Configuração de quais despesas compõem base do ICMS
- Memória de cálculo detalhada para cada operação
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.costCalculator = {
        
        // Alíquotas de ICMS por estado
        ICMS_ALIQUOTAS_UF: {
            'AC': 19, 'AL': 20, 'AP': 18, 'AM': 20, 'BA': 20.5, 'CE': 20, 'DF': 20, 'ES': 17,
            'GO': 19, 'MA': 23, 'MT': 17, 'MS': 17, 'MG': 18, 'PA': 19, 'PB': 20, 'PR': 19.5,
            'PE': 20.5, 'PI': 22.5, 'RJ': 22, 'RN': 20, 'RS': 17, 'RO': 19.5, 'RR': 20,
            'SC': 17, 'SP': 18, 'SE': 20, 'TO': 20
        },
        
        // Configurações padrão de despesas extra-DI
        despesasExtraDI: {
            // Despesas que COMPÕEM a base do ICMS
            baseICMS: {
                despachante: { valor: 0, descricao: 'Honorários de despachante aduaneiro' },
                armazenagem: { valor: 0, descricao: 'Armazenagem no porto/aeroporto' },
                capatazia: { valor: 0, descricao: 'Movimentação portuária' },
                taxaUtilizacaoSiscomex: { valor: 0, descricao: 'Taxa de utilização do Siscomex' },
                outrasPortuarias: { valor: 0, descricao: 'Outras despesas portuárias' }
            },
            
            // Despesas que NÃO COMPÕEM a base do ICMS
            naoBaseICMS: {
                transporteInterno: { valor: 0, descricao: 'Transporte interno (porto até empresa)' },
                seguroInterno: { valor: 0, descricao: 'Seguro transporte interno' },
                despesasBancarias: { valor: 0, descricao: 'Despesas bancárias (câmbio, IOF)' },
                outrasNaoBase: { valor: 0, descricao: 'Outras despesas não integrantes da base' }
            }
        },
        
        // Função principal para calcular custos unitários
        calcularCustosUnitarios: function(dados, config) {
            ExpertzyDI.log('COST_CALC', 'Iniciando cálculos de custos unitários com despesas extra-DI');
            
            if (!dados || !dados.adicoes || dados.adicoes.length === 0) {
                throw new Error('Dados da DI não disponíveis para cálculo');
            }
            
            // Obter despesas extras configuradas pelo usuário
            const despesasExtras = this.obterDespesasExtras();
            
            // Obter taxa de câmbio configurada
            const taxaCambio = this.obterTaxaCambio(dados);
            
            const calculoConfig = this.prepararConfiguracao(config);
            calculoConfig.despesasExtras = despesasExtras;
            calculoConfig.taxaCambio = taxaCambio;
            
            const resultados = {
                adicoes: [],
                totais: {
                    valorMercadoria: 0,
                    custoTotal: 0,
                    despesasExtraDI: {
                        baseICMS: 0,
                        naoBaseICMS: 0,
                        incluirNF: 0,
                        apenasParaCusto: 0,
                        total: 0
                    },
                    impostos: {
                        II: 0,
                        IPI: 0,
                        PIS: 0,
                        COFINS: 0,
                        ICMS: 0
                    }
                },
                memoria: [],
                configuracao: calculoConfig
            };
            
            // Processar cada adição
            dados.adicoes.forEach((adicao, index) => {
                const resultadoAdicao = this.calcularAdicao(adicao, calculoConfig, index + 1);
                resultados.adicoes.push(resultadoAdicao);
                
                // Somar aos totais
                this.somarTotais(resultados.totais, resultadoAdicao);
            });
            
            // Aplicar incentivos fiscais se configurado
            if (calculoConfig.aplicarIncentivos) {
                this.aplicarIncentivosFiscais(resultados, calculoConfig);
            }
            
            // Registrar no audit log
            if (ExpertzyDI.utils.audit && ExpertzyDI.utils.audit.log) {
                ExpertzyDI.utils.audit.log('calcular_custos_unitarios', {
                    configuracao: calculoConfig,
                    totais: resultados.totais
                });
            }
            
            ExpertzyDI.log('COST_CALC', 'Cálculos concluídos', {
                adicoes: resultados.adicoes.length,
                custoTotal: resultados.totais.custoTotal,
                despesasExtraDI: resultados.totais.despesasExtraDI.total
            });
            
            return resultados;
        },
        
        // Obter despesas extras configuradas pelo usuário
        obterDespesasExtras: function() {
            if (ExpertzyDI.modules.despesasExtras) {
                return ExpertzyDI.modules.despesasExtras.obterDespesas();
            }
            
            // Retornar estrutura vazia se módulo não estiver disponível
            return {
                lista: [],
                totais: {
                    baseICMS: 0,
                    foraBase: 0,
                    incluirNF: 0,
                    apenasParaCusto: 0,
                    total: 0
                }
            };
        },
        
        // Obter taxa de câmbio configurada
        obterTaxaCambio: function(dados) {
            // Primeiro tentar obter do módulo de câmbio
            if (ExpertzyDI.modules.cambio) {
                const taxaEfetiva = ExpertzyDI.modules.cambio.obterTaxaEfetiva();
                if (taxaEfetiva > 0) {
                    return taxaEfetiva;
                }
            }
            
            // Sempre usar taxa da DI como padrão
            if (dados && dados.taxaCambio && dados.taxaCambio > 0) {
                return dados.taxaCambio;
            }
            
            // Se não houver taxa na DI, lançar erro
            throw new Error('Taxa de câmbio não disponível na DI. Configure manualmente a taxa de câmbio.');
        },
        
        // Preparar configuração de cálculo
        prepararConfiguracao: function(config) {
            const configuracao = {
                // Configurações básicas
                incoterm: config?.incoterm || ExpertzyDI.data.config.incoterm || 'FOB',
                estado: config?.estado || ExpertzyDI.data.config.estado || 'GO',
                
                // Despesas adicionais da DI
                afrmm: config?.afrmm || ExpertzyDI.data.config.afrmm || 0,
                siscomex: config?.siscomex || ExpertzyDI.data.config.siscomex || 0,
                
                // Despesas extra-DI
                despesasExtraDI: config?.despesasExtraDI || this.obterDespesasExtraDIConfiguradas(),
                
                // Configurações especiais
                dolarDiferenciado: config?.dolarDiferenciado || false,
                taxaDolarDiferenciado: config?.taxaDolarDiferenciado || 0,
                reducaoBaseICMS: config?.reducaoBaseICMS || 0,
                substituicaoTributaria: config?.substituicaoTributaria || false,
                
                // Incentivos fiscais
                aplicarIncentivos: config?.aplicarIncentivos || false,
                
                // Alíquota ICMS padrão por estado
                aliquotaICMSPadrao: this.obterAliquotaICMSPadrao(config?.estado || 'GO') / 100,
                
                // Margens e custos
                margemLucro: config?.margemLucro || 0,
                custosAdicionais: config?.custosAdicionais || {},
                
                // Data para taxa de câmbio (se necessário)
                dataCalculo: config?.dataCalculo || new Date()
            };
            
            ExpertzyDI.log('COST_CALC', 'Configuração preparada', configuracao);
            return configuracao;
        },
        
        // Obter despesas extra-DI configuradas pelo usuário
        obterDespesasExtraDIConfiguradas: function() {
            const despesasConfiguradas = {
                baseICMS: {},
                naoBaseICMS: {}
            };
            
            // Copiar estrutura padrão
            Object.keys(this.despesasExtraDI.baseICMS).forEach(key => {
                const elemento = document.getElementById(`despesa-base-${key}`);
                despesasConfiguradas.baseICMS[key] = {
                    ...this.despesasExtraDI.baseICMS[key],
                    valor: elemento ? parseFloat(elemento.value) || 0 : 0
                };
            });
            
            Object.keys(this.despesasExtraDI.naoBaseICMS).forEach(key => {
                const elemento = document.getElementById(`despesa-naobase-${key}`);
                despesasConfiguradas.naoBaseICMS[key] = {
                    ...this.despesasExtraDI.naoBaseICMS[key],
                    valor: elemento ? parseFloat(elemento.value) || 0 : 0
                };
            });
            
            return despesasConfiguradas;
        },
        
        // Obter alíquota de ICMS padrão por estado
        obterAliquotaICMSPadrao: function(estado) {
            return this.ICMS_ALIQUOTAS_UF[estado] || 19; // Padrão 19% se estado não encontrado
        },
        
        // Calcular totais das despesas extra-DI
        calcularTotaisDespesasExtraDI: function(despesasConfig) {
            const totalBaseICMS = Object.values(despesasConfig.baseICMS)
                .reduce((sum, despesa) => sum + (despesa.valor || 0), 0);
                
            const totalNaoBaseICMS = Object.values(despesasConfig.naoBaseICMS)
                .reduce((sum, despesa) => sum + (despesa.valor || 0), 0);
            
            return {
                baseICMS: totalBaseICMS,
                naoBaseICMS: totalNaoBaseICMS,
                total: totalBaseICMS + totalNaoBaseICMS
            };
        },
        
        // Calcular uma adição específica
        calcularAdicao: function(adicao, config, numeroAdicao) {
            const memoria = [];
            const totaisDespesasExtraDI = this.calcularTotaisDespesasExtraDI(config.despesasExtraDI);
            
            // Passo 1: Valores base da mercadoria (mapeamento correto dos campos do XML)
            const valorMercadoriaFOB = adicao.vcmvBRL || adicao.valorTotal || 0;
            const valorFrete = 0; // Para CFR/CIF já está embutido no VCMV
            const valorSeguro = 0; // Para CIF já está embutido no VCMV
            
            // Validação crítica
            if (!valorMercadoriaFOB || valorMercadoriaFOB === 0) {
                throw new Error(`Valor da mercadoria não encontrado para adição ${numeroAdicao}. VCMV: ${adicao.vcmvBRL}`);
            }
            
            ExpertzyDI.log('COST_CALC', `Adição ${numeroAdicao}: VCMV BRL = ${valorMercadoriaFOB}`);
            
            memoria.push({
                passo: 1,
                descricao: 'Valores base da mercadoria',
                detalhes: {
                    valorMercadoriaFOB: valorMercadoriaFOB,
                    valorFrete: valorFrete,
                    valorSeguro: valorSeguro,
                    incoterm: config.incoterm
                }
            });
            
            // Passo 2: Cálculo da base CIF
            let baseCIF = valorMercadoriaFOB || 0;
            if (config.incoterm === 'FOB') {
                baseCIF += (valorFrete || 0) + (valorSeguro || 0);
            }
            
            // Garantir que baseCIF não seja undefined
            baseCIF = baseCIF || 0;
            
            memoria.push({
                passo: 2,
                descricao: 'Cálculo da base CIF',
                formula: config.incoterm === 'FOB' ? 'FOB + Frete + Seguro' : 'CIF (já incluído)',
                calculo: config.incoterm === 'FOB' ? 
                    `${valorMercadoriaFOB} + ${valorFrete} + ${valorSeguro} = ${baseCIF}` :
                    `${baseCIF} (CIF)`,
                resultado: baseCIF
            });
            
            // Passo 3: Cálculo do Imposto de Importação (II)
            const baseII = baseCIF;
            const aliquotaII = (adicao.impostos && adicao.impostos.II) ? adicao.impostos.II.aliquota : 0;
            const valorII = baseII * aliquotaII;
            
            memoria.push({
                passo: 3,
                descricao: 'Cálculo do Imposto de Importação (II)',
                formula: 'Base CIF × Alíquota II',
                calculo: `${baseII} × ${(aliquotaII * 100).toFixed(2)}% = ${valorII.toFixed(2)}`,
                resultado: valorII
            });
            
            // Passo 4: Cálculo da base para IPI
            const baseIPI = baseCIF + valorII;
            const aliquotaIPI = (adicao.impostos && adicao.impostos.IPI) ? adicao.impostos.IPI.aliquota : 0;
            const valorIPI = baseIPI * aliquotaIPI;
            
            memoria.push({
                passo: 4,
                descricao: 'Cálculo do IPI',
                formula: '(Base CIF + II) × Alíquota IPI',
                calculo: `(${baseCIF.toFixed(2)} + ${valorII.toFixed(2)}) × ${(aliquotaIPI * 100).toFixed(2)}% = ${valorIPI.toFixed(2)}`,
                resultado: valorIPI
            });
            
            // Passo 5: Cálculo do PIS (usar alíquota da DI se disponível)
            const basePIS = baseCIF + valorII + config.afrmm + config.siscomex;
            const aliquotaPIS = (adicao.impostos && adicao.impostos.PIS) ? adicao.impostos.PIS.aliquota : 0.0165; // 1,65% padrão só se não houver na DI
            const valorPIS = basePIS * aliquotaPIS;
            
            memoria.push({
                passo: 5,
                descricao: 'Cálculo do PIS',
                formula: '(Base CIF + II + AFRMM + SISCOMEX) × Alíquota PIS',
                calculo: `(${baseCIF.toFixed(2)} + ${valorII.toFixed(2)} + ${config.afrmm.toFixed(2)} + ${config.siscomex.toFixed(2)}) × ${(aliquotaPIS * 100).toFixed(2)}% = ${valorPIS.toFixed(2)}`,
                resultado: valorPIS
            });
            
            // Passo 6: Cálculo do COFINS (usar alíquota da DI se disponível)
            const baseCOFINS = baseCIF + valorII + config.afrmm + config.siscomex;
            const aliquotaCOFINS = (adicao.impostos && adicao.impostos.COFINS) ? adicao.impostos.COFINS.aliquota : 0.076; // 7,6% padrão só se não houver na DI
            const valorCOFINS = baseCOFINS * aliquotaCOFINS;
            
            memoria.push({
                passo: 6,
                descricao: 'Cálculo do COFINS',
                formula: '(Base CIF + II + AFRMM + SISCOMEX) × Alíquota COFINS',
                calculo: `(${baseCIF.toFixed(2)} + ${valorII.toFixed(2)} + ${config.afrmm.toFixed(2)} + ${config.siscomex.toFixed(2)}) × ${(aliquotaCOFINS * 100).toFixed(2)}% = ${valorCOFINS.toFixed(2)}`,
                resultado: valorCOFINS
            });
            
            // Passo 7: Cálculo do ICMS com despesas extra-DI
            let valorICMS = 0;
            let baseICMS = 0;
            
            // Obter despesas extras que compõem a base do ICMS
            const despesasBaseICMS = config.despesasExtras ? config.despesasExtras.totais.baseICMS : 0;
            
            const aliquotaICMS = (adicao.impostos && adicao.impostos.ICMS) ? 
                               adicao.impostos.ICMS.aliquota : 
                               config.aliquotaICMSPadrao;
            
            if (aliquotaICMS && aliquotaICMS > 0) {
                // Base do ICMS: (CIF + II + IPI + PIS + COFINS + AFRMM + SISCOMEX + Despesas Base ICMS) / (1 - Aliq ICMS)
                const baseICMSIntermediaria = baseCIF + valorII + valorIPI + valorPIS + valorCOFINS + 
                                            config.afrmm + config.siscomex + despesasBaseICMS;
                
                // Aplicar redução de base se configurada
                const fatorReducao = 1 - config.reducaoBaseICMS;
                
                baseICMS = (baseICMSIntermediaria / (1 - aliquotaICMS)) * fatorReducao;
                valorICMS = baseICMS * aliquotaICMS;
                
                memoria.push({
                    passo: 7,
                    descricao: 'Cálculo do ICMS com despesas extra-DI',
                    formula: config.reducaoBaseICMS > 0 ? 
                        '[(Base + Despesas Base ICMS) / (1 - Aliq ICMS)] × (1 - Redução) × Aliq ICMS' :
                        '[(Base + Despesas Base ICMS) / (1 - Aliq ICMS)] × Aliq ICMS',
                    detalhes: {
                        baseIntermediaria: baseICMSIntermediaria,
                        despesasBaseICMS: totaisDespesasExtraDI.baseICMS,
                        aliquotaICMS: aliquotaICMS,
                        reducaoBase: config.reducaoBaseICMS,
                        baseICMS: baseICMS
                    },
                    calculo: `Base Intermediária: ${baseICMSIntermediaria.toFixed(2)} | Base Final: ${baseICMS.toFixed(2)} | ICMS: ${valorICMS.toFixed(2)}`,
                    resultado: valorICMS
                });
            } else {
                memoria.push({
                    passo: 7,
                    descricao: 'ICMS não aplicável',
                    observacao: 'ICMS não declarado na DI ou alíquota zero',
                    resultado: 0
                });
            }
            
            // Passo 8: Custo total da mercadoria (incluindo todas as despesas)
            const despesasTotais = config.despesasExtras ? config.despesasExtras.totais.total : 0;
            const custoTotalMercadoria = baseCIF + valorII + valorIPI + valorPIS + valorCOFINS + valorICMS + 
                                       config.afrmm + config.siscomex + despesasTotais;
            const quantidadeTotal = adicao.quantidade || 1;
            const custoUnitario = custoTotalMercadoria / quantidadeTotal;
            
            memoria.push({
                passo: 8,
                descricao: 'Custo total da mercadoria',
                formula: 'CIF + II + IPI + PIS + COFINS + ICMS + AFRMM + SISCOMEX + Despesas Extra-DI',
                detalhes: {
                    custoSemDespesasExtraDI: baseCIF + valorII + valorIPI + valorPIS + valorCOFINS + valorICMS + config.afrmm + config.siscomex,
                    despesasExtraDI: despesasTotais,
                    custoTotal: custoTotalMercadoria,
                    quantidade: quantidadeTotal,
                    custoUnitario: custoUnitario
                },
                calculo: `${custoTotalMercadoria.toFixed(2)} / ${quantidadeTotal} = ${custoUnitario.toFixed(2)}`,
                resultado: custoUnitario
            });
            
            // Passo 9: Rateio para itens (se houver múltiplos itens)
            const itensComCusto = adicao.itens ? this.ratearCustosPorItens(adicao.itens, custoTotalMercadoria, memoria) : [];
            
            const resultado = {
                numeroAdicao: numeroAdicao,
                codigoNCM: adicao.codigoNCM,
                descricaoMercadoria: adicao.descricaoMercadoria,
                
                // Valores base
                valorMercadoriaFOB: valorMercadoriaFOB,
                valorFrete: valorFrete,
                valorSeguro: valorSeguro,
                baseCIF: baseCIF,
                
                // Impostos calculados
                impostos: {
                    II: { base: baseII, aliquota: aliquotaII, valor: valorII },
                    IPI: { base: baseIPI, aliquota: aliquotaIPI, valor: valorIPI },
                    PIS: { base: basePIS, aliquota: aliquotaPIS, valor: valorPIS },
                    COFINS: { base: baseCOFINS, aliquota: aliquotaCOFINS, valor: valorCOFINS },
                    ICMS: { base: baseICMS, aliquota: adicao.aliquotaICMS || 0, valor: valorICMS }
                },
                
                // Despesas da DI
                despesasDI: {
                    afrmm: config.afrmm,
                    siscomex: config.siscomex
                },
                
                // Despesas extra-DI
                despesasExtraDI: {
                    baseICMS: totaisDespesasExtraDI.baseICMS,
                    naoBaseICMS: totaisDespesasExtraDI.naoBaseICMS,
                    total: totaisDespesasExtraDI.total,
                    detalhamento: config.despesasExtraDI
                },
                
                // Custos finais
                custoTotal: custoTotalMercadoria,
                quantidadeTotal: quantidadeTotal,
                custoUnitario: custoUnitario,
                
                // Itens com custo rateado
                itens: itensComCusto,
                
                // Memória de cálculo
                memoriaCalculo: memoria
            };
            
            return resultado;
        },
        
        // Ratear custos por itens dentro de uma adição
        ratearCustosPorItens: function(itens, custoTotalAdicao, memoria) {
            if (!itens || itens.length === 0) {
                return [];
            }
            
            // Se só tem um item, todo o custo vai para ele
            if (itens.length === 1) {
                const item = itens[0];
                const quantidade = item.quantidadeUnidadeComercializada || 1;
                
                return [{
                    ...item,
                    custoTotal: custoTotalAdicao,
                    custoUnitario: custoTotalAdicao / quantidade,
                    percentualRateio: 100
                }];
            }
            
            // Múltiplos itens: rateio proporcional por valor
            const valorTotalItens = itens.reduce((sum, item) => sum + (item.valorMercadoria || 0), 0);
            
            if (valorTotalItens === 0) {
                // Se não tem valores, rateio igualitário
                const custoIgualitario = custoTotalAdicao / itens.length;
                
                memoria.push({
                    passo: 9,
                    descricao: 'Rateio igualitário entre itens',
                    observacao: 'Valores dos itens não disponíveis - aplicado rateio igualitário',
                    custoIgualitario: custoIgualitario
                });
                
                return itens.map(item => ({
                    ...item,
                    custoTotal: custoIgualitario,
                    custoUnitario: custoIgualitario / (item.quantidadeUnidadeComercializada || 1),
                    percentualRateio: 100 / itens.length
                }));
            }
            
            // Rateio proporcional por valor
            const itensComCusto = itens.map(item => {
                const valorItem = item.valorMercadoria || 0;
                const percentualRateio = (valorItem / valorTotalItens) * 100;
                const custoTotalItem = (custoTotalAdicao * valorItem) / valorTotalItens;
                const quantidadeItem = item.quantidadeUnidadeComercializada || 1;
                const custoUnitarioItem = custoTotalItem / quantidadeItem;
                
                return {
                    ...item,
                    valorMercadoria: valorItem,
                    custoTotal: custoTotalItem,
                    custoUnitario: custoUnitarioItem,
                    percentualRateio: percentualRateio
                };
            });
            
            memoria.push({
                passo: 9,
                descricao: 'Rateio proporcional por valor entre itens',
                formula: 'Custo Item = (Valor Item / Valor Total Itens) × Custo Total Adição',
                detalhes: {
                    valorTotalItens: valorTotalItens,
                    custoTotalAdicao: custoTotalAdicao,
                    quantidadeItens: itens.length
                }
            });
            
            return itensComCusto;
        },
        
        // Somar aos totais gerais
        somarTotais: function(totais, resultadoAdicao) {
            totais.valorMercadoria += resultadoAdicao.valorMercadoriaFOB;
            totais.custoTotal += resultadoAdicao.custoTotal;
            
            // Somar despesas extra-DI
            totais.despesasExtraDI.baseICMS += resultadoAdicao.despesasExtraDI.baseICMS;
            totais.despesasExtraDI.naoBaseICMS += resultadoAdicao.despesasExtraDI.naoBaseICMS;
            totais.despesasExtraDI.total += resultadoAdicao.despesasExtraDI.total;
            
            // Somar impostos
            Object.keys(totais.impostos).forEach(imposto => {
                if (resultadoAdicao.impostos[imposto]) {
                    totais.impostos[imposto] += resultadoAdicao.impostos[imposto].valor || 0;
                }
            });
        },
        
        // Aplicar incentivos fiscais
        aplicarIncentivosFiscais: function(resultados, config) {
            if (!config.aplicarIncentivos || !ExpertzyDI.modules.incentives) {
                return;
            }
            
            ExpertzyDI.log('COST_CALC', 'Aplicando incentivos fiscais', { estado: config.estado });
            
            // Delegar para o módulo de incentivos
            ExpertzyDI.modules.incentives.aplicarIncentivos(resultados, config);
        },
        
        // Gerar interface para configuração das despesas extra-DI
        gerarInterfaceDespesasExtraDI: function() {
            const html = `
                <div class="despesas-extra-di-config">
                    <h3>Despesas Extra-DI</h3>
                    <p class="info-text">Configure as despesas adicionais de importação não constantes na DI:</p>
                    
                    <div class="despesas-group">
                        <h4>Despesas que COMPÕEM a base do ICMS:</h4>
                        ${Object.entries(this.despesasExtraDI.baseICMS).map(([key, despesa]) => `
                            <div class="despesa-item">
                                <label for="despesa-base-${key}">${despesa.descricao}:</label>
                                <input type="number" 
                                       id="despesa-base-${key}" 
                                       step="0.01" 
                                       min="0" 
                                       value="0" 
                                       placeholder="R$ 0,00">
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="despesas-group">
                        <h4>Despesas que NÃO COMPÕEM a base do ICMS:</h4>
                        ${Object.entries(this.despesasExtraDI.naoBaseICMS).map(([key, despesa]) => `
                            <div class="despesa-item">
                                <label for="despesa-naobase-${key}">${despesa.descricao}:</label>
                                <input type="number" 
                                       id="despesa-naobase-${key}" 
                                       step="0.01" 
                                       min="0" 
                                       value="0" 
                                       placeholder="R$ 0,00">
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="despesas-totais">
                        <div class="total-base-icms">
                            <strong>Total Base ICMS: R$ <span id="total-base-icms">0,00</span></strong>
                        </div>
                        <div class="total-nao-base-icms">
                            <strong>Total Não Base ICMS: R$ <span id="total-nao-base-icms">0,00</span></strong>
                        </div>
                        <div class="total-geral-despesas">
                            <strong>Total Geral: R$ <span id="total-geral-despesas">0,00</span></strong>
                        </div>
                    </div>
                </div>
            `;
            
            return html;
        },
        
        // Configurar event listeners para despesas extra-DI
        configurarEventListenersDespesasExtraDI: function() {
            const calcularTotais = () => {
                let totalBaseICMS = 0;
                let totalNaoBaseICMS = 0;
                
                // Somar despesas base ICMS
                Object.keys(this.despesasExtraDI.baseICMS).forEach(key => {
                    const input = document.getElementById(`despesa-base-${key}`);
                    if (input) {
                        totalBaseICMS += parseFloat(input.value) || 0;
                    }
                });
                
                // Somar despesas não base ICMS
                Object.keys(this.despesasExtraDI.naoBaseICMS).forEach(key => {
                    const input = document.getElementById(`despesa-naobase-${key}`);
                    if (input) {
                        totalNaoBaseICMS += parseFloat(input.value) || 0;
                    }
                });
                
                // Atualizar displays
                const totalBaseEl = document.getElementById('total-base-icms');
                const totalNaoBaseEl = document.getElementById('total-nao-base-icms');
                const totalGeralEl = document.getElementById('total-geral-despesas');
                
                if (totalBaseEl) totalBaseEl.textContent = totalBaseICMS.toFixed(2);
                if (totalNaoBaseEl) totalNaoBaseEl.textContent = totalNaoBaseICMS.toFixed(2);
                if (totalGeralEl) totalGeralEl.textContent = (totalBaseICMS + totalNaoBaseICMS).toFixed(2);
            };
            
            // Adicionar listeners a todos os inputs de despesas
            [...Object.keys(this.despesasExtraDI.baseICMS), ...Object.keys(this.despesasExtraDI.naoBaseICMS)].forEach(key => {
                const inputBase = document.getElementById(`despesa-base-${key}`);
                const inputNaoBase = document.getElementById(`despesa-naobase-${key}`);
                
                if (inputBase) {
                    inputBase.addEventListener('input', calcularTotais);
                    inputBase.addEventListener('change', calcularTotais);
                }
                
                if (inputNaoBase) {
                    inputNaoBase.addEventListener('input', calcularTotais);
                    inputNaoBase.addEventListener('change', calcularTotais);
                }
            });
        },
        
        // Validar cálculos contra DI original
        validarCalculos: function(resultados, dadosOriginais) {
            if (!ExpertzyDI.modules.validation) {
                ExpertzyDI.log('COST_CALC', 'Módulo de validação não disponível');
                return null;
            }
            
            return ExpertzyDI.modules.validation.compararCalculos(resultados, dadosOriginais);
        },
        
        // Utilitário: arredondar valor monetário
        arredondarMoeda: function(valor) {
            return Math.round(valor * 100) / 100;
        },
        
        // Utilitário: calcular percentual
        calcularPercentual: function(parte, total) {
            return total > 0 ? (parte / total) * 100 : 0;
        }
    };
    
})(window.ExpertzyDI);