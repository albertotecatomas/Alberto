// 1. Alternador de Tema

function tcToggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Atualizar texto do botão
  const themeButton = document.querySelector('.tc-theme-toggle');
  if (themeButton) {
    const icon = themeButton.querySelector('svg') || themeButton.querySelector('i');
    const textSpan = themeButton.querySelector('span');
    
    if (newTheme === 'light') {
      if (textSpan) textSpan.textContent = 'Modo Escuro';
      if (icon) icon.setAttribute('aria-label', 'Mudar para modo escuro');
    } else {
      if (textSpan) textSpan.textContent = 'Modo Claro';
      if (icon) icon.setAttribute('aria-label', 'Mudar para modo claro');
    }
  }
}

// 2. Toggle do Submenu Mobile

function tcSubmenuToggle(event) {
  if (window.innerWidth <= 768) {
    const simuladorItem = event.currentTarget.closest('.simula');
    if (simuladorItem) {
      simuladorItem.classList.toggle('open');
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

// 3. Fechar submenu ao clicar fora

document.addEventListener('click', function(event) {
  if (!event.target.closest('.simula')) {
    const openSubmenus = document.querySelectorAll('.simula.open');
    openSubmenus.forEach(item => item.classList.remove('open'));
  }
});

// Inicialização

document.addEventListener('DOMContentLoaded', function() {
  // Tema salvo
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Adicionar evento ao botão de tema
  const themeButton = document.querySelector('.tc-theme-toggle');
  if (themeButton) {
    themeButton.addEventListener('click', tcToggleTheme);
  }
  
  // Adicionar evento ao item Simulador para mobile
  const simuladorLink = document.querySelector('.simula > a');
  if (simuladorLink) {
    simuladorLink.addEventListener('click', tcSubmenuToggle);
  }
});
