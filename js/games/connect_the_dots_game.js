function initializeGame(container, gameData, onComplete) {
    container.innerHTML = `<canvas id="dots-canvas" width="400" height="400" style="background-image: url(${gameData.backgroundImage}); background-size: cover; border-radius: 10px;"></canvas>`;
    const canvas = container.querySelector('#dots-canvas');
    const ctx = canvas.getContext('2d');
    const stars = gameData.starPositions;
    let clickedStars = [];

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw all stars
        stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
        });
        // Draw lines between clicked stars
        if (clickedStars.length > 1) {
            ctx.beginPath();
            ctx.moveTo(clickedStars[0].x, clickedStars[0].y);
            for (let i = 1; i < clickedStars.length; i++) {
                ctx.lineTo(clickedStars[i].x, clickedStars[i].y);
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const nextStarIndex = clickedStars.length;
        if (nextStarIndex < stars.length) {
            const nextStar = stars[nextStarIndex];
            const distance = Math.sqrt(Math.pow(mouseX - nextStar.x, 2) + Math.pow(mouseY - nextStar.y, 2));

            if (distance < 15) { // Click tolerance
                clickedStars.push(nextStar);
                draw();
                if (clickedStars.length === stars.length) {
                    // Game complete
                    const finalImg = new Image();
                    finalImg.src = gameData.finalImage;
                    finalImg.onload = () => {
                        ctx.drawImage(finalImg, 50, 50, 300, 300); // Adjust position/size as needed
                    }
                    setTimeout(onComplete, 1500); // Wait a moment to show the final image
                }
            }
        }
    });

    draw(); // Initial draw
}