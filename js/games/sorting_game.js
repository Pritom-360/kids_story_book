function initializeGame(container, gameData, onComplete) {
    container.innerHTML = `
        <div id="sorting-area" style="width: 100%; display: flex; justify-content: space-around; gap: 10px; margin-bottom: 20px;">
            <div id="good-basket" data-type="good" style="width: 120px; height: 120px; border: 3px dashed #6a994e; border-radius: 10px; text-align:center; padding-top: 5px;">Pie Basket</div>
            <div id="bad-basket" data-type="bad" style="width: 120px; height: 120px; border: 3px dashed #d00000; border-radius: 10px; text-align:center; padding-top: 5px;">Toss Away</div>
        </div>
        <div id="items-to-sort" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;"></div>
    `;

    const itemsContainer = container.querySelector('#items-to-sort');
    const goodBasket = container.querySelector('#good-basket');
    const badBasket = container.querySelector('#bad-basket');
    let correctItems = 0;
    const totalGoodItems = gameData.items.filter(item => item.type === 'good').length;

    gameData.items.forEach(item => {
        const elem = document.createElement('img');
        elem.id = item.id;
        elem.src = item.src;
        elem.dataset.type = item.type;
        elem.draggable = true;
        elem.style.width = '60px';
        elem.style.cursor = 'grab';
        elem.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', e.target.id);
        });
        itemsContainer.appendChild(elem);
    });

    [goodBasket, badBasket].forEach(basket => {
        basket.addEventListener('dragover', e => e.preventDefault());
        basket.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text');
            const draggedItem = document.getElementById(id);
            
            if (draggedItem.dataset.type === basket.dataset.type) {
                draggedItem.draggable = false;
                draggedItem.style.opacity = '0.5';
                basket.appendChild(draggedItem);
                
                if(draggedItem.dataset.type === 'good') {
                    correctItems++;
                }

                if (correctItems === totalGoodItems) {
                    onComplete();
                }
            }
        });
    });
}