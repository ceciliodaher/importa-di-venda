/*
PRICING-UI.JS - Interface de Precificação Modular
Sistema independente para cálculo de preços de venda
Expertzy Inteligência Tributária
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.modules.pricingUI = {
        
        // Estado do módulo
        isInitialized: false,
        modalVisible: false,
        dadosProdutos: [],
        
        // Inicializar módulo
        init: function() {
            if (this.isInitialized) return;
            
            ExpertzyDI.log('PRICING_UI', 'Inicializando módulo de precificação');
            this.configurarEventListeners();
            this.isInitialized = true;
        },
        
        // Configurar event listeners
        configurarEventListeners: function() {
            // Botão de precificação
            const pricingBtn = document.getElementById('pricingBtn');
            if (pricingBtn) {
                pricingBtn.addEventListener('click', () => this.abrirModal());
            }
            
            // Fechar modal
            const closeBtn = document.getElementById('closePricingModal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.fecharModal());
            }
            
            // Clique fora do modal
            const modal = document.getElementById('pricingModal');
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.fecharModal();
                    }
                });
            }
        },
        
        // Abrir modal
        abrirModal: function() {
            // Verificar se há dados disponíveis
            if (!this.verificarDadosDisponiveis()) {
                this.mostrarToast('Execute os cálculos da DI primeiro antes de abrir o módulo de precificação.', 'warning');
                return;
            }
            
            // Carregar dados dos produtos
            this.carregarDadosProdutos();
            
            // Atualizar conteúdo do modal
            this.atualizarConteudoModal();
            
            // Mostrar modal
            const modal = document.getElementById('pricingModal');
            if (modal) {
                modal.style.display = 'flex';
                this.modalVisible = true;
            }
            
            ExpertzyDI.log('PRICING_UI', 'Modal de precificação aberto');
        },
        
        // Fechar modal
        fecharModal: function() {
            const modal = document.getElementById('pricingModal');
            if (modal) {
                modal.style.display = 'none';
                this.modalVisible = false;
            }
            
            ExpertzyDI.log('PRICING_UI', 'Modal de precificação fechado');
        },
        
        // Verificar se há dados disponíveis
        verificarDadosDisponiveis: function() {
            return ExpertzyDI.data && 
                   ExpertzyDI.data.currentDI && 
                   ExpertzyDI.data.currentDI.adicoes &&
                   ExpertzyDI.data.currentDI.adicoes.length > 0;
        },
        
        // Carregar dados dos produtos
        carregarDadosProdutos: function() {
            if (!ExpertzyDI.data || !ExpertzyDI.data.currentDI) return;
            
            this.dadosProdutos = [];
            
            const adicoes = ExpertzyDI.data.currentDI.adicoes || [];
            adicoes.forEach((adicao, index) => {
                this.dadosProdutos.push({
                    id: index + 1,
                    adicao: adicao.numeroAdicao || (index + 1),
                    ncm: adicao.codigoNCM || 'N/A',
                    descricao: adicao.descricaoMercadoria || 'Produto importado',
                    custoUnitario: adicao.custoUnitario || 0,
                    custoTotal: adicao.custoTotal || 0,
                    quantidade: adicao.quantidadeTotal || 1,
                    
                    // Configurações padrão
                    margemLucro: 30,
                    despesasOperacionais: 15,
                    precoVenda: 0,
                    impostosSaida: 0,
                    margemReal: 0
                });
            });
        },
        
        // Atualizar conteúdo do modal
        atualizarConteudoModal: function() {
            const container = document.getElementById('pricingContent');
            if (!container) return;
            
            let html = `
                <div class="pricing-config">
                    <h3>Configuração de Precificação</h3>
                    <div class="config-grid">
                        <div class="config-group">
                            <label>Regime Tributário:</label>
                            <select id="regimeTributario" class="form-control">
                                <option value="lucro_real">Lucro Real</option>
                                <option value="lucro_presumido" selected>Lucro Presumido</option>
                                <option value="simples_nacional">Simples Nacional</option>
                            </select>
                        </div>
                        
                        <div class="config-group">
                            <label>Margem de Lucro (%):</label>
                            <input type="number" id="margemLucro" value="30" step="0.1" class="form-control">
                        </div>
                        
                        <div class="config-group">
                            <label>Despesas Operacionais (%):</label>
                            <input type="number" id="despesasOperacionais" value="15" step="0.1" class="form-control">
                        </div>
                    </div>
                    
                    <button class="expertzy-btn" onclick="ExpertzyDI.modules.pricingUI.calcularPrecos()">
                        Calcular Preços
                    </button>
                </div>
                
                <div class="produtos-section">
                    <h3>Produtos Importados</h3>
                    <div class="produtos-table">
                        <div class="table-header">
                            <div>Produto</div>
                            <div>NCM</div>
                            <div>Custo Unit.</div>
                            <div>Preço Venda</div>
                            <div>Margem Real</div>
                        </div>
            `;
            
            this.dadosProdutos.forEach(produto => {
                html += `
                    <div class="table-row">
                        <div class="produto-desc">${produto.descricao}</div>
                        <div>${produto.ncm}</div>
                        <div>R$ ${produto.custoUnitario.toFixed(2)}</div>
                        <div class="preco-venda">R$ ${produto.precoVenda.toFixed(2)}</div>
                        <div class="margem ${produto.margemReal >= 20 ? 'positiva' : 'negativa'}">
                            ${produto.margemReal.toFixed(1)}%
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
        },
        
        // Calcular preços
        calcularPrecos: function() {
            ExpertzyDI.log('PRICING_UI', 'Calculando preços de venda');
            
            // Obter configurações
            const regime = document.getElementById('regimeTributario')?.value || 'lucro_presumido';
            const margemLucro = parseFloat(document.getElementById('margemLucro')?.value) || 30;
            const despesasOp = parseFloat(document.getElementById('despesasOperacionais')?.value) || 15;
            
            // Processar cada produto
            this.dadosProdutos.forEach(produto => {
                const resultado = this.calcularPrecoProduto(produto, regime, margemLucro, despesasOp);
                Object.assign(produto, resultado);
            });
            
            // Atualizar visualização
            this.atualizarConteudoModal();
        },
        
        // Calcular preço de um produto
        calcularPrecoProduto: function(produto, regime, margemLucro, despesasOperacionais) {
            const custoBase = produto.custoUnitario;
            let aliquotaImpostos = 0;
            
            // Calcular alíquota de impostos conforme regime
            switch(regime) {
                case 'lucro_real':
                    aliquotaImpostos = 33.25; // PIS + COFINS + CSLL + IRPJ + ICMS estimado
                    break;
                case 'lucro_presumido':
                    aliquotaImpostos = 32.65; // PIS + COFINS + CSLL + IRPJ + ICMS estimado
                    break;
                case 'simples_nacional':
                    aliquotaImpostos = 12.0; // Estimativa média Simples Nacional
                    break;
            }
            
            // Cálculo do preço de venda
            const fatorCusto = 1 + (despesasOperacionais / 100);
            const fatorMargem = 1 + (margemLucro / 100);
            const fatorImpostos = 1 - (aliquotaImpostos / 100);
            
            const precoVenda = (custoBase * fatorCusto * fatorMargem) / fatorImpostos;
            const impostosSaida = precoVenda * (aliquotaImpostos / 100);
            const margemReal = ((precoVenda - impostosSaida - custoBase * fatorCusto) / precoVenda) * 100;
            
            return {
                precoVenda: precoVenda,
                impostosSaida: impostosSaida,
                margemReal: margemReal,
                aliquotaImpostos: aliquotaImpostos
            };
        },
        
        // Mostrar toast
        mostrarToast: function(mensagem, tipo = 'info') {
            // Implementação simples de toast
            const toast = document.createElement('div');
            toast.className = `toast toast-${tipo}`;
            toast.textContent = mensagem;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: ${tipo === 'warning' ? '#f39c12' : '#3498db'};
                color: white;
                border-radius: 5px;
                z-index: 10000;
                max-width: 300px;
            `;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 5000);
        }
    };
    
})(window.ExpertzyDI);