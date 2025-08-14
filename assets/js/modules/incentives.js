/*
INCENTIVES.JS - Sistema de Incentivos Fiscais por Estado
Cálculo transparente com aplicação de créditos e reduções de base
Expertzy Inteligência Tributária

Estados suportados:
- Goiás (COMEXPRODUZIR): Crédito outorgado 65% + redução base vendas internas
- Santa Catarina (TTD 409): Alíquotas progressivas
- Espírito Santo (INVEST-ES): Diferimento + redução 75%
- Minas Gerais (Corredor MG): Crédito presumido variável
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.incentives = {
        
        // Configurações detalhadas dos incentivos por estado
        programasIncentivos: {
            "GO": {
                "nome": "COMEXPRODUZIR",
                "descricao": "Crédito outorgado de 65% sobre o ICMS devido nas operações interestaduais + redução de base nas vendas internas",
                "tipo": "credito_outorgado_reducao_base",
                "ativo": true,
                "vigencia": {
                    "inicio": "2024-01-01",
                    "fim": "2032-12-31"
                },
                "parametros": {
                    // Vendas interestaduais
                    "aliquota_interestadual_4": 0.04,    // 4% (regra geral - similar nacional)
                    "aliquota_interestadual_12": 0.12,   // 12% (lista CAMEX - produtos específicos)
                    "credito_outorgado_pct": 0.65,       // 65% crédito outorgado
                    
                    // Vendas internas - redução de base para atingir 4% efetivo
                    "aliquota_interna": 0.19,           // 19% (normal)
                    "reducao_base_interna": 0.789474,   // Redução para atingir 4% efetivo (19% × (1-0.789474) = 4%)
                    "carga_efetiva_interna": 0.04,      // 4% efetivo
                    
                    "contrapartidas": {
                        "FUNPRODUZIR": 0.005, // 0,5% sobre base ICMS
                        "PROTEGE": 0.015      // 1,5% sobre base ICMS
                    }
                },
                "cargas_efetivas": {
                    "interestadual_4": 0.014,   // 4% × (1-0.65) = 1,4%
                    "interestadual_12": 0.042,  // 12% × (1-0.65) = 4,2%
                    "interna": 0.04             // 4% com redução de base
                },
                "observacoes": {
                    "aliquota_4": "Produtos com similar nacional (regra geral)",
                    "aliquota_12": "Produtos específicos da lista CAMEX",
                    "verificacao_lista": "Necessário verificar NCM na lista CAMEX vigente"
                },
                "requisitos": [
                    "Importação para industrialização",
                    "Saída interestadual do produto industrializado",
                    "Manutenção de pelo menos 200 empregos diretos"
                ]
            },
            
            "SC": {
                "nome": "TTD 409",
                "descricao": "Tratamento Tributário Diferenciado com alíquotas progressivas por período",
                "tipo": "aliquota_diferenciada",
                "ativo": true,
                "vigencia": {
                    "inicio": "2024-01-01",
                    "fim": "2030-12-31"
                },
                "parametros": {
                    "aliquota_normal": 0.17,                    // 17% alíquota normal SC
                    "aliquota_incentivada_fase1": 0.026,        // 2,6% até 2026
                    "aliquota_incentivada_fase2": 0.01,         // 1,0% após 2026
                    "data_mudanca_fase": "2027-01-01",
                    "contrapartidas": {
                        "Fundo_Educacao": 0.004 // 0,4% sobre base ICMS
                    }
                },
                "cargas_efetivas": {
                    "fase1": 0.030,  // 2,6% + 0,4% contrapartida = 3,0%
                    "fase2": 0.014   // 1,0% + 0,4% contrapartida = 1,4%
                },
                "requisitos": [
                    "Importação através de portos catarinenses",
                    "Industrialização em Santa Catarina",
                    "Percentual mínimo de vendas interestaduais"
                ]
            },
            
            "ES": {
                "nome": "INVEST-ES Importação",
                "descricao": "Diferimento total do ICMS na importação + redução de 75% na base das saídas para CD",
                "tipo": "diferimento_reducao_base",
                "ativo": true,
                "vigencia": {
                    "inicio": "2024-01-01",
                    "fim": "2035-12-31"
                },
                "parametros": {
                    "diferimento_importacao": true,
                    "aliquota_normal": 0.17,            // 17% alíquota normal ES
                    "reducao_base_saida": 0.75,         // 75% redução na base das saídas
                    "carga_efetiva_saida": 0.0425,      // 17% × (1-0.75) = 4,25%
                    "contrapartidas": {
                        "Taxa_Administrativa": 0.005 // 0,5% sobre base ICMS
                    }
                },
                "cargas_efetivas": {
                    "importacao": 0.0,       // Diferimento total
                    "saida_cd": 0.0475       // 4,25% + 0,5% taxa = 4,75%
                },
                "requisitos": [
                    "Importação direta pelo porto de Vitória",
                    "Instalação de Centro de Distribuição",
                    "Investimento mínimo de R$ 5 milhões"
                ]
            },
            
            "MG": {
                "nome": "Corredor de Importação MG",
                "descricao": "Diferimento na importação + crédito presumido nas saídas conforme similaridade",
                "tipo": "credito_presumido_diferenciado",
                "ativo": true,
                "vigencia": {
                    "inicio": "2024-01-01",
                    "fim": "2028-12-31"
                },
                "parametros": {
                    "diferimento_importacao": true,
                    "aliquota_normal": 0.18,                        // 18% alíquota normal MG
                    
                    // Alíquotas interestaduais corretas
                    "aliquota_interestadual_4": 0.04,               // 4% (similar nacional)
                    "aliquota_interestadual_12": 0.12,              // 12% (lista CAMEX)
                    
                    // Créditos presumidos conforme destino e similaridade
                    "credito_interestadual_com_similar": 0.03,      // 3%
                    "credito_interno_com_similar": 0.06,            // 6%
                    "credito_interestadual_sem_similar": 0.025,     // 2,5%
                    "credito_interno_sem_similar": 0.05             // 5%
                },
                "cargas_efetivas": {
                    "importacao": 0.0,                      // Diferimento total
                    "interestadual_com_similar": 0.01,      // 4% - 3% = 1%
                    "interno_com_similar": 0.12,            // 18% - 6% = 12%
                    "interestadual_sem_similar": 0.095,     // 12% - 2,5% = 9,5%
                    "interno_sem_similar": 0.13             // 18% - 5% = 13%
                },
                "requisitos": [
                    "Importação através de portos específicos",
                    "Industrialização em Minas Gerais",
                    "Classificação de similar nacional definida"
                ]
            }
        },
        
        // Aplicar incentivos fiscais aos resultados
        aplicarIncentivos: function(resultados, config) {
            ExpertzyDI.log('INCENTIVES', 'Iniciando aplicação de incentivos fiscais', {
                estado: config.estado,
                adicoes: resultados.adicoes.length
            });
            
            const programa = this.programasIncentivos[config.estado];
            if (!programa || !programa.ativo) {
                ExpertzyDI.log('INCENTIVES', 'Nenhum incentivo ativo para o estado', { estado: config.estado });
                return resultados;
            }
            
            // Verificar vigência
            if (!this.verificarVigencia(programa)) {
                ExpertzyDI.log('INCENTIVES', 'Programa fora do período de vigência', { programa: programa.nome });
                return resultados;
            }
            
            // Aplicar incentivo conforme o tipo
            switch (programa.tipo) {
                case 'credito_outorgado_reducao_base':
                    this.aplicarCreditoOutorgadoReducaoBase(resultados, programa, config);
                    break;
                case 'aliquota_diferenciada':
                    this.aplicarAliquotaDiferenciada(resultados, programa, config);
                    break;
                case 'diferimento_reducao_base':
                    this.aplicarDiferimentoReducaoBase(resultados, programa, config);
                    break;
                case 'credito_presumido_diferenciado':
                    this.aplicarCreditoPresumidoDiferenciado(resultados, programa, config);
                    break;
                default:
                    ExpertzyDI.log('INCENTIVES', 'Tipo de incentivo não reconhecido', { tipo: programa.tipo });
            }
            
            // Registrar aplicação do incentivo
            this.registrarAplicacaoIncentivo(resultados, programa, config);
            
            return resultados;
        },
        
        // Verificar se o programa está dentro da vigência
        verificarVigencia: function(programa) {
            const agora = new Date();
            const inicio = new Date(programa.vigencia.inicio);
            const fim = new Date(programa.vigencia.fim);
            
            return agora >= inicio && agora <= fim;
        },
        
        // Determinar alíquota interestadual baseada no NCM
        determinarAliquotaInterestadual: function(ncm, config) {
            // Por padrão, usar 4% (similar nacional)
            // TODO: Implementar verificação da lista CAMEX para produtos específicos que usam 12%
            const produtoListaCAMEX = config?.produtoListaCAMEX || false;
            
            return produtoListaCAMEX ? 0.12 : 0.04;
        },
        
        // Aplicar crédito outorgado e redução de base (Goiás - COMEXPRODUZIR)
        aplicarCreditoOutorgadoReducaoBase: function(resultados, programa, config) {
            ExpertzyDI.log('INCENTIVES', 'Aplicando COMEXPRODUZIR - Cálculo transparente');
            
            // Configuração padrão: assumir operação interestadual
            const tipoOperacao = config.tipoOperacao || 'interestadual';
            
            resultados.adicoes.forEach(adicao => {
                const icmsOriginal = adicao.impostos.ICMS.valor;
                const baseICMS = adicao.impostos.ICMS.base;
                
                if (icmsOriginal > 0 && baseICMS > 0) {
                    let icmsFinal, creditoOutorgado, reducaoBase, memoria;
                    
                    if (tipoOperacao === 'interestadual') {
                        // OPERAÇÕES INTERESTADUAIS: Determinar alíquota correta (4% ou 12%)
                        const aliquotaInterestadual = this.determinarAliquotaInterestadual(adicao.codigoNCM, config);
                        const icmsCalculado = baseICMS * aliquotaInterestadual;
                        creditoOutorgado = icmsCalculado * programa.parametros.credito_outorgado_pct;
                        icmsFinal = icmsCalculado - creditoOutorgado;
                        
                        const tipoAliquota = aliquotaInterestadual === 0.04 ? 'similar_nacional' : 'lista_camex';
                        
                        memoria = {
                            tipo: 'credito_outorgado',
                            baseICMS: baseICMS,
                            aliquotaInterestadual: aliquotaInterestadual,
                            tipoAliquota: tipoAliquota,
                            icmsCalculado: icmsCalculado,
                            creditoOutorgado: creditoOutorgado,
                            percentualCredito: programa.parametros.credito_outorgado_pct,
                            formula: `ICMS = (Base × ${(aliquotaInterestadual*100).toFixed(0)}%) - Crédito Outorgado (${(programa.parametros.credito_outorgado_pct*100)}%)`,
                            observacao: tipoAliquota === 'similar_nacional' ? 
                                'Produto com similar nacional - alíquota 4%' : 
                                'Produto da lista CAMEX - alíquota 12%'
                        };
                        
                    } else {
                        // OPERAÇÕES INTERNAS: Aplicar redução de base para atingir 4% efetivo
                        const aliquotaInterna = programa.parametros.aliquota_interna;
                        const reducaoBasePct = programa.parametros.reducao_base_interna;
                        const baseReduzida = baseICMS * (1 - reducaoBasePct);
                        icmsFinal = baseReduzida * aliquotaInterna;
                        creditoOutorgado = 0;
                        reducaoBase = baseICMS - baseReduzida;
                        
                        memoria = {
                            tipo: 'reducao_base',
                            baseICMS: baseICMS,
                            reducaoBase: reducaoBase,
                            baseReduzida: baseReduzida,
                            aliquotaNormal: aliquotaInterna,
                            cargaEfetiva: programa.parametros.carga_efetiva_interna,
                            formula: `ICMS = Base Reduzida (${((1-reducaoBasePct)*100).toFixed(1)}%) × ${(aliquotaInterna*100)}% = ${(programa.parametros.carga_efetiva_interna*100)}% efetivo`
                        };
                    }
                    
                    // Calcular contrapartidas sobre a base original
                    const contrapartidas = this.calcularContrapartidas(baseICMS, programa.parametros.contrapartidas);
                    
                    // Atualizar adição com cálculo transparente
                    adicao.impostos.ICMS.valor = icmsFinal;
                    adicao.impostos.ICMS.valorOriginal = icmsOriginal;
                    adicao.impostos.ICMS.calculoTransparente = memoria;
                    
                    adicao.incentivo = {
                        programa: programa.nome,
                        tipo: tipoOperacao,
                        estado: 'GO',
                        icmsOriginal: icmsOriginal,
                        icmsFinal: icmsFinal,
                        creditoOutorgado: creditoOutorgado || 0,
                        reducaoBase: reducaoBase || 0,
                        contrapartidas: contrapartidas,
                        economia: icmsOriginal - icmsFinal - contrapartidas.total,
                        memoriaCalculo: memoria
                    };
                    
                    // Recalcular custo total
                    const diferencaICMS = icmsOriginal - icmsFinal;
                    adicao.custoTotal -= diferencaICMS;
                    adicao.custoTotal += contrapartidas.total;
                    adicao.custoUnitario = adicao.custoTotal / adicao.quantidadeTotal;
                    
                    // Atualizar itens proporcionalmente
                    this.atualizarItensComIncentivo(adicao, diferencaICMS, contrapartidas.total);
                    
                    ExpertzyDI.log('INCENTIVES', 'COMEXPRODUZIR aplicado', {
                        adicao: adicao.numeroAdicao,
                        tipo: tipoOperacao,
                        aliquota: memoria.aliquotaInterestadual ? `${(memoria.aliquotaInterestadual*100)}%` : 'N/A',
                        economia: adicao.incentivo.economia.toFixed(2),
                        contrapartidas: contrapartidas.total.toFixed(2)
                    });
                }
            });
        },
        
        // Aplicar alíquota diferenciada (Santa Catarina - TTD 409)
        aplicarAliquotaDiferenciada: function(resultados, programa, config) {
            ExpertzyDI.log('INCENTIVES', 'Aplicando TTD 409 - Alíquota diferenciada por fase');
            
            // Determinar fase do programa
            const agora = new Date();
            const dataMudanca = new Date(programa.parametros.data_mudanca_fase);
            const fase = agora < dataMudanca ? 'fase1' : 'fase2';
            const aliquotaIncentivada = fase === 'fase1' ? 
                programa.parametros.aliquota_incentivada_fase1 : 
                programa.parametros.aliquota_incentivada_fase2;
            
            resultados.adicoes.forEach(adicao => {
                const icmsOriginal = adicao.impostos.ICMS.valor;
                const baseICMS = adicao.impostos.ICMS.base;
                
                if (icmsOriginal > 0 && baseICMS > 0) {
                    // Calcular ICMS com alíquota incentivada
                    const icmsComIncentivo = baseICMS * aliquotaIncentivada;
                    
                    // Calcular contrapartidas
                    const contrapartidas = this.calcularContrapartidas(baseICMS, programa.parametros.contrapartidas);
                    
                    const memoria = {
                        tipo: 'aliquota_diferenciada',
                        fase: fase,
                        baseICMS: baseICMS,
                        aliquotaNormal: programa.parametros.aliquota_normal,
                        aliquotaIncentivada: aliquotaIncentivada,
                        formula: `ICMS = Base × ${(aliquotaIncentivada*100).toFixed(1)}% (${fase})`,
                        vigencia: fase === 'fase1' ? 'até 2026' : 'após 2026'
                    };
                    
                    // Atualizar adição
                    adicao.impostos.ICMS.valor = icmsComIncentivo;
                    adicao.impostos.ICMS.valorOriginal = icmsOriginal;
                    adicao.impostos.ICMS.calculoTransparente = memoria;
                    
                    adicao.incentivo = {
                        programa: programa.nome,
                        estado: 'SC',
                        fase: fase,
                        icmsOriginal: icmsOriginal,
                        icmsFinal: icmsComIncentivo,
                        aliquotaAplicada: aliquotaIncentivada,
                        contrapartidas: contrapartidas,
                        economia: icmsOriginal - icmsComIncentivo - contrapartidas.total,
                        memoriaCalculo: memoria
                    };
                    
                    // Recalcular custo total
                    const diferencaICMS = icmsOriginal - icmsComIncentivo;
                    adicao.custoTotal -= diferencaICMS;
                    adicao.custoTotal += contrapartidas.total;
                    adicao.custoUnitario = adicao.custoTotal / adicao.quantidadeTotal;
                    
                    // Atualizar itens proporcionalmente
                    this.atualizarItensComIncentivo(adicao, diferencaICMS, contrapartidas.total);
                    
                    ExpertzyDI.log('INCENTIVES', 'TTD 409 aplicado', {
                        adicao: adicao.numeroAdicao,
                        fase: fase,
                        aliquota: (aliquotaIncentivada*100).toFixed(1) + '%',
                        economia: adicao.incentivo.economia.toFixed(2)
                    });
                }
            });
        },
        
        // Aplicar diferimento e redução de base (Espírito Santo - INVEST-ES)
        aplicarDiferimentoReducaoBase: function(resultados, programa, config) {
            ExpertzyDI.log('INCENTIVES', 'Aplicando INVEST-ES - Diferimento + redução base');
            
            resultados.adicoes.forEach(adicao => {
                const icmsOriginal = adicao.impostos.ICMS.valor;
                const baseICMS = adicao.impostos.ICMS.base;
                
                if (icmsOriginal > 0 && baseICMS > 0) {
                    // Na importação: diferimento total (ICMS = 0)
                    const icmsImportacao = 0;
                    
                    // Para saída CD: aplicar redução de 75% na base
                    const aliquotaNormal = programa.parametros.aliquota_normal;
                    const reducaoBase = programa.parametros.reducao_base_saida;
                    const baseReduzidaCD = baseICMS * (1 - reducaoBase);
                    const icmsSaidaCD = baseReduzidaCD * aliquotaNormal;
                    
                    // Calcular contrapartidas
                    const contrapartidas = this.calcularContrapartidas(baseICMS, programa.parametros.contrapartidas);
                    
                    const memoria = {
                        tipo: 'diferimento_reducao_base',
                        baseICMS: baseICMS,
                        diferimentoImportacao: icmsOriginal,
                        reducaoBaseSaida: reducaoBase,
                        baseReduzidaCD: baseReduzidaCD,
                        aliquotaNormal: aliquotaNormal,
                        icmsSaidaCD: icmsSaidaCD,
                        formula: `Importação: Diferimento total | Saída CD: Base × (1-75%) × 17% = ${(programa.parametros.carga_efetiva_saida*100).toFixed(2)}%`
                    };
                    
                    // Atualizar adição (diferimento na importação)
                    adicao.impostos.ICMS.valor = icmsImportacao;
                    adicao.impostos.ICMS.valorOriginal = icmsOriginal;
                    adicao.impostos.ICMS.diferido = icmsOriginal;
                    adicao.impostos.ICMS.calculoTransparente = memoria;
                    
                    adicao.incentivo = {
                        programa: programa.nome,
                        estado: 'ES',
                        icmsOriginal: icmsOriginal,
                        icmsImportacao: icmsImportacao,
                        icmsDiferido: icmsOriginal,
                        icmsSaidaCD: icmsSaidaCD,
                        contrapartidas: contrapartidas,
                        economia: icmsOriginal - contrapartidas.total, // Economia total na importação
                        memoriaCalculo: memoria
                    };
                    
                    // Recalcular custo total (sem ICMS na importação, mas com contrapartidas)
                    adicao.custoTotal -= icmsOriginal;
                    adicao.custoTotal += contrapartidas.total;
                    adicao.custoUnitario = adicao.custoTotal / adicao.quantidadeTotal;
                    
                    // Atualizar itens proporcionalmente
                    this.atualizarItensComIncentivo(adicao, icmsOriginal, contrapartidas.total);
                    
                    ExpertzyDI.log('INCENTIVES', 'INVEST-ES aplicado', {
                        adicao: adicao.numeroAdicao,
                        diferimento: icmsOriginal.toFixed(2),
                        economia: adicao.incentivo.economia.toFixed(2)
                    });
                }
            });
        },
        
        // Aplicar crédito presumido diferenciado (Minas Gerais - Corredor MG)
        aplicarCreditoPresumidoDiferenciado: function(resultados, programa, config) {
            ExpertzyDI.log('INCENTIVES', 'Aplicando Corredor MG - Crédito presumido diferenciado');
            
            // Configuração padrão
            const tipoOperacao = config.tipoOperacao || 'interestadual_com_similar';
            const creditoPresumido = programa.parametros[`credito_${tipoOperacao}`];
            
            resultados.adicoes.forEach(adicao => {
                const icmsOriginal = adicao.impostos.ICMS.valor;
                const baseICMS = adicao.impostos.ICMS.base;
                
                if (icmsOriginal > 0 && baseICMS > 0) {
                    // Na importação: diferimento total
                    const icmsImportacao = 0;
                    
                    // Na saída: calcular crédito presumido
                    const valorCreditoPresumido = baseICMS * creditoPresumido;
                    
                    // Para cálculo da carga efetiva, usar alíquota interestadual correta
                    const aliquotaSaida = tipoOperacao.includes('interestadual') ? 
                        this.determinarAliquotaInterestadual(adicao.codigoNCM, config) : 
                        programa.parametros.aliquota_normal;
                    
                    const memoria = {
                        tipo: 'credito_presumido_diferenciado',
                        baseICMS: baseICMS,
                        diferimentoImportacao: icmsOriginal,
                        tipoOperacao: tipoOperacao,
                        aliquotaSaida: aliquotaSaida,
                        percentualCredito: creditoPresumido,
                        valorCreditoPresumido: valorCreditoPresumido,
                        formula: `Importação: Diferimento total | Saída: Crédito ${(creditoPresumido*100).toFixed(1)}% (${tipoOperacao.replace('_', ' ')})`,
                        cargaEfetivaSaida: aliquotaSaida - creditoPresumido
                    };
                    
                    // Atualizar adição (diferimento na importação)
                    adicao.impostos.ICMS.valor = icmsImportacao;
                    adicao.impostos.ICMS.valorOriginal = icmsOriginal;
                    adicao.impostos.ICMS.diferido = icmsOriginal;
                    adicao.impostos.ICMS.calculoTransparente = memoria;
                    
                    adicao.incentivo = {
                        programa: programa.nome,
                        estado: 'MG',
                        icmsOriginal: icmsOriginal,
                        icmsImportacao: icmsImportacao,
                        icmsDiferido: icmsOriginal,
                        tipoOperacao: tipoOperacao,
                        creditoPresumido: valorCreditoPresumido,
                        economia: icmsOriginal, // Economia total na importação
                        memoriaCalculo: memoria
                    };
                    
                    // Recalcular custo total (sem ICMS na importação)
                    adicao.custoTotal -= icmsOriginal;
                    adicao.custoUnitario = adicao.custoTotal / adicao.quantidadeTotal;
                    
                    // Atualizar itens proporcionalmente
                    this.atualizarItensComIncentivo(adicao, icmsOriginal, 0);
                    
                    ExpertzyDI.log('INCENTIVES', 'Corredor MG aplicado', {
                        adicao: adicao.numeroAdicao,
                        tipoOperacao: tipoOperacao,
                        creditoPresumido: valorCreditoPresumido.toFixed(2),
                        economia: adicao.incentivo.economia.toFixed(2)
                    });
                }
            });
        },
        
        // Atualizar itens com aplicação do incentivo
        atualizarItensComIncentivo: function(adicao, reducaoICMS, aumentoContrapartidas) {
            adicao.itens.forEach(item => {
                const proporcao = item.percentualRateio / 100;
                item.custoTotal -= reducaoICMS * proporcao;
                item.custoTotal += aumentoContrapartidas * proporcao;
                item.custoUnitario = item.custoTotal / (item.quantidadeUnidadeComercializada || 1);
            });
        },
        
        // Calcular contrapartidas (fundos, taxas, etc.)
        calcularContrapartidas: function(baseCalculo, contrapartidas) {
            const resultado = {};
            let total = 0;
            
            Object.entries(contrapartidas).forEach(([nome, aliquota]) => {
                const valor = baseCalculo * aliquota;
                resultado[nome] = valor;
                total += valor;
            });
            
            resultado.total = total;
            return resultado;
        },
        
        // Registrar aplicação do incentivo no audit log
        registrarAplicacaoIncentivo: function(resultados, programa, config) {
            const economiaTotal = resultados.adicoes.reduce((sum, adicao) => 
                sum + (adicao.incentivo?.economia || 0), 0);
            
            if (ExpertzyDI.utils.audit && ExpertzyDI.utils.audit.log) {
                ExpertzyDI.utils.audit.log('aplicar_incentivo_fiscal', {
                    programa: programa.nome,
                    estado: config.estado,
                    tipo: programa.tipo,
                    economiaTotal: economiaTotal,
                    adicoesAfetadas: resultados.adicoes.filter(a => a.incentivo).length
                });
            }
            
            // Atualizar totais gerais
            resultados.totais.impostos.ICMS = resultados.adicoes.reduce((sum, adicao) => 
                sum + adicao.impostos.ICMS.valor, 0);
            
            resultados.totais.custoTotal = resultados.adicoes.reduce((sum, adicao) => 
                sum + adicao.custoTotal, 0);
            
            resultados.incentivo = {
                programa: programa.nome,
                estado: config.estado,
                economiaTotal: economiaTotal,
                aplicado: true
            };
        },
        
        // Gerar interface para configuração de alíquotas interestaduais
        gerarInterfaceAliquotasInterestaduais: function() {
            return `
                <div class="aliquotas-interestaduais-config">
                    <h4>Configuração de Alíquotas Interestaduais</h4>
                    <div class="info-box">
                        <p><strong>Regra Geral:</strong> 4% para produtos com similar nacional</p>
                        <p><strong>Lista CAMEX:</strong> 12% para produtos específicos</p>
                        <p><em>Consulte a lista CAMEX vigente para verificar seu NCM</em></p>
                    </div>
                    
                    <div class="aliquota-config">
                        <label>
                            <input type="radio" name="tipo-aliquota-interestadual" value="4" checked>
                            4% - Produto com similar nacional (regra geral)
                        </label>
                        <label>
                            <input type="radio" name="tipo-aliquota-interestadual" value="12">
                            12% - Produto da lista CAMEX
                        </label>
                    </div>
                </div>
            `;
        },
        
        // Verificar elegibilidade para incentivos
        verificarElegibilidade: function(estado, dados) {
            const programa = this.programasIncentivos[estado];
            
            if (!programa || !programa.ativo) {
                return {
                    elegivel: false,
                    motivo: 'Programa não disponível ou inativo'
                };
            }
            
            if (!this.verificarVigencia(programa)) {
                return {
                    elegivel: false,
                    motivo: 'Programa fora do período de vigência'
                };
            }
            
            return {
                elegivel: true,
                programa: programa.nome,
                requisitos: programa.requisitos,
                vigencia: programa.vigencia,
                observacoes: programa.observacoes
            };
        }
    };
    
})(window.ExpertzyDI);