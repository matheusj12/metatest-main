document.addEventListener('DOMContentLoaded', function() {
  // --- DADOS E PROCESSAMENTO INICIAL ---
  const projetos = window.projectImages || [];
  const partners = window.partnerLogos || [];
  const destinos = projetos.map(p => {
    const title = p.arquivo.split('/').pop()
      .replace(/\.[^/.]+$/, '')
      .replace(/-[0-9a-f]{8,32}$/i, '')
      .replace(/-/g, ' ');
    return {
      title: title.replace(/\b\w/g, l => l.toUpperCase()),
      description: p.description,
      icon: p.arquivo,
      background: p.arquivo,
      url: '#',
    };
  });

  // --- SELETORES DE ELEMENTOS DO DOM ---
  let currentItemIndex = 0;
  const doc = document;
  const projectSelector = doc.getElementById('project-selector');
  const itemDetails = doc.getElementById('item-details');
  const bgContainer = doc.getElementById('bg-container');
  const timeEl = doc.getElementById('current-time');
  const partnerLogosContainer = doc.getElementById('partner-logos'); // Seleciona o container principal

  // --- FUNÇÕES DE RENDERIZAÇÃO ---
  const renderHTML = (container, html) => {
    if (container) container.innerHTML = html;
  };

  const renderProjectSelector = () => {
    const html = destinos.map((d, i) =>
      `<div class="project-card" data-index="${i}" title="${d.title}" style="background-image: url(${d.icon})"></div>`
    ).join('');
    renderHTML(projectSelector, html);
  };

  const renderItemDetails = (destino) => {
    if (!destino) return;
    const html = `<h1>${destino.title}</h1><p>${destino.description}</p><div class="btn-container"><button id="generate-btn" class="btn btn-primary">Explorar com IA ✨</button><a href="${destino.url}" target="_blank" class="btn btn-secondary">Ver Propriedade</a></div>`;
    renderHTML(itemDetails, html);
    doc.getElementById('generate-btn')?.addEventListener('click', handleGenerateClick);
  };

  const createBackgrounds = () => {
    const html = destinos.map(d =>
      `<div class="background-image" style="background-image: url(${d.background})"></div>`
    ).join('');
    renderHTML(bgContainer, html);
  };

  // ==========================================================
  // A CORREÇÃO ESTÁ AQUI
  // ==========================================================
  const renderPartnerLogos = () => {
    // 1. Verificamos se o container existe e se temos parceiros
    if (!partnerLogosContainer || partners.length === 0) return;

    // 2. Geramos as tags <img>, duplicando a lista para o efeito de scroll infinito
    const logos = [...partners, ...partners].map(p =>
      `<img src="${p.logoUrl}" alt="${p.name}" class="partner-logo">`
    ).join('');

    // 3. Criamos a estrutura completa com a div interna '.logos-track' que o CSS espera
    const finalHTML = `<div class="logos-track">${logos}</div>`;

    // 4. Injetamos o HTML final no container
    renderHTML(partnerLogosContainer, finalHTML);
  };
  // ==========================================================

  // --- FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO ---
  function updateSelection() {
    if (destinos.length === 0) return;
    renderItemDetails(destinos[currentItemIndex]);
    doc.querySelectorAll('.background-image').forEach((el, i) => el.classList.toggle('visible', i === currentItemIndex));
    doc.querySelectorAll('.project-card').forEach((el, i) => el.classList.toggle('active', i === currentItemIndex));
  }

  // --- LÓGICA DE EVENTOS ---
  function handleProjectClick(event) {
    const card = event.target.closest('.project-card');
    if (!card) return;
    const index = parseInt(card.dataset.index, 10);
    if (index !== currentItemIndex) {
      currentItemIndex = index;
      updateSelection();
    }
  }

  function handleArrowKeys(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const len = destinos.length;
    currentItemIndex = (event.key === 'ArrowLeft')
      ? (currentItemIndex - 1 + len) % len
      : (currentItemIndex + 1) % len;
    updateSelection();
  }

  function handleGenerateClick() {
    console.log("Botão 'Explorar com IA' clicado para:", destinos[currentItemIndex].title);
  }

  function updateTime() {
    if (timeEl) timeEl.textContent = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // --- INICIALIZAÇÃO ---
  createBackgrounds();
  renderProjectSelector();
  renderPartnerLogos(); // Agora esta função cria a estrutura correta
  updateSelection();
  updateTime();
  setInterval(updateTime, 60000);

  projectSelector?.addEventListener('click', handleProjectClick);
  doc.addEventListener('keydown', handleArrowKeys);
});
