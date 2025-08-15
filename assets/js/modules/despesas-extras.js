/*
DESPESAS-EXTRAS.JS - Módulo de Gestão de Despesas Extras de Importação
Expertzy Inteligência Tributária

Funcionalidades:
- Adicionar/remover despesas dinamicamente
- Configurar quais despesas compõem base ICMS
- Templates de despesas comuns
- Cálculo automático de totais
- Integração com sistema de custos
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.despesasExtras = {
        
        // Lista de despesas configuradas
        despesas: [],
        
        // Contador para IDs únicos
        contadorId: 0,
        
        // Templates de despesas comuns
        templates: {
            armazenagem: {
                descricao: 'Armazenagem Portuária',
                compoeBaseICMS: true,
                incluirNF: true,
                apenasParaCusto: false
            },
            capatazia: {
                descricao: 'Capatazia/Movimentação',
                compoeBaseICMS: true,
                incluirNF: true,
                apenasParaCusto: false
            },
            despachante: {
                descricao: 'Honorários Despachante',
                compoeBaseICMS: true,
                incluirNF: true,
                apenasParaCusto: false
            },
            thc: {
                descricao: 'THC - Terminal Handling Charge',
                compoeBaseICMS: true,
                incluirNF: true,
                apenasParaCusto: false
            },
            frete_interno: {
                descricao: 'Frete Interno (Porto-Empresa)',
                compoeBaseICMS: false,
                incluirNF: false,
                apenasParaCusto: true
            },
            consolidacao: {
                descricao: 'Consolidação/Desconsolidação BL',
                compoeBaseICMS: true,
                incluirNF: true,
                apenasParaCusto: false
            },
            isps: {
                descricao: 'ISPS - Taxa de Segurança',
                compoeBaseICMS: true,
                incluirNF: true,
                apenasParaCusto: false
            },
            scanner: {
                descricao: 'Taxa de Scanner/Inspeção',
                compoeBaseICMS: true,
                incluirNF: true,
                apenasParaCusto: false
            },
            seguro_interno: {
                descricao: 'Seguro Transporte Interno',
                compoeBaseICMS: false,
                incluirNF: false,
                apenasParaCusto: true
            },
            despesas_bancarias: {
                descricao: 'Despesas Bancárias/IOF',
                compoeBaseICMS: false,
                incluirNF: false,
                apenasParaCusto: true
            }
        },
        
        // Inicializar módulo
        init: function() {
            ExpertzyDI.log('DESPESAS_EXTRAS', 'Módulo de despesas extras inicializado');
            this.configurarEventListeners();
        },
        
        // Configurar event listeners
        configurarEventListeners: function() {
            // Listeners para opções de câmbio
            const radiosCambio = document.querySelectorAll('input[name="tipoCambio"]');
            radiosCambio.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.alternarTipoCambio(e.target.value);
                });
            });
        },
        
        // Adicionar despesa genérica
        adicionarDespesa: function(dados = null) {
            const id = 'desp_' + (++this.contadorId);
            
            const despesa = dados || {
                id: id,
                descricao: '',
                valor: 0,
                compoeBaseICMS: false,
                incluirNF: true,
                apenasParaCusto: false
            };
            
            despesa.id = id;
            this.despesas.push(despesa);
            
            this.renderizarDespesa(despesa);
            this.atualizarTotais();
            
            ExpertzyDI.log('DESPESAS_EXTRAS', 'Despesa adicionada', despesa);
        },
        
        // Adicionar despesa a partir de template
        adicionarTemplate: function(tipo) {
            const template = this.templates[tipo];
            if (!template) {
                ExpertzyDI.log('DESPESAS_EXTRAS', 'Template não encontrado: ' + tipo, 'error');
                return;
            }
            
            const despesa = Object.assign({}, template, {
                valor: 0
            });
            
            this.adicionarDespesa(despesa);
        },
        
        // Renderizar despesa na interface
        renderizarDespesa: function(despesa) {
            const container = document.getElementById('despesasLista');
            if (!container) return;
            
            const div = document.createElement('div');
            div.className = 'despesa-item';
            div.id = 'item_' + despesa.id;
            
            div.innerHTML = `
                <input type="text" 
                       class="despesa-descricao" 
                       placeholder="Descrição da despesa" 
                       value="${despesa.descricao}"
                       onchange="ExpertzyDI.modules.despesasExtras.atualizarDespesa('${despesa.id}', 'descricao', this.value)">
                
                <input type="number" 
                       class="despesa-valor" 
                       placeholder="0,00" 
                       step="0.01"
                       value="${despesa.valor}"
                       onchange="ExpertzyDI.modules.despesasExtras.atualizarDespesa('${despesa.id}', 'valor', parseFloat(this.value) || 0)">
                
                <label class="despesa-checkbox">
                    <input type="checkbox" 
                           ${despesa.compoeBaseICMS ? 'checked' : ''}
                           onchange="ExpertzyDI.modules.despesasExtras.atualizarDespesa('${despesa.id}', 'compoeBaseICMS', this.checked)">
                    Base ICMS
                </label>
                
                <label class="despesa-checkbox">
                    <input type="checkbox" 
                           ${despesa.incluirNF ? 'checked' : ''}
                           onchange="ExpertzyDI.modules.despesasExtras.atualizarDespesa('${despesa.id}', 'incluirNF', this.checked)">
                    Incluir NF
                </label>
                
                <label class="despesa-checkbox">
                    <input type="checkbox" 
                           ${despesa.apenasParaCusto ? 'checked' : ''}
                           onchange="ExpertzyDI.modules.despesasExtras.atualizarDespesa('${despesa.id}', 'apenasParaCusto', this.checked)">
                    Só Custo
                </label>
                
                <button class="btn-remover-despesa" 
                        onclick="ExpertzyDI.modules.despesasExtras.removerDespesa('${despesa.id}')">
                    🗑️
                </button>
            `;
            
            container.appendChild(div);
        },
        
        // Atualizar despesa
        atualizarDespesa: function(id, campo, valor) {
            const despesa = this.despesas.find(d => d.id === id);
            if (!despesa) return;
            
            despesa[campo] = valor;
            this.atualizarTotais();
            
            ExpertzyDI.log('DESPESAS_EXTRAS', `Despesa ${id} atualizada`, {campo, valor});
        },
        
        // Remover despesa
        removerDespesa: function(id) {
            const index = this.despesas.findIndex(d => d.id === id);
            if (index === -1) return;
            
            this.despesas.splice(index, 1);
            
            const elemento = document.getElementById('item_' + id);
            if (elemento) {
                elemento.remove();
            }
            
            this.atualizarTotais();
            
            ExpertzyDI.log('DESPESAS_EXTRAS', 'Despesa removida: ' + id);
        },
        
        // Atualizar totais
        atualizarTotais: function() {
            let totalBaseICMS = 0;
            let totalForaBase = 0;
            let totalGeral = 0;
            
            this.despesas.forEach(despesa => {
                const valor = despesa.valor || 0;
                totalGeral += valor;
                
                if (despesa.compoeBaseICMS) {
                    totalBaseICMS += valor;
                } else {
                    totalForaBase += valor;
                }
            });
            
            // Atualizar interface
            const elemTotalBase = document.getElementById('totalBaseICMS');
            const elemTotalFora = document.getElementById('totalForaBase');
            const elemTotalGeral = document.getElementById('totalDespesasExtras');
            
            if (elemTotalBase) elemTotalBase.textContent = this.formatarMoeda(totalBaseICMS);
            if (elemTotalFora) elemTotalFora.textContent = this.formatarMoeda(totalForaBase);
            if (elemTotalGeral) elemTotalGeral.textContent = this.formatarMoeda(totalGeral);
            
            // Armazenar no namespace global
            if (ExpertzyDI.data) {
                ExpertzyDI.data.despesasExtras = {
                    lista: this.despesas,
                    totais: {
                        baseICMS: totalBaseICMS,
                        foraBase: totalForaBase,
                        total: totalGeral
                    }
                };
            }
        },
        
        // Obter despesas configuradas
        obterDespesas: function() {
            return {
                lista: this.despesas,
                totais: this.calcularTotais()
            };
        },
        
        // Calcular totais
        calcularTotais: function() {
            let totalBaseICMS = 0;
            let totalForaBase = 0;
            let totalNF = 0;
            let totalCusto = 0;
            
            this.despesas.forEach(despesa => {
                const valor = despesa.valor || 0;
                
                if (despesa.compoeBaseICMS) {
                    totalBaseICMS += valor;
                } else {
                    totalForaBase += valor;
                }
                
                if (despesa.incluirNF) {
                    totalNF += valor;
                }
                
                if (despesa.apenasParaCusto) {
                    totalCusto += valor;
                }
            });
            
            return {
                baseICMS: totalBaseICMS,
                foraBase: totalForaBase,
                incluirNF: totalNF,
                apenasParaCusto: totalCusto,
                total: totalBaseICMS + totalForaBase
            };
        },
        
        // Alternar tipo de câmbio
        alternarTipoCambio: function(tipo) {
            const cambioUnico = document.getElementById('cambioUnico');
            const cambioMultiplo = document.getElementById('cambioMultiplo');
            
            if (cambioUnico) cambioUnico.classList.add('expertzy-hidden');
            if (cambioMultiplo) cambioMultiplo.classList.add('expertzy-hidden');
            
            if (tipo === 'unico' && cambioUnico) {
                cambioUnico.classList.remove('expertzy-hidden');
            } else if (tipo === 'multiplo' && cambioMultiplo) {
                cambioMultiplo.classList.remove('expertzy-hidden');
            }
        },
        
        // Formatar moeda
        formatarMoeda: function(valor) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor);
        },
        
        // Limpar todas as despesas
        limpar: function() {
            this.despesas = [];
            const container = document.getElementById('despesasLista');
            if (container) {
                container.innerHTML = '';
            }
            this.atualizarTotais();
        }
    };
    
})(window.ExpertzyDI);