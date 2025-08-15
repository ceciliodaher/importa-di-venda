/*
FILE-UTILS.JS - Utilitários para manipulação de arquivos
Expertzy Inteligência Tributária
*/

(function(ExpertzyDI) {
    'use strict';
    
    // Módulo de utilitários de arquivo
    ExpertzyDI.utils.file = {
        
        // Validar arquivo
        validateFile: function(file) {
            return new Promise((resolve, reject) => {
                // Verificar se é um arquivo
                if (!file) {
                    reject(new Error('Nenhum arquivo selecionado'));
                    return;
                }
                
                // Verificar extensão
                if (!file.name.toLowerCase().endsWith('.xml')) {
                    reject(new Error('Arquivo deve ter extensão .xml'));
                    return;
                }
                
                // Verificar tipo MIME
                if (file.type && !['text/xml', 'application/xml'].includes(file.type)) {
                    reject(new Error('Tipo de arquivo inválido. Selecione um arquivo XML.'));
                    return;
                }
                
                // Verificar tamanho (máximo 50MB)
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                    reject(new Error('Arquivo muito grande. Máximo 50MB permitido.'));
                    return;
                }
                
                // Verificar se não está vazio
                if (file.size === 0) {
                    reject(new Error('Arquivo está vazio'));
                    return;
                }
                
                ExpertzyDI.log('FILE', 'Arquivo validado com sucesso', {
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                
                resolve(file);
            });
        },
        
        // Ler arquivo como texto
        readAsText: function(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    ExpertzyDI.log('FILE', 'Arquivo lido como texto', {
                        size: e.target.result.length
                    });
                    resolve(e.target.result);
                };
                
                reader.onerror = function(e) {
                    ExpertzyDI.log('ERROR', 'Erro ao ler arquivo', e);
                    reject(new Error('Erro ao ler arquivo'));
                };
                
                reader.readAsText(file, 'UTF-8');
            });
        },
        
        // Configurar drag and drop
        setupDragAndDrop: function() {
            const dragDropZone = document.getElementById('dragDropZone');
            const fileInput = document.getElementById('fileInput');
            
            if (!dragDropZone) return;
            
            // Prevenir comportamento padrão
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dragDropZone.addEventListener(eventName, this.preventDefaults, false);
                document.body.addEventListener(eventName, this.preventDefaults, false);
            });
            
            // Destacar área de drop
            ['dragenter', 'dragover'].forEach(eventName => {
                dragDropZone.addEventListener(eventName, () => {
                    dragDropZone.classList.add('drag-over');
                }, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dragDropZone.addEventListener(eventName, () => {
                    dragDropZone.classList.remove('drag-over');
                }, false);
            });
            
            // Manipular drop
            dragDropZone.addEventListener('drop', this.handleDrop.bind(this), false);
            
            // Click para abrir seletor de arquivo
            dragDropZone.addEventListener('click', () => {
                fileInput.click();
            });
            
            // Manipular seleção de arquivo via input
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
            
            ExpertzyDI.log('FILE', 'Drag and Drop configurado');
        },
        
        // Prevenir comportamentos padrão
        preventDefaults: function(e) {
            e.preventDefault();
            e.stopPropagation();
        },
        
        // Manipular drop de arquivo
        handleDrop: function(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        },
        
        // Manipular seleção de arquivo (drop ou click)
        handleFileSelect: function(file) {
            // Validar e processar arquivo
            this.validateFile(file)
                .then(() => {
                    this.displayFileInfo(file);
                    
                    // Armazenar arquivo no estado global
                    ExpertzyDI.data.currentFile = file;
                    
                    // Processar arquivo automaticamente
                    this.processFile(file);
                    
                    ExpertzyDI.log('FILE', 'Arquivo selecionado e validado', {
                        name: file.name,
                        size: file.size
                    });
                })
                .catch(error => {
                    this.showError(error.message);
                });
        },
        
        // Exibir informações do arquivo
        displayFileInfo: function(file) {
            const fileInfo = document.getElementById('fileInfo');
            const fileName = document.getElementById('fileName');
            
            if (fileInfo && fileName) {
                fileName.textContent = file.name;
                fileInfo.classList.remove('expertzy-hidden');
            }
        },
        
        // Processar arquivo XML
        processFile: function(file) {
            this.readAsText(file)
                .then(content => {
                    // Processar XML usando o módulo XML processor
                    if (ExpertzyDI.modules.xmlProcessor) {
                        return ExpertzyDI.modules.xmlProcessor.process(content);
                    } else {
                        throw new Error('Módulo de processamento XML não disponível');
                    }
                })
                .then(dados => {
                    // Armazenar dados processados
                    ExpertzyDI.data.currentDI = dados;
                    
                    // Mostrar seção de configuração
                    this.showConfigSection();
                    
                    ExpertzyDI.log('FILE', 'Arquivo processado com sucesso');
                })
                .catch(error => {
                    this.showError('Erro ao processar arquivo: ' + error.message);
                });
        },
        
        // Mostrar seção de configuração
        showConfigSection: function() {
            const configSection = document.getElementById('configSection');
            if (configSection) {
                configSection.classList.remove('expertzy-hidden');
            }
        },
        
        // Mostrar erro
        showError: function(message) {
            const errorContainer = document.getElementById('errorContainer');
            const errorMessage = document.getElementById('errorMessage');
            
            if (errorContainer && errorMessage) {
                errorMessage.textContent = message;
                errorContainer.classList.remove('expertzy-hidden');
            }
            
            // Também mostrar toast se disponível
            if (ExpertzyDI.modules.pricingUI && ExpertzyDI.modules.pricingUI.mostrarToast) {
                ExpertzyDI.modules.pricingUI.mostrarToast(message, 'error');
            }
        },
        
        // Download de arquivo
        downloadFile: function(content, filename, mimeType = 'text/plain') {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            ExpertzyDI.log('FILE', 'Arquivo baixado', {
                filename: filename,
                size: content.length,
                type: mimeType
            });
        },
        
        // Salvar dados em arquivo JSON
        saveAsJSON: function(data, filename = 'di-analysis.json') {
            const jsonString = JSON.stringify(data, null, 2);
            this.downloadFile(jsonString, filename, 'application/json');
        },
        
        // Salvar dados em arquivo CSV
        saveAsCSV: function(data, filename = 'di-analysis.csv') {
            let csvContent = '';
            
            if (Array.isArray(data) && data.length > 0) {
                // Headers
                const headers = Object.keys(data[0]);
                csvContent += headers.join(',') + '\n';
                
                // Dados
                data.forEach(row => {
                    const values = headers.map(header => {
                        let value = row[header] || '';
                        // Escapar valores que contêm vírgula ou aspas
                        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                            value = '"' + value.replace(/"/g, '""') + '"';
                        }
                        return value;
                    });
                    csvContent += values.join(',') + '\n';
                });
            }
            
            this.downloadFile(csvContent, filename, 'text/csv');
        },
        
        // Verificar suporte do navegador
        checkBrowserSupport: function() {
            const support = {
                fileReader: typeof FileReader !== 'undefined',
                dragAndDrop: 'draggable' in document.createElement('div'),
                downloadAttribute: 'download' in document.createElement('a'),
                blob: typeof Blob !== 'undefined'
            };
            
            const unsupported = [];
            Object.keys(support).forEach(feature => {
                if (!support[feature]) {
                    unsupported.push(feature);
                }
            });
            
            if (unsupported.length > 0) {
                ExpertzyDI.log('ERROR', 'Recursos não suportados pelo navegador', unsupported);
                return false;
            }
            
            ExpertzyDI.log('FILE', 'Todos os recursos de arquivo são suportados');
            return true;
        },
        
        // Obter informações do arquivo
        getFileInfo: function(file) {
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: new Date(file.lastModified),
                extension: file.name.split('.').pop().toLowerCase(),
                sizeFormatted: ExpertzyDI.formatFileSize ? ExpertzyDI.formatFileSize(file.size) : file.size + ' bytes'
            };
        }
    };
    
    // Inicializar drag and drop quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ExpertzyDI.utils.file.setupDragAndDrop();
            ExpertzyDI.utils.file.checkBrowserSupport();
        });
    } else {
        ExpertzyDI.utils.file.setupDragAndDrop();
        ExpertzyDI.utils.file.checkBrowserSupport();
    }
    
})(window.ExpertzyDI);