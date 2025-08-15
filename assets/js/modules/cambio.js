/*
CAMBIO.JS - Módulo de Gestão de Câmbio
Expertzy Inteligência Tributária

Funcionalidades:
- Configuração de câmbio único ou múltiplo
- Cálculo de média ponderada para múltiplos contratos
- Integração com sistema de custos
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.cambio = {
        
        // Configuração atual
        config: {
            tipo: 'di', // 'di', 'unico', 'multiplo'
            taxaDI: 0,
            taxaUnica: 0,
            contratos: []
        },
        
        // Contador para IDs únicos
        contadorId: 0,
        
        // Inicializar módulo
        init: function() {
            ExpertzyDI.log('CAMBIO', 'Módulo de câmbio inicializado');
        },
        
        // Adicionar contrato de câmbio
        adicionarContrato: function() {
            const id = 'contrato_' + (++this.contadorId);
            
            const contrato = {
                id: id,
                descricao: '',
                valorUSD: 0,
                taxaCambio: 0,
                valorBRL: 0
            };
            
            this.config.contratos.push(contrato);
            this.renderizarContrato(contrato);
            
            ExpertzyDI.log('CAMBIO', 'Contrato adicionado', contrato);
        },
        
        // Renderizar contrato na interface
        renderizarContrato: function(contrato) {
            const container = document.getElementById('contratosCambio');
            if (!container) return;
            
            const div = document.createElement('div');
            div.className = 'contrato-item';
            div.id = 'contrato_' + contrato.id;
            
            div.innerHTML = `
                <input type="text" 
                       placeholder="Descrição" 
                       value="${contrato.descricao}"
                       onchange="ExpertzyDI.modules.cambio.atualizarContrato('${contrato.id}', 'descricao', this.value)">
                
                <input type="number" 
                       placeholder="Valor USD" 
                       step="0.01"
                       value="${contrato.valorUSD}"
                       onchange="ExpertzyDI.modules.cambio.atualizarContrato('${contrato.id}', 'valorUSD', parseFloat(this.value) || 0)">
                
                <input type="number" 
                       placeholder="Taxa (R$/USD)" 
                       step="0.0001"
                       value="${contrato.taxaCambio}"
                       onchange="ExpertzyDI.modules.cambio.atualizarContrato('${contrato.id}', 'taxaCambio', parseFloat(this.value) || 0)">
                
                <button class="btn-remover-despesa" 
                        onclick="ExpertzyDI.modules.cambio.removerContrato('${contrato.id}')">
                    🗑️
                </button>
            `;
            
            container.appendChild(div);
        },
        
        // Atualizar contrato
        atualizarContrato: function(id, campo, valor) {
            const contrato = this.config.contratos.find(c => c.id === id);
            if (!contrato) return;
            
            contrato[campo] = valor;
            
            // Calcular valor em BRL
            if (campo === 'valorUSD' || campo === 'taxaCambio') {
                contrato.valorBRL = contrato.valorUSD * contrato.taxaCambio;
            }
            
            this.calcularMediaPonderada();
            
            ExpertzyDI.log('CAMBIO', `Contrato ${id} atualizado`, {campo, valor});
        },
        
        // Remover contrato
        removerContrato: function(id) {
            const index = this.config.contratos.findIndex(c => c.id === id);
            if (index === -1) return;
            
            this.config.contratos.splice(index, 1);
            
            const elemento = document.getElementById('contrato_' + id);
            if (elemento) {
                elemento.remove();
            }
            
            this.calcularMediaPonderada();
            
            ExpertzyDI.log('CAMBIO', 'Contrato removido: ' + id);
        },
        
        // Calcular média ponderada dos contratos
        calcularMediaPonderada: function() {
            if (this.config.contratos.length === 0) {
                this.atualizarMediaPonderada(0);
                return 0;
            }
            
            let somaValorBRL = 0;
            let somaValorUSD = 0;
            
            this.config.contratos.forEach(contrato => {
                somaValorBRL += contrato.valorUSD * contrato.taxaCambio;
                somaValorUSD += contrato.valorUSD;
            });
            
            const mediaPonderada = somaValorUSD > 0 ? somaValorBRL / somaValorUSD : 0;
            
            this.atualizarMediaPonderada(mediaPonderada);
            
            return mediaPonderada;
        },
        
        // Atualizar exibição da média ponderada
        atualizarMediaPonderada: function(valor) {
            const elemento = document.getElementById('taxaMediaPonderada');
            if (elemento) {
                elemento.textContent = `R$ ${valor.toFixed(4)}`;
            }
            
            // Armazenar no namespace global
            if (ExpertzyDI.data) {
                ExpertzyDI.data.taxaCambioEfetiva = valor;
            }
        },
        
        // Obter taxa de câmbio efetiva
        obterTaxaEfetiva: function() {
            const tipo = document.querySelector('input[name="tipoCambio"]:checked')?.value || 'di';
            
            switch(tipo) {
                case 'di':
                    return this.config.taxaDI || 0;
                    
                case 'unico':
                    const inputUnico = document.getElementById('taxaCambioUnico');
                    return parseFloat(inputUnico?.value) || 0;
                    
                case 'multiplo':
                    return this.calcularMediaPonderada();
                    
                default:
                    return 0;
            }
        },
        
        // Definir taxa da DI
        definirTaxaDI: function(taxa) {
            this.config.taxaDI = taxa;
            ExpertzyDI.log('CAMBIO', 'Taxa da DI definida: ' + taxa);
        },
        
        // Obter configuração completa
        obterConfiguracao: function() {
            return {
                tipo: document.querySelector('input[name="tipoCambio"]:checked')?.value || 'di',
                taxaEfetiva: this.obterTaxaEfetiva(),
                contratos: this.config.contratos,
                taxaDI: this.config.taxaDI
            };
        },
        
        // Limpar configuração
        limpar: function() {
            this.config = {
                tipo: 'di',
                taxaDI: 0,
                taxaUnica: 0,
                contratos: []
            };
            
            const container = document.getElementById('contratosCambio');
            if (container) {
                container.innerHTML = '';
            }
            
            this.atualizarMediaPonderada(0);
            
            // Reset radio buttons
            const radioDI = document.querySelector('input[name="tipoCambio"][value="di"]');
            if (radioDI) {
                radioDI.checked = true;
            }
        }
    };
    
})(window.ExpertzyDI);