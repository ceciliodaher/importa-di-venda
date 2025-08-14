/*
DATA-UTILS.JS - Utilitários de Dados Simples
Expertzy Inteligência Tributária
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.utils.data = {
        
        // Formatar número brasileiro
        formatNumber: function(value, decimals = 2) {
            return new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(value);
        },
        
        // Converter string para número
        parseNumber: function(str) {
            if (!str) return 0;
            const cleaned = str.toString().replace(/[^\d.,\-]/g, '');
            const normalized = cleaned.replace(/\./g, '').replace(',', '.');
            const number = parseFloat(normalized);
            return isNaN(number) ? 0 : number;
        },
        
        // Validar dados obrigatórios
        validateRequired: function(obj, fields) {
            const missing = [];
            fields.forEach(field => {
                if (!obj[field] || obj[field] === '') {
                    missing.push(field);
                }
            });
            return missing;
        }
    };
    
})(window.ExpertzyDI);