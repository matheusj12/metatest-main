import { Controller } from "@hotwired/stimulus"

// Este é o "cérebro" da sua aplicação. Ele se conecta ao <div data-controller="projetos"> no HTML.
export default class extends Controller {
  static targets = [
    "bgContainer", "itemList", "details", "partners",
    "indicators", "currentTime"
  ]

  static values = {
    dados: Array
  }

  // O método connect() é a primeira coisa que executa quando o controller é carregado na página.
  connect() {
    this.currentItemIndex = 0;
    this.destinos = this.dadosValue;  Pega os dados do HTML (que o Rails enviou)

    // Chama as funções para construir os elementos que faltam na sua tela
    this.renderBackgrounds();
    this.renderItemList();
    this.renderIndicators();

    this.updateSelection();
    this.startClock();

    this.element.addEventListener('keydown', this.handleKeydown.bind(this));

    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  }

  // --- MÉTODOS PARA CONSTRUIR A PÁGINA ---

  renderBackgrounds() {
    this.destinos.forEach((destino, index) => {
      const bgDiv = document.createElement('div');
      bgDiv.className = 'background-image';
      bgDiv.style.backgroundImage = `url(${destino.background})`;
      bgDiv.id = `bg-${index}`;
      this.bgContainerTarget.appendChild(bgDiv);
    });
  }

  renderItemList() {
    this.itemListTarget.innerHTML = '';
    this.destinos.forEach((destino, index) => {
      const item = document.createElement('div');
      item.className = 'item-card';
      item.style.backgroundImage = `url(${destino.icon})`;
      item.setAttribute('role', 'button');
      item.dataset.action = "click->projetos#select";
      item.dataset.index = index;
      this.itemListTarget.appendChild(item);
    });
  }

  renderIndicators() {
    this.indicatorsTarget.innerHTML = '';
    this.destinos.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-indicator';
      dot.dataset.action = "click->projetos#select";
      dot.dataset.index = index;
      this.indicatorsTarget.appendChild(dot);
    });
  }

  renderItemDetails(destino) {
    this.detailsTarget.innerHTML = `
      <h1 class="item-title">${destino.title}</h1>
      <h2 class="item-description">${destino.description || 'Um empreendimento de alto padrão.'}</h2>
      <div class="button-group">
        <a href="${destino.url}" target="_blank" class="secondary-button">Ver Propriedade</a>
      </div>
    `;
    setTimeout(() => {
      this.detailsTarget.querySelector('.item-title').classList.add('animate-in');
      this.detailsTarget.querySelector('.item-description').classList.add('animate-in');
      this.detailsTarget.querySelector('.button-group').classList.add('animate-in');
    }, 50);
  }

  // --- MÉTODOS PARA INTERATIVIDADE ---

  select(event) {
    const newIndex = parseInt(event.currentTarget.dataset.index, 10);
    if (this.currentItemIndex === newIndex) return;
    this.currentItemIndex = newIndex;
    this.updateSelection();
  }

  prev() {
    this.currentItemIndex = (this.currentItemIndex - 1 + this.destinos.length) % this.destinos.length;
    this.updateSelection();
    this.scrollToActiveCard();
  }

  next() {
    this.currentItemIndex = (this.currentItemIndex + 1) % this.destinos.length;
    this.updateSelection();
    this.scrollToActiveCard();
  }

  // Função que atualiza tudo na tela quando um novo item é selecionado
  updateSelection() {
    const currentDestino = this.destinos[this.currentItemIndex];

    this.bgContainerTarget.querySelectorAll('.background-image').forEach((div, index) => {
      div.classList.toggle('visible', index === this.currentItemIndex);
    });

    this.itemListTarget.querySelectorAll('.item-card').forEach((item, index) => {
      item.classList.toggle('active', index === this.currentItemIndex);
    });

    this.indicatorsTarget.querySelectorAll('.carousel-indicator').forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentItemIndex);
    });

    this.renderItemDetails(currentDestino);
  }

  scrollToActiveCard() {
    const activeCard = this.itemListTarget.children[this.currentItemIndex];
    if (activeCard) {
      activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  startClock() {
    // Implementação do relógio se necessário
  }

  handleKeydown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }
}
