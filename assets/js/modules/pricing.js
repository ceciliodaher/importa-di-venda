/*
PRICING.JS - Módulo de Precificação
Formação de preços de venda com cálculo correto de créditos tributários
Expertzy Inteligência Tributária

Funcionalidades:
- Créditos PIS/COFINS seguem alíquotas da DI
- Detecção automática de adicional 1% COFINS por alíquotas
- Crédito IPI no Real e Presumido (empresas equiparadas à indústria)
- Simples Nacional 2025 - todos impostos DI viram custo
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.pricing = {
        
        // Configurações de regime tributário
        regimesTributarios: {
            "real": {
                "nome": "Lucro Real",
                "pis": 0.0165,      // 1,65%
                "cofins": 0.076,    // 7,6%
                "irpj": 0.15,       // 15% + adicional 10% sobre lucro > R$ 240k
                "csll": 0.09,       // 9%
                "creditoPisCofins": true,
                "creditoIPI": true
            },
            "presumido": {
                "nome": "Lucro Presumido",
                "pis": 0.0065,      // 0,65%
                "cofins": 0.03,     // 3%
                "irpj": 0.15,       // 15% sobre 8% da receita (1,2% efetivo)
                "csll": 0.09,       // 9% sobre 12% da receita (1,08% efetivo)
                "creditoPisCofins": false,
                "creditoIPI": true, // Empresas equiparadas à indústria
                "percentualPresuncaoIRPJ": 0.08,
                "percentualPresuncaoCSLL": 0.12
            },
            "simples": {
                "nome": "Simples Nacional",
                "aliquotaUnificada": true,
                "creditoPisCofins": false,
                "creditoIPI": false,
                "impostosViramCusto": true, // Todos impostos da DI viram custo
                // Anexos do Simples Nacional 2025
                "anexos": {
                    "I": { // Comércio
                        "nome": "Comércio (lojas em geral)",
                        "faixas": [
                            { limite: 180000, aliquota: 0.04, deducao: 0 },
                            { limite: 360000, aliquota: 0.073, deducao: 5940 },
                            { limite: 720000, aliquota: 0.095, deducao: 13860 },
                            { limite: 1800000, aliquota: 0.107, deducao: 22500 },
                            { limite: 3600000, aliquota: 0.143, deducao: 87300 },
                            { limite: 4800000, aliquota: 0.19, deducao: 378000 }
                        ]
                    },
                    "II": { // Indústria
                        "nome": "Fábricas/indústrias e empresas industriais",
                        "faixas": [
                            { limite: 180000, aliquota: 0.045, deducao: 0 },
                            { limite: 360000, aliquota: 0.078, deducao: 5940 },
                            { limite: 720000, aliquota: 0.10, deducao: 13860 },
                            { limite: 1800000, aliquota: 0.112, deducao: 22500 },
                            { limite: 3600000, aliquota: 0.147, deducao: 85500 },
                            { limite: 4800000, aliquota: 0.30, deducao: 720000 }
                        ]
                    },
                    "III": { // Serviços gerais
                        "nome": "Serviços de instalação, reparos e manutenção",
                        "faixas": [
                            { limite: 180000, aliquota: 0.06, deducao: 0 },
                            { limite: 360000, aliquota: 0.112, deducao: 9360 },
                            { limite: 720000, aliquota: 0.135, deducao: 17640 },
                            { limite: 1800000, aliquota: 0.16, deducao: 35640 },
                            { limite: 3600000, aliquota: 0.21, deducao: 125640 },
                            { limite: 4800000, aliquota: 0.33, deducao: 648000 }
                        ]
                    },
                    "IV": { // Serviços específicos
                        "nome": "Limpeza, vigilância, obras, construção",
                        "faixas": [
                            { limite: 180000, aliquota: 0.045, deducao: 0 },
                            { limite: 360000, aliquota: 0.09, deducao: 8100 },
                            { limite: 720000, aliquota: 0.102, deducao: 12420 },
                            { limite: 1800000, aliquota: 0.14, deducao: 39780 },
                            { limite: 3600000, aliquota: 0.22, deducao: 183780 },
                            { limite: 4800000, aliquota: 0.33, deducao: 828000 }
                        ]
                    },
                    "V": { // Serviços profissionais
                        "nome": "Auditoria, jornalismo, tecnologia, publicidade",
                        "faixas": [
                            { limite: 180000, aliquota: 0.155, deducao: 0 },
                            { limite: 360000, aliquota: 0.18, deducao: 4500 },
                            { limite: 720000, aliquota: 0.195, deducao: 9900 },
                            { limite: 1800000, aliquota: 0.205, deducao: 17100 },
                            { limite: 3600000, aliquota: 0.23, deducao: 62100 },
                            { limite: 4800000, aliquota: 0.305, deducao: 540000 }
                        ]
                    }
                }
            }
        },
        
        // Verificar se tem adicional de 1% COFINS baseado nas alíquotas
        verificarAdicional1pctCofins: function(aliquotaPIS, aliquotaCOFINS) {
            // Tolerância para comparação de números decimais
            const tolerancia = 0.0001;
            
            // Serviços com adicional: PIS 1,65% e COFINS 8,6% (7,6% + 1%)
            if (Math.abs(aliquotaPIS - 0.0165) < tolerancia && 
                Math.abs(aliquotaCOFINS - 0.086) < tolerancia) {
                return {
                    temAdicional: true,
                    tipo: 'servicos',
                    aliquotaBase: 0.076,
                    adicional: 0.01
                };
            }
            
            // Bens com adicional: PIS 2,1% e COFINS 10,65% (9,65% + 1%)
            if (Math.abs(aliquotaPIS - 0.021) < tolerancia && 
                Math.abs(aliquotaCOFINS - 0.1065) < tolerancia) {
                return {
                    temAdicional: true,
                    tipo: 'bens',
                    aliquotaBase: 0.0965,
                    adicional: 0.01
                };
            }
            
            return {
                temAdicional: false,
                tipo: null,
                aliquotaBase: aliquotaCOFINS,
                adicional: 0
            };
        },
        
        // Calcular preço de venda baseado no custo e margem desejada
        calcularPrecoVenda: function(dadosImportacao, configuracao) {
            ExpertzyDI.log('PRICING', 'Iniciando cálculo de preço de venda', {
                custoUnitario: dadosImportacao.custoUnitario,
                margemDesejada: configuracao.margemDesejada
            });
            
            const config = this.prepararConfiguracaoPrecificacao(configuracao);
            const resultado = {
                custoUnitario: dadosImportacao.custoUnitario,
                dadosImportacao: dadosImportacao,
                configuracao: config,
                impostos: {},
                creditos: {},
                precos: {},
                margens: {},
                memoria: []
            };
            
            // Passo 1: Ajustar custo com impostos não creditáveis
            const custoAjustado = this.ajustarCustoComImpostosNaoCredinaveis(dadosImportacao, config);
            resultado.custoAjustado = custoAjustado;
            
            // Passo 2: Calcular créditos tributários corretos
            const creditos = this.calcularCreditosTributarios(dadosImportacao, config);
            resultado.creditos = creditos;
            
            // Passo 3: Calcular impostos sobre vendas
            const impostosVenda = this.calcularImpostosVenda(custoAjustado.custoFinal, config);
            resultado.impostos = impostosVenda;
            
            // Passo 4: Formar preço de venda
            const precoFormado = this.formarPrecoVenda(custoAjustado.custoFinal, config, impostosVenda, creditos);
            resultado.precos = precoFormado;
            
            // Passo 5: Verificar margem real obtida
            const margemReal = this.verificarMargemReal(custoAjustado.custoFinal, precoFormado, impostosVenda, creditos);
            resultado.margens = margemReal;
            
            // Passo 6: Gerar memória de cálculo
            resultado.memoria = this.gerarMemoriaCalculoPrecificacao(dadosImportacao, config, resultado);
            
            ExpertzyDI.log('PRICING', 'Precificação concluída', {
                precoVenda: resultado.precos.precoVendaFinal,
                margemReal: resultado.margens.margemRealPercentual
            });
            
            return resultado;
        },
        
        // Preparar configuração de precificação
        prepararConfiguracaoPrecificacao: function(config) {
            return {
                // Margem desejada
                margemDesejada: config?.margemDesejada || 0.30, // 30%
                tipoMargem: config?.tipoMargem || 'bruta', // 'bruta' ou 'liquida'
                
                // Regime tributário
                regime: config?.regime || 'presumido',
                anexoSimples: config?.anexoSimples || 'I', // Para Simples Nacional
                receitaAnual: config?.receitaAnual || 1000000, // Para cálculo Simples
                
                // Tipo de operação
                tipoOperacao: config?.tipoOperacao || 'interestadual',
                estadoDestino: config?.estadoDestino || 'SP',
                
                // Configurações ICMS
                aliquotaICMSVenda: config?.aliquotaICMSVenda || this.obterAliquotaICMSVenda(config),
                aplicarSTVenda: config?.aplicarSTVenda || false,
                
                // Configurações IPI
                aliquotaIPIVenda: config?.aliquotaIPIVenda || 0,
                
                // Despesas operacionais
                despesasOperacionais: config?.despesasOperacionais || 0.05, // 5%
                comissoes: config?.comissoes || 0.02, // 2%
                outrosCustos: config?.outrosCustos || 0.01, // 1%
                
                // Configurações especiais
                impostoPorDentro: config?.impostoPorDentro !== false,
                produtoListaCAMEX: config?.produtoListaCAMEX || false
            };
        },
        
        // Ajustar custo com impostos não creditáveis
        ajustarCustoComImpostosNaoCredinaveis: function(dadosImportacao, config) {
            const ajuste = {
                custoBase: dadosImportacao.custoUnitario,
                impostosNaoCredinaveis: 0,
                custoFinal: dadosImportacao.custoUnitario,
                detalhes: {}
            };
            
            const impostosDI = dadosImportacao.impostos || {};
            
            if (config.regime === 'simples') {
                // No Simples Nacional, TODOS os impostos da DI viram custo
                ajuste.impostosNaoCredinaveis = (impostosDI.II?.valor || 0) +
                                              (impostosDI.IPI?.valor || 0) +
                                              (impostosDI.PIS?.valor || 0) +
                                              (impostosDI.COFINS?.valor || 0) +
                                              (impostosDI.ICMS?.valor || 0);
                
                ajuste.detalhes = {
                    II: impostosDI.II?.valor || 0,
                    IPI: impostosDI.IPI?.valor || 0,
                    PIS: impostosDI.PIS?.valor || 0,
                    COFINS: impostosDI.COFINS?.valor || 0,
                    ICMS: impostosDI.ICMS?.valor || 0,
                    observacao: 'Simples Nacional - todos impostos DI viram custo'
                };
                
            } else if (config.regime === 'presumido') {
                // No Presumido, PIS e COFINS não são creditáveis
                const pisNaoCredito = impostosDI.PIS?.valor || 0;
                const cofinsNaoCredito = impostosDI.COFINS?.valor || 0;
                
                ajuste.impostosNaoCredinaveis = pisNaoCredito + cofinsNaoCredito;
                ajuste.detalhes = {
                    PIS: pisNaoCredito,
                    COFINS: cofinsNaoCredito,
                    observacao: 'Presumido - PIS/COFINS não creditáveis'
                };
                
            } else {
                // Lucro Real - apenas adicional 1% COFINS vira custo (se aplicável)
                const cofinsAdicional1pct = this.calcularCofinsAdicional1Pct(dadosImportacao);
                
                ajuste.impostosNaoCredinaveis = cofinsAdicional1pct;
                ajuste.detalhes = {
                    COFINSAdicional1pct: cofinsAdicional1pct,
                    observacao: cofinsAdicional1pct > 0 ? 
                        'Lucro Real - adicional 1% COFINS vira custo' :
                        'Lucro Real - todos impostos creditáveis'
                };
            }
            
            ajuste.custoFinal = ajuste.custoBase + ajuste.impostosNaoCredinaveis;
            return ajuste;
        },
        
        // Calcular adicional 1% COFINS que vira custo
        calcularCofinsAdicional1Pct: function(dadosImportacao) {
            const impostosDI = dadosImportacao.impostos || {};
            
            const aliquotaPIS = impostosDI.PIS?.aliquota || 0;
            const aliquotaCOFINS = impostosDI.COFINS?.aliquota || 0;
            const baseCOFINS = impostosDI.COFINS?.base || 0;
            
            const verificacao = this.verificarAdicional1pctCofins(aliquotaPIS, aliquotaCOFINS);
            
            if (verificacao.temAdicional) {
                const adicional1pct = baseCOFINS * verificacao.adicional;
                
                ExpertzyDI.log('PRICING', 'Adicional 1% COFINS detectado', {
                    tipo: verificacao.tipo,
                    aliquotaPIS: (aliquotaPIS * 100).toFixed(2) + '%',
                    aliquotaCOFINS: (aliquotaCOFINS * 100).toFixed(2) + '%',
                    base: baseCOFINS,
                    adicional: adicional1pct
                });
                
                return adicional1pct;
            }
            
            return 0;
        },
        
        // Calcular créditos tributários corretos
        calcularCreditosTributarios: function(dadosImportacao, config) {
            const creditos = {
                creditoPIS: 0,
                creditoCOFINS: 0,
                creditoIPI: 0,
                creditoICMS: 0,
                total: 0,
                detalhes: {}
            };
            
            const regime = this.regimesTributarios[config.regime];
            const impostosDI = dadosImportacao.impostos || {};
            
            if (config.regime === 'real') {
                // LUCRO REAL: Direito a créditos
                
                // Crédito PIS = valor integral da DI
                if (impostosDI.PIS) {
                    creditos.creditoPIS = impostosDI.PIS.valor;
                    creditos.detalhes.creditoPIS = `Crédito PIS ${(impostosDI.PIS.aliquota * 100).toFixed(2)}%`;
                }
                
                // Crédito COFINS = valor da DI EXCETO adicional de 1%
                if (impostosDI.COFINS) {
                    const aliquotaPIS = impostosDI.PIS?.aliquota || 0;
                    const aliquotaCOFINS = impostosDI.COFINS.aliquota;
                    const verificacao = this.verificarAdicional1pctCofins(aliquotaPIS, aliquotaCOFINS);
                    
                    if (verificacao.temAdicional) {
                        // Há adicional: crédito apenas da parte base
                        const baseCOFINS = impostosDI.COFINS.base;
                        const creditoBase = baseCOFINS * verificacao.aliquotaBase;
                        creditos.creditoCOFINS = creditoBase;
                        creditos.detalhes.creditoCOFINS = `Crédito COFINS ${(verificacao.aliquotaBase * 100).toFixed(2)}% (exceto adicional 1%)`;
                    } else {
                        // Sem adicional: crédito integral
                        creditos.creditoCOFINS = impostosDI.COFINS.valor;
                        creditos.detalhes.creditoCOFINS = `Crédito COFINS ${(aliquotaCOFINS * 100).toFixed(2)}%`;
                    }
                }
                
                // Crédito IPI = valor integral (empresas equiparadas à indústria)
                if (impostosDI.IPI) {
                    creditos.creditoIPI = impostosDI.IPI.valor;
                    creditos.detalhes.creditoIPI = 'Empresa equiparada à indústria';
                }
                
                // Crédito ICMS (se aplicável)
                if (impostosDI.ICMS) {
                    creditos.creditoICMS = impostosDI.ICMS.valor;
                    creditos.detalhes.creditoICMS = 'Crédito ICMS da importação';
                }
                
            } else if (config.regime === 'presumido') {
                // LUCRO PRESUMIDO: Apenas crédito de IPI
                
                if (impostosDI.IPI) {
                    creditos.creditoIPI = impostosDI.IPI.valor;
                    creditos.detalhes.creditoIPI = 'Empresa equiparada à indústria (Presumido)';
                }
                
                creditos.detalhes.observacao = 'Presumido - sem crédito PIS/COFINS';
                
            } else {
                // SIMPLES NACIONAL: Sem créditos (todos impostos já viraram custo)
                creditos.detalhes.observacao = 'Simples Nacional - sem direito a créditos';
            }
            
            creditos.total = creditos.creditoPIS + creditos.creditoCOFINS + creditos.creditoIPI + creditos.creditoICMS;
            
            return creditos;
        },
        
        // Obter alíquota ICMS para venda
        obterAliquotaICMSVenda: function(config) {
            if (config?.tipoOperacao === 'interestadual') {
                return config?.produtoListaCAMEX ? 0.12 : 0.04;
            } else {
                const estado = config?.estadoDestino || 'SP';
                const aliquotasEstados = ExpertzyDI.constants.ALIQ_ICMS_ESTADOS;
                return aliquotasEstados[estado]?.aliquota || 0.18;
            }
        },
        
        // Calcular impostos sobre vendas
        calcularImpostosVenda: function(custoAjustado, config) {
            const regime = this.regimesTributarios[config.regime];
            const impostos = {
                regime: config.regime,
                pis: 0,
                cofins: 0,
                icms: 0,
                ipi: 0,
                irpj: 0,
                csll: 0,
                simplesNacional: 0,
                total: 0
            };
            
            // Base de cálculo (preço de venda - será ajustado iterativamente)
            let baseCalculo = custoAjustado * (1 + config.margemDesejada);
            
            if (config.regime === 'simples') {
                // Simples Nacional - alíquota única por anexo e faixa
                const aliquotaSimples = this.obterAliquotaSimples(config.receitaAnual, config.anexoSimples);
                const valorDeducao = this.obterValorDeducaoSimples(config.receitaAnual, config.anexoSimples);
                
                // Cálculo: (Receita × Alíquota) - Valor a Deduzir
                impostos.simplesNacional = Math.max(0, (baseCalculo * aliquotaSimples) - (valorDeducao / 12));
                impostos.total = impostos.simplesNacional;
                
                impostos.detalhes = {
                    anexo: config.anexoSimples,
                    aliquota: aliquotaSimples,
                    valorDeducaoMensal: valorDeducao / 12
                };
                
            } else {
                // Regime Real ou Presumido
                impostos.pis = baseCalculo * regime.pis;
                impostos.cofins = baseCalculo * regime.cofins;
                impostos.icms = baseCalculo * config.aliquotaICMSVenda;
                impostos.ipi = baseCalculo * config.aliquotaIPIVenda;
                
                if (config.regime === 'presumido') {
                    impostos.irpj = baseCalculo * regime.percentualPresuncaoIRPJ * regime.irpj;
                    impostos.csll = baseCalculo * regime.percentualPresuncaoCSLL * regime.csll;
                }
                
                impostos.total = impostos.pis + impostos.cofins + impostos.icms + impostos.ipi + impostos.irpj + impostos.csll;
            }
            
            return impostos;
        },
        
        // Obter alíquota do Simples Nacional
        obterAliquotaSimples: function(receitaAnual, anexo) {
            const anexoConfig = this.regimesTributarios.simples.anexos[anexo];
            if (!anexoConfig) return 0.04; // Default primeira faixa
            
            for (const faixa of anexoConfig.faixas) {
                if (receitaAnual <= faixa.limite) {
                    return faixa.aliquota;
                }
            }
            
            // Se ultrapassar todas as faixas, usar a última
            const ultimaFaixa = anexoConfig.faixas[anexoConfig.faixas.length - 1];
            return ultimaFaixa.aliquota;
        },
        
        // Obter valor de dedução do Simples Nacional
        obterValorDeducaoSimples: function(receitaAnual, anexo) {
            const anexoConfig = this.regimesTributarios.simples.anexos[anexo];
            if (!anexoConfig) return 0;
            
            for (const faixa of anexoConfig.faixas) {
                if (receitaAnual <= faixa.limite) {
                    return faixa.deducao;
                }
            }
            
            const ultimaFaixa = anexoConfig.faixas[anexoConfig.faixas.length - 1];
            return ultimaFaixa.deducao;
        },
        
        // Formar preço de venda
        formarPrecoVenda: function(custoAjustado, config, impostos, creditos) {
            const precos = {};
            
            // Custo base + despesas operacionais
            const custoComDespesas = custoAjustado * (1 + config.despesasOperacionais + config.comissoes + config.outrosCustos);
            precos.custoComDespesas = custoComDespesas;
            
            if (config.impostoPorDentro) {
                // IMPOSTOS POR DENTRO: Preço = (Custo + Margem) / (1 - Alíquota Total)
                const margemDesejada = custoComDespesas * config.margemDesejada;
                const custoMaisMargem = custoComDespesas + margemDesejada;
                
                // Calcular alíquota total de impostos
                let aliquotaTotal = 0;
                if (config.regime === 'simples') {
                    aliquotaTotal = this.obterAliquotaSimples(config.receitaAnual, config.anexoSimples);
                } else {
                    const regime = this.regimesTributarios[config.regime];
                    aliquotaTotal = regime.pis + regime.cofins + config.aliquotaICMSVenda + config.aliquotaIPIVenda;
                    
                    if (config.regime === 'presumido') {
                        aliquotaTotal += regime.percentualPresuncaoIRPJ * regime.irpj;
                        aliquotaTotal += regime.percentualPresuncaoCSLL * regime.csll;
                    }
                }
                
                // Considerar créditos no cálculo
                const creditosPorReal = creditos.total / custoComDespesas;
                const aliquotaLiquida = Math.max(0, aliquotaTotal - creditosPorReal);
                
                precos.precoVendaBruto = custoMaisMargem / (1 - aliquotaLiquida);
                precos.impostosTotais = precos.precoVendaBruto * aliquotaTotal;
                precos.creditosTotais = creditos.total;
                precos.precoVendaFinal = precos.precoVendaBruto;
                
            } else {
                // IMPOSTOS POR FORA: Preço = Custo + Margem + Impostos - Créditos
                const margemDesejada = custoComDespesas * config.margemDesejada;
                const precoBase = custoComDespesas + margemDesejada;
                
                precos.precoVendaBruto = precoBase;
                precos.impostosTotais = impostos.total;
                precos.creditosTotais = creditos.total;
                precos.precoVendaFinal = precoBase + impostos.total - creditos.total;
            }
            
            return precos;
        },
        
        // Verificar margem real obtida
        verificarMargemReal: function(custoAjustado, precos, impostos, creditos) {
            const margens = {};
            
            // Receita líquida (preço de venda - impostos + créditos)
            const receitaLiquida = precos.precoVendaFinal - impostos.total + creditos.total;
            
            // Margem bruta
            margens.margemBruta = receitaLiquida - custoAjustado;
            margens.margemBrutaPercentual = (margens.margemBruta / receitaLiquida) * 100;
            
            // Margem líquida (considerando despesas operacionais)
            const despesasOperacionais = precos.precoVendaFinal * 0.08;
            margens.margemLiquida = margens.margemBruta - despesasOperacionais;
            margens.margemLiquidaPercentual = (margens.margemLiquida / receitaLiquida) * 100;
            
            // Margem real (percentual sobre preço de venda)
            margens.margemReal = precos.precoVendaFinal - custoAjustado - impostos.total + creditos.total - despesasOperacionais;
            margens.margemRealPercentual = (margens.margemReal / precos.precoVendaFinal) * 100;
            
            // Markup
            margens.markup = (precos.precoVendaFinal / custoAjustado) - 1;
            margens.markupPercentual = margens.markup * 100;
            
            return margens;
        },
        
        // Gerar memória de cálculo de precificação
        gerarMemoriaCalculoPrecificacao: function(dadosImportacao, config, resultado) {
            const memoria = [];
            
            memoria.push({
                passo: 1,
                descricao: 'Custo unitário da importação',
                valor: dadosImportacao.custoUnitario,
                formula: 'Custo calculado pelo módulo cost-calculator'
            });
            
            memoria.push({
                passo: 2,
                descricao: 'Ajuste por impostos não creditáveis',
                valor: resultado.custoAjustado.custoFinal,
                detalhes: resultado.custoAjustado.detalhes,
                formula: 'Custo base + impostos que viram custo'
            });
            
            // Verificar se tem adicional COFINS para detalhar
            const impostosDI = dadosImportacao.impostos || {};
            const aliquotaPIS = impostosDI.PIS?.aliquota || 0;
            const aliquotaCOFINS = impostosDI.COFINS?.aliquota || 0;
            const verificacaoAdicional = this.verificarAdicional1pctCofins(aliquotaPIS, aliquotaCOFINS);
            
            if (verificacaoAdicional.temAdicional) {
                memoria.push({
                    passo: '2.1',
                    descricao: 'Detecção adicional 1% COFINS',
                    detalhes: {
                        aliquotaPIS: (aliquotaPIS * 100).toFixed(2) + '%',
                        aliquotaCOFINS: (aliquotaCOFINS * 100).toFixed(2) + '%',
                        tipo: verificacaoAdicional.tipo,
                        aliquotaBase: (verificacaoAdicional.aliquotaBase * 100).toFixed(2) + '%',
                        adicional: (verificacaoAdicional.adicional * 100).toFixed(2) + '%'
                    },
                    observacao: 'Adicional de 1% detectado automaticamente pelas alíquotas'
                });
            }
            
            memoria.push({
                passo: 3,
                descricao: 'Créditos tributários disponíveis',
                valor: resultado.creditos.total,
                detalhes: resultado.creditos.detalhes,
                observacao: `Regime: ${config.regime}`
            });
            
            memoria.push({
                passo: 4,
                descricao: 'Impostos sobre vendas',
                valor: resultado.impostos.total,
                regime: config.regime
            });
            
            memoria.push({
                passo: 5,
                descricao: 'Preço de venda final',
                valor: resultado.precos.precoVendaFinal,
                formula: config.impostoPorDentro ? 
                    'Impostos por dentro: (Custo + Margem) / (1 - Alíq. Total)' :
                    'Impostos por fora: Custo + Margem + Impostos - Créditos'
            });
            
            memoria.push({
                passo: 6,
                descricao: 'Margem real obtida',
                valor: resultado.margens.margemRealPercentual,
                detalhes: {
                    margemBruta: resultado.margens.margemBrutaPercentual.toFixed(2) + '%',
                    margemLiquida: resultado.margens.margemLiquidaPercentual.toFixed(2) + '%',
                    markup: resultado.margens.markupPercentual.toFixed(2) + '%'
                }
            });
            
            return memoria;
        },
        
        // Análise comparativa de regimes tributários
        analisarRegimesTributarios: function(dadosImportacao, configuracao) {
            const analise = {
                configuracao: configuracao,
                resultados: {}
            };
            
            const regimes = ['real', 'presumido', 'simples'];
            
            regimes.forEach(regime => {
                const configRegime = { ...configuracao, regime: regime };
                const resultado = this.calcularPrecoVenda(dadosImportacao, configRegime);
                
                analise.resultados[regime] = {
                    precoVenda: resultado.precos.precoVendaFinal,
                    margemReal: resultado.margens.margemRealPercentual,
                    impostos: resultado.impostos.total,
                    creditos: resultado.creditos.total,
                    custoAjustado: resultado.custoAjustado.custoFinal
                };
            });
            
            // Identificar regime mais vantajoso
            let melhorRegime = null;
            let melhorMargem = -Infinity;
            
            Object.entries(analise.resultados).forEach(([regime, dados]) => {
                if (dados.margemReal > melhorMargem) {
                    melhorMargem = dados.margemReal;
                    melhorRegime = regime;
                }
            });
            
            analise.recomendacao = {
                regime: melhorRegime,
                margem: melhorMargem,
                motivo: `Maior margem real: ${melhorMargem.toFixed(2)}%`
            };
            
            return analise;
        }
    };
    
})(window.ExpertzyDI);