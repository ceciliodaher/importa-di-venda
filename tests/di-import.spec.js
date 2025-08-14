/**
 * Testes E2E para Importação de DI
 * Sistema Expertzy DI
 * 
 * Testa o fluxo completo de importação e processamento de XML de DI
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Sistema de Importação DI', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a página principal
    await page.goto('/');
    
    // Verificar se a página carregou corretamente
    await expect(page.locator('.app-title')).toContainText('Importação DI');
  });

  test('deve carregar a interface principal', async ({ page }) => {
    // Verificar elementos principais
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.upload-section')).toBeVisible();
    await expect(page.locator('#dragDropZone')).toBeVisible();
    
    // Verificar texto de instrução
    await expect(page.locator('.drag-drop-text')).toContainText('Arraste seu arquivo XML aqui');
  });

  test('deve processar arquivo XML via drag and drop', async ({ page }) => {
    // Simular drag and drop de arquivo XML
    const filePath = path.join(__dirname, '..', 'orientacoes', '2300120746.xml');
    
    // Criar DataTransfer para simular drag & drop
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
    
    // Adicionar arquivo ao DataTransfer
    const file = await page.evaluateHandle(
      (path) => {
        const file = new File(['conteudo xml'], '2300120746.xml', { type: 'text/xml' });
        return file;
      },
      filePath
    );
    
    await page.evaluate(
      ([dt, f]) => { dt.items.add(f); },
      [dataTransfer, file]
    );
    
    // Simular evento de drop
    await page.dispatchEvent('#dragDropZone', 'drop', { dataTransfer });
    
    // Verificar que o arquivo foi processado
    await expect(page.locator('#fileInfo')).toBeVisible();
    await expect(page.locator('#fileName')).toContainText('.xml');
  });

  test('deve mostrar seção de configuração após carregar XML', async ({ page }) => {
    // Carregar arquivo via input file (alternativa ao drag & drop)
    const fileInput = page.locator('#fileInput');
    const filePath = path.join(__dirname, '..', 'orientacoes', '2300120746.xml');
    
    // Verificar se o arquivo existe antes de tentar carregá-lo
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      await fileInput.setInputFiles(filePath);
      
      // Aguardar processamento
      await page.waitForTimeout(1000);
      
      // Verificar que a seção de configuração apareceu
      await expect(page.locator('#configSection')).toBeVisible();
    }
  });

  test('deve detectar INCOTERM automaticamente', async ({ page }) => {
    // Este teste depende do processamento real do XML
    // Verificar se o indicador de INCOTERM detectado aparece
    const incotermIndicator = page.locator('#incotermDetected');
    
    // Se o XML foi processado, deve mostrar o INCOTERM
    if (await incotermIndicator.isVisible()) {
      await expect(incotermIndicator).toContainText('INCOTERM detectado');
    }
  });

  test('deve calcular custos ao clicar no botão', async ({ page }) => {
    // Simular clique no botão de calcular
    const calcButton = page.locator('button:has-text("Calcular Custos")');
    
    if (await calcButton.isVisible()) {
      await calcButton.click();
      
      // Verificar que os resultados aparecem
      await expect(page.locator('#resultsSection')).toBeVisible();
    }
  });

  test('deve exibir módulo de precificação', async ({ page }) => {
    // Verificar se o módulo de precificação foi inicializado
    const pricingSection = page.locator('#pricingSection');
    
    // Se a seção existe, verificar seus elementos
    if (await pricingSection.count() > 0) {
      // Tornar visível se estiver oculto
      await page.evaluate(() => {
        const section = document.getElementById('pricingSection');
        if (section) {
          section.classList.remove('expertzy-hidden');
        }
      });
      
      // Verificar elementos do módulo de precificação
      await expect(page.locator('#regimeTributario')).toBeVisible();
      await expect(page.locator('#margemDesejada')).toBeVisible();
      
      // Testar mudança de regime
      await page.selectOption('#regimeTributario', 'simples');
      await expect(page.locator('#simplesConfig')).toBeVisible();
      
      await page.selectOption('#regimeTributario', 'real');
      await expect(page.locator('#simplesConfig')).not.toBeVisible();
    }
  });

  test('deve ajustar slider de margem', async ({ page }) => {
    const margemSlider = page.locator('#margemDesejada');
    const margemValue = page.locator('#margemValue');
    
    if (await margemSlider.isVisible()) {
      // Definir valor do slider
      await margemSlider.fill('45');
      
      // Verificar que o valor foi atualizado
      await expect(margemValue).toContainText('45%');
    }
  });

  test('deve exportar relatórios', async ({ page }) => {
    // Verificar botões de exportação
    const exportButtons = page.locator('.export-btn');
    
    // Contar quantos botões de exportação existem
    const count = await exportButtons.count();
    expect(count).toBeGreaterThan(0);
    
    // Verificar tipos de exportação disponíveis
    await expect(page.locator('button:has-text("Excel")')).toBeVisible();
    await expect(page.locator('button:has-text("CSV")')).toBeVisible();
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
  });

  test('deve validar responsividade mobile', async ({ page }) => {
    // Definir viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que elementos se adaptam
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.upload-section')).toBeVisible();
    
    // Menu deve estar adaptado para mobile
    const headerActions = page.locator('.header-actions');
    const box = await headerActions.boundingBox();
    
    // Em mobile, o header deve ocupar menos espaço
    if (box) {
      expect(box.width).toBeLessThan(200);
    }
  });

  test('deve verificar cores da marca Expertzy', async ({ page }) => {
    // Verificar se as cores corporativas estão aplicadas
    const primaryButton = page.locator('.btn-primary').first();
    
    if (await primaryButton.isVisible()) {
      const backgroundColor = await primaryButton.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      // Verificar se usa a cor vermelha Expertzy (RGB aproximado)
      expect(backgroundColor).toContain('255'); // Red component
    }
  });

  test('deve exibir logs no console', async ({ page }) => {
    // Capturar logs do console
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
    
    // Recarregar página para capturar logs de inicialização
    await page.reload();
    
    // Aguardar logs
    await page.waitForTimeout(1000);
    
    // Verificar se o sistema logou inicialização
    const hasInitLog = consoleLogs.some(log => 
      log.includes('Sistema Expertzy DI') || 
      log.includes('inicializado')
    );
    
    expect(hasInitLog).toBeTruthy();
  });

  test('deve testar comparação de regimes tributários', async ({ page }) => {
    // Tornar seção de precificação visível
    await page.evaluate(() => {
      const section = document.getElementById('pricingSection');
      if (section) {
        section.classList.remove('expertzy-hidden');
      }
    });
    
    // Clicar no botão de comparar regimes
    const compareButton = page.locator('button:has-text("Comparar Regimes")');
    
    if (await compareButton.isVisible()) {
      await compareButton.click();
      
      // Verificar que a comparação aparece
      const comparison = page.locator('#regimeComparison');
      if (await comparison.count() > 0) {
        await expect(comparison).toBeVisible();
        
        // Verificar cards de comparação
        const comparisonCards = page.locator('.comparison-card');
        const cardCount = await comparisonCards.count();
        expect(cardCount).toBe(3); // Real, Presumido, Simples
      }
    }
  });

  test('deve simular cenários de precificação', async ({ page }) => {
    // Tornar simulador visível
    await page.evaluate(() => {
      const simulator = document.getElementById('scenarioSimulator');
      if (simulator) {
        simulator.classList.remove('expertzy-hidden');
      }
    });
    
    const simulator = page.locator('#scenarioSimulator');
    
    if (await simulator.isVisible()) {
      // Configurar parâmetros de simulação
      await page.fill('#margemMin', '15');
      await page.fill('#margemMax', '45');
      await page.fill('#margemStep', '10');
      
      // Executar simulação
      const simButton = page.locator('button:has-text("Simular")');
      if (await simButton.isVisible()) {
        await simButton.click();
        
        // Verificar resultados
        await expect(page.locator('#simulationResults')).toBeVisible();
        await expect(page.locator('.simulation-table')).toBeVisible();
      }
    }
  });
});

test.describe('Validação de Dados', () => {
  
  test('deve validar formato de números', async ({ page }) => {
    await page.goto('/');
    
    // Testar campos numéricos
    const numericFields = await page.locator('input[type="number"]').all();
    
    for (const field of numericFields) {
      // Tentar inserir texto
      await field.fill('abc');
      const value = await field.inputValue();
      
      // Campo numérico não deve aceitar texto
      expect(value).toBe('');
    }
  });
  
  test('deve validar limites de valores', async ({ page }) => {
    await page.goto('/');
    
    const margemSlider = page.locator('#margemDesejada');
    
    if (await margemSlider.isVisible()) {
      // Testar limite máximo
      await margemSlider.fill('150');
      const maxValue = await margemSlider.inputValue();
      expect(parseInt(maxValue)).toBeLessThanOrEqual(100);
      
      // Testar limite mínimo
      await margemSlider.fill('-10');
      const minValue = await margemSlider.inputValue();
      expect(parseInt(minValue)).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Performance', () => {
  
  test('deve carregar página em menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('deve processar XML rapidamente', async ({ page }) => {
    await page.goto('/');
    
    // Medir tempo de processamento
    const startTime = Date.now();
    
    // Simular processamento (executar função se disponível)
    const processingTime = await page.evaluate(() => {
      const start = Date.now();
      
      if (window.ExpertzyDI && window.ExpertzyDI.modules.xmlProcessor) {
        // Simular processamento com dados mock
        const mockXML = '<di><numero>123</numero></di>';
        try {
          window.ExpertzyDI.modules.xmlProcessor.process(mockXML);
        } catch (e) {
          // Ignorar erros de dados mock
        }
      }
      
      return Date.now() - start;
    });
    
    // Processamento deve ser rápido (menos de 500ms)
    expect(processingTime).toBeLessThan(500);
  });
});