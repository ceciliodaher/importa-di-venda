/*
EXPERTZY INTELIGÊNCIA TRIBUTÁRIA
© 2025 Expertzy Inteligência Tributária
Módulo de Precificação - Cálculo de preços de venda com análise tributária
*/

// =============================================================================
// PRICING MODULE
// =============================================================================
window.PricingModule = {
    
    // Configurações do módulo
    config: {
        regimesTributarios: {
            'lucro_real': {
                nome: 'Lucro Real',
                pis: 0.0165,
                cofins: 0.076,
                irpj: 0.15,
                csll: 0.09,
                creditos: true
            },
            'lucro_presumido': {
                nome: 'Lucro Presumido',
                pis: 0.0065,
                cofins: 0.03,
                irpj: 0.15,
                csll: 0.09,
                creditos: false
            },
            'simples_nacional': {
                nome: 'Simples Nacional',
                anexos: {
                    'I': { nome: 'Comércio', aliquotas: [4.0, 7.3, 9.5, 10.7, 14.3, 19.0] },
                    'II': { nome: 'Indústria', aliquotas: [4.5, 7.8, 10.0, 11.2, 14.7, 30.0] },
                    'III': { nome: 'Serviços', aliquotas: [6.0, 11.2, 13.5, 16.0, 21.0, 33.0] },
                    'IV': { nome: 'Serviços', aliquotas: [4.5, 9.0, 10.2, 14.0, 22.0, 33.0] },
                    'V': { nome: 'Serviços', aliquotas: [15.5, 18.0, 19.5, 20.5, 23.0, 30.5] }
                }
            }
        },
        
        faixasReceita: [
            { min: 0, max: 180000, faixa: 1 },
            { min: 180000.01, max: 360000, faixa: 2 },
            { min: 360000.01, max: 720000, faixa: 3 },
            { min: 720000.01, max: 1800000, faixa: 4 },
            { min: 1800000.01, max: 3600000, faixa: 5 },
            { min: 3600000.01, max: 4800000, faixa: 6 }
        ]
    },
    
    // Dados dos produtos para precificação
    produtos: [],
    
    // Inicializar módulo
    init: function() {
        this.setupEventListeners();
        console.log('🔥 Módulo de Precificação inicializado');
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        const pricingBtn = document.getElementById('pricingBtn');
        const closePricingModal = document.getElementById('closePricingModal');
        const pricingModal = document.getElementById('pricingModal');
        
        if (pricingBtn) {
            pricingBtn.addEventListener('click', () => this.openModal());
        }
        
        if (closePricingModal) {
            closePricingModal.addEventListener('click', () => this.closeModal());
        }
        
        if (pricingModal) {
            pricingModal.addEventListener('click', (e) => {
                if (e.target === pricingModal) {
                    this.closeModal();
                }
            });
        }
    },
    
    // Abrir modal de precificação
    openModal: function() {
        if (!window.calculationResults || !window.calculationResults.adicoes) {
            Utils.showToast('Nenhum dado disponível para precificação. Execute os cálculos primeiro.', 'warning');
            return;
        }
        
        this.produtos = this.prepararDadosProdutos();
        this.renderModal();
        
        const modal = document.getElementById('pricingModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },
    
    // Fechar modal
    closeModal: function() {
        const modal = document.getElementById('pricingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // Preparar dados dos produtos para precificação
    prepararDadosProdutos: function() {
        const produtos = [];
        
        if (window.calculationResults && window.calculationResults.adicoes) {
            window.calculationResults.adicoes.forEach((adicao, index) => {
                produtos.push({
                    id: index,
                    adicao: adicao.numeroAdicao || (index + 1),
                    ncm: adicao.codigoNCM || 'N/A',
                    descricao: adicao.descricaoMercadoria || 'Produto importado',
                    custoUnitario: adicao.custoUnitario || 0,
                    custoTotal: adicao.custoTotal || 0,
                    quantidade: adicao.quantidadeTotal || 1,
                    
                    // Configurações de precificação (valores padrão)
                    margemLucro: 30, // 30%
                    regimeTributario: 'lucro_presumido',
                    anexoSimples: 'I',
                    receitaAnual: 1000000,
                    despesasOperacionais: 10, // 10%
                    
                    // Resultados calculados
                    precoVenda: 0,
                    impostosSaida: 0,
                    margemReal: 0
                });
            });
        }
        
        return produtos;
    },
    
    // Renderizar modal de precificação
    renderModal: function() {
        const content = document.getElementById('pricingContent');
        if (!content) return;
        
        content.innerHTML = `
            <div class="pricing-container">
                <!-- Configurações Globais -->
                <div class="pricing-config">
                    <h4>⚙️ Configurações Gerais</h4>
                    <div class="config-row">
                        <div class="config-item">
                            <label>Regime Tributário Padrão:</label>
                            <select id="regimeGlobal" class="pricing-select">
                                <option value="lucro_real">Lucro Real</option>
                                <option value="lucro_presumido" selected>Lucro Presumido</option>
                                <option value="simples_nacional">Simples Nacional</option>
                            </select>
                        </div>
                        <div class="config-item">
                            <label>Margem de Lucro Padrão (%):</label>
                            <input type="number" id="margemGlobal" class="pricing-input" value="30" min="0" max="500" step="0.1">
                        </div>
                        <div class="config-item">
                            <label>Receita Anual Estimada (R$):</label>
                            <input type="number" id="receitaGlobal" class="pricing-input" value="1000000" min="0" step="1000">
                        </div>
                    </div>
                    <div class="config-actions">
                        <button class="btn-secondary" onclick="PricingModule.aplicarConfiguracaoGlobal()">
                            Aplicar a Todos os Produtos
                        </button>
                        <button class="btn-primary" onclick="PricingModule.calcularTodosPrecos()">
                            Calcular Todos os Preços
                        </button>
                    </div>
                </div>
                
                <!-- Tabela de Produtos -->
                <div class="pricing-table-container">
                    <div class="table-header">
                        <h4>📊 Precificação por Produto</h4>
                        <div class="table-actions">
                            <button class="btn-outline" onclick="PricingModule.exportarPrecificacao()">
                                📊 Exportar Excel
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="pricing-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Custo Unit.</th>
                                    <th>Margem %</th>
                                    <th>Regime</th>
                                    <th>Impostos Saída</th>
                                    <th>Preço Venda</th>
                                    <th>Margem Real</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="pricingTableBody">
                                ${this.renderProdutoRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Resumo Financeiro -->
                <div class="pricing-summary" id="pricingSummary">
                    ${this.renderResumoFinanceiro()}
                </div>
            </div>
        `;
        
        this.setupPricingEventListeners();
    },
    
    // Renderizar linhas dos produtos
    renderProdutoRows: function() {
        return this.produtos.map(produto => `
            <tr data-produto="${produto.id}">
                <td>
                    <div class="produto-info">
                        <strong>Add ${produto.adicao} - ${produto.ncm}</strong>
                        <small>${produto.descricao.substring(0, 50)}...</small>
                    </div>
                </td>
                <td>
                    <span class="valor-monetario">${this.formatCurrency(produto.custoUnitario)}</span>
                </td>
                <td>
                    <input type="number" class="pricing-input-small margem-input" 
                           data-produto="${produto.id}" value="${produto.margemLucro}" 
                           min="0" max="500" step="0.1">%
                </td>
                <td>
                    <select class="pricing-select-small regime-select" data-produto="${produto.id}">
                        <option value="lucro_real" ${produto.regimeTributario === 'lucro_real' ? 'selected' : ''}>L. Real</option>
                        <option value="lucro_presumido" ${produto.regimeTributario === 'lucro_presumido' ? 'selected' : ''}>L. Presumido</option>
                        <option value="simples_nacional" ${produto.regimeTributario === 'simples_nacional' ? 'selected' : ''}>Simples</option>
                    </select>
                </td>
                <td>
                    <span class="valor-imposto" data-produto="${produto.id}">
                        ${this.formatCurrency(produto.impostosSaida)}
                    </span>
                </td>
                <td>
                    <span class="valor-preco" data-produto="${produto.id}">
                        ${this.formatCurrency(produto.precoVenda)}
                    </span>
                </td>
                <td>
                    <span class="margem-real ${produto.margemReal < produto.margemLucro ? 'margem-baixa' : ''}" data-produto="${produto.id}">
                        ${produto.margemReal.toFixed(2)}%
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="PricingModule.calcularPrecoProduto(${produto.id})" title="Recalcular">
                        🔄
                    </button>
                    <button class="btn-icon" onclick="PricingModule.mostrarDetalhes(${produto.id})" title="Ver Detalhes">
                        👁️
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    // Renderizar resumo financeiro
    renderResumoFinanceiro: function() {
        const totalCusto = this.produtos.reduce((sum, p) => sum + (p.custoTotal || 0), 0);
        const totalVenda = this.produtos.reduce((sum, p) => sum + (p.precoVenda * p.quantidade || 0), 0);
        const totalImpostos = this.produtos.reduce((sum, p) => sum + (p.impostosSaida * p.quantidade || 0), 0);
        const margemMedia = totalVenda > 0 ? ((totalVenda - totalCusto - totalImpostos) / totalVenda * 100) : 0;
        
        return `
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="card-label">Custo Total</div>
                    <div class="card-value">${this.formatCurrency(totalCusto)}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Receita Prevista</div>
                    <div class="card-value">${this.formatCurrency(totalVenda)}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Impostos de Saída</div>
                    <div class="card-value">${this.formatCurrency(totalImpostos)}</div>
                </div>
                <div class="summary-card">
                    <div class="card-label">Margem Média</div>
                    <div class="card-value ${margemMedia < 20 ? 'value-warning' : ''}">${margemMedia.toFixed(2)}%</div>
                </div>
            </div>
        `;
    },
    
    // Configurar event listeners específicos da precificação
    setupPricingEventListeners: function() {
        // Event listeners para inputs de margem
        const margemInputs = document.querySelectorAll('.margem-input');
        margemInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const produtoId = parseInt(e.target.dataset.produto);
                const novamargem = parseFloat(e.target.value) || 0;
                this.produtos[produtoId].margemLucro = novamarգem;
                this.calcularPrecoProduto(produtoId);
            });
        });
        
        // Event listeners para selects de regime
        const regimeSelects = document.querySelectorAll('.regime-select');
        regimeSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const produtoId = parseInt(e.target.dataset.produto);
                const novoRegime = e.target.value;
                this.produtos[produtoId].regimeTributario = novoRegime;
                this.calcularPrecoProduto(produtoId);
            });
        });
    },
    
    // Aplicar configuração global a todos os produtos
    aplicarConfiguracaoGlobal: function() {
        const regimeGlobal = document.getElementById('regimeGlobal')?.value || 'lucro_presumido';
        const margemGlobal = parseFloat(document.getElementById('margemGlobal')?.value) || 30;
        const receitaGlobal = parseFloat(document.getElementById('receitaGlobal')?.value) || 1000000;
        
        this.produtos.forEach(produto => {
            produto.regimeTributario = regimeGlobal;
            produto.margemLucro = margemGlobal;
            produto.receitaAnual = receitaGlobal;
        });
        
        this.renderModal(); // Re-render para atualizar valores
        Utils.showToast('Configurações aplicadas a todos os produtos', 'success');
    },
    
    // Calcular preço de um produto específico
    calcularPrecoProduto: function(produtoId) {
        const produto = this.produtos[produtoId];
        if (!produto) return;
        
        const custoBase = produto.custoUnitario;
        const margemDesejada = produto.margemLucro / 100;
        const regime = produto.regimeTributario;
        
        let impostosSaida = 0;
        
        // Calcular impostos de saída baseado no regime
        if (regime === 'lucro_real') {
            const config = this.config.regimesTributarios.lucro_real;
            impostosSaida = custoBase * (config.pis + config.cofins + config.irpj + config.csll);
        } else if (regime === 'lucro_presumido') {
            const config = this.config.regimesTributarios.lucro_presumido;
            impostosSaida = custoBase * (config.pis + config.cofins + config.irpj + config.csll);
        } else if (regime === 'simples_nacional') {
            const anexo = produto.anexoSimples || 'I';
            const receita = produto.receitaAnual || 1000000;
            const faixa = this.determinarFaixaSimples(receita);
            const aliquota = this.config.regimesTributarios.simples_nacional.anexos[anexo].aliquotas[faixa - 1] / 100;
            impostosSaida = custoBase * aliquota;
        }
        
        // Calcular preço de venda
        // Fórmula: Preço = (Custo + Impostos) / (1 - Margem)
        const precoVenda = (custoBase + impostosSaida) / (1 - margemDesejada);
        
        // Calcular margem real obtida
        const margemReal = ((precoVenda - custoBase - impostosSaida) / precoVenda) * 100;
        
        // Atualizar produto
        produto.precoVenda = precoVenda;
        produto.impostosSaida = impostosSaida;
        produto.margemReal = margemReal;
        
        // Atualizar interface
        this.atualizarLinhaTabela(produtoId);
        this.atualizarResumoFinanceiro();
    },
    
    // Calcular todos os preços
    calcularTodosPrecos: function() {
        this.produtos.forEach((produto, index) => {
            this.calcularPrecoProduto(index);
        });
        
        Utils.showToast('Preços calculados para todos os produtos', 'success');
    },
    
    // Determinar faixa do Simples Nacional
    determinarFaixaSimples: function(receitaAnual) {
        for (let i = 0; i < this.config.faixasReceita.length; i++) {
            const faixa = this.config.faixasReceita[i];
            if (receitaAnual >= faixa.min && receitaAnual <= faixa.max) {
                return faixa.faixa;
            }
        }
        return 6; // Faixa máxima
    },
    
    // Atualizar linha da tabela
    atualizarLinhaTabela: function(produtoId) {
        const produto = this.produtos[produtoId];
        const row = document.querySelector(`tr[data-produto="${produtoId}"]`);
        if (!row) return;
        
        row.querySelector(`.valor-imposto[data-produto="${produtoId}"]`).textContent = this.formatCurrency(produto.impostosSaida);
        row.querySelector(`.valor-preco[data-produto="${produtoId}"]`).textContent = this.formatCurrency(produto.precoVenda);
        
        const margemSpan = row.querySelector(`.margem-real[data-produto="${produtoId}"]`);
        margemSpan.textContent = `${produto.margemReal.toFixed(2)}%`;
        margemSpan.className = `margem-real ${produto.margemReal < produto.margemLucro ? 'margem-baixa' : ''}`;
    },
    
    // Atualizar resumo financeiro
    atualizarResumoFinanceiro: function() {
        const summaryContainer = document.getElementById('pricingSummary');
        if (summaryContainer) {
            summaryContainer.innerHTML = this.renderResumoFinanceiro();
        }
    },
    
    // Mostrar detalhes de um produto
    mostrarDetalhes: function(produtoId) {
        const produto = this.produtos[produtoId];
        if (!produto) return;
        
        const detalhes = `
            <div class="produto-detalhes">
                <h4>Detalhes da Precificação - Adição ${produto.adicao}</h4>
                <div class="detalhes-grid">
                    <div class="detalhe-item">
                        <label>Custo Unitário:</label>
                        <span>${this.formatCurrency(produto.custoUnitario)}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Margem Desejada:</label>
                        <span>${produto.margemLucro}%</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Impostos de Saída:</label>
                        <span>${this.formatCurrency(produto.impostosSaida)}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Preço de Venda:</label>
                        <span>${this.formatCurrency(produto.precoVenda)}</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Margem Real:</label>
                        <span>${produto.margemReal.toFixed(2)}%</span>
                    </div>
                    <div class="detalhe-item">
                        <label>Receita Total:</label>
                        <span>${this.formatCurrency(produto.precoVenda * produto.quantidade)}</span>
                    </div>
                </div>
            </div>
        `;
        
        Utils.showToast(detalhes, 'info', 10000);
    },
    
    // Exportar precificação para Excel
    exportarPrecificacao: function() {
        if (!window.XLSX) {
            Utils.showToast('Biblioteca Excel não carregada', 'error');
            return;
        }
        
        const workbook = XLSX.utils.book_new();
        
        // Planilha de Precificação
        const precificacaoData = this.produtos.map(produto => ({
            'Adição': produto.adicao,
            'NCM': produto.ncm,
            'Descrição': produto.descricao,
            'Custo Unitário': produto.custoUnitario,
            'Quantidade': produto.quantidade,
            'Custo Total': produto.custoTotal,
            'Margem Desejada (%)': produto.margemLucro,
            'Regime Tributário': this.config.regimesTributarios[produto.regimeTributario]?.nome || produto.regimeTributario,
            'Impostos de Saída': produto.impostosSaida,
            'Preço de Venda': produto.precoVenda,
            'Receita Total': produto.precoVenda * produto.quantidade,
            'Margem Real (%)': produto.margemReal
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(precificacaoData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Precificação');
        
        // Baixar arquivo
        const filename = `Precificacao_DI_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, filename);
        
        Utils.showToast('Relatório de precificação exportado com sucesso!', 'success');
    },
    
    // Formatar moeda
    formatCurrency: function(value) {
        if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
};

// Inicializar módulo quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    PricingModule.init();
});

// CSS específico para o módulo de precificação
const pricingStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(9, 26, 48, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
}

.modal-container {
    background: white;
    border-radius: 12px;
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 100%;
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--expertzy-blue);
    color: white;
    border-radius: 12px 12px 0 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-body {
    padding: 20px;
}

.pricing-config {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.config-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}

.config-item label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: var(--expertzy-blue);
}

.pricing-select,
.pricing-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.config-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.pricing-table-container {
    margin-bottom: 20px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.pricing-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.pricing-table th,
.pricing-table td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 1px solid #eee;
}

.pricing-table th {
    background: var(--expertzy-blue);
    color: white;
    font-weight: 600;
}

.produto-info strong {
    display: block;
    color: var(--expertzy-blue);
}

.produto-info small {
    color: #666;
    font-size: 12px;
}

.pricing-input-small,
.pricing-select-small {
    width: 80px;
    padding: 4px 6px;
    border: 1px solid #ddd;
    border-radius: 3px;
    font-size: 12px;
}

.valor-monetario {
    font-weight: 600;
    color: var(--expertzy-blue);
}

.valor-preco {
    font-weight: 600;
    color: var(--expertzy-red);
}

.margem-real {
    font-weight: 600;
    color: #28a745;
}

.margem-baixa {
    color: #dc3545;
}

.btn-icon {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    margin: 0 2px;
    border-radius: 3px;
}

.btn-icon:hover {
    background: #f8f9fa;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 20px;
}

.summary-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
    border-left: 4px solid var(--expertzy-red);
}

.card-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
}

.card-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--expertzy-blue);
}

.value-warning {
    color: #dc3545;
}

.btn-primary,
.btn-secondary,
.btn-outline {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    font-weight: 600;
}

.btn-primary {
    background: var(--expertzy-red);
    color: white;
}

.btn-secondary {
    background: var(--expertzy-blue);
    color: white;
}

.btn-outline {
    background: white;
    color: var(--expertzy-blue);
    border: 1px solid var(--expertzy-blue);
}

.btn-primary:hover,
.btn-secondary:hover,
.btn-outline:hover {
    opacity: 0.9;
}
</style>
`;

// Adicionar estilos ao documento
document.head.insertAdjacentHTML('beforeend', pricingStyles);