document.addEventListener('DOMContentLoaded', () => {
    const storyFiles = ['stories/the_brave_rabbit.json', 'stories/the_lost_star.json', 'stories/luna_the_light.json', 'stories/squeakys_acorn_pie.json'];
    const progressData = JSON.parse(localStorage.getItem('storybookProgress')) || {};

    storyFiles.forEach(file => {
        fetch(file)
            .then(response => response.json())
            .then(story => {
                const category = story.category.toLowerCase();
                const container = document.querySelector(`#${category}-stories .story-grid`);
                if (container) {
                    const storyCard = document.createElement('a');
                    storyCard.href = `story.html?story=${story.id}`;
                    storyCard.className = 'story-card';

                    let progressPercent = 0;
                    if (progressData[story.id]) {
                        // Calculate progress. -1 because length is not zero-indexed
                        progressPercent = (progressData[story.id].page / (story.pages.length - 1)) * 100;
                    } else {
                        storyCard.classList.add('unread');
                    }
                    
                    storyCard.innerHTML = `
                        <div class="thumbnail-container">
                            <img src="${story.thumbnail}" alt="${story.title}">
                            ${!progressData[story.id] ? '<div class="new-badge">New</div>' : ''}
                        </div>
                        <h3>${story.title}</h3>
                        <div class="progress-bar">
                            <div class="progress-bar-inner" style="width: ${progressPercent}%"></div>
                        </div>
                    `;
                    container.appendChild(storyCard);
                }
            })
            .catch(error => console.error(`Error loading story ${file}:`, error));
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
        });
    }
});