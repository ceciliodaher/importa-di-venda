/*
DOM-UTILS.JS - Utilitários DOM Simples
Expertzy Inteligência Tributária
*/

(function(ExpertzyDI) {
    'use strict';
    
    ExpertzyDI.utils.dom = {
        
        // Criar elemento
        createElement: function(tag, className, content) {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (content) element.textContent = content;
            return element;
        },
        
        // Mostrar/esconder elemento
        toggle: function(selector, show) {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = show ? 'block' : 'none';
            }
        },
        
        // Atualizar conteúdo
        updateContent: function(selector, content) {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = content;
            }
        }
    };
    
})(window.ExpertzyDI);