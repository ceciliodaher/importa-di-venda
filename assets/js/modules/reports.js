/*
REPORTS.JS - Sistema de Relatórios Profissionais Excel
Formatação avançada conforme orientações de profissionalização
Expertzy Inteligência Tributária

Implementações profissionais:
- Headers com cores corporativas (#4285F4 azul, #FF002D vermelho)
- Formatação condicional para validações (verde/amarelo/vermelho)
- Zebra striping em tabelas
- Bordas automáticas e alinhamentos otimizados
- Formatação monetária brasileira (R$)
- Fontes especializadas (NCM monospace, títulos destacados)
- Layout responsivo para impressão
- 12 abas com formatação específica por tipo de conteúdo
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.reports = {
        
        // Estilos corporativos Expertzy para Excel
        estilosExpertzy: {
            // Cores corporativas
            cores: {
                vermelhoExpertzy: 'FFFF002D',      // #FF002D
                azulNaval: 'FF091A30',             // #091A30
                branco: 'FFFFFFFF',                // #FFFFFF
                azulCorporativo: 'FF4285F4',       // Headers padrão
                verdeClaro: 'FFE8F5E8',            // Aprovado/OK
                amareloClaro: 'FFFFF3CD',          // Aviso
                vermelhoClaro: 'FFFFEAEA',         // Erro
                cinzaClaro: 'FFF5F5F5',            // Alternância zebra
                azulClaro: 'FFE3F2FD'              // Informativo
            },
            
            // Estilos de header
            headerPrincipal: {
                fill: { fgColor: { rgb: 'FF091A30' } },  // Azul naval
                font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 14 },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'medium', color: { rgb: 'FF000000' } },
                    bottom: { style: 'medium', color: { rgb: 'FF000000' } },
                    left: { style: 'medium', color: { rgb: 'FF000000' } },
                    right: { style: 'medium', color: { rgb: 'FF000000' } }
                }
            },
            
            headerSecundario: {
                fill: { fgColor: { rgb: 'FF4285F4' } },  // Azul corporativo
                font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 12 },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FF000000' } },
                    bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                    left: { style: 'thin', color: { rgb: 'FF000000' } },
                    right: { style: 'thin', color: { rgb: 'FF000000' } }
                }
            },
            
            // Estilos de dados
            valorMonetario: {
                numFmt: '#,##0.00_);[Red](#,##0.00)',
                alignment: { horizontal: 'right', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
                }
            },
            
            valorPercentual: {
                numFmt: '0.00%',
                alignment: { horizontal: 'right', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
                }
            },
            
            textoNormal: {
                alignment: { horizontal: 'left', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
                }
            },
            
            ncmMonospace: {
                font: { name: 'Courier New', sz: 10 },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                    right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
                }
            },
            
            // Estilos de validação com formatação condicional
            validacaoOK: {
                fill: { fgColor: { rgb: 'FFE8F5E8' } },  // Verde claro
                font: { color: { rgb: 'FF2E7D32' }, bold: true },
                border: {
                    top: { style: 'thin', color: { rgb: 'FF4CAF50' } },
                    bottom: { style: 'thin', color: { rgb: 'FF4CAF50' } },
                    left: { style: 'thin', color: { rgb: 'FF4CAF50' } },
                    right: { style: 'thin', color: { rgb: 'FF4CAF50' } }
                }
            },
            
            validacaoAviso: {
                fill: { fgColor: { rgb: 'FFFFF8E1' } },  // Amarelo claro
                font: { color: { rgb: 'FFF57F17' }, bold: true },
                border: {
                    top: { style: 'thin', color: { rgb: 'FFFFC107' } },
                    bottom: { style: 'thin', color: { rgb: 'FFFFC107' } },
                    left: { style: 'thin', color: { rgb: 'FFFFC107' } },
                    right: { style: 'thin', color: { rgb: 'FFFFC107' } }
                }
            },
            
            validacaoErro: {
                fill: { fgColor: { rgb: 'FFFFEBEE' } },  // Vermelho claro
                font: { color: { rgb: 'FFC62828' }, bold: true },
                border: {
                    top: { style: 'thin', color: { rgb: 'FFF44336' } },
                    bottom: { style: 'thin', color: { rgb: 'FFF44336' } },
                    left: { style: 'thin', color: { rgb: 'FFF44336' } },
                    right: { style: 'thin', color: { rgb: 'FFF44336' } }
                }
            },
            
            // Estilos para totais e subtotais
            subtotal: {
                fill: { fgColor: { rgb: 'FFE3F2FD' } },  // Azul claro
                font: { bold: true, sz: 11 },
                border: {
                    top: { style: 'medium', color: { rgb: 'FF1976D2' } },
                    bottom: { style: 'thin', color: { rgb: 'FF1976D2' } },
                    left: { style: 'thin', color: { rgb: 'FF1976D2' } },
                    right: { style: 'thin', color: { rgb: 'FF1976D2' } }
                }
            },
            
            totalGeral: {
                fill: { fgColor: { rgb: 'FF1976D2' } },  // Azul forte
                font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 12 },
                border: {
                    top: { style: 'medium', color: { rgb: 'FF000000' } },
                    bottom: { style: 'medium', color: { rgb: 'FF000000' } },
                    left: { style: 'medium', color: { rgb: 'FF000000' } },
                    right: { style: 'medium', color: { rgb: 'FF000000' } }
                }
            },
            
            // Zebra striping para tabelas
            linhaAlternada: {
                fill: { fgColor: { rgb: 'FFF5F5F5' } },  // Cinza bem claro
                border: {
                    top: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                    bottom: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                    left: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                    right: { style: 'thin', color: { rgb: 'FFE0E0E0' } }
                }
            }
        },
        
        // Gerar relatório principal
        generate: function(formato, dados, configuracao = {}) {
            ExpertzyDI.log('REPORTS', 'Iniciando geração de relatório profissional', {
                formato: formato,
                adicoes: dados?.adicoes?.length || 0
            });
            
            if (!dados || !dados.adicoes) {
                throw new Error('Dados não disponíveis para geração do relatório');
            }
            
            const config = this.prepararConfiguracaoRelatorio(configuracao);
            
            switch (formato.toLowerCase()) {
                case 'excel':
                case 'xlsx':
                    return this.gerarRelatorioExcelProfissional(dados, config);
                    
                case 'pdf':
                    return this.gerarRelatorioPDF(dados, config);
                    
                case 'csv':
                    return this.gerarRelatorioCSV(dados, config);
                    
                case 'json':
                    return this.gerarRelatorioJSON(dados, config);
                    
                default:
                    throw new Error(`Formato não suportado: ${formato}`);
            }
        },
        
        // Preparar configuração do relatório
        prepararConfiguracaoRelatorio: function(config) {
            return {
                // Informações do relatório
                titulo: config?.titulo || 'Análise de Declaração de Importação',
                subtitulo: config?.subtitulo || 'Sistema Expertzy - Cálculo de custos e tributação',
                empresa: config?.empresa || '',
                responsavel: config?.responsavel || '',
                
                // Configurações de exibição
                incluirMemoriaCalculo: config?.incluirMemoriaCalculo !== false,
                incluirIncentivos: config?.incluirIncentivos !== false,
                incluirValidacao: config?.incluirValidacao !== false,
                incluirCroquiNF: config?.incluirCroquiNF !== false,
                
                // Formatação
                moeda: config?.moeda || 'BRL',
                idioma: config?.idioma || 'pt-BR',
                
                // Dados adicionais
                dataGeracao: new Date(),
                versaoSistema: ExpertzyDI.app.version
            };
        },
        
        // Gerar relatório Excel profissional (12 abas)
        gerarRelatorioExcelProfissional: function(dados, config) {
            ExpertzyDI.log('REPORTS', 'Gerando relatório Excel profissional com 12 abas');
            
            // Verificar se biblioteca XLSX está disponível
            if (typeof XLSX === 'undefined') {
                throw new Error('Biblioteca XLSX não carregada. Inclua xlsx.full.min.js');
            }
            
            const workbook = XLSX.utils.book_new();
            
            // 01_Capa
            const wsCapa = this.criarAba01Capa(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsCapa, '01_Capa');
            
            // 02_Importador  
            const wsImportador = this.criarAba02Importador(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsImportador, '02_Importador');
            
            // 03_Carga
            const wsCarga = this.criarAba03Carga(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsCarga, '03_Carga');
            
            // 04_Valores
            const wsValores = this.criarAba04Valores(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsValores, '04_Valores');
            
            // 04A_Config_Custos
            const wsConfigCustos = this.criarAba04AConfigCustos(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsConfigCustos, '04A_Config_Custos');
            
            // 05_Tributos_Totais
            const wsTributosTotais = this.criarAba05TributosTotais(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsTributosTotais, '05_Tributos_Totais');
            
            // 05A_Validacao_Custos
            const wsValidacaoCustos = this.criarAba05AValidacaoCustos(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsValidacaoCustos, '05A_Validacao_Custos');
            
            // 06_Resumo_Adicoes
            const wsResumoAdicoes = this.criarAba06ResumoAdicoes(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsResumoAdicoes, '06_Resumo_Adicoes');
            
            // 06A_Resumo_Custos
            const wsResumoCustos = this.criarAba06AResumoCustos(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsResumoCustos, '06A_Resumo_Custos');
            
            // Croqui_NFe_Entrada
            if (config.incluirCroquiNF) {
                const wsCroqui = this.criarAbaCroquiNFeEntrada(dados, config);
                XLSX.utils.book_append_sheet(workbook, wsCroqui, 'Croqui_NFe_Entrada');
            }
            
            // 99_Complementar
            const wsComplementar = this.criarAba99Complementar(dados, config);
            XLSX.utils.book_append_sheet(workbook, wsComplementar, '99_Complementar');
            
            // Memoria_Calculo
            if (config.incluirMemoriaCalculo) {
                const wsMemoria = this.criarAbaMemoriaCalculo(dados, config);
                XLSX.utils.book_append_sheet(workbook, wsMemoria, 'Memoria_Calculo');
            }
            
            // Gerar arquivo
            const nomeArquivo = this.gerarNomeArquivo('excel', dados, config);
            const arquivoBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            
            // Download do arquivo
            this.downloadArquivo(arquivoBuffer, nomeArquivo, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            
            ExpertzyDI.log('REPORTS', 'Relatório Excel profissional gerado com sucesso', { arquivo: nomeArquivo });
            return { success: true, arquivo: nomeArquivo, formato: 'xlsx' };
        },
        
        // 01_Capa - Aba de apresentação
        criarAba01Capa: function(dados, config) {
            const dadosCapa = [
                ['EXPERTZY INTELIGÊNCIA TRIBUTÁRIA'],
                [''],
                ['ANÁLISE DE DECLARAÇÃO DE IMPORTAÇÃO'],
                ['Sistema Integrado de Custos e Tributação'],
                [''],
                [''],
                ['Informações Gerais'],
                ['Número da DI:', dados.numero || 'N/A'],
                ['Data de Registro:', dados.dataRegistro || 'N/A'], 
                ['Data de Desembaraço:', dados.dataDesembaraco || 'N/A'],
                ['INCOTERM:', dados.incoterm || 'N/A'],
                [''],
                ['Empresa/Responsável'],
                ['Empresa:', config.empresa || 'N/A'],
                ['Responsável:', config.responsavel || 'N/A'],
                ['Data de Geração:', config.dataGeracao.toLocaleDateString('pt-BR')],
                ['Versão do Sistema:', config.versaoSistema || 'N/A'],
                [''],
                ['Resumo Quantitativo'], 
                ['Número de Adições:', dados.adicoes.length],
                ['Número de Itens:', dados.adicoes.reduce((sum, adicao) => sum + (adicao.itens?.length || 0), 0)],
                [''],
                ['Resumo Financeiro'],
                ['Valor Total Mercadoria:', dados.totais?.valorMercadoria || 0],
                ['Custo Total Final:', dados.totais?.custoTotal || 0]
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosCapa);
            
            // Configurar larguras das colunas
            ws['!cols'] = [
                { wch: 30 }, // Labels
                { wch: 60 }  // Valores
            ];
            
            // Aplicar formatação profissional para aba de capa
            this.aplicarFormatacaoAbaCapa(ws, dadosCapa.length);
            
            return ws;
        },
        
        // Aplicar formatação profissional para aba de capa
        aplicarFormatacaoAbaCapa: function(ws, numLinhas) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Header principal (linha 1) - Título Expertzy
            if (ws['A1']) {
                ws['A1'].s = {
                    fill: { fgColor: { rgb: 'FFFF002D' } },  // Vermelho Expertzy
                    font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 16 },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: {
                        top: { style: 'medium', color: { rgb: 'FF000000' } },
                        bottom: { style: 'medium', color: { rgb: 'FF000000' } },
                        left: { style: 'medium', color: { rgb: 'FF000000' } },
                        right: { style: 'medium', color: { rgb: 'FF000000' } }
                    }
                };
            }
            
            // Subtítulo (linha 3)
            if (ws['A3']) {
                ws['A3'].s = {
                    fill: { fgColor: { rgb: 'FF091A30' } },  // Azul naval
                    font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 14 },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: {
                        top: { style: 'thin', color: { rgb: 'FF000000' } },
                        bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                        left: { style: 'thin', color: { rgb: 'FF000000' } },
                        right: { style: 'thin', color: { rgb: 'FF000000' } }
                    }
                };
            }
            
            // Headers de seções (linhas com apenas uma coluna preenchida)
            const secoes = [7, 13, 19, 23]; // Linhas das seções
            secoes.forEach(linha => {
                const cell = ws[XLSX.utils.encode_cell({r: linha - 1, c: 0})];
                if (cell) {
                    cell.s = {
                        fill: { fgColor: { rgb: 'FF4285F4' } },  // Azul corporativo
                        font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 12 },
                        alignment: { horizontal: 'left', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'FF000000' } },
                            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                            left: { style: 'thin', color: { rgb: 'FF000000' } },
                            right: { style: 'thin', color: { rgb: 'FF000000' } }
                        }
                    };
                }
            });
            
            // Dados normais com zebra striping
            for (let R = 7; R <= range.e.r; R++) {
                if (!secoes.includes(R + 1) && R !== 0 && R !== 2) { // Pular headers e seções
                    const isZebra = (R % 2) === 0;
                    
                    for (let C = 0; C <= range.e.c; C++) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                        if (ws[cellAddress]) {
                            ws[cellAddress].s = {
                                fill: { fgColor: { rgb: isZebra ? 'FFF5F5F5' : 'FFFFFFFF' } },
                                font: { sz: 11 },
                                alignment: { 
                                    horizontal: C === 0 ? 'left' : 'right', 
                                    vertical: 'center' 
                                },
                                border: {
                                    top: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                                    bottom: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                                    left: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                                    right: { style: 'thin', color: { rgb: 'FFE0E0E0' } }
                                }
                            };
                            
                            // Formatação monetária para valores
                            if (C === 1 && typeof ws[cellAddress].v === 'number' && ws[cellAddress].v > 100) {
                                ws[cellAddress].s.numFmt = '"R$ "#,##0.00';
                            }
                        }
                    }
                }
            }
            
            // Configurar alturas das linhas
            ws['!rows'] = [
                { hpt: 30 }, // Título principal
                { hpt: 15 }, // Espaço
                { hpt: 25 }, // Subtítulo
                { hpt: 15 }, // Descrição
                ...Array(numLinhas - 4).fill({ hpt: 20 }) // Dados
            ];
        },
        
        // 02_Importador - Dados do importador
        criarAba02Importador: function(dados, config) {
            const importador = dados.importador || {};
            
            const dadosImportador = [
                ['Dados do Importador'],
                [''],
                ['Nome/Razão Social:', importador.nome || 'N/A'],
                ['CNPJ:', importador.cnpj || 'N/A'],
                ['Inscrição Estadual:', importador.inscricaoEstadual || 'N/A'],
                [''],
                ['Endereço'],
                ['Logradouro:', importador.endereco || 'N/A'],
                ['Município:', importador.municipio || 'N/A'],
                ['UF:', importador.uf || 'N/A'],
                ['CEP:', importador.cep || 'N/A'],
                [''],
                ['Representante Legal'],
                ['Nome:', dados.nomeRepresentante || 'N/A'],
                ['CPF:', dados.cpfRepresentante || 'N/A']
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosImportador);
            
            // Configurar larguras das colunas  
            ws['!cols'] = [
                { wch: 30 }, // Labels
                { wch: 60 }  // Valores
            ];
            
            // Aplicar formatação
            this.aplicarFormatacaoAbaSimples(ws, dadosImportador.length);
            
            return ws;
        },
        
        // 03_Carga - Informações da carga
        criarAba03Carga: function(dados, config) {
            const pesoTotal = dados.adicoes.reduce((sum, adicao) => sum + (adicao.pesoLiquidoTotal || 0), 0);
            const volumeTotal = dados.adicoes.reduce((sum, adicao) => sum + (adicao.volume || 0), 0);
            
            const dadosCarga = [
                ['Informações da Carga'],
                [''],
                ['Peso Líquido Total (kg):', pesoTotal],
                ['Volume Total (m³):', volumeTotal],
                ['INCOTERM:', dados.incoterm || 'N/A'],
                [''],
                ['Valores CIF'],
                ['Mercadoria (FOB):', dados.totais?.valorMercadoria || 0],
                ['Frete:', dados.totais?.valorFrete || 0],
                ['Seguro:', dados.totais?.valorSeguro || 0],
                ['Total CIF:', (dados.totais?.valorMercadoria || 0) + (dados.totais?.valorFrete || 0) + (dados.totais?.valorSeguro || 0)],
                [''],
                ['Despesas Adicionais'],
                ['AFRMM:', dados.totais?.afrmm || 0],
                ['SISCOMEX:', dados.totais?.siscomex || 0]
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosCarga);
            
            // Configurar larguras das colunas
            ws['!cols'] = [
                { wch: 30 }, // Labels  
                { wch: 20 }  // Valores
            ];
            
            // Aplicar formatação
            this.aplicarFormatacaoAbaSimples(ws, dadosCarga.length);
            
            return ws;
        },
        
        // 04_Valores - Valores principais
        criarAba04Valores: function(dados, config) {
            const dadosValores = [
                ['Valores Principais da DI'],
                [''],
                ['Valor Mercadoria (Condição Venda):', dados.totais?.valorMercadoriaCondicaoVenda || 0],
                ['Valor Mercadoria (Local Embarque):', dados.totais?.valorMercadoriaLocalEmbarque || 0],
                ['Valor Frete:', dados.totais?.valorFrete || 0],
                ['Valor Seguro:', dados.totais?.valorSeguro || 0],
                [''],
                ['Despesas Complementares'],
                ['AFRMM:', dados.totais?.afrmm || 0],
                ['SISCOMEX:', dados.totais?.siscomex || 0],
                [''],
                ['Totais Calculados'],
                ['Base CIF Total:', dados.totais?.baseCIF || 0],
                ['Custo Total Final:', dados.totais?.custoTotal || 0]
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosValores);
            
            // Configurar larguras das colunas
            ws['!cols'] = [
                { wch: 35 }, // Labels
                { wch: 20 }  // Valores
            ];
            
            // Aplicar formatação
            this.aplicarFormatacaoAbaSimples(ws, dadosValores.length);
            
            return ws;
        },
        
        // 04A_Config_Custos - Configurações de cálculo
        criarAba04AConfigCustos: function(dados, config) {
            const configuracao = dados.configuracao || {};
            
            const dadosConfig = [
                ['Configurações de Cálculo de Custos'],
                [''],
                ['Parâmetros Gerais'],
                ['INCOTERM:', configuracao.incoterm || 'FOB'],
                ['Estado de Destino:', configuracao.estado || 'GO'],
                ['Aplicar Incentivos:', configuracao.aplicarIncentivos ? 'Sim' : 'Não'],
                [''],
                ['Despesas Extra-DI'],
                ['Total Base ICMS:', dados.totais?.despesasExtraDI?.baseICMS || 0],
                ['Total Não Base ICMS:', dados.totais?.despesasExtraDI?.naoBaseICMS || 0],
                ['Total Geral Extra-DI:', dados.totais?.despesasExtraDI?.total || 0],
                [''],
                ['Configurações Especiais'],
                ['Dólar Diferenciado:', configuracao.dolarDiferenciado ? 'Sim' : 'Não'],
                ['Redução Base ICMS:', (configuracao.reducaoBaseICMS || 0) * 100 + '%'],
                ['Substituição Tributária:', configuracao.substituicaoTributaria ? 'Sim' : 'Não']
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosConfig);
            
            // Configurar larguras das colunas
            ws['!cols'] = [
                { wch: 30 }, // Labels
                { wch: 25 }  // Valores
            ];
            
            // Aplicar formatação
            this.aplicarFormatacaoAbaSimples(ws, dadosConfig.length);
            
            return ws;
        },
        
        // 05_Tributos_Totais - Impostos com ícones
        criarAba05TributosTotais: function(dados, config) {
            const impostos = dados.totais?.impostos || {};
            
            const dadosTributos = [
                ['Tributo', 'Valor Total'],
                ['📊 Imposto de Importação (II)', impostos.II || 0],
                ['⚡ IPI', impostos.IPI || 0], 
                ['💰 PIS', impostos.PIS || 0],
                ['💳 COFINS', impostos.COFINS || 0],
                ['🏛️ ICMS', impostos.ICMS || 0],
                ['📈 TOTAL GERAL', Object.values(impostos).reduce((sum, val) => sum + (val || 0), 0)]
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosTributos);
            
            // Configurar larguras das colunas
            ws['!cols'] = [
                { wch: 35 }, // Tributo com ícone
                { wch: 20 }  // Valor
            ];
            
            // Aplicar formatação específica para tributos
            this.aplicarFormatacaoTributos(ws, dadosTributos.length);
            
            return ws;
        },
        
        // Aplicar formatação profissional para tributos totais
        aplicarFormatacaoTributos: function(ws, numLinhas) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Header principal
            if (ws['A1']) {
                ws['A1'].s = {
                    fill: { fgColor: { rgb: 'FFFF002D' } },  // Vermelho Expertzy
                    font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 14 },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: {
                        top: { style: 'medium', color: { rgb: 'FF000000' } },
                        bottom: { style: 'medium', color: { rgb: 'FF000000' } },
                        left: { style: 'medium', color: { rgb: 'FF000000' } },
                        right: { style: 'medium', color: { rgb: 'FF000000' } }
                    }
                };
            }
            
            // Headers da tabela (linha 3)
            if (ws['A3'] && ws['B3']) {
                [ws['A3'], ws['B3']].forEach(cell => {
                    cell.s = {
                        fill: { fgColor: { rgb: 'FF4285F4' } },  // Azul corporativo
                        font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 12 },
                        alignment: { horizontal: 'center', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'FF000000' } },
                            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                            left: { style: 'thin', color: { rgb: 'FF000000' } },
                            right: { style: 'thin', color: { rgb: 'FF000000' } }
                        }
                    };
                });
            }
            
            // Dados dos tributos com cores diferenciadas
            const coresTributos = {
                'II': 'FF1976D2',   // Azul
                'IPI': 'FF7B1FA2',  // Roxo
                'PIS': 'FF388E3C',  // Verde
                'COFINS': 'FFF57C00', // Laranja
                'ICMS': 'FFD32F2F'  // Vermelho
            };
            
            for (let R = 3; R < numLinhas - 2; R++) { // Pular total geral
                const cellA = XLSX.utils.encode_cell({ r: R, c: 0 });
                const cellB = XLSX.utils.encode_cell({ r: R, c: 1 });
                
                if (ws[cellA]) {
                    // Identificar tipo de tributo para cor específica
                    const texto = ws[cellA].v || '';
                    let corFundo = 'FFFFFFFF';
                    
                    Object.entries(coresTributos).forEach(([tributo, cor]) => {
                        if (texto.includes(tributo)) {
                            corFundo = 'FF' + cor.substring(2) + '20'; // Versão mais clara
                        }
                    });
                    
                    ws[cellA].s = {
                        fill: { fgColor: { rgb: corFundo } },
                        font: { bold: true, sz: 11 },
                        alignment: { horizontal: 'left', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                            bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                            left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                            right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
                        }
                    };
                }
                
                if (ws[cellB]) {
                    ws[cellB].s = {
                        numFmt: '"R$ "#,##0.00',
                        alignment: { horizontal: 'right', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                            bottom: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                            left: { style: 'thin', color: { rgb: 'FFD0D0D0' } },
                            right: { style: 'thin', color: { rgb: 'FFD0D0D0' } }
                        }
                    };
                }
            }
            
            // Total geral com destaque especial
            const totalRow = numLinhas - 1;
            const cellTotalA = XLSX.utils.encode_cell({ r: totalRow, c: 0 });
            const cellTotalB = XLSX.utils.encode_cell({ r: totalRow, c: 1 });
            
            if (ws[cellTotalA]) {
                ws[cellTotalA].s = this.estilosExpertzy.totalGeral;
            }
            
            if (ws[cellTotalB]) {
                ws[cellTotalB].s = {
                    ...this.estilosExpertzy.totalGeral,
                    numFmt: '"R$ "#,##0.00'
                };
            }
        },
        
        // 05A_Validacao_Custos - Validação com cores condicionais
        criarAba05AValidacaoCustos: function(dados, config) {
            const validacao = dados.validacao?.resultados || {};
            
            const dadosValidacao = [
                ['Tributo', 'Calculado', 'DI Original', 'Diferença', 'Status'],
            ];
            
            Object.entries(validacao).forEach(([tributo, resultado]) => {
                const status = this.obterStatusValidacao(resultado.diferenca, resultado.tolerancia);
                dadosValidacao.push([
                    tributo,
                    resultado.calculado || 0,
                    resultado.original || 0,
                    resultado.diferenca || 0,
                    status.icone + ' ' + status.texto
                ]);
            });
            
            const ws = XLSX.utils.aoa_to_sheet(dadosValidacao);
            
            // Configurar larguras das colunas
            ws['!cols'] = [
                { wch: 15 }, // Tributo
                { wch: 15 }, // Calculado
                { wch: 15 }, // DI Original
                { wch: 15 }, // Diferença
                { wch: 20 }  // Status
            ];
            
            // Aplicar formatação condicional
            this.aplicarFormatacaoValidacao(ws, dadosValidacao.length, validacao);
            
            return ws;
        },
        
        // Aplicar formatação condicional para validação
        aplicarFormatacaoValidacao: function(ws, numLinhas, validacao) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Header da tabela
            for (let C = 0; C <= 4; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                if (ws[cellAddress]) {
                    ws[cellAddress].s = {
                        fill: { fgColor: { rgb: 'FF4285F4' } },  // Azul corporativo
                        font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 12 },
                        alignment: { horizontal: 'center', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'FF000000' } },
                            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                            left: { style: 'thin', color: { rgb: 'FF000000' } },
                            right: { style: 'thin', color: { rgb: 'FF000000' } }
                        }
                    };
                }
            }
            
            // Dados com formatação condicional baseada no status
            for (let R = 1; R < numLinhas; R++) {
                const cellStatus = ws[XLSX.utils.encode_cell({ r: R, c: 4 })];
                let estiloLinha = this.estilosExpertzy.textoNormal;
                
                if (cellStatus && cellStatus.v) {
                    const statusText = cellStatus.v.toString();
                    
                    if (statusText.includes('✅') || statusText.includes('OK')) {
                        estiloLinha = this.estilosExpertzy.validacaoOK;
                    } else if (statusText.includes('⚠️') || statusText.includes('AVISO')) {
                        estiloLinha = this.estilosExpertzy.validacaoAviso;
                    } else if (statusText.includes('❌') || statusText.includes('ERRO')) {
                        estiloLinha = this.estilosExpertzy.validacaoErro;
                    }
                }
                
                // Aplicar estilo a toda a linha
                for (let C = 0; C <= 4; C++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cellAddress]) {
                        ws[cellAddress].s = { ...estiloLinha };
                        
                        // Formatação específica por coluna
                        if (C >= 1 && C <= 3) { // Colunas de valores
                            ws[cellAddress].s.numFmt = '"R$ "#,##0.00';
                            ws[cellAddress].s.alignment = { horizontal: 'right', vertical: 'center' };
                        } else if (C === 0) { // Coluna tributo
                            ws[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
                            ws[cellAddress].s.font = { ...ws[cellAddress].s.font, bold: true };
                        }
                    }
                }
            }
            
            // Configurar alturas das linhas
            ws['!rows'] = [
                { hpt: 25 }, // Header
                ...Array(numLinhas - 1).fill({ hpt: 22 }) // Dados
            ];
        },
        
        // 06_Resumo_Adicoes - Tabela complexa principal
        criarAba06ResumoAdicoes: function(dados, config) {
            const headers = [
                'Adição', 'NCM', 'Descrição', 'Qtd', 'Un',
                'Valor FOB', 'Frete', 'Seguro', 'Base CIF',
                'II', 'IPI', 'PIS', 'COFINS', 'ICMS',
                'Custo Unit.', 'Custo Total'
            ];
            
            const dadosResumo = [headers];
            
            dados.adicoes.forEach(adicao => {
                dadosResumo.push([
                    adicao.numeroAdicao || '',
                    adicao.codigoNCM || '',
                    (adicao.descricaoMercadoria || '').substring(0, 30) + '...',
                    adicao.quantidadeTotal || 0,
                    adicao.unidadeMedidaComercializada || '',
                    adicao.valorMercadoriaFOB || 0,
                    adicao.valorFrete || 0,
                    adicao.valorSeguro || 0,
                    adicao.baseCIF || 0,
                    adicao.impostos?.II?.valor || 0,
                    adicao.impostos?.IPI?.valor || 0,
                    adicao.impostos?.PIS?.valor || 0,
                    adicao.impostos?.COFINS?.valor || 0,
                    adicao.impostos?.ICMS?.valor || 0,
                    adicao.custoUnitario || 0,
                    adicao.custoTotal || 0
                ]);
            });
            
            const ws = XLSX.utils.aoa_to_sheet(dadosResumo);
            
            // Configurar larguras otimizadas por tipo de conteúdo
            ws['!cols'] = [
                { wch: 8 },  // Adição
                { wch: 12 }, // NCM  
                { wch: 35 }, // Descrição
                { wch: 8 },  // Qtd
                { wch: 6 },  // Un
                { wch: 12 }, // Valor FOB
                { wch: 12 }, // Frete
                { wch: 12 }, // Seguro
                { wch: 12 }, // Base CIF
                { wch: 12 }, // II
                { wch: 12 }, // IPI
                { wch: 12 }, // PIS
                { wch: 12 }, // COFINS
                { wch: 12 }, // ICMS
                { wch: 12 }, // Custo Unit.
                { wch: 15 }  // Custo Total
            ];
            
            // Aplicar formatação complexa
            this.aplicarFormatacaoResumoAdicoes(ws, dadosResumo.length);
            
            return ws;
        },
        
        // Aplicar formatação complexa para resumo de adições
        aplicarFormatacaoResumoAdicoes: function(ws, numLinhas) {
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Headers com merge se apropriado
            for (let C = 0; C <= range.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                if (ws[cellAddress]) {
                    ws[cellAddress].s = {
                        fill: { fgColor: { rgb: 'FF4285F4' } },  // Azul corporativo
                        font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 11 },
                        alignment: { horizontal: 'center', vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'FF000000' } },
                            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
                            left: { style: 'thin', color: { rgb: 'FF000000' } },
                            right: { style: 'thin', color: { rgb: 'FF000000' } }
                        }
                    };
                }
            }
            
            // Dados com zebra striping e formatação específica por tipo
            for (let R = 1; R < numLinhas; R++) {
                const isZebra = (R % 2) === 0;
                const corFundo = isZebra ? 'FFF5F5F5' : 'FFFFFFFF';
                
                for (let C = 0; C <= range.e.c; C++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (ws[cellAddress]) {
                        // Estilo base
                        ws[cellAddress].s = {
                            fill: { fgColor: { rgb: corFundo } },
                            font: { sz: 10 },
                            alignment: { vertical: 'center' },
                            border: {
                                top: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                                bottom: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                                left: { style: 'thin', color: { rgb: 'FFE0E0E0' } },
                                right: { style: 'thin', color: { rgb: 'FFE0E0E0' } }
                            }
                        };
                        
                        // Formatação específica por tipo de dados
                        switch (C) {
                            case 0: // Adição
                                ws[cellAddress].s.alignment.horizontal = 'center';
                                ws[cellAddress].s.font.bold = true;
                                break;
                                
                            case 1: // NCM - fonte monospace
                                ws[cellAddress].s.font.name = 'Courier New';
                                ws[cellAddress].s.font.sz = 9;
                                ws[cellAddress].s.alignment.horizontal = 'center';
                                break;
                                
                            case 2: // Descrição
                                ws[cellAddress].s.alignment.horizontal = 'left';
                                ws[cellAddress].s.font.sz = 9;
                                break;
                                
                            case 3: // Quantidade - formato numérico
                                ws[cellAddress].s.numFmt = '#,##0.00';
                                ws[cellAddress].s.alignment.horizontal = 'right';
                                break;
                                
                            case 4: // Unidade
                                ws[cellAddress].s.alignment.horizontal = 'center';
                                ws[cellAddress].s.font.sz = 9;
                                break;
                                
                            default: // Valores monetários (5-15)
                                if (C >= 5) {
                                    ws[cellAddress].s.numFmt = '"R$ "#,##0.00';
                                    ws[cellAddress].s.alignment.horizontal = 'right';
                                }
                                break;
                        }
                    }
                }
            }
            
            // Configurar altura das linhas
            ws['!rows'] = [
                { hpt: 25 }, // Header
                ...Array(numLinhas - 1).fill({ hpt: 18 }) // Dados mais compactos
            ];
            
            // Auto-filtro no header
            ws['!autofilter'] = { ref: XLSX.utils.encode_range({
                s: { c: 0, r: 0 },
                e: { c: range.e.c, r: numLinhas - 1 }
            })};
        },
        
        // 06A_Resumo_Custos - Estrutura de custos
        criarAba06AResumoCustos: function(dados, config) {
            const dadosCustos = [
                ['ESTRUTURA DE CUSTOS DETALHADA'],
                [''],
                ['Custos Base'],
                ['Valor FOB Total:', dados.totais?.valorMercadoria || 0],
                ['Frete Total:', dados.totais?.valorFrete || 0],
                ['Seguro Total:', dados.totais?.valorSeguro || 0],
                ['Subtotal CIF:', (dados.totais?.valorMercadoria || 0) + (dados.totais?.valorFrete || 0) + (dados.totais?.valorSeguro || 0)],
                [''],
                ['Tributos Federais'],
                ['Imposto de Importação:', dados.totais?.impostos?.II || 0],
                ['IPI:', dados.totais?.impostos?.IPI || 0],
                ['PIS:', dados.totais?.impostos?.PIS || 0],  
                ['COFINS:', dados.totais?.impostos?.COFINS || 0],
                ['Subtotal Tributos Fed.:', (dados.totais?.impostos?.II || 0) + (dados.totais?.impostos?.IPI || 0) + (dados.totais?.impostos?.PIS || 0) + (dados.totais?.impostos?.COFINS || 0)],
                [''],
                ['Tributos Estaduais'],
                ['ICMS:', dados.totais?.impostos?.ICMS || 0],
                [''],
                ['Despesas Complementares'],
                ['AFRMM:', dados.totais?.afrmm || 0],
                ['SISCOMEX:', dados.totais?.siscomex || 0],
                ['Despesas Extra-DI:', dados.totals?.despesasExtraDI?.total || 0],
                ['Subtotal Despesas:', (dados.totais?.afrmm || 0) + (dados.totais?.siscomex || 0) + (dados.totais?.despesasExtraDI?.total || 0)],
                [''],
                ['CUSTO TOTAL FINAL:', dados.totais?.custoTotal || 0]
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosCustos);
            
            // Configurar larguras das colunas
            ws['!cols'] = [
                { wch: 30 }, // Labels
                { wch: 20 }  // Valores
            ];
            
            // Aplicar formatação com seções destacadas
            this.aplicarFormatacaoResumoCustos(ws, dadosCustos.length);
            
            return ws;
        },
        
        // Croqui_NFe_Entrada - Layout nota fiscal
        criarAbaCroquiNFeEntrada: function(dados, config) {
            const dadosCroqui = [
                ['CROQUI DE NOTA FISCAL DE ENTRADA'],
                [''],
                ['═══════════════════════════════════════════════════════════════'],
                [''],
                ['DADOS DO EMITENTE (Importador)'],
                ['Nome/Razão Social: ' + (dados.importador?.nome || 'N/A')],
                ['CNPJ: ' + (dados.importador?.cnpj || 'N/A')],
                ['Endereço: ' + (dados.importador?.endereco || 'N/A')],
                [''],
                ['DADOS DA OPERAÇÃO'],
                ['Natureza da Operação: Importação por conta própria'],
                ['DI: ' + (dados.numero || 'N/A')],
                ['Data: ' + (dados.dataRegistro || 'N/A')],
                [''],
                ['PRODUTOS/SERVIÇOS'],
                ['Cód.|Descrição|Qtd|Un|Vl Unit|Vl Total|NCM|CST'],
                ['═══════════════════════════════════════════════════════════════']
            ];
            
            // Adicionar produtos
            dados.adicoes.forEach((adicao, index) => {
                dadosCroqui.push([
                    `${String(index + 1).padStart(3, '0')}|${(adicao.descricaoMercadoria || '').substring(0, 25)}|${adicao.quantidadeTotal || 0}|${adicao.unidadeMedidaComercializada || ''}|${(adicao.custoUnitario || 0).toFixed(2)}|${(adicao.custoTotal || 0).toFixed(2)}|${adicao.codigoNCM || ''}|000`
                ]);
            });
            
            dadosCroqui.push(['═══════════════════════════════════════════════════════════════']);
            dadosCroqui.push(['']);
            dadosCroqui.push(['TOTAIS']);
            dadosCroqui.push(['Valor Total dos Produtos: ' + this.formatarMoeda(dados.totais?.custoTotal || 0)]);
            dadosCroqui.push(['Valor Total da Nota: ' + this.formatarMoeda(dados.totais?.custoTotal || 0)]);
            
            const ws = XLSX.utils.aoa_to_sheet(dadosCroqui);
            
            // Configurar largura expandida para layout de NF
            ws['!cols'] = [{ wch: 100 }];
            
            // Aplicar formatação estilo documento fiscal
            this.aplicarFormatacaoCroquiNF(ws, dadosCroqui.length);
            
            return ws;
        },
        
        // 99_Complementar - Informações técnicas  
        criarAba99Complementar: function(dados, config) {
            const infoComplementar = dados.informacaoComplementar || 'Não há informações complementares disponíveis.';
            
            const dadosComplementar = [
                ['INFORMAÇÕES COMPLEMENTARES'],
                [''],
                [infoComplementar],
                [''],
                ['OBSERVAÇÕES TÉCNICAS'],
                [''],
                ['• Este relatório foi gerado automaticamente pelo Sistema Expertzy'],
                ['• Os cálculos seguem a legislação tributária brasileira vigente'],
                ['• Para dúvidas técnicas, consulte a memória de cálculo'],
                ['• Validação realizada contra os valores originais da DI'],
                [''],
                ['DADOS TÉCNICOS DO SISTEMA'],
                ['Versão: ' + (config.versaoSistema || 'N/A')],
                ['Data/Hora Geração: ' + config.dataGeracao.toLocaleString('pt-BR')],
                ['Usuário Responsável: ' + (config.responsavel || 'N/A')]
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(dadosComplementar);
            
            // Configurar largura expandida para texto
            ws['!cols'] = [{ wch: 150 }];
            
            // Aplicar formatação para informações técnicas
            this.aplicarFormatacaoComplementar(ws, dadosComplementar.length);
            
            return ws;
        },
        
        // Memoria_Calculo - Documentação técnica
        criarAbaMemoriaCalculo: function(dados, config) {
            const memoriaCompleta = [
                ['MEMÓRIA DE CÁLCULO DETALHADA'],
                [''],
                ['Este documento apresenta o detalhamento completo dos cálculos'],
                ['realizados para cada adição da Declaração de Importação.'],
                ['']
            ];
            
            dados.adicoes.forEach((adicao, index) => {
                memoriaCompleta.push([`${index + 1}. ADIÇÃO ${adicao.numeroAdicao || index + 1} - NCM ${adicao.codigoNCM || 'N/A'}`]);
                memoriaCompleta.push(['']);
                
                if (adicao.memoriaCalculo && adicao.memoriaCalculo.length > 0) {
                    adicao.memoriaCalculo.forEach(passo => {
                        memoriaCompleta.push([`   ${passo.passo}. ${passo.descricao}`]);
                        if (passo.formula) memoriaCompleta.push([`      Fórmula: ${passo.formula}`]);
                        if (passo.calculo) memoriaCompleta.push([`      Cálculo: ${passo.calculo}`]);
                        if (passo.resultado !== undefined) memoriaCompleta.push([`      Resultado: ${this.formatarMoeda(passo.resultado)}`]);
                        if (passo.observacao) memoriaCompleta.push([`      Obs: ${passo.observacao}`]);
                        memoriaCompleta.push(['']);
                    });
                }
                
                memoriaCompleta.push(['   ─────────────────────────────────────────────']);
                memoriaCompleta.push(['']);
            });
            
            // Adicionar notas de rodapé
            memoriaCompleta.push(['NOTAS DE RODAPÉ']);
            memoriaCompleta.push(['']);
            memoriaCompleta.push(['[1] Todos os valores monetários estão em Reais (BRL)']);
            memoriaCompleta.push(['[2] Cálculos seguem a legislação tributária vigente']);
            memoriaCompleta.push(['[3] Para links entre abas, utilize os hyperlinks do Excel']);
            
            const ws = XLSX.utils.aoa_to_sheet(memoriaCompleta);
            
            // Configurar largura para documentação
            ws['!cols'] = [{ wch: 120 }];
            
            // Aplicar formatação para documentação técnica
            this.aplicarFormatacaoMemoriaCalculo(ws, memoriaCompleta.length);
            
            return ws;
        },
        
        // Funções de formatação específicas
        
        aplicarFormatacaoAbaSimples: function(ws, numLinhas) {
            // Headers e formatação zebra para abas simples
            for (let i = 0; i < numLinhas; i++) {
                const linha = i + 1;
                
                // Headers principais
                if (ws[`A${linha}`] && ws[`A${linha}`].v && !ws[`B${linha}`]) {
                    ws[`A${linha}`].s = this.estilosExpertzy.headerPrincipal;
                }
                
                // Alternância zebra
                if (i % 2 === 0 && ws[`A${linha}`] && ws[`B${linha}`]) {
                    ws[`A${linha}`].s = this.estilosExpertzy.textoNormal;
                    ws[`B${linha}`].s = this.estilosExpertzy.valorMonetario;
                } else if (ws[`A${linha}`] && ws[`B${linha}`]) {
                    ws[`A${linha}`].s = { ...this.estilosExpertzy.textoNormal, fill: { fgColor: { rgb: this.estilosExpertzy.cores.cinzaClaro } } };
                    ws[`B${linha}`].s = { ...this.estilosExpertzy.valorMonetario, fill: { fgColor: { rgb: this.estilosExpertzy.cores.cinzaClaro } } };
                }
            }
        },
        
        aplicarFormatacaoTributos: function(ws, numLinhas) {
            // Header
            ws['A1'].s = this.estilosExpertzy.headerSecundario;
            ws['B1'].s = this.estilosExpertzy.headerSecundario;
            
            // Dados com cores diferenciadas por tributo
            for (let i = 2; i <= numLinhas; i++) {
                if (ws[`A${i}`] && ws[`B${i}`]) {
                    ws[`A${i}`].s = this.estilosExpertzy.textoNormal;
                    
                    // Total destacado com fundo verde
                    if (ws[`A${i}`].v && ws[`A${i}`].v.includes('TOTAL')) {
                        ws[`A${i}`].s = { ...this.estilosExpertzy.textoNormal, fill: { fgColor: { rgb: this.estilosExpertzy.cores.verdeClaro } }, font: { bold: true } };
                        ws[`B${i}`].s = { ...this.estilosExpertzy.valorMonetario, fill: { fgColor: { rgb: this.estilosExpertzy.cores.verdeClaro } }, font: { bold: true } };
                    } else {
                        ws[`B${i}`].s = this.estilosExpertzy.valorMonetario;
                    }
                }
            }
        },
        
        aplicarFormatacaoValidacao: function(ws, numLinhas, validacao) {
            // Header
            ['A', 'B', 'C', 'D', 'E'].forEach(col => {
                if (ws[`${col}1`]) ws[`${col}1`].s = this.estilosExpertzy.headerSecundario;
            });
            
            // Formatação condicional por status
            for (let i = 2; i <= numLinhas; i++) {
                ['A', 'B', 'C', 'D', 'E'].forEach(col => {
                    if (ws[`${col}${i}`]) {
                        let estilo = this.estilosExpertzy.textoNormal;
                        
                        // Cores por status na coluna E
                        if (col === 'E' && ws[`${col}${i}`].v) {
                            if (ws[`${col}${i}`].v.includes('✅')) {
                                estilo = { ...estilo, fill: { fgColor: { rgb: this.estilosExpertzy.cores.verdeClaro } } };
                            } else if (ws[`${col}${i}`].v.includes('⚠️')) {
                                estilo = { ...estilo, fill: { fgColor: { rgb: this.estilosExpertzy.cores.amareloClaro } } };
                            } else if (ws[`${col}${i}`].v.includes('❌')) {
                                estilo = { ...estilo, fill: { fgColor: { rgb: this.estilosExpertzy.cores.vermelhoClaro } } };
                            }
                        }
                        
                        // Formatação monetária para colunas B, C, D
                        if (['B', 'C', 'D'].includes(col)) {
                            estilo = { ...this.estilosExpertzy.valorMonetario, ...estilo };
                        }
                        
                        ws[`${col}${i}`].s = estilo;
                    }
                });
            }
        },
        
        aplicarFormatacaoResumoAdicoes: function(ws, numLinhas) {
            // Headers
            const colunas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
            colunas.forEach(col => {
                if (ws[`${col}1`]) ws[`${col}1`].s = this.estilosExpertzy.headerSecundario;
            });
            
            // Formatação específica por tipo de coluna
            for (let i = 2; i <= numLinhas; i++) {
                colunas.forEach((col, index) => {
                    if (ws[`${col}${i}`]) {
                        let estilo = this.estilosExpertzy.textoNormal;
                        
                        // NCM com fonte monospace
                        if (index === 1) { // Coluna B (NCM)
                            estilo = this.estilosExpertzy.ncmMonospace;
                        }
                        // Valores monetários
                        else if (index >= 5 && index <= 15) { // Colunas F-P (valores)
                            estilo = this.estilosExpertzy.valorMonetario;
                        }
                        // Quantidades
                        else if (index === 3) { // Coluna D (Qtd)
                            estilo = { ...this.estilosExpertzy.textoNormal, numFmt: '#,##0', alignment: { horizontal: 'right' } };
                        }
                        
                        // Alternância de cores por linha (zebra)
                        if (i % 2 === 0) {
                            estilo = { ...estilo, fill: { fgColor: { rgb: this.estilosExpertzy.cores.cinzaClaro } } };
                        }
                        
                        ws[`${col}${i}`].s = estilo;
                    }
                });
            }
        },
        
        aplicarFormatacaoResumoCustos: function(ws, numLinhas) {
            for (let i = 1; i <= numLinhas; i++) {
                if (ws[`A${i}`] && ws[`A${i}`].v) {
                    // Headers de seção
                    if (!ws[`B${i}`] && !ws[`A${i}`].v.includes(':')) {
                        ws[`A${i}`].s = this.estilosExpertzy.headerPrincipal;
                    }
                    // Subtotais
                    else if (ws[`A${i}`].v.includes('Subtotal') || ws[`A${i}`].v.includes('TOTAL')) {
                        ws[`A${i}`].s = { ...this.estilosExpertzy.textoNormal, font: { bold: true }, fill: { fgColor: { rgb: this.estilosExpertzy.cores.azulClaro } } };
                        if (ws[`B${i}`]) ws[`B${i}`].s = { ...this.estilosExpertzy.valorMonetario, font: { bold: true }, fill: { fgColor: { rgb: this.estilosExpertzy.cores.azulClaro } } };
                    }
                    // Dados normais
                    else {
                        ws[`A${i}`].s = this.estilosExpertzy.textoNormal;
                        if (ws[`B${i}`]) ws[`B${i}`].s = this.estilosExpertzy.valorMonetario;
                    }
                }
            }
        },
        
        aplicarFormatacaoCroquiNF: function(ws, numLinhas) {
            for (let i = 1; i <= numLinhas; i++) {
                if (ws[`A${i}`]) {
                    // Headers e separadores
                    if (ws[`A${i}`].v && (ws[`A${i}`].v.includes('CROQUI') || ws[`A${i}`].v.includes('═══'))) {
                        ws[`A${i}`].s = { ...this.estilosExpertzy.headerPrincipal, font: { name: 'Courier New', sz: 12, bold: true } };
                    }
                    // Dados estruturados
                    else {
                        ws[`A${i}`].s = { font: { name: 'Courier New', sz: 10 }, alignment: { horizontal: 'left' } };
                    }
                }
            }
        },
        
        aplicarFormatacaoComplementar: function(ws, numLinhas) {
            for (let i = 1; i <= numLinhas; i++) {
                if (ws[`A${i}`]) {
                    // Headers
                    if (ws[`A${i}`].v && ws[`A${i}`].v.includes('INFORMAÇÕES') || ws[`A${i}`].v && ws[`A${i}`].v.includes('OBSERVAÇÕES') || ws[`A${i}`].v && ws[`A${i}`].v.includes('DADOS TÉCNICOS')) {
                        ws[`A${i}`].s = this.estilosExpertzy.headerSecundario;
                    }
                    // Texto corrido
                    else {
                        ws[`A${i}`].s = { font: { sz: 10 }, alignment: { horizontal: 'justify', wrapText: true } };
                    }
                }
            }
        },
        
        aplicarFormatacaoMemoriaCalculo: function(ws, numLinhas) {
            for (let i = 1; i <= numLinhas; i++) {
                if (ws[`A${i}`] && ws[`A${i}`].v) {
                    // Headers principais
                    if (ws[`A${i}`].v.includes('MEMÓRIA DE CÁLCULO') || ws[`A${i}`].v.includes('NOTAS DE RODAPÉ')) {
                        ws[`A${i}`].s = this.estilosExpertzy.headerPrincipal;
                    }
                    // Headers de adição
                    else if (ws[`A${i}`].v.match(/^\d+\./)) {
                        ws[`A${i}`].s = { ...this.estilosExpertzy.headerSecundario, font: { bold: true, sz: 12 } };
                    }
                    // Conteúdo indentado
                    else if (ws[`A${i}`].v.startsWith('   ')) {
                        ws[`A${i}`].s = { font: { name: 'Courier New', sz: 9 }, alignment: { horizontal: 'left' } };
                    }
                    // Texto normal
                    else {
                        ws[`A${i}`].s = { font: { sz: 10 }, alignment: { horizontal: 'left' } };
                    }
                }
            }
        },
        
        // Utilitários
        
        obterStatusValidacao: function(diferenca, tolerancia) {
            const diferencaAbs = Math.abs(diferenca || 0);
            const toleranciaVerde = tolerancia?.verde || 0.0001;
            const toleranciaAmarela = tolerancia?.amarela || 0.01;
            
            if (diferencaAbs <= toleranciaVerde) {
                return { icone: '✅', texto: 'OK', cor: 'verde' };
            } else if (diferencaAbs <= toleranciaAmarela) {
                return { icone: '⚠️', texto: 'Aviso', cor: 'amarelo' };
            } else {
                return { icone: '❌', texto: 'Erro', cor: 'vermelho' };
            }
        },
        
        // Outras funções (PDF, CSV, JSON) mantidas do código anterior...
        
        gerarRelatorioPDF: function(dados, config) {
            // Implementação do PDF mantida...
            ExpertzyDI.log('REPORTS', 'PDF ainda não implementado com formatação completa');
            return { success: false, error: 'PDF em desenvolvimento' };
        },
        
        gerarRelatorioCSV: function(dados, config) {
            // Implementação do CSV mantida...
            ExpertzyDI.log('REPORTS', 'Gerando relatório CSV para ERP');
            
            const headers = [
                'NCM', 'Descricao', 'Quantidade', 'Unidade', 'Valor_Unitario',
                'Custo_Total_BRL', 'II', 'IPI', 'PIS', 'COFINS', 'ICMS', 'Custo_Unitario_Final'
            ];
            
            const linhas = [headers.join(',')];
            
            dados.adicoes.forEach(adicao => {
                const linha = [
                    `"${adicao.codigoNCM || ''}"`,
                    `"${(adicao.descricaoMercadoria || '').replace(/"/g, '""')}"`,
                    adicao.quantidadeTotal || 0,
                    `"${adicao.unidadeMedidaComercializada || ''}"`,
                    (adicao.valorMercadoriaFOB || 0).toFixed(2),
                    (adicao.custoTotal || 0).toFixed(2),
                    (adicao.impostos?.II?.valor || 0).toFixed(2),
                    (adicao.impostos?.IPI?.valor || 0).toFixed(2),
                    (adicao.impostos?.PIS?.valor || 0).toFixed(2),
                    (adicao.impostos?.COFINS?.valor || 0).toFixed(2),
                    (adicao.impostos?.ICMS?.valor || 0).toFixed(2),
                    (adicao.custoUnitario || 0).toFixed(2)
                ];
                
                linhas.push(linha.join(','));
            });
            
            const csvContent = linhas.join('\n');
            const nomeArquivo = this.gerarNomeArquivo('csv', dados, config);
            
            this.downloadArquivo(csvContent, nomeArquivo, 'text/csv;charset=utf-8;');
            
            ExpertzyDI.log('REPORTS', 'Relatório CSV gerado com sucesso', { arquivo: nomeArquivo });
            return { success: true, arquivo: nomeArquivo, formato: 'csv' };
        },
        
        gerarRelatorioJSON: function(dados, config) {
            // Implementação do JSON mantida...
            const relatorio = {
                metadata: {
                    titulo: config.titulo,
                    dataGeracao: config.dataGeracao.toISOString(),
                    versaoSistema: config.versaoSistema,
                    empresa: config.empresa,
                    responsavel: config.responsavel
                },
                
                declaracaoImportacao: {
                    numero: dados.numero,
                    dataRegistro: dados.dataRegistro,
                    importador: dados.importador,
                    incoterm: dados.incoterm
                },
                
                resumo: {
                    quantidadeAdicoes: dados.adicoes.length,
                    quantidadeItens: dados.adicoes.reduce((sum, adicao) => sum + (adicao.itens?.length || 0), 0),
                    valorTotalMercadoria: dados.totais?.valorMercadoria || 0,
                    custoTotalFinal: dados.totais?.custoTotal || 0,
                    impostosTotais: dados.totais?.impostos || {}
                },
                
                adicoes: dados.adicoes,
                incentivos: dados.incentivo || null,
                validacao: dados.validacao || null,
                auditoria: ExpertzyDI.data.auditLog || []
            };
            
            const jsonContent = JSON.stringify(relatorio, null, 2);
            const nomeArquivo = this.gerarNomeArquivo('json', dados, config);
            
            this.downloadArquivo(jsonContent, nomeArquivo, 'application/json;charset=utf-8;');
            
            ExpertzyDI.log('REPORTS', 'Relatório JSON gerado com sucesso', { arquivo: nomeArquivo });
            return { success: true, arquivo: nomeArquivo, formato: 'json' };
        },
        
        // Utilitários gerais
        
        gerarNomeArquivo: function(formato, dados, config) {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:\-]/g, '').replace('T', '_');
            const prefixo = 'Expertzy_DI_Analise';
            const numeroOrdem = dados.numero ? `_${dados.numero}` : '';
            const extensao = formato === 'excel' ? 'xlsx' : formato;
            
            return `${prefixo}${numeroOrdem}_${timestamp}.${extensao}`;
        },
        
        downloadArquivo: function(conteudo, nomeArquivo, mimeType) {
            const blob = new Blob([conteudo], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = nomeArquivo;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        },
        
        formatarMoeda: function(valor) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor || 0);
        }
    };
    
})(window.ExpertzyDI);