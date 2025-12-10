/**
 * Sistema de otimizações para Teca Capital
 * Namespaced: tcOptimizations
 * NOTA: Incluir apenas se não houver funcionalidades equivalentes no HTML
 */

(function() {
    'use strict';
    
    // =========================================================================
    // 1. SISTEMA DE ALTERNÂNCIA DE TEMA
    // =========================================================================
    
    function tcThemeToggle() {
        const toggleSelectors = [
            '.tc-theme-toggle',
            '.theme-toggle',
            '[data-theme-toggle]',
            'button[aria-label*="tema" i]',
            'button[aria-label*="theme" i]',
            'button[aria-label*="modo" i]'
        ];
        
        const toggle = document.querySelector(toggleSelectors.join(', '));
        if (!toggle) {
            // Criar botão se não existir
            const newToggle = document.createElement('button');
            newToggle.className = 'tc-theme-toggle';
            newToggle.setAttribute('aria-label', 'Alternar tema claro/escuro');
            newToggle.setAttribute('aria-pressed', 'false');
            newToggle.textContent = 'Tema';
            
            // Inserir no header se existir
            const header = document.querySelector('header .interface');
            if (header) {
                header.appendChild(newToggle);
                initializeTheme(newToggle);
            }
            return;
        }
        
        initializeTheme(toggle);
    }
    
    function initializeTheme(toggle) {
        // Recuperar preferência salva ou usar padrão do sistema
        const savedTheme = localStorage.getItem('tc-theme');
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const currentTheme = savedTheme || systemPreference;
        
        // Aplicar tema inicial
        document.documentElement.setAttribute('data-theme', currentTheme);
        toggle.setAttribute('aria-pressed', currentTheme === 'light');
        
        // Evento de clique
        toggle.addEventListener('click', function() {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('tc-theme', newTheme);
            this.setAttribute('aria-pressed', newTheme === 'light');
            
            // Atualizar gráficos se função existir
            if (typeof tcChartAdjustForLight === 'function') {
                tcChartAdjustForLight();
            }
        });
        
        // Escutar mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('tc-theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                toggle.setAttribute('aria-pressed', newTheme === 'light');
            }
        });
    }
    
    // =========================================================================
    // 2. SUPORTE TOUCH PARA SUBMENU (APENAS SE NECESSÁRIO)
    // =========================================================================
    
    function tcSubmenuTouch() {
        // Verificar se é dispositivo touch
        if (!('ontouchstart' in window)) return;
        
        const menuItems = document.querySelectorAll('.simula');
        
        menuItems.forEach(item => {
            let tapTimer;
            
            item.addEventListener('touchstart', function(e) {
                const submenu = this.querySelector('.sub-lista');
                if (!submenu) return;
                
                e.preventDefault();
                
                // Fechar outros submenus abertos
                document.querySelectorAll('.sub-lista').forEach(sm => {
                    if (sm !== submenu && sm.style.display === 'block') {
                        sm.style.display = 'none';
                    }
                });
                
                // Alternar este submenu
                const isVisible = submenu.style.display === 'block';
                submenu.style.display = isVisible ? 'none' : 'block';
                
                // Timer para fechar ao tocar fora
                clearTimeout(tapTimer);
                tapTimer = setTimeout(() => {
                    if (submenu.style.display === 'block') {
                        submenu.style.display = 'none';
                    }
                }, 5000);
                
            }, { passive: false });
            
            // Prevenir fechamento ao tocar dentro do submenu
            item.addEventListener('touchend', function(e) {
                const submenu = this.querySelector('.sub-lista');
                if (submenu && submenu.contains(e.target)) {
                    e.stopPropagation();
                }
            });
        });
        
        // Fechar submenus ao tocar fora
        document.addEventListener('touchstart', function(e) {
            if (!e.target.closest('.simula')) {
                document.querySelectorAll('.sub-lista').forEach(submenu => {
                    submenu.style.display = 'none';
                });
            }
        });
    }
    
    // =========================================================================
    // 3. AJUSTE DE GRÁFICOS PARA TEMA CLARO (CHART.JS)
    // =========================================================================
    
    function tcChartAdjustForLight() {
        if (typeof Chart === 'undefined') return;
        
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        
        Object.values(Chart.instances || {}).forEach(chart => {
            if (!chart || !chart.options) return;
            
            const options = chart.options;
            const textColor = isLightTheme ? '#000000' : '#ffffff';
            const gridColor = isLightTheme ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
            
            // Atualizar cores de texto
            if (options.plugins?.legend?.labels) {
                options.plugins.legend.labels.color = textColor;
            }
            
            if (options.scales) {
                Object.values(options.scales).forEach(scale => {
                    if (scale.ticks) {
                        scale.ticks.color = textColor;
                        scale.ticks.font = { family: 'system-ui, sans-serif' };
                    }
                    if (scale.title) {
                        scale.title.color = textColor;
                        scale.title.font = { family: 'system-ui, sans-serif', weight: '600' };
                    }
                    if (scale.grid) {
                        scale.grid.color = gridColor;
                    }
                });
            }
            
            // Atualizar título do gráfico se existir
            if (options.plugins?.title) {
                options.plugins.title.color = textColor;
                options.plugins.title.font = { family: 'system-ui, sans-serif', weight: '600' };
            }
            
            chart.update('none');
        });
    }
    
    // =========================================================================
    // 4. INICIALIZAÇÃO
    // =========================================================================
    
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar sistema de tema
        tcThemeToggle();
        
        // Inicializar suporte touch para submenu (apenas se necessário)
        // tcSubmenuTouch();
        
        // Observar mudanças de tema para ajustar gráficos
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-theme' && typeof tcChartAdjustForLight === 'function') {
                    setTimeout(tcChartAdjustForLight, 100);
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
    });
    
    // Expor funções globalmente para uso externo
    window.tcOptimizations = {
        toggleTheme: tcThemeToggle,
        initTouchMenu: tcSubmenuTouch,
        adjustCharts: tcChartAdjustForLight
    };
    
})();