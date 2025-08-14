/*
XML-PROCESSOR.JS - Módulo de Processamento XML
Baseado no código testado e funcional (importa-di-complete.js)
Expertzy Inteligência Tributária
*/

(function(ExpertzyDI) {
    'use strict';
    
    // Constantes para caminhos XML (baseado no código funcional)
    const DI_XML_PATHS = {
        ROOT: 'declaracaoImportacao',
        ADICAO: 'adicao',
        NUMERO_DI: 'numeroDI',
        DATA_REGISTRO: 'dataRegistro',
        URF_DESPACHO: 'urfDespachoNome',
        MODALIDADE: 'modalidadeDespachoNome',
        TOTAL_ADICOES: 'totalAdicoes',
        IMPORTADOR_CNPJ: 'importadorNumero',
        IMPORTADOR_NOME: 'importadorNome',
        FOB_USD: 'localEmbarqueTotalDolares',
        FOB_BRL: 'localEmbarqueTotalReais',
        FRETE_USD: 'freteTotalDolares',
        FRETE_BRL: 'freteTotalReais',
        SEGURO_BRL: 'seguroTotalReais',
        AFRMM: 'afrmm',
        SISCOMEX: 'taxaSiscomex',
        VALOR_ADUANEIRO: 'localDescargaTotalReais',
        // Campos das adições
        NUMERO_ADICAO: 'numeroAdicao',
        NCM: 'dadosMercadoriaCodigoNcm',
        DESCRICAO_NCM: 'dadosMercadoriaNomeNcm',
        VCMV_USD: 'condicaoVendaValorMoeda',
        VCMV_BRL: 'condicaoVendaValorReais',
        INCOTERM: 'condicaoVendaIncoterm',
        PESO_LIQUIDO_ADICAO: 'dadosMercadoriaPesoLiquido',
        QUANTIDADE_ESTATISTICA: 'dadosMercadoriaMedidaEstatisticaQuantidade',
        UNIDADE_ESTATISTICA: 'dadosMercadoriaMedidaEstatisticaUnidade',
        EXPORTADOR: 'fornecedorNome',
        PAIS_ORIGEM: 'paisOrigemMercadoriaNome',
        // Impostos
        II_ALIQUOTA: 'iiAliquotaAdValorem',
        II_VALOR: 'iiAliquotaValorRecolher',
        IPI_ALIQUOTA: 'ipiAliquotaAdValorem',
        IPI_VALOR: 'ipiAliquotaValorRecolher',
        PIS_ALIQUOTA: 'pisPasepAliquotaAdValorem',
        PIS_VALOR: 'pisPasepAliquotaValorRecolher',
        COFINS_ALIQUOTA: 'cofinsAliquotaAdValorem',
        COFINS_VALOR: 'cofinsAliquotaValorRecolher',
        PIS_COFINS_BASE: 'pisCofinsBaseCalculoValor'
    };
    
    ExpertzyDI.modules.xmlProcessor = {
        
        xmlDoc: null,
        rootElement: null,
        
        // Processar arquivo XML
        process: function(file = null) {
            // Se não foi passado arquivo, tentar pegar do input ou cache
            if (!file) {
                const fileInput = document.getElementById('xml-file');
                file = fileInput.files[0];
            }
            
            if (!file && ExpertzyDI.data.currentFile) {
                file = ExpertzyDI.data.currentFile;
            }
            
            if (!file) {
                ExpertzyDI.showError('Nenhum arquivo selecionado');
                return;
            }
            
            ExpertzyDI.log('XML_PROCESSOR', 'Iniciando processamento de XML');
            ExpertzyDI.showProcessing('Processando XML', 'Lendo arquivo da DI...');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const xmlContent = e.target.result;
                    this.parseXML(xmlContent)
                        .then((diData) => {
                            ExpertzyDI.data.currentDI = diData;
                            ExpertzyDI.state.hasData = true;
                            
                            this.exibirResultados(diData);
                            this.ativarModulos();
                            
                            ExpertzyDI.log('XML_PROCESSOR', 'Processamento concluído com sucesso', {
                                numero: diData.cabecalho.DI,
                                adicoes: diData.adicoes.length
                            });
                            
                            ExpertzyDI.updateStatus('success', 'DI processada com sucesso');
                            ExpertzyDI.hideProcessing();
                        })
                        .catch((error) => {
                            ExpertzyDI.log('XML_PROCESSOR', `Erro no processamento: ${error.message}`, 'ERROR');
                            ExpertzyDI.showError(`Erro no processamento: ${error.message}`);
                            ExpertzyDI.hideProcessing();
                        });
                        
                } catch (error) {
                    ExpertzyDI.log('XML_PROCESSOR', `Erro no processamento: ${error.message}`, 'ERROR');
                    ExpertzyDI.showError(`Erro no processamento: ${error.message}`);
                    ExpertzyDI.hideProcessing();
                }
            };
            
            reader.onerror = () => {
                ExpertzyDI.hideProcessing();
                ExpertzyDI.showError('Erro ao ler o arquivo');
            };
            
            reader.readAsText(file);
        },
        
        // Parse do XML (baseado no código funcional)
        parseXML: function(xmlContent) {
            const self = this;
            return new Promise(function(resolve, reject) {
                try {
                    ExpertzyDI.updateProgress(10);
                    
                    const parser = new DOMParser();
                    self.xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
                    
                    const parserError = self.xmlDoc.querySelector('parsererror');
                    if (parserError) {
                        throw new Error(`XML Parse Error: ${parserError.textContent}`);
                    }
                    
                    ExpertzyDI.updateProgress(30);
                    
                    self.rootElement = self.xmlDoc.querySelector(DI_XML_PATHS.ROOT);
                    if (!self.rootElement) {
                        throw new Error('Elemento declaracaoImportacao não encontrado no XML');
                    }
                    
                    ExpertzyDI.updateProgress(50);
                    
                    const data = {
                        cabecalho: self.extractCabecalho(),
                        importador: self.extractImportador(),
                        valores: self.extractValores(),
                        adicoes: self.extractAdicoes(),
                        informacaoComplementar: self.getTextContent('informacaoComplementar') || '—'
                    };
                    
                    ExpertzyDI.updateProgress(80);
                    
                    self.validateDIData(data);
                    
                    ExpertzyDI.updateProgress(100);
                    
                    resolve(data);
                    
                } catch (error) {
                    reject(new Error(`Erro ao processar XML: ${error.message}`));
                }
            });
        },
        
        // Extrair cabeçalho (baseado no código funcional)
        extractCabecalho: function() {
            return {
                DI: this.getTextContent(DI_XML_PATHS.NUMERO_DI) || 'N/A',
                dataRegistro: this.getTextContent(DI_XML_PATHS.DATA_REGISTRO) || 'N/A',
                urfDespacho: this.getTextContent(DI_XML_PATHS.URF_DESPACHO) || 'N/A',
                modalidade: this.getTextContent(DI_XML_PATHS.MODALIDADE) || 'N/A',
                qtdAdicoes: parseInt(this.getTextContent(DI_XML_PATHS.TOTAL_ADICOES) || '0')
            };
        },
        
        // Extrair dados do importador
        extractImportador: function() {
            return {
                cnpj: this.getTextContent(DI_XML_PATHS.IMPORTADOR_CNPJ) || 'N/A',
                nome: this.getTextContent(DI_XML_PATHS.IMPORTADOR_NOME) || 'N/A'
            };
        },
        
        // Extrair valores (baseado no código funcional)
        extractValores: function() {
            const valores = {
                fobUSD: this.parseNumericField(this.getTextContent(DI_XML_PATHS.FOB_USD) || '0'),
                fobBRL: this.parseNumericField(this.getTextContent(DI_XML_PATHS.FOB_BRL) || '0'),
                freteUSD: this.parseNumericField(this.getTextContent(DI_XML_PATHS.FRETE_USD) || '0'),
                freteBRL: this.parseNumericField(this.getTextContent(DI_XML_PATHS.FRETE_BRL) || '0'),
                seguroBRL: this.parseNumericField(this.getTextContent(DI_XML_PATHS.SEGURO_BRL) || '0'),
                afrmmBRL: this.parseNumericField(this.getTextContent(DI_XML_PATHS.AFRMM) || '0'),
                siscomexBRL: this.parseNumericField(this.getTextContent(DI_XML_PATHS.SISCOMEX) || '0'),
                valorAduaneiroBRL: this.parseNumericField(this.getTextContent(DI_XML_PATHS.VALOR_ADUANEIRO) || '0')
            };
            
            // Extrair informação complementar para buscar valores que podem não estar nos campos específicos
            const informacaoComplementar = this.getTextContent('informacaoComplementar') || '';
            
            // Se SISCOMEX não foi encontrado nos campos XML ou está zerado, buscar na informação complementar
            if (valores.siscomexBRL === 0 && informacaoComplementar) {
                const siscomexMatch = informacaoComplementar.match(/SISCOMEX.*?R\$\s*([\d.,]+)/i);
                if (siscomexMatch) {
                    valores.siscomexBRL = parseFloat(siscomexMatch[1].replace(/\./g, '').replace(',', '.')) || 0;
                }
            }
            
            // Se AFRMM não foi encontrado nos campos XML ou está zerado, buscar na informação complementar
            if (valores.afrmmBRL === 0 && informacaoComplementar) {
                const afrmmMatch = informacaoComplementar.match(/AFRMM.*?R\$\s*([\d.,]+)/i);
                if (afrmmMatch) {
                    valores.afrmmBRL = parseFloat(afrmmMatch[1].replace(/\./g, '').replace(',', '.')) || 0;
                }
            }
            
            // Buscar outros custos portuários (capatazia, armazenagem, etc.)
            if (informacaoComplementar) {
                let outrosCustos = 0;
                
                // Capatazia
                const capataziaMatch = informacaoComplementar.match(/CAPATAZIA.*?R\$\s*([\d.,]+)/i);
                if (capataziaMatch) {
                    outrosCustos += parseFloat(capataziaMatch[1].replace(/\./g, '').replace(',', '.')) || 0;
                }
                
                // Armazenagem
                const armazenagemMatch = informacaoComplementar.match(/ARMAZENAGEM.*?R\$\s*([\d.,]+)/i);
                if (armazenagemMatch) {
                    outrosCustos += parseFloat(armazenagemMatch[1].replace(/\./g, '').replace(',', '.')) || 0;
                }
                
                // Taxa de liberação
                const liberacaoMatch = informacaoComplementar.match(/LIBERACAO.*?R\$\s*([\d.,]+)/i);
                if (liberacaoMatch) {
                    outrosCustos += parseFloat(liberacaoMatch[1].replace(/\./g, '').replace(',', '.')) || 0;
                }
                
                if (outrosCustos > 0) {
                    valores.outrosCustosBRL = outrosCustos;
                }
            }
            
            // Detectar INCOTERM pelos valores e da primeira adição se disponível
            valores.incoterm = this.detectIncoterm(valores);
            
            return valores;
        },
        
        // Detectar INCOTERM
        detectIncoterm: function(valores) {
            // Primeiro tenta detectar pelas adições se já foram extraídas
            if (this.adicoesData && this.adicoesData.length > 0) {
                const primeiraAdicao = this.adicoesData[0];
                const incotermAdicao = primeiraAdicao.incoterm;
                if (incotermAdicao && incotermAdicao !== 'N/A') {
                    return incotermAdicao.toUpperCase();
                }
            }
            
            // Fallback: detectar pelos valores de frete e seguro
            if (valores.freteUSD === 0 && valores.seguroBRL === 0) {
                return 'FOB';
            } else if (valores.freteUSD > 0 && valores.seguroBRL === 0) {
                return 'CFR';
            } else if (valores.freteUSD > 0 && valores.seguroBRL > 0) {
                return 'CIF';
            }
            return 'FOB'; // Default
        },
        
        // Extrair adições (baseado no código funcional)
        extractAdicoes: function() {
            const adicoes = [];
            const adicaoElements = this.rootElement.querySelectorAll(DI_XML_PATHS.ADICAO);
            
            ExpertzyDI.log('XML_PROCESSOR', `Encontradas ${adicaoElements.length} adições`);
            
            for (let i = 0; i < adicaoElements.length; i++) {
                const adicaoElement = adicaoElements[i];
                const adicao = this.extractAdicao(adicaoElement, i + 1);
                if (adicao) {
                    adicoes.push(adicao);
                }
            }
            
            // Armazenar dados das adições para detecção de INCOTERM
            this.adicoesData = adicoes;
            
            return adicoes;
        },
        
        // Extrair dados de uma adição
        extractAdicao: function(element, index) {
            const adicao = {
                numero: index,
                numeroAdicao: this.getElementText(element, DI_XML_PATHS.NUMERO_ADICAO) || index.toString(),
                codigoNCM: this.getElementText(element, DI_XML_PATHS.NCM) || '',
                descricaoMercadoria: this.getElementText(element, DI_XML_PATHS.DESCRICAO_NCM) || '',
                vcmvUSD: this.parseNumericField(this.getElementText(element, DI_XML_PATHS.VCMV_USD) || '0'),
                vcmvBRL: this.parseNumericField(this.getElementText(element, DI_XML_PATHS.VCMV_BRL) || '0'),
                incoterm: this.getElementText(element, DI_XML_PATHS.INCOTERM) || 'FOB',
                pesoLiquido: this.parseNumericField(this.getElementText(element, DI_XML_PATHS.PESO_LIQUIDO_ADICAO) || '0', 1000), // kg com 3 decimais
                quantidade: this.parseNumericField(this.getElementText(element, DI_XML_PATHS.QUANTIDADE_ESTATISTICA) || '0', 1), // quantidade inteira
                unidade: this.getElementText(element, DI_XML_PATHS.UNIDADE_ESTATISTICA) || '',
                exportador: this.getElementText(element, DI_XML_PATHS.EXPORTADOR) || '',
                paisOrigem: this.getElementText(element, DI_XML_PATHS.PAIS_ORIGEM) || '',
                impostos: this.extractImpostosAdicao(element)
            };
            
            // Calcular valores derivados
            adicao.valorUnitario = adicao.quantidade > 0 ? adicao.vcmvBRL / adicao.quantidade : 0;
            adicao.valorTotal = adicao.vcmvBRL;
            
            return adicao;
        },
        
        // Extrair impostos de uma adição
        extractImpostosAdicao: function(element) {
            const impostos = {};
            
            // II - Imposto de Importação  
            // Alíquotas já vêm em percentual no XML, dividir por 100 para decimal
            const iiAliquota = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.II_ALIQUOTA) || '0', 10000); // 4 decimais percentual
            const iiValor = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.II_VALOR) || '0'); // valor em centavos
            if (iiAliquota > 0 || iiValor > 0) {
                impostos.II = {
                    aliquota: iiAliquota,
                    valor: iiValor,
                    base: iiAliquota > 0 ? iiValor / iiAliquota : 0
                };
            }
            
            // IPI
            const ipiAliquota = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.IPI_ALIQUOTA) || '0', 10000); // 4 decimais percentual
            const ipiValor = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.IPI_VALOR) || '0'); // valor em centavos
            if (ipiAliquota > 0 || ipiValor > 0) {
                impostos.IPI = {
                    aliquota: ipiAliquota,
                    valor: ipiValor,
                    base: ipiAliquota > 0 ? ipiValor / ipiAliquota : 0
                };
            }
            
            // PIS
            const pisAliquota = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.PIS_ALIQUOTA) || '0', 10000); // 4 decimais percentual
            const pisValor = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.PIS_VALOR) || '0'); // valor em centavos
            const pisBase = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.PIS_COFINS_BASE) || '0'); // base em centavos
            if (pisAliquota > 0 || pisValor > 0) {
                impostos.PIS = {
                    aliquota: pisAliquota,
                    valor: pisValor,
                    base: pisBase > 0 ? pisBase : (pisAliquota > 0 ? pisValor / pisAliquota : 0)
                };
            }
            
            // COFINS
            const cofinsAliquota = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.COFINS_ALIQUOTA) || '0', 10000); // 4 decimais percentual
            const cofinsValor = this.parseNumericField(this.getElementText(element, DI_XML_PATHS.COFINS_VALOR) || '0'); // valor em centavos
            if (cofinsAliquota > 0 || cofinsValor > 0) {
                impostos.COFINS = {
                    aliquota: cofinsAliquota,
                    valor: cofinsValor,
                    base: pisBase > 0 ? pisBase : (cofinsAliquota > 0 ? cofinsValor / cofinsAliquota : 0)
                };
            }
            
            return impostos;
        },
        
        // Obter texto do elemento (baseado no código funcional)
        getTextContent: function(path) {
            return this.getElementText(this.rootElement, path);
        },
        
        // Obter texto de elemento específico
        getElementText: function(element, path) {
            if (!element || !path) return null;
            const targetElement = element.querySelector(path);
            return targetElement ? targetElement.textContent : null;
        },
        
        // Converter para número (baseado no código funcional)
        // Valores monetários no XML da DI são armazenados em centavos (inteiros)
        parseNumericField: function(value, divisor = 100) {
            if (!value || value.trim() === '') return 0;
            
            // Remover caracteres não numéricos, mantendo apenas dígitos
            let cleanValue = value.toString().replace(/[^\d]/g, '');
            
            if (cleanValue === '') return 0;
            
            const number = parseInt(cleanValue, 10) || 0;
            
            // Para valores monetários, dividir por 100 (centavos para reais)
            // Para quantidades, usar divisor = 1 ou específico
            return number / divisor;
        },
        
        // Validar dados da DI
        validateDIData: function(diData) {
            const errors = [];
            
            if (!diData.cabecalho.DI || diData.cabecalho.DI === 'N/A') {
                errors.push('Número da DI não encontrado');
            }
            
            if (!diData.adicoes || diData.adicoes.length === 0) {
                errors.push('Nenhuma adição encontrada na DI');
            }
            
            if (errors.length > 0) {
                throw new Error(`Estrutura da DI inválida:\n${errors.join('\n')}`);
            }
        },
        
        // Exibir resultados no painel
        exibirResultados: function(dados) {
            const resultsSection = document.getElementById('results-section');
            const resultsSummary = document.getElementById('results-summary');
            
            if (resultsSection && resultsSummary) {
                resultsSection.style.display = 'block';
                
                resultsSummary.innerHTML = `
                    <div class="result-card">
                        <h3>DI ${dados.cabecalho.DI} processada com sucesso</h3>
                        <div class="result-grid">
                            <div class="result-item">
                                <label>Data de Registro:</label>
                                <span>${dados.cabecalho.dataRegistro}</span>
                            </div>
                            <div class="result-item">
                                <label>Importador:</label>
                                <span>${dados.importador.nome}</span>
                            </div>
                            <div class="result-item">
                                <label>INCOTERM:</label>
                                <span>${dados.valores.incoterm}</span>
                            </div>
                            <div class="result-item">
                                <label>Valor FOB:</label>
                                <span>${ExpertzyDI.formatCurrency(dados.valores.fobBRL)}</span>
                            </div>
                            <div class="result-item">
                                <label>Adições:</label>
                                <span>${dados.adicoes.length}</span>
                            </div>
                            <div class="result-item">
                                <label>INCOTERM:</label>
                                <span style="font-weight: bold; color: var(--expertzy-red);">${dados.valores.incoterm}</span>
                            </div>
                            <div class="result-item">
                                <label>AFRMM:</label>
                                <span>${ExpertzyDI.formatCurrency(dados.valores.afrmmBRL)}</span>
                            </div>
                            <div class="result-item">
                                <label>SISCOMEX:</label>
                                <span>${ExpertzyDI.formatCurrency(dados.valores.siscomexBRL)}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        },
        
        // Ativar módulos após processamento
        ativarModulos: function() {
            const moduleTabs = document.getElementById('module-tabs');
            const modulesContainer = document.getElementById('modules-container');
            
            if (moduleTabs) {
                moduleTabs.style.display = 'flex';
            }
            
            if (modulesContainer) {
                modulesContainer.style.display = 'block';
            }
            
            // Configurar dados iniciais nos módulos
            if (ExpertzyDI.data.currentDI) {
                this.configurarInterface(ExpertzyDI.data.currentDI);
            }
        },
        
        // Configurar interface com dados extraídos
        configurarInterface: function(di) {
            const valores = di.valores;
            
            // Configurar INCOTERM detectado automaticamente
            this.selecionarIncoterm(valores.incoterm);
            
            // Preencher despesas adicionais
            this.preencherDespesasAdicionais(valores);
            
            // Atualizar configuração global
            ExpertzyDI.data.config.incoterm = valores.incoterm;
            ExpertzyDI.data.config.afrmm = valores.afrmmBRL || 0;
            ExpertzyDI.data.config.siscomex = valores.siscomexBRL || 0;
            
            ExpertzyDI.log('XML_PROCESSOR', `Interface configurada - INCOTERM: ${valores.incoterm}, AFRMM: ${valores.afrmmBRL}, SISCOMEX: ${valores.siscomexBRL}`);
        },
        
        // Selecionar INCOTERM na interface
        selecionarIncoterm: function(incoterm) {
            const incotermRadios = document.querySelectorAll('input[name="incoterm"]');
            incotermRadios.forEach(radio => {
                if (radio.value === incoterm) {
                    radio.checked = true;
                }
            });
            
            // Adicionar indicação visual de INCOTERM detectado
            this.mostrarIncotermDetectado(incoterm);
        },
        
        // Mostrar indicação de INCOTERM detectado
        mostrarIncotermDetectado: function(incoterm) {
            const configCard = document.querySelector('.config-card h3');
            if (configCard && configCard.textContent === 'INCOTERM') {
                const detectedIndicator = document.createElement('div');
                detectedIndicator.className = 'incoterm-detected';
                detectedIndicator.style.cssText = `
                    background: #E8F5E8;
                    color: #2D5016;
                    padding: 0.5rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                `;
                detectedIndicator.innerHTML = `
                    <span>🎯</span>
                    <strong>INCOTERM detectado automaticamente: ${incoterm}</strong>
                `;
                
                // Inserir após o título
                configCard.parentNode.insertBefore(detectedIndicator, configCard.nextSibling);
            }
        },
        
        // Preencher despesas adicionais
        preencherDespesasAdicionais: function(valores) {
            const afrmmInput = document.getElementById('afrmm');
            const siscomexInput = document.getElementById('siscomex');
            
            if (afrmmInput && valores.afrmmBRL > 0) {
                afrmmInput.value = valores.afrmmBRL.toFixed(2);
            }
            
            if (siscomexInput && valores.siscomexBRL > 0) {
                siscomexInput.value = valores.siscomexBRL.toFixed(2);
            }
        }
    };
    
})(window.ExpertzyDI);