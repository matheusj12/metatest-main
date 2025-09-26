  document.addEventListener('DOMContentLoaded', function() {
            // Imagens dos projetos
            const imagens = [
                { arquivo: 'img/Baccarat-Residences-Miami.png' },
                { arquivo: 'img/Six-Fisher-Island.png' },
                { arquivo: 'img/icon-beach.png' },
                { arquivo: 'img/Parque-Global.png' },
                { arquivo: 'img/rivage.png' },
                { arquivo: 'img/SLS-Harbour-Beach.png' },
                { arquivo: 'img/VICEROY.png' }
            ];

            // Parceiros fictícios (adicione seus logos em /img/parceiros/)
            const partners = [
                { name: "Four Seasons", logoUrl: "logo/dezer.png" },
                { name: "Mandarin Oriental", logoUrl: "logo/icon_beach.png" },
                { name: "Aman", logoUrl: "logo/related.png" },
                { name: "St. Regis", logoUrl: "logo/rivagelogo.png" },
                { name: "Waldorf Astoria", logoUrl: "logo/tecnisa.png" }
            ];

            // Gera título a partir do nome do arquivo
            function gerarTitulo(nomeArquivo) {
                return nomeArquivo
                    .replace(/^img\//, '')
                    .replace(/\.[^/.]+$/, '')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
            }

            // Cria os destinos dinamicamente
            const destinos = imagens.map(img => ({
                title: gerarTitulo(img.arquivo),
                description: '', // Adicione descrição se quiser
                icon: img.arquivo,
                background: img.arquivo,
                url: '#',
                gallery: []
            }));

            let currentItemIndex = 0;
            const itemListContainer = document.getElementById('item-list-container');
            const itemDetailsContainer = document.getElementById('item-details');
            const bgContainer = document.getElementById('bg-container');
            const modal = document.getElementById('gemini-modal');
            const modalCloseBtn = document.getElementById('modal-close-btn');
            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');
            const prevArrow = document.getElementById('prev-arrow');
            const nextArrow = document.getElementById('next-arrow');
            const partnerLogosContainer = document.getElementById('partner-logos');
            const carouselIndicators = document.getElementById('carousel-indicators');

            // Cria os backgrounds
            destinos.forEach((destino, index) => {
                const bgDiv = document.createElement('div');
                bgDiv.className = 'background-image';
                bgDiv.style.backgroundImage = `url(${destino.background})`;
                bgDiv.id = `bg-${index}`;
                bgContainer.appendChild(bgDiv);
            });

            // Renderiza os cards do carrossel
            function renderItemList() {
                itemListContainer.innerHTML = '';
                destinos.forEach((destino, index) => {
                    const item = document.createElement('div');
                    item.className = 'item-card';
                    item.style.backgroundImage = `url(${destino.icon})`;
                    item.setAttribute('tabindex', 0);
                    item.setAttribute('aria-label', destino.title);
                    item.setAttribute('role', 'button');
                    item.setAttribute('title', destino.title);
                    item.addEventListener('click', () => {
                        if (index === currentItemIndex) return;
                        currentItemIndex = index;
                        updateSelection();
                    });
                    item.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            currentItemIndex = index;
                            updateSelection();
                        }
                    });
                    itemListContainer.appendChild(item);
                });
            }

            // Renderiza os indicadores do carrossel
            function renderCarouselIndicators() {
                carouselIndicators.innerHTML = '';
                destinos.forEach((_, idx) => {
                    const dot = document.createElement('div');
                    dot.className = 'carousel-indicator' + (idx === currentItemIndex ? ' active' : '');
                    dot.setAttribute('aria-label', `Selecionar ${destinos[idx].title}`);
                    dot.setAttribute('tabindex', 0);
                    dot.addEventListener('click', () => {
                        currentItemIndex = idx;
                        updateSelection();
                    });
                    dot.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            currentItemIndex = idx;
                            updateSelection();
                        }
                    });
                    carouselIndicators.appendChild(dot);
                });
            }

            // Renderiza detalhes do card selecionado
            function renderItemDetails(destino) {
                itemDetailsContainer.innerHTML = `
                    <h1 class="item-title">${destino.title}</h1>
                    <h2 class="item-description">${destino.description || 'Selecione "Explorar com IA" para saber mais sobre este projeto.'}</h2>
                    <div class="button-group">
                         <button class="gemini-button" id="generate-btn">Explorar com IA ✨</button>
                         <a href="${destino.url}" target="_blank" class="secondary-button">Ver Propriedade</a>
                    </div>
                `;
                document.getElementById('generate-btn').addEventListener('click', handleGenerateClick);

                setTimeout(() => {
                    itemDetailsContainer.querySelector('.item-title').classList.add('animate-in');
                    itemDetailsContainer.querySelector('.item-description').classList.add('animate-in');
                    itemDetailsContainer.querySelector('.button-group').classList.add('animate-in');
                }, 50);
            }

            // Renderiza logos dos parceiros
            function renderPartnerLogos() {
                const logosFragment = document.createDocumentFragment();
                [...partners, ...partners].forEach(partner => {
                    const img = document.createElement('img');
                    img.src = partner.logoUrl;
                    img.alt = partner.name;
                    img.loading = "lazy";
                    logosFragment.appendChild(img);
                });
                partnerLogosContainer.appendChild(logosFragment);
            }

            // Chamada fictícia à API Gemini (substitua por sua chave e backend seguro)
            async function callGeminiAPI(prompt) {
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                const payload = { contents: [{ parts: [{ text: prompt }] }] };
                try {
                    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const result = await response.json();
                    const candidate = result.candidates?.[0];
                    if (candidate && candidate.content?.parts?.[0]?.text) return candidate.content.parts[0].text;
                    else throw new Error("Resposta da API inválida ou sem conteúdo.");
                } catch (error) { console.error("Falha na chamada da API:", error); throw error; }
            }

            // Botão "Explorar com IA"
            async function handleGenerateClick() {
                const destino = destinos[currentItemIndex];
                modalTitle.innerText = `A explorar ${destino.title}...`;
                modalBody.innerHTML = '<div class="loader"></div>';
                showModal();
                try {
                    const prompt = `Aja como um especialista em imobiliário de luxo. Descreva o conceito e os principais atrativos do empreendimento "${destino.title}". Foque em aspetos como arquitetura, amenidades exclusivas e o estilo de vida que proporciona. O texto deve ser cativante e elegante. A resposta deve estar em português de Portugal.`;
                    const description = await callGeminiAPI(prompt);
                    let galleryHTML = '';
                    if (destino.gallery && destino.gallery.length > 0) {
                        galleryHTML = `
                            <div class="modal-gallery"><h3>Galeria de Imagens</h3><div class="gallery-images">
                            ${destino.gallery.map(imgUrl => `<img src="${imgUrl}" class="gallery-img" alt="Imagem da galeria de ${destino.title}">`).join('')}
                            </div></div>`;
                    }
                    modalTitle.innerText = `Sobre ${destino.title}`;
                    modalBody.innerHTML = `<p>${description.replace(/\n/g, '<br>')}</p>${galleryHTML}<div class="modal-actions"><button class="gemini-button" id="draft-email-btn">Pedir Mais Informações ✨</button></div>`;
                    document.getElementById('draft-email-btn').addEventListener('click', handleDraftEmailClick);
                } catch (error) {
                    console.error("Erro ao gerar descrição:", error);
                    modalTitle.innerText = "Erro";
                    modalBody.innerText = "Não foi possível carregar as informações. Por favor, tente novamente mais tarde.";
                }
            }

            // Botão "Pedir Mais Informações"
            async function handleDraftEmailClick() {
                const destino = destinos[currentItemIndex];
                modalTitle.innerText = `A redigir o seu e-mail para ${destino.title}...`;
                modalBody.innerHTML = '<div class="loader"></div>';
                try {
                    const prompt = `Aja como um assistente de um cliente de alto poder de compra a escrever um e-mail para a equipa de vendas do empreendimento de luxo "${destino.title}". O tom deve ser educado e direto. Demonstre interesse no projeto e peça mais informações, como plantas, tabela de preços e disponibilidade. Deixe espaços como "[Nome do Cliente]" e "[Contacto Telefónico]" para serem preenchidos. Termine de forma cordial, a aguardar um breve contacto. O e-mail deve estar em português de Portugal.`;
                    const emailBody = await callGeminiAPI(prompt);
                    modalTitle.innerText = `Minuta de E-mail de Contacto`;
                    modalBody.innerHTML = `<p>${emailBody.replace(/\n/g, '<br>')}</p>`;
                } catch (error) {
                    console.error("Erro ao gerar e-mail:", error);
                    modalTitle.innerText = "Erro";
                    modalBody.innerText = "Não foi possível criar o e-mail. Por favor, tente novamente mais tarde.";
                }
            }

            // Modal
            function showModal() { modal.classList.add('visible'); modal.focus(); }
            function hideModal() { modal.classList.remove('visible'); }
            modalCloseBtn.addEventListener('click', hideModal);
            modal.addEventListener('click', (e) => { if(e.target === modal) hideModal(); });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('visible')) hideModal();
                // Navegação por teclado no carrossel
                if (e.key === 'ArrowLeft') {
                    currentItemIndex = (currentItemIndex - 1 + destinos.length) % destinos.length;
                    updateSelection();
                }
                if (e.key === 'ArrowRight') {
                    currentItemIndex = (currentItemIndex + 1) % destinos.length;
                    updateSelection();
                }
            });

            // Atualiza seleção do carrossel
            function updateSelection() {
                const currentDestino = destinos[currentItemIndex];
                document.querySelectorAll('.background-image').forEach((div, index) => { div.classList.toggle('visible', index === currentItemIndex); });
                renderItemDetails(currentDestino);
                document.querySelectorAll('.item-card').forEach((item, index) => { item.classList.toggle('active', index === currentItemIndex); });
                renderCarouselIndicators();
            }

            // Atualiza hora
            function updateTime() {
                const timeEl = document.getElementById('current-time');
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString('pt-PT', { hour: 'numeric', minute: '2-digit' });
            }

            // Setas do carrossel
            prevArrow.addEventListener('click', () => {
                currentItemIndex = (currentItemIndex - 1 + destinos.length) % destinos.length;
                updateSelection();
                scrollToActiveCard();
            });

            nextArrow.addEventListener('click', () => {
                currentItemIndex = (currentItemIndex + 1) % destinos.length;
                updateSelection();
                scrollToActiveCard();
            });

            // Scroll automático para o card ativo
            function scrollToActiveCard() {
                const activeCard = itemListContainer.children[currentItemIndex];
                if (activeCard) activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }

            feather.replace();
            updateTime();
            setInterval(updateTime, 1000);
            renderItemList();
            renderCarouselIndicators();
            updateSelection();
            renderPartnerLogos();
        });
