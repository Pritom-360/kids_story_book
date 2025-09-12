function initializeGame(container, gameData, onComplete) {
    const items = [...gameData.items, ...gameData.items];
    let flippedCards = [];
    let matchedPairs = 0;
    let lockBoard = false; // Prevent clicking more than 2 cards at once

    items.sort(() => Math.random() - 0.5);
    
    const grid = document.createElement('div');
    grid.className = 'memory-grid';
    container.appendChild(grid);

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.item = item;
        card.innerHTML = `
            <div class="memory-card-inner">
                <div class="back-face">?</div>
                <div class="front-face">
                    <img src="assets/images/games/memory/${item}.png" alt="${item}">
                </div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });

    function flipCard(card) {
        if (lockBoard || card.classList.contains('flip')) return;

        card.classList.add('flip');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            lockBoard = true;
            setTimeout(checkForMatch, 1200);
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        if (card1.dataset.item === card2.dataset.item) {
            matchedPairs++;
            if (matchedPairs === gameData.items.length) {
                onComplete();
            }
        } else {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
        }
        flippedCards = [];
        lockBoard = false;
    }
}