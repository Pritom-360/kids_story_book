document.addEventListener('DOMContentLoaded', () => {
    // === DOM Element Selectors ===
    const pageContainer = document.getElementById('page-container');
    const imageContainer = document.getElementById('image-container');
    const textContainer = document.getElementById('text-container');
    const gameContainer = document.getElementById('game-container');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageIndicator = document.getElementById('page-indicator');
    const readModeToggle = document.getElementById('read-mode-toggle');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const narrationAudio = document.getElementById('narration-audio');

    // === State Variables ===
    let currentStory = null;
    let currentPageIndex = 0;
    let readToMe = true;
    let progressData = JSON.parse(localStorage.getItem('storybookProgress')) || {};

    // === SVG Icons for Controls ===
    const ICONS = {
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>`,
        pause: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
        next: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`,
        prev: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 6l-8.5 6 8.5 6V6zM6 6h2v12H6V6z"/></svg>`,
    };

    // === Initial Setup ===
    prevBtn.innerHTML = ICONS.prev;
    nextBtn.innerHTML = ICONS.next;
    playPauseBtn.innerHTML = ICONS.play;

    const urlParams = new URLSearchParams(window.location.search);
    const storyId = urlParams.get('story');

    if (!storyId) {
        window.location.href = 'index.html';
        return;
    }

    // Fetch and load the story data
    fetch(`stories/${storyId}.json`)
        .then(res => res.json())
        .then(storyData => {
            currentStory = storyData;
            loadProgress();
            renderPage();
        });

    // === Core Functions ===
    function renderPage(animation = '') {
        if (!currentStory) return;
        const page = currentStory.pages[currentPageIndex];
        
        pageContainer.className = 'page';
        if (animation) {
             pageContainer.classList.add(animation);
             setTimeout(() => {
                pageContainer.classList.remove(animation);
                updatePageContent(page);
             }, 250); // Match half of the CSS animation duration
        } else {
            updatePageContent(page);
        }
    }
    
    function updatePageContent(page) {
        narrationAudio.pause();
        narrationAudio.currentTime = 0;

        // Hide all containers initially
        imageContainer.style.display = 'none';
        textContainer.style.display = 'none';
        gameContainer.style.display = 'none';
        playPauseBtn.style.display = 'none';
        
        if (page.type === 'read') {
            imageContainer.style.display = 'block';
            textContainer.style.display = 'block';
            imageContainer.innerHTML = `<img src="${page.image}" alt="Illustration">`;
            textContainer.innerHTML = `<p>${page.text}</p>`;
            
            if (page.audio) {
                narrationAudio.src = page.audio;
                playPauseBtn.style.display = 'grid'; // Use grid for icon centering
                if (readToMe) {
                    narrationAudio.play();
                    playPauseBtn.innerHTML = ICONS.pause;
                    playPauseBtn.setAttribute('aria-label', 'Pause Narration');
                } else {
                    playPauseBtn.innerHTML = ICONS.play;
                    playPauseBtn.setAttribute('aria-label', 'Play Narration');
                }
            }
        } else if (page.type === 'game') {
            gameContainer.style.display = 'flex';
            loadGame(page);
        }
        
        updateControls();
        saveProgress();
    }

    function loadGame(page) {
        gameContainer.innerHTML = `
            <div class="game-description">${page.description}</div>
            <div id="game-board"></div>
            <button class="skip-game-btn">Skip Game</button>`;
        
        const gameBoard = document.getElementById('game-board');
        const skipButton = gameContainer.querySelector('.skip-game-btn');
        skipButton.onclick = () => goToPage(currentPageIndex + 1, 'next');

        // Dynamically load game script
        const gameScript = document.createElement('script');
        gameScript.src = page.gameScript;
        gameScript.onload = () => {
            if (window.initializeGame) {
                // Pass the game board, game data, and a callback function for completion
                window.initializeGame(gameBoard, page.gameData, () => {
                    console.log('Game completed!');
                    setTimeout(() => goToPage(currentPageIndex + 1, 'next'), 500); // Short delay for satisfaction
                });
            }
        };
        document.body.appendChild(gameScript);
    }

    function updateControls() {
        pageIndicator.textContent = `${currentPageIndex + 1} / ${currentStory.pages.length}`;
        prevBtn.disabled = currentPageIndex === 0;
        nextBtn.disabled = currentPageIndex === currentStory.pages.length - 1;
    }

    function goToPage(index, direction) {
        if (index >= 0 && index < currentStory.pages.length) {
            currentPageIndex = index;
            const animation = direction === 'next' ? 'page-turn-next' : 'page-turn-prev';
            renderPage(animation);
        }
    }

    function saveProgress() {
        progressData[storyId] = { page: currentPageIndex };
        localStorage.setItem('storybookProgress', JSON.stringify(progressData));
    }
    
    function loadProgress() {
        if (progressData[storyId]) {
            currentPageIndex = progressData[storyId].page;
        }
    }

    // === Event Listeners ===
    nextBtn.addEventListener('click', () => goToPage(currentPageIndex + 1, 'next'));
    prevBtn.addEventListener('click', () => goToPage(currentPageIndex - 1, 'prev'));

    readModeToggle.addEventListener('click', () => {
        readToMe = !readToMe;
        readModeToggle.textContent = readToMe ? 'Read Myself' : 'Read to Me';
        
        const currentPage = currentStory.pages[currentPageIndex];
        if (currentPage.type === 'read' && currentPage.audio) {
            if (readToMe) {
                narrationAudio.play();
                playPauseBtn.innerHTML = ICONS.pause;
            } else {
                narrationAudio.pause();
                playPauseBtn.innerHTML = ICONS.play;
            }
        }
    });

    playPauseBtn.addEventListener('click', () => {
        if (narrationAudio.paused) {
            narrationAudio.play();
            playPauseBtn.innerHTML = ICONS.pause;
            playPauseBtn.setAttribute('aria-label', 'Pause Narration');
        } else {
            narrationAudio.pause();
            playPauseBtn.innerHTML = ICONS.play;
            playPauseBtn.setAttribute('aria-label', 'Play Narration');
        }
    });

    narrationAudio.onended = () => {
        playPauseBtn.innerHTML = ICONS.play;
        playPauseBtn.setAttribute('aria-label', 'Play Narration');
    };
});