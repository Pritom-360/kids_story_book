const CACHE_NAME = 'storybook-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/story.html',
    '/css/style.css',
    '/js/main.js',
    '/js/story.js',
    '/manifest.json',
    // === Add core assets below ===
    '/stories/the_brave_rabbit.json',
    '/stories/the_lost_star.json',
    '/assets/images/brave_rabbit_thumb.jpg',
    '/assets/images/lost_star_thumb.jpg',
    // You can add more critical assets here to pre-cache
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Not in cache, fetch from network and cache it
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    }
                );
            })
    );
});