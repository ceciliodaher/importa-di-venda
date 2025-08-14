/*
AUDIT-LOGGER.JS - Sistema de Auditoria Simples
Expertzy Inteligência Tributária
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.utils.audit = {
        
        // Log de auditoria
        log: function(operation, data, result) {
            const entry = {
                timestamp: new Date().toISOString(),
                operation: operation,
                data: data,
                result: result
            };
            
            ExpertzyDI.data.auditLog.push(entry);
            ExpertzyDI.log('AUDIT', `${operation} registrado`);
        },
        
        // Obter log completo
        getLog: function() {
            return ExpertzyDI.data.auditLog;
        },
        
        // Limpar log
        clear: function() {
            ExpertzyDI.data.auditLog = [];
        }
    };
    
})(window.ExpertzyDI);