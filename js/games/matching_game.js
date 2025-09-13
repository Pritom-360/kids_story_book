// This is a simplified matching game scaffold.
// A more robust solution might use a library like interact.js
function initializeGame(container, gameData, onComplete) {
    container.innerHTML = `
        <div id="match-items" style="display:flex; gap: 10px; margin-bottom: 20px;"></div>
        <div id="match-targets" style="display:flex; gap: 10px;"></div>
    `;

    const itemsContainer = container.querySelector('#match-items');
    const targetsContainer = container.querySelector('#match-targets');
    let correctMatches = 0;

    // Create draggable items
    gameData.items.forEach(item => {
        const elem = document.createElement('div');
        elem.id = `item-${item}`;
        elem.draggable = true;
        elem.innerHTML = `<img src="assets/images/games/matching/${item}.png" alt="${item}" style="width:100px; cursor:pointer;">`;
        elem.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', elem.id));
        itemsContainer.appendChild(elem);
    });

    // Create drop targets
    gameData.shapes.forEach(shape => {
        const target = document.createElement('div');
        target.dataset.shapeFor = shape.replace('_shape', '');
        target.style.width = '110px';
        target.style.height = '110px';
        target.style.border = '2px dashed #ccc';
        target.style.borderRadius = '10px';
        target.style.display = 'flex';
        target.style.alignItems = 'center';
        target.style.justifyContent = 'center';
        target.innerHTML = `<img src="assets/images/games/matching/${shape}.png" alt="${shape}" style="width:100px; opacity: 0.5;">`;
        
        target.addEventListener('dragover', e => e.preventDefault());
        target.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text');
            const draggedItem = document.getElementById(id);
            const itemName = id.replace('item-', '');

            if (target.dataset.shapeFor === itemName) {
                target.innerHTML = ''; // Clear placeholder
                target.appendChild(draggedItem);
                draggedItem.draggable = false;
                correctMatches++;
                if (correctMatches === gameData.items.length) {
                    onComplete();
                }
            }
        });
        targetsContainer.appendChild(target);
    });
}

/**
 * Mobile-Friendly & Backwards-Compatible Matching Game
 * Uses a "Tap-to-Select, Tap-to-Place" interaction model.
 * It can understand both the old data structure ({items, shapes}) and the new one ({pairs}).
 */
function initializeGame(container, gameData, onComplete) {
    // --- Backwards Compatibility Layer ---
    // Check if the new `pairs` structure exists. If not, create it from the old structure.
    let gamePairs = gameData.pairs;
    if (!gamePairs && gameData.items && gameData.shapes) {
        console.log("Old data structure detected. Converting to new 'pairs' structure.");
        gamePairs = gameData.items.map((item, index) => ({
            id: item,
            itemSrc: `assets/images/games/matching/${item}.png`,
            shapeSrc: `assets/images/games/matching/${gameData.shapes[index]}.png`
        }));
    }

    if (!gamePairs) {
        container.innerHTML = "Error: Invalid game data for matching game.";
        console.error("Game data is missing 'pairs' or 'items'/'shapes' arrays.", gameData);
        return;
    }
    // --- End of Compatibility Layer ---


    // Set up the game board HTML
    container.innerHTML = `
        <div id="match-targets" style="display:flex; gap: 15px; margin-bottom: 30px; justify-content: center;"></div>
        <div id="match-items" style="display:flex; flex-wrap: wrap; gap: 15px; justify-content: center;"></div>
    `;

    const itemsContainer = container.querySelector('#match-items');
    const targetsContainer = container.querySelector('#match-targets');
    
    let selectedItem = null;
    let correctMatches = 0;
    const totalMatches = gamePairs.length;

    // Shuffle the items for variety each time
    const shuffledPairs = [...gamePairs].sort(() => Math.random() - 0.5);

    shuffledPairs.forEach(pair => {
        // --- Create the tappable items ---
        const item = document.createElement('img');
        item.src = pair.itemSrc;
        item.dataset.matchId = pair.id; // Link to its shape
        item.className = 'item-to-sort'; // Use same class as sorting for styling
        item.style.width = '80px';
        item.style.height = '80px';
        item.style.cursor = 'pointer';
        item.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

        item.addEventListener('click', () => {
            if (selectedItem) {
                selectedItem.classList.remove('selected');
            }
            selectedItem = item;
            selectedItem.classList.add('selected');
        });
        itemsContainer.appendChild(item);
        
        // --- Create the target shapes ---
        const target = document.createElement('div');
        target.dataset.matchId = pair.id; // Link to its item
        target.style.width = '90px';
        target.style.height = '90px';
        target.style.border = '3px dashed var(--primary-color)';
        target.style.borderRadius = '15px';
        target.style.display = 'flex';
        target.style.alignItems = 'center';
        target.style.justifyContent = 'center';
        target.style.padding = '5px';
        target.innerHTML = `<img src="${pair.shapeSrc}" style="width:100%; height:100%; object-fit:contain; opacity: 0.4;">`;

        target.addEventListener('click', () => {
            if (!selectedItem) return;

            if (selectedItem.dataset.matchId === target.dataset.matchId) {
                // Correct match!
                target.innerHTML = '';
                target.style.borderStyle = 'solid';
                target.appendChild(selectedItem);

                const placedItem = selectedItem.cloneNode(true);
                target.innerHTML = '';
                target.appendChild(placedItem);
                
                selectedItem = null;
                correctMatches++;

                if (correctMatches === totalMatches) {
                    onComplete();
                }
            } else {
                // Incorrect match
                target.classList.add('shake-error');
                setTimeout(() => target.classList.remove('shake-error'), 300);
                selectedItem.classList.remove('selected');
                selectedItem = null;
            }
        });
        targetsContainer.appendChild(target);
    });
}
