/*
EXPERTZY INTELIGÊNCIA TRIBUTÁRIA
© 2025 Expertzy Inteligência Tributária
Sistema de Análise de DI - Aplicação Principal

Cores Corporativas:
- Vermelho Expertzy: #FF002D
- Azul Naval: #091A30  
- Cinza Claro: #FFFFFF
*/

(function() {
    'use strict';
    
    // Namespace principal do sistema
    window.ExpertzyDI = {
        // Informações da aplicação
        app: {
            name: 'Expertzy DI Analyzer',
            version: '1.0.0',
            author: 'Expertzy Inteligência Tributária',
            description: 'Sistema de análise de Declarações de Importação'
        },
        
        // Configurações da marca
        brand: {
            colors: {
                primary: '#FF002D',
                secondary: '#091A30',
                light: '#FFFFFF',
                success: '#28A745',
                warning: '#FFC107',
                danger: '#DC3545',
                info: '#17A2B8'
            },
            fonts: {
                primary: 'gadeg thin',
                secondary: 'BRFirma Medium',
                monospace: 'Monaco'
            }
        },
        
        // Módulos do sistema
        modules: {},
        
        // Utilitários
        utils: {},
        
        // Dados da aplicação
        data: {
            currentFile: null,
            currentDI: null,
            calculations: {},
            validationResults: {},
            auditLog: [],
            config: {
                incoterm: 'FOB',
                estado: 'GO',
                incentivosAtivos: false,
                afrmm: 0,
                siscomex: 0,
                regime: 'real',
                margem: 0
            }
        },
        
        // Estado da aplicação
        state: {
            currentModule: 'config',
            isProcessing: false,
            hasData: false,
            lastUpdate: null
        },
        
        // Constantes do sistema
        constants: {
            // Estados e alíquotas ICMS
            ALIQ_ICMS_ESTADOS: {
                "GO": { "nome": "Goiás", "aliquota": 0.19, "codigo": "GO" },
                "SC": { "nome": "Santa Catarina", "aliquota": 0.17, "codigo": "SC" },
                "ES": { "nome": "Espírito Santo", "aliquota": 0.17, "codigo": "ES" },
                "MG": { "nome": "Minas Gerais", "aliquota": 0.18, "codigo": "MG" },
                "SP": { "nome": "São Paulo", "aliquota": 0.18, "codigo": "SP" },
                "RJ": { "nome": "Rio de Janeiro", "aliquota": 0.18, "codigo": "RJ" },
                "RS": { "nome": "Rio Grande do Sul", "aliquota": 0.18, "codigo": "RS" },
                "PR": { "nome": "Paraná", "aliquota": 0.19, "codigo": "PR" },
                "BA": { "nome": "Bahia", "aliquota": 0.205, "codigo": "BA" },
                "PE": { "nome": "Pernambuco", "aliquota": 0.18, "codigo": "PE" }
            },
            
            // Incentivos fiscais por estado
            INCENTIVOS_FISCAIS: {
                "GO": {
                    "nome": "COMEXPRODUZIR",
                    "descricao": "Crédito outorgado de 65% sobre o saldo devedor do ICMS nas operações interestaduais",
                    "tipo": "credito_outorgado",
                    "ativo": true,
                    "parametros": {
                        "aliquota_interestadual": 0.04,
                        "credito_outorgado_pct": 0.65,
                        "aliquota_interna_reduzida": 0.04,
                        "contrapartidas": {
                            "FUNPRODUZIR": 0.05,
                            "PROTEGE": 0.15
                        }
                    },
                    "carga_efetiva_interestadual": 0.0192,
                    "carga_efetiva_interna": 0.04
                },
                "SC": {
                    "nome": "TTD 409",
                    "descricao": "Tratamento Tributário Diferenciado com alíquotas efetivas reduzidas",
                    "tipo": "aliquota_efetiva",
                    "ativo": true,
                    "parametros": {
                        "aliquota_importacao_fase1": 0.026,
                        "aliquota_importacao_fase2": 0.01,
                        "contrapartidas": {
                            "Fundo_Educacao": 0.004
                        }
                    },
                    "carga_efetiva_interestadual": 0.014
                },
                "ES": {
                    "nome": "INVEST-ES Importação",
                    "descricao": "Diferimento total do ICMS na importação + redução de 75% nas saídas para CD",
                    "tipo": "diferimento_reducao",
                    "ativo": true,
                    "parametros": {
                        "diferimento_importacao": true,
                        "reducao_saida_pct": 0.75,
                        "contrapartidas": {
                            "Taxa_Administrativa": 0.005
                        }
                    },
                    "carga_efetiva_interestadual": 0.0434
                },
                "MG": {
                    "nome": "Corredor de Importação MG",
                    "descricao": "Diferimento na importação + crédito presumido nas saídas",
                    "tipo": "credito_presumido",
                    "ativo": true,
                    "parametros": {
                        "credito_interestadual_com_similar": 0.03,
                        "credito_interno_com_similar": 0.06,
                        "credito_interestadual_sem_similar": 0.025,
                        "credito_interno_sem_similar": 0.05
                    },
                    "carga_efetiva_interestadual": 0.01
                }
            },
            
            // Tolerâncias de validação
            VALIDATION_TOLERANCE: {
                GREEN: 0.0001,   // 0.01%
                YELLOW: 0.01,    // 1.00%
                RED: Infinity    // > 1.00%
            },
            
            // Formatos de arquivo suportados
            SUPPORTED_FORMATS: {
                XML: ['.xml', 'text/xml', 'application/xml']
            }
        },
        
        // Inicialização da aplicação
        init: function() {
            console.log(`%c${this.app.name} v${this.app.version}`, 
                       `color: ${this.brand.colors.primary}; font-size: 16px; font-weight: bold;`);
            console.log(`%c© 2025 ${this.app.author}`, 
                       `color: ${this.brand.colors.secondary}; font-size: 12px;`);
            
            this.setupEventListeners();
            this.initializeModules();
            this.updateStatus('waiting', 'Aguardando arquivo XML');
            
            // Log de inicialização
            this.log('SYSTEM', 'Sistema inicializado com sucesso');
        },
        
        // Configurar event listeners globais
        setupEventListeners: function() {
            // Event listener para mudança de arquivo
            const fileInput = document.getElementById('xml-file');
            if (fileInput) {
                fileInput.addEventListener('change', this.handleFileSelect.bind(this));
            }
            
            // Event listeners para tabs
            const tabs = document.querySelectorAll('.tab-item');
            tabs.forEach(tab => {
                tab.addEventListener('click', this.switchModule.bind(this));
            });
            
            // Event listeners para configuração
            this.setupConfigListeners();
            
            // Event listener global para erros
            window.addEventListener('error', this.handleGlobalError.bind(this));
        },
        
        // Configurar listeners de configuração
        setupConfigListeners: function() {
            // INCOTERM
            const incotermRadios = document.querySelectorAll('input[name="incoterm"]');
            incotermRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.data.config.incoterm = e.target.value;
                    this.log('CONFIG', `INCOTERM alterado para: ${e.target.value}`);
                });
            });
            
            // Estado
            const estadoSelect = document.getElementById('estado-destino');
            if (estadoSelect) {
                estadoSelect.addEventListener('change', (e) => {
                    this.data.config.estado = e.target.value;
                    this.log('CONFIG', `Estado alterado para: ${e.target.value}`);
                });
            }
            
            // Despesas adicionais
            const afrmmInput = document.getElementById('afrmm');
            const siscomexInput = document.getElementById('siscomex');
            
            if (afrmmInput) {
                afrmmInput.addEventListener('change', (e) => {
                    this.data.config.afrmm = parseFloat(e.target.value) || 0;
                    this.log('CONFIG', `AFRMM: R$ ${this.data.config.afrmm.toFixed(2)}`);
                });
            }
            
            if (siscomexInput) {
                siscomexInput.addEventListener('change', (e) => {
                    this.data.config.siscomex = parseFloat(e.target.value) || 0;
                    this.log('CONFIG', `SISCOMEX: R$ ${this.data.config.siscomex.toFixed(2)}`);
                });
            }
            
            // Event listener para botão de processar cálculos
            const processarBtn = document.getElementById('processar-calculos');
            if (processarBtn) {
                processarBtn.addEventListener('click', () => {
                    this.processarCalculos();
                });
            }
        },
        
        // Inicializar módulos (aguarda carregamento)
        initializeModules: function() {
            // Os módulos serão inicializados quando os scripts forem carregados
            // Cada módulo se registrará automaticamente no namespace
        },
        
        // Manipular seleção de arquivo
        handleFileSelect: function(event) {
            const file = event.target.files[0];
            if (file) {
                this.processFile(file);
            }
        },
        
        // Processar arquivo
        processFile: function(file) {
            if (!this.utils.file) {
                this.showError('Módulo de arquivo não carregado');
                return;
            }
            
            this.utils.file.validateFile(file)
                .then(() => {
                    this.displayFileInfo(file);
                })
                .catch(error => {
                    this.showError(error.message);
                });
        },
        
        // Exibir informações do arquivo
        displayFileInfo: function(file) {
            const fileInfoPanel = document.getElementById('file-info-panel');
            const fileName = document.getElementById('file-name');
            const fileSize = document.getElementById('file-size');
            
            if (fileInfoPanel && fileName && fileSize) {
                fileName.textContent = file.name;
                fileSize.textContent = this.formatFileSize(file.size);
                fileInfoPanel.style.display = 'block';
                
                // Esconder área de upload
                const uploadArea = document.getElementById('upload-area');
                if (uploadArea) {
                    uploadArea.style.display = 'none';
                }
            }
        },
        
        // Formatar tamanho do arquivo
        formatFileSize: function(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },
        
        // Processar cálculos com os dados da DI
        processarCalculos: function() {
            if (!this.data.currentDI) {
                this.showError('Nenhuma DI carregada para processamento');
                return;
            }
            
            try {
                this.log('APP', 'Iniciando processamento de cálculos...');
                this.updateStatus('info', 'Processando cálculos...');
                
                // Coletear configurações atuais da interface
                const config = this.coletarConfiguracao();
                
                // Executar cálculos de custo
                if (this.modules.costCalculator) {
                    const resultadosCusto = this.modules.costCalculator.calcularCustosUnitarios(
                        this.data.currentDI, 
                        config
                    );
                    this.data.calculations = resultadosCusto;
                }
                
                // Executar validação
                if (this.modules.validation && this.modules.validation.executeValidation) {
                    this.modules.validation.executeValidation();
                }
                
                // Ativar outros módulos
                this.ativarModulosCalculados();
                
                this.log('APP', 'Cálculos processados com sucesso');
                this.updateStatus('success', 'Cálculos processados com sucesso');
                
            } catch (error) {
                this.log('ERROR', `Erro no processamento: ${error.message}`);
                this.showError(`Erro no processamento: ${error.message}`);
            }
        },
        
        // Coletar configuração atual da interface
        coletarConfiguracao: function() {
            return {
                incoterm: document.querySelector('input[name="incoterm"]:checked')?.value || 'FOB',
                estado: document.getElementById('estado-destino')?.value || 'GO',
                afrmm: parseFloat(document.getElementById('afrmm')?.value || '0'),
                siscomex: parseFloat(document.getElementById('siscomex')?.value || '0')
            };
        },
        
        // Ativar módulos após cálculos
        ativarModulosCalculados: function() {
            // Ativar tabs de validação, incentivos, etc.
            const tabs = document.querySelectorAll('.tab-item.disabled');
            tabs.forEach(tab => {
                tab.classList.remove('disabled');
                tab.removeAttribute('title');
            });
            
            // Atualizar interface com resultados
            this.atualizarInterfaceComResultados();
        },
        
        // Atualizar interface com resultados
        atualizarInterfaceComResultados: function() {
            // População automática dos módulos de validação, incentivos, etc.
            // O módulo de validação já exibe os resultados automaticamente no executeValidation
            this.log('APP', 'Interface atualizada com resultados dos cálculos');
        },
        
        // Trocar módulo ativo
        switchModule: function(event) {
            const moduleId = event.target.closest('.tab-item').dataset.module;
            
            // Atualizar tabs
            document.querySelectorAll('.tab-item').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.closest('.tab-item').classList.add('active');
            
            // Atualizar módulos
            document.querySelectorAll('.module').forEach(module => {
                module.classList.remove('active');
            });
            
            const targetModule = document.getElementById(`${moduleId}-module`);
            if (targetModule) {
                targetModule.classList.add('active');
                this.state.currentModule = moduleId;
                this.log('UI', `Módulo ativo: ${moduleId}`);
            }
        },
        
        // Atualizar status global
        updateStatus: function(status, message) {
            const statusIndicator = document.getElementById('status-indicator');
            const statusText = document.getElementById('status-text');
            
            if (statusIndicator) {
                statusIndicator.className = `status-indicator ${status}`;
            }
            
            if (statusText) {
                statusText.textContent = message;
            }
            
            this.state.lastUpdate = new Date();
            this.log('STATUS', `${status.toUpperCase()}: ${message}`);
        },
        
        // Mostrar overlay de processamento
        showProcessing: function(title, message) {
            const overlay = document.getElementById('processing-overlay');
            const titleEl = document.getElementById('processing-title');
            const messageEl = document.getElementById('processing-message');
            
            if (overlay) {
                overlay.style.display = 'flex';
                this.state.isProcessing = true;
            }
            
            if (titleEl) titleEl.textContent = title;
            if (messageEl) messageEl.textContent = message;
            
            this.updateProgress(0);
        },
        
        // Esconder overlay de processamento
        hideProcessing: function() {
            const overlay = document.getElementById('processing-overlay');
            if (overlay) {
                overlay.style.display = 'none';
                this.state.isProcessing = false;
            }
        },
        
        // Atualizar progresso
        updateProgress: function(percentage) {
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${Math.round(percentage)}%`;
            }
        },
        
        // Mostrar erro
        showError: function(message) {
            console.error('Erro:', message);
            this.updateStatus('error', `Erro: ${message}`);
            
            // Aqui você pode implementar um modal de erro mais sofisticado
            alert(`Erro: ${message}`);
        },
        
        // Sistema de logging
        log: function(category, message, data = null) {
            const timestamp = new Date().toISOString();
            const logEntry = {
                timestamp,
                category,
                message,
                data
            };
            
            this.data.auditLog.push(logEntry);
            
            // Log no console com cores
            const colors = {
                SYSTEM: '#FF002D',
                CONFIG: '#091A30', 
                UI: '#17A2B8',
                STATUS: '#28A745',
                ERROR: '#DC3545',
                VALIDATION: '#FFC107'
            };
            
            console.log(`%c[${category}] ${message}`, 
                       `color: ${colors[category] || '#6C757D'}; font-weight: bold;`, 
                       data || '');
        },
        
        // Manipular erros globais
        handleGlobalError: function(event) {
            this.log('ERROR', 'Erro global capturado', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        },
        
        // Utilitários gerais
        formatCurrency: function(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        },
        
        formatPercentage: function(value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'percent',
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            }).format(value);
        },
        
        formatNumber: function(value, decimals = 2) {
            return new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value);
        }
    };
    
    // Processar XML (função global para compatibilidade)
    window.processXML = function() {
        if (ExpertzyDI.modules.xmlProcessor && typeof ExpertzyDI.modules.xmlProcessor.process === 'function') {
            ExpertzyDI.modules.xmlProcessor.process();
        } else {
            ExpertzyDI.showError('Módulo XML Processor não está disponível');
        }
    };
    
    // Gerar relatório (função global para compatibilidade)
    window.generateReport = function(type) {
        if (ExpertzyDI.modules.reports && typeof ExpertzyDI.modules.reports.generate === 'function') {
            ExpertzyDI.modules.reports.generate(type);
        } else {
            ExpertzyDI.showError('Módulo de relatórios não está disponível');
        }
    };
    
    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ExpertzyDI.init();
        });
    } else {
        ExpertzyDI.init();
    }
    
})();