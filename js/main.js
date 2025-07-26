// Initialize game when page loads
let game;

console.log('Main.js loaded - waiting for DOMContentLoaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired - initializing game');
    try {
        console.log('Creating Game instance...');
        game = new Game();
        console.log('Game instance created successfully:', game);
        console.log('Starting game loop...');
        game.gameLoop();
        console.log('Game loop started successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
        console.error('Error stack:', error.stack);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (game) {
        game.render();
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});