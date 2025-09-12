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